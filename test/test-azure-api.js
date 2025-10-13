#!/usr/bin/env node
/**
 * Test Azure OpenAI API directly to verify configuration
 * Usage: node test-azure-api.js ENDPOINT API_KEY DEPLOYMENT_NAME [API_VERSION]
 *
 * Example:
 * node test-azure-api.js https://your-resource.openai.azure.com abc123... gpt-4 2024-02-01
 */

const https = require('https');
const { URL } = require('url');

const endpoint = process.argv[2];
const apiKey = process.argv[3];
const deploymentName = process.argv[4];
const apiVersion = process.argv[5] || '2024-02-01';

if (!endpoint || !apiKey || !deploymentName) {
  console.error('Usage: node test-azure-api.js ENDPOINT API_KEY DEPLOYMENT_NAME [API_VERSION]');
  console.error('\nParameters:');
  console.error('  ENDPOINT        - Your Azure OpenAI endpoint (e.g., https://your-resource.openai.azure.com)');
  console.error('  API_KEY         - Your Azure OpenAI API key (32-character hex string)');
  console.error('  DEPLOYMENT_NAME - Your deployment name (e.g., gpt-4, gpt-35-turbo)');
  console.error('  API_VERSION     - API version (optional, defaults to 2024-02-01)');
  console.error('\nExample:');
  console.error('  node test-azure-api.js https://myresource.openai.azure.com abc123def456... gpt-4');
  console.error('\nWhere to find these values:');
  console.error('  1. Go to https://portal.azure.com');
  console.error('  2. Navigate to your Azure OpenAI resource');
  console.error('  3. Go to "Keys and Endpoint" for ENDPOINT and API_KEY');
  console.error('  4. Go to "Model deployments" for DEPLOYMENT_NAME');
  process.exit(1);
}

console.log('=== Azure OpenAI Configuration ===');
console.log(`Endpoint:        ${endpoint}`);
console.log(`API Key:         ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`Deployment:      ${deploymentName}`);
console.log(`API Version:     ${apiVersion}`);
console.log('');

// Validate configuration
console.log('=== Validating Configuration ===');

// Check endpoint format
if (!endpoint.startsWith('https://')) {
  console.error('✗ ERROR: Endpoint must start with https://');
  process.exit(1);
}

if (!endpoint.includes('.openai.azure.com')) {
  console.warn('⚠ WARNING: Endpoint should typically end with .openai.azure.com');
}

// Check API key format
if (!/^[a-f0-9]{32}$/i.test(apiKey)) {
  console.warn(`⚠ WARNING: API key doesn't match expected format (32 hex characters)`);
  console.warn(`  Found: ${apiKey.length} characters`);
  console.warn(`  Pattern: ${apiKey.match(/[a-f0-9]/gi)?.length || 0} hex chars`);
}

console.log('✓ Configuration looks reasonable\n');

// Build request
const testPrompt = 'Write a simple bash script that prints "Hello World"';

const requestBody = JSON.stringify({
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant that improves and fixes scripts. You respond only with executable code, no explanations or markdown formatting.'
    },
    {
      role: 'user',
      content: testPrompt
    }
  ],
  temperature: 0.3,
  max_tokens: 2000
});

// Construct full URL
const fullUrl = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

console.log('=== Testing API Call ===');
console.log(`Full URL: ${fullUrl}`);
console.log('');
console.log('Request Body:', JSON.stringify(JSON.parse(requestBody), null, 2));
console.log('');

const urlObj = new URL(fullUrl);
const options = {
  hostname: urlObj.hostname,
  path: urlObj.pathname + urlObj.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': apiKey,
    'Content-Length': Buffer.byteLength(requestBody)
  }
};

console.log('Request Headers:');
console.log(`  Content-Type: application/json`);
console.log(`  api-key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('');

const req = https.request(options, (res) => {
  console.log('=== Response ===');
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('');
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('=== FULL RESPONSE ===');
      console.log(JSON.stringify(result, null, 2));
      console.log('');

      // Check response status
      if (res.statusCode === 200) {
        console.log('=== SUCCESS ===');

        // Try to extract content using the same logic as providers.js
        const content = result.choices?.[0]?.message?.content;

        if (content) {
          console.log('✓ Content extracted successfully:');
          console.log('---');
          console.log(content);
          console.log('---');
          console.log('');
          console.log('✓✓✓ Azure OpenAI integration is working correctly! ✓✓✓');
        } else {
          console.log('✗ Failed to extract content!');
          console.log('');
          console.log('Response structure:');
          console.log('- choices exists:', !!result.choices);
          console.log('- choices[0] exists:', !!result.choices?.[0]);
          console.log('- choices[0].message exists:', !!result.choices?.[0]?.message);
          console.log('- choices[0].message.content exists:', !!result.choices?.[0]?.message?.content);

          if (result.choices?.[0]) {
            console.log('');
            console.log('First choice:', JSON.stringify(result.choices[0], null, 2));
          }
        }
      } else {
        console.log('=== ERROR ===');
        console.log(`✗ HTTP ${res.statusCode}: ${res.statusMessage}`);
        console.log('');

        if (result.error) {
          console.log('Error details:');
          console.log(JSON.stringify(result.error, null, 2));
          console.log('');

          // Provide helpful error messages
          if (res.statusCode === 401) {
            console.log('SOLUTION: Check your API key is correct');
          } else if (res.statusCode === 404) {
            console.log('SOLUTION: Check your deployment name and endpoint URL');
            console.log('  - Verify deployment exists in Azure Portal > Model deployments');
            console.log('  - Ensure endpoint URL is correct (should be https://YOUR-RESOURCE.openai.azure.com)');
          } else if (res.statusCode === 429) {
            console.log('SOLUTION: Rate limit exceeded, wait and try again');
          } else if (res.statusCode === 400) {
            console.log('SOLUTION: Check the request format and API version');
            console.log('  - Try API version: 2024-02-01, 2023-12-01-preview, or 2023-05-15');
          }
        }
      }
    } catch (e) {
      console.error('✗ Failed to parse response:', e.message);
      console.log('');
      console.log('Raw response:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('=== REQUEST FAILED ===');
  console.error('✗ Error:', e.message);
  console.error('');

  if (e.code === 'ENOTFOUND') {
    console.error('SOLUTION: Check your endpoint URL is correct');
    console.error('  - Should be: https://YOUR-RESOURCE.openai.azure.com');
    console.error('  - NOT: https://api.openai.com (that\'s OpenAI, not Azure)');
  } else if (e.code === 'ECONNREFUSED') {
    console.error('SOLUTION: Connection refused - check endpoint URL and firewall');
  } else if (e.code === 'ETIMEDOUT') {
    console.error('SOLUTION: Connection timeout - check network and firewall');
  }

  process.exit(1);
});

req.write(requestBody);
req.end();
