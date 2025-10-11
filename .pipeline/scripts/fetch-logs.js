#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const WORKSPACE = 'kumaakh';
const REPO = 'ai-code-buddy';
const USERNAME = process.env.BITBUCKET_USERNAME;
const PASSWORD = process.env.BITBUCKET_APP_PASSWORD;
const PIPELINE_UUID = process.argv[2];

if (!PIPELINE_UUID) {
    console.error('Usage: node fetch-logs.js <pipeline-uuid>');
    process.exit(1);
}

function apiRequest(path) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
        const options = {
            hostname: 'api.bitbucket.org',
            path: `/2.0/repositories/${WORKSPACE}/${REPO}${path}`,
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
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Parse error: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log(`Fetching logs for pipeline: ${PIPELINE_UUID}`);

    const encodedUuid = encodeURIComponent(`{${PIPELINE_UUID}}`);

    // Get steps
    const stepsInfo = await apiRequest(`/pipelines/${encodedUuid}/steps/`);

    console.log(`\nFound ${stepsInfo.values.length} steps:\n`);

    // Save each step's log
    const logsDir = path.join('logs', `pipeline-${PIPELINE_UUID}`);
    fs.mkdirSync(logsDir, { recursive: true });

    for (const step of stepsInfo.values) {
        const stepUuid = step.uuid.replace(/[{}]/g, '');
        const stepName = step.name;
        const state = step.state.name;
        const result = step.state.result?.name || 'N/A';

        console.log(`${stepName}: ${state} - ${result}`);

        if (result === 'FAILED') {
            // Fetch logs
            const encodedStepUuid = encodeURIComponent(`{${stepUuid}}`);

            try {
                // Get log content (this redirects to S3)
                const logData = await new Promise((resolve, reject) => {
                    const options = {
                        hostname: 'api.bitbucket.org',
                        path: `/2.0/repositories/${WORKSPACE}/${REPO}/pipelines/${encodedUuid}/steps/${encodedStepUuid}/log`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`,
                        }
                    };

                    https.get(options, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => resolve(data));
                    }).on('error', reject);
                });

                const logFile = path.join(logsDir, `${stepName.replace(/[^a-z0-9]/gi, '_')}.log`);
                fs.writeFileSync(logFile, logData);

                console.log(`  ✅ Log saved to: ${logFile}`);
                console.log(`\n  Last 20 lines:\n`);
                const lines = logData.split('\n');
                lines.slice(-20).forEach(line => console.log(`    ${line}`));
                console.log('');

            } catch (error) {
                console.log(`  ⚠️  Failed to fetch log: ${error.message}`);
            }
        }
    }

    console.log(`\nLogs saved to: ${logsDir}/`);
}

main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});
