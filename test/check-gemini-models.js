#!/usr/bin/env node
/**
 * Check available Gemini models using the ListModels API
 * Usage: node check-gemini-models.js YOUR_API_KEY
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node check-gemini-models.js YOUR_GEMINI_API_KEY');
  console.error('\nExample: node check-gemini-models.js AIza...');
  process.exit(1);
}

console.log('Checking available Gemini models...\n');

// Try v1 API
function checkModels(apiVersion) {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ version: apiVersion, result });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    // Try v1
    console.log('=== Checking v1 API ===');
    const v1Result = await checkModels('v1');

    if (v1Result.result.error) {
      console.error('v1 Error:', v1Result.result.error.message);
    } else if (v1Result.result.models) {
      console.log(`Found ${v1Result.result.models.length} models in v1:\n`);

      v1Result.result.models.forEach(model => {
        const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
        const isFree = model.name.includes('flash') || model.name.includes('pro');

        console.log(`Model: ${model.name}`);
        console.log(`  Display Name: ${model.displayName || 'N/A'}`);
        console.log(`  Supports generateContent: ${supportsGenerate ? '✓' : '✗'}`);
        console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        if (isFree) console.log(`  🆓 Likely Free Tier`);
        console.log('');
      });

      // Show recommended models
      console.log('=== RECOMMENDED MODELS FOR providers.js ===\n');
      const generateModels = v1Result.result.models.filter(m =>
        m.supportedGenerationMethods?.includes('generateContent')
      );

      generateModels.forEach(model => {
        const modelId = model.name.replace('models/', '');
        console.log(`{ id: '${modelId}', name: '${model.displayName}' },`);
      });
    }

    // Try v1beta for comparison
    console.log('\n=== Checking v1beta API ===');
    const v1betaResult = await checkModels('v1beta');

    if (v1betaResult.result.error) {
      console.error('v1beta Error:', v1betaResult.result.error.message);
    } else if (v1betaResult.result.models) {
      console.log(`Found ${v1betaResult.result.models.length} models in v1beta`);

      const v1betaGenerate = v1betaResult.result.models.filter(m =>
        m.supportedGenerationMethods?.includes('generateContent')
      );
      console.log(`${v1betaGenerate.length} support generateContent\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
