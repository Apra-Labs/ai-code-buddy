#!/usr/bin/env node

/**
 * Pipeline Monitor for ai-code-buddy
 * Monitors the latest pipeline build in real-time
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment from .env.pipeline
const envPath = path.join(__dirname, '../../.env.pipeline');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const WORKSPACE = process.env.BITBUCKET_WORKSPACE || 'kumaakh';
const REPO = process.env.BITBUCKET_REPO || 'ai-code-buddy';
const BRANCH = process.argv[2] || 'fix/bitbucket-pipelines-empty-command';
const POLL_INTERVAL = 5000; // 5 seconds

const USERNAME = process.env.BITBUCKET_USERNAME;
const PASSWORD = process.env.BITBUCKET_APP_PASSWORD;

if (!USERNAME || !PASSWORD) {
    console.error('Error: BITBUCKET_USERNAME and BITBUCKET_APP_PASSWORD must be set');
    process.exit(1);
}

const AUTH = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
const API_BASE = `api.bitbucket.org`;

function log(message) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${time}] ${message}`);
}

function apiRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_BASE,
            path: `/2.0/repositories/${WORKSPACE}/${REPO}${path}`,
            method: 'GET',
            headers: {
                'Authorization': `Basic ${AUTH}`,
                'Accept': 'application/json'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

async function findLatestPipeline() {
    const data = await apiRequest('/pipelines?pagelen=5&sort=-created_on');
    const pipeline = data.values.find(p => p.target.ref_name === BRANCH);
    return pipeline ? pipeline.uuid.replace(/[{}]/g, '') : null;
}

async function getPipelineStatus(uuid) {
    const encodedUuid = encodeURIComponent(`{${uuid}}`);
    return await apiRequest(`/pipelines/${encodedUuid}`);
}

async function getPipelineSteps(uuid) {
    const encodedUuid = encodeURIComponent(`{${uuid}}`);
    return await apiRequest(`/pipelines/${encodedUuid}/steps/`);
}

async function monitor() {
    log(`🔍 Finding latest pipeline for branch: ${BRANCH}`);

    const pipelineUuid = await findLatestPipeline();
    if (!pipelineUuid) {
        log(`❌ No pipeline found for branch ${BRANCH}`);
        process.exit(1);
    }

    log(`✅ Found pipeline: ${pipelineUuid}`);
    log(`🔗 URL: https://bitbucket.org/${WORKSPACE}/${REPO}/pipelines/results/${pipelineUuid}`);
    log('');

    let lastState = '';
    let lastSteps = '';

    while (true) {
        try {
            const pipelineInfo = await getPipelineStatus(pipelineUuid);
            const state = pipelineInfo.state.name;
            const result = pipelineInfo.state.result?.name || 'N/A';
            const buildNum = pipelineInfo.build_number;

            if (state !== lastState) {
                if (state === 'COMPLETED') {
                    if (result === 'SUCCESSFUL') {
                        log(`✅ Pipeline #${buildNum} COMPLETED: ${result}`);
                    } else {
                        log(`❌ Pipeline #${buildNum} COMPLETED: ${result}`);

                        // Show error if YAML parsing failed
                        const errorMsg = pipelineInfo.state.result?.error?.message;
                        if (errorMsg) {
                            log(`   Error: ${errorMsg}`);
                        }
                    }

                    log('');
                    log(`📊 Final Status: ${state} - ${result}`);

                    if (result !== 'SUCCESSFUL') {
                        log('');
                        log('🔍 To fetch detailed logs, run:');
                        log(`   bash temp/apra-lic-mgr/scripts/fetch-logs.sh ${pipelineUuid}`);
                    } else {
                        log('🎉 Pipeline succeeded!');
                    }

                    break;
                } else if (state === 'IN_PROGRESS') {
                    log(`⏳ Pipeline #${buildNum} is running...`);
                } else if (state === 'PENDING') {
                    log(`⏳ Pipeline #${buildNum} is pending...`);
                }
                lastState = state;
            }

            // Show step progress
            if (state === 'IN_PROGRESS') {
                const stepsInfo = await getPipelineSteps(pipelineUuid);
                const stepsSummary = stepsInfo.values
                    .map(step => `   ${step.name}: ${step.state.name} (${step.state.result?.name || 'running'})`)
                    .join('\n');

                if (stepsSummary !== lastSteps) {
                    console.log(stepsSummary);
                    lastSteps = stepsSummary;
                }
            }

        } catch (error) {
            log(`⚠️  Error checking pipeline: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
}

// Run monitor
monitor().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
});
