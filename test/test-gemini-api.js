#!/usr/bin/env node
/**
 * Test Gemini API directly to see actual response format
 * Usage: node test-gemini-api.js YOUR_API_KEY [MODEL_NAME]
 */

const https = require('https');

const apiKey = process.argv[2];
const model = process.argv[3] || 'gemini-1.5-flash';

if (!apiKey) {
  console.error('Usage: node test-gemini-api.js YOUR_GEMINI_API_KEY [MODEL_NAME]');
  console.error('\nExample: node test-gemini-api.js AIza... gemini-1.5-flash');
  process.exit(1);
}

const testPrompt = 'Write a simple bash script that prints "Hello World"';

const requestBody = JSON.stringify({
  contents: [{
    parts: [{
      text: `You are a helpful assistant that improves and fixes scripts. Given the following request, provide ONLY the improved executable code without any explanations or markdown formatting:\n\n${testPrompt}`
    }]
  }],
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 2000
  }
});

const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

console.log(`Testing Gemini API with model: ${model}\n`);
console.log('Request URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
console.log('\nRequest Body:', JSON.stringify(JSON.parse(requestBody), null, 2), '\n');

const urlObj = new URL(url);
const options = {
  hostname: urlObj.hostname,
  path: urlObj.pathname + urlObj.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody)
  }
};

const req = https.request(options, (res) => {
  console.log('Response Status:', res.statusCode);
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2), '\n');

  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('=== FULL RESPONSE ===');
      console.log(JSON.stringify(result, null, 2));
      console.log('\n=== PARSED CONTENT ===');

      // Try to extract content using the same logic as providers.js
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (content) {
        console.log('✓ Content extracted successfully:');
        console.log(content);
      } else {
        console.log('✗ Failed to extract content!');
        console.log('\nResponse structure:');
        console.log('- candidates exists:', !!result.candidates);
        console.log('- candidates[0] exists:', !!result.candidates?.[0]);
        console.log('- candidates[0].content exists:', !!result.candidates?.[0]?.content);
        console.log('- candidates[0].content.parts exists:', !!result.candidates?.[0]?.content?.parts);
        console.log('- candidates[0].content.parts[0] exists:', !!result.candidates?.[0]?.content?.parts?.[0]);

        if (result.candidates?.[0]) {
          console.log('\nFirst candidate:', JSON.stringify(result.candidates[0], null, 2));
        }

        if (result.error) {
          console.log('\n✗ ERROR in response:');
          console.log(JSON.stringify(result.error, null, 2));
        }
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
  process.exit(1);
});

req.write(requestBody);
req.end();
