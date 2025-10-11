#!/usr/bin/env node

/**
 * Pipeline Debugging Tool
 * Comprehensive utility for debugging Bitbucket Pipelines
 *
 * Usage:
 *   node .pipeline/scripts/debug-pipeline.js <command> [args]
 *
 * Commands:
 *   test-creds              - Test API credentials
 *   inspect <pipeline-num>  - Inspect pipeline structure and status
 *   error <pipeline-num>    - Get detailed error information
 *   logs <pipeline-num>     - Fetch and save build logs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load credentials
const envPath = path.join(__dirname, '../../.env.pipeline');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.pipeline file not found. Create it with:');
  console.error('   BITBUCKET_USERNAME=your-username');
  console.error('   BITBUCKET_APP_PASSWORD=your-app-password');
  console.error('   BITBUCKET_WORKSPACE=workspace-name');
  console.error('   BITBUCKET_REPO=repo-name');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) process.env[key.trim()] = value.trim();
});

const username = process.env.BITBUCKET_USERNAME;
const password = process.env.BITBUCKET_APP_PASSWORD;
const workspace = process.env.BITBUCKET_WORKSPACE;
const repo = process.env.BITBUCKET_REPO;
const auth = Buffer.from(`${username}:${password}`).toString('base64');

function apiRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.bitbucket.org',
      path: `/2.0/repositories/${workspace}/${repo}${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function testCredentials() {
  console.log('Testing Bitbucket API credentials...\n');
  console.log('Username:', username);
  console.log('Workspace:', workspace);
  console.log('Repository:', repo);
  console.log('');

  try {
    const result = await apiRequest('/pipelines?pagelen=1');
    console.log('✅ Credentials are valid!');
    console.log(`Repository: ${workspace}/${repo}`);
    if (result.values && result.values.length > 0) {
      console.log(`Latest pipeline: #${result.values[0].build_number}`);
    }
  } catch (err) {
    console.error('❌ Credential test failed:', err.message);
    process.exit(1);
  }
}

async function inspectPipeline(pipelineNum) {
  console.log(`Inspecting pipeline #${pipelineNum}\n`);

  const pipelines = await apiRequest('/pipelines?pagelen=50&sort=-created_on');
  const pipeline = pipelines.values.find(p => p.build_number == pipelineNum);

  if (!pipeline) {
    console.log(`❌ Pipeline #${pipelineNum} not found`);
    return;
  }

  const uuid = pipeline.uuid.replace(/[{}]/g, '');
  const encodedUuid = encodeURIComponent(`{${uuid}}`);

  console.log(`Pipeline #${pipelineNum}`);
  console.log(`UUID: ${uuid}`);
  console.log(`Branch: ${pipeline.target.ref_name}`);
  console.log(`State: ${pipeline.state.name}`);
  console.log(`Result: ${pipeline.state.result?.name || 'N/A'}`);
  console.log(`URL: https://bitbucket.org/${workspace}/${repo}/pipelines/results/${uuid}`);
  console.log('');

  // Get steps
  const steps = await apiRequest(`/pipelines/${encodedUuid}/steps/`);
  console.log(`Steps (${steps.values.length}):`);

  for (const step of steps.values) {
    const status = step.state.result?.name || step.state.name;
    const icon = status === 'SUCCESSFUL' ? '✅' : status === 'FAILED' ? '❌' : '⏳';
    console.log(`  ${icon} ${step.name}: ${status}`);
  }
}

async function getPipelineError(pipelineNum) {
  console.log(`Getting error details for pipeline #${pipelineNum}\n`);

  const pipelines = await apiRequest('/pipelines?pagelen=50&sort=-created_on');
  const pipeline = pipelines.values.find(p => p.build_number == pipelineNum);

  if (!pipeline) {
    console.log(`❌ Pipeline #${pipelineNum} not found`);
    return;
  }

  console.log(`Pipeline #${pipelineNum}`);
  console.log(`State: ${pipeline.state.name} - ${pipeline.state.result?.name || 'N/A'}`);
  console.log('');

  if (pipeline.state.result?.error) {
    console.log('❌ Error Details:');
    console.log(JSON.stringify(pipeline.state.result.error, null, 2));
  } else {
    console.log('ℹ️  No error information available');
  }
}

async function fetchLogs(pipelineNum) {
  console.log(`Fetching logs for pipeline #${pipelineNum}\n`);

  const pipelines = await apiRequest('/pipelines?pagelen=50&sort=-created_on');
  const pipeline = pipelines.values.find(p => p.build_number == pipelineNum);

  if (!pipeline) {
    console.log(`❌ Pipeline #${pipelineNum} not found`);
    return;
  }

  const uuid = pipeline.uuid.replace(/[{}]/g, '');
  const encodedUuid = encodeURIComponent(`{${uuid}}`);

  // Get steps
  const steps = await apiRequest(`/pipelines/${encodedUuid}/steps/`);

  for (const step of steps.values) {
    console.log(`\nFetching logs for: ${step.name}`);

    const stepUuid = step.uuid.replace(/[{}]/g, '');
    const encodedStepUuid = encodeURIComponent(`{${stepUuid}}`);

    // Fetch log
    const logData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.bitbucket.org',
        path: `/2.0/repositories/${workspace}/${repo}/pipelines/${encodedUuid}/steps/${encodedStepUuid}/log`,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      };
      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    // Save to file
    const logDir = path.join(__dirname, `../../logs/pipeline-${pipelineNum}`);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `${step.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.log`);
    fs.writeFileSync(logFile, logData);

    console.log(`  Saved to: ${logFile}`);
    console.log(`  Size: ${(logData.length / 1024).toFixed(2)} KB`);
  }

  console.log(`\n✅ All logs saved to: logs/pipeline-${pipelineNum}/`);
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  if (!command) {
    console.log('Pipeline Debugging Tool\n');
    console.log('Usage: node debug-pipeline.js <command> [args]\n');
    console.log('Commands:');
    console.log('  test-creds              - Test API credentials');
    console.log('  inspect <pipeline-num>  - Inspect pipeline structure');
    console.log('  error <pipeline-num>    - Get error details');
    console.log('  logs <pipeline-num>     - Fetch and save logs');
    process.exit(0);
  }

  try {
    switch (command) {
      case 'test-creds':
        await testCredentials();
        break;
      case 'inspect':
        if (!arg) {
          console.error('❌ Please provide pipeline number');
          process.exit(1);
        }
        await inspectPipeline(arg);
        break;
      case 'error':
        if (!arg) {
          console.error('❌ Please provide pipeline number');
          process.exit(1);
        }
        await getPipelineError(arg);
        break;
      case 'logs':
        if (!arg) {
          console.error('❌ Please provide pipeline number');
          process.exit(1);
        }
        await fetchLogs(arg);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
