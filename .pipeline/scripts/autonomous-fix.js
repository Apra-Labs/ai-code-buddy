#!/usr/bin/env node

/**
 * Autonomous Pipeline Debugger
 * Continuously monitors pipeline, fetches errors, applies fixes, and retries
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Load environment
const envPath = path.join(__dirname, '../.env.pipeline');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const WORKSPACE = process.env.BITBUCKET_WORKSPACE;
const REPO = process.env.BITBUCKET_REPO;
const USERNAME = process.env.BITBUCKET_USERNAME;
const PASSWORD = process.env.BITBUCKET_APP_PASSWORD;
const BRANCH = process.argv[2] || 'fix/bitbucket-pipelines-empty-command';
const MAX_ITERATIONS = 10;

let iteration = 0;

function log(message) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${time}] ${message}`);
}

function exec(cmd) {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
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
                    reject(new Error(`Failed to parse: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
    });
}

async function findLatestPipeline() {
    const data = await apiRequest('/pipelines?pagelen=5&sort=-created_on');
    const pipeline = data.values.find(p => p.target.ref_name === BRANCH);
    return pipeline;
}

async function waitForPipeline(uuid) {
    log(`⏳ Waiting for pipeline ${uuid} to complete...`);

    while (true) {
        const encodedUuid = encodeURIComponent(`{${uuid}}`);
        const pipeline = await apiRequest(`/pipelines/${encodedUuid}`);

        if (pipeline.state.name === 'COMPLETED') {
            return pipeline;
        }

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
    }
}

function applyYAMLFix(errorMessage) {
    log(`🔧 Analyzing error: ${errorMessage}`);

    const yamlFile = 'bitbucket-pipelines.yml';
    let content = fs.readFileSync(yamlFile, 'utf-8');

    // Fix: Remove all standalone comments in script sections
    if (errorMessage.includes('Missing or empty command string')) {
        log('🔧 Removing all standalone comment lines from script sections...');

        const lines = content.split('\n');
        const fixed = [];
        let inScriptSection = false;
        let indentLevel = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Detect script section start
            if (trimmed === 'script:') {
                inScriptSection = true;
                indentLevel = line.search(/\S/);
                fixed.push(line);
                continue;
            }

            // Detect script section end (next section at same or lower indent)
            if (inScriptSection && line.search(/\S/) >= 0 && line.search(/\S/) <= indentLevel && trimmed !== '') {
                inScriptSection = false;
            }

            // In script section: remove standalone comments, keep command comments
            if (inScriptSection) {
                // Skip lines that are only comments (not attached to -)
                if (trimmed.startsWith('#') && !fixed[fixed.length - 1]?.trim().startsWith('-')) {
                    log(`  Removing line ${i + 1}: ${trimmed.substring(0, 60)}`);
                    continue;
                }
            }

            fixed.push(line);
        }

        const newContent = fixed.join('\n');
        if (newContent !== content) {
            fs.writeFileSync(yamlFile, newContent);
            log(`✅ Applied fix to ${yamlFile}`);
            return true;
        }
    }

    return false;
}

async function main() {
    log(`🤖 Autonomous Pipeline Debugger Starting`);
    log(`📦 Repository: ${WORKSPACE}/${REPO}`);
    log(`🌿 Branch: ${BRANCH}`);
    log('');

    while (iteration < MAX_ITERATIONS) {
        iteration++;
        log(`\n${'='.repeat(60)}`);
        log(`🔄 Iteration ${iteration}/${MAX_ITERATIONS}`);
        log(`${'='.repeat(60)}\n`);

        // Find latest pipeline
        const pipeline = await findLatestPipeline();
        if (!pipeline) {
            log(`❌ No pipeline found for branch ${BRANCH}`);
            break;
        }

        const uuid = pipeline.uuid.replace(/[{}]/g, '');
        const state = pipeline.state.name;
        const result = pipeline.state.result?.name;

        log(`📊 Pipeline #${pipeline.build_number}: ${state} - ${result || 'N/A'}`);
        log(`🔗 https://bitbucket.org/${WORKSPACE}/${REPO}/pipelines/results/${uuid}`);

        // Wait if still running
        let finalPipeline = pipeline;
        if (state === 'IN_PROGRESS' || state === 'PENDING') {
            finalPipeline = await waitForPipeline(uuid);
        }

        const finalResult = finalPipeline.state.result?.name;

        if (finalResult === 'SUCCESSFUL') {
            log('\n🎉🎉🎉 PIPELINE SUCCEEDED! 🎉🎉🎉');
            log(`✅ All fixes applied successfully after ${iteration} iteration(s)`);
            break;
        }

        // Pipeline failed - analyze and fix
        const error = finalPipeline.state.result?.error;
        if (error) {
            log(`\n❌ Pipeline failed with error:`);
            log(`   ${error.message}`);

            // Try to apply fix
            const fixed = applyYAMLFix(error.message);

            if (fixed) {
                // Commit and push
                log('\n📝 Committing fix...');
                exec('git add bitbucket-pipelines.yml');
                exec(`git commit -m "Auto-fix: Remove YAML validation errors (iteration ${iteration})"`);

                log('📤 Pushing to remote...');
                exec('git push');

                log('✅ Fix pushed, waiting for new pipeline...');
                await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15s for new pipeline
            } else {
                log('⚠️  No automatic fix available for this error');
                log('🛑 Manual intervention required');
                break;
            }
        } else {
            log('⚠️  Pipeline failed but no error details available');
            break;
        }
    }

    if (iteration >= MAX_ITERATIONS) {
        log(`\n⚠️  Reached maximum iterations (${MAX_ITERATIONS}). Stopping.`);
    }

    log('\n🏁 Autonomous debugging session ended');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
});
