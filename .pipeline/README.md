# Pipeline Automation Tools

Autonomous debugging and monitoring tools for Bitbucket Pipelines.

## Setup

1. Create `.env.pipeline` in project root:
```bash
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password
BITBUCKET_WORKSPACE=kumaakh
BITBUCKET_REPO=ai-code-buddy
```

2. The `.env.pipeline` file is git-ignored for security.

## Tools

### `autonomous-fix.js`
Continuously monitors pipeline builds and automatically applies fixes when failures are detected.

```bash
node .pipeline/autonomous-fix.js <branch-name>
```

- Monitors pipeline in real-time
- Analyzes failure patterns
- Applies common fixes automatically
- Commits and pushes fixes
- Loops until success (max 10 iterations)

### `monitor-pipeline.js`
Real-time pipeline monitoring tool.

```bash
node .pipeline/monitor-pipeline.js <branch-name>
```

- Shows pipeline status updates
- Displays step progress
- Reports final results

### `fetch-logs.js`
Downloads failed pipeline logs for analysis.

```bash
node .pipeline/fetch-logs.js <pipeline-uuid>
```

- Fetches all step logs
- Saves to `logs/pipeline-{uuid}/`
- Displays last 20 lines of failed steps

## Usage Example

```bash
# Quick autonomous fix
node .pipeline/autonomous-fix.js fix/my-feature

# Or monitor manually
node .pipeline/monitor-pipeline.js fix/my-feature
```

## Features

- ✅ No external dependencies (uses Node.js built-ins)
- ✅ Loads credentials from `.env.pipeline`
- ✅ Auto-fixes common issues (YAML errors, missing packages)
- ✅ Detailed logging and error analysis
- ✅ Artifact download support
