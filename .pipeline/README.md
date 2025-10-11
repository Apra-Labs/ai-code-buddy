# Pipeline Automation Tools

Autonomous debugging and monitoring tools for Bitbucket Pipelines.

## 📚 Documentation

- **[AUTONOMOUS_DEBUGGING.md](./AUTONOMOUS_DEBUGGING.md)** - Complete guide to autonomous pipeline debugging
  - Detailed workflow and techniques
  - Common issues and solutions
  - Real case study from this project
  - Best practices and troubleshooting

## Quick Start

### 1. Setup Credentials

Create `.env.pipeline` in project root:
```bash
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password
BITBUCKET_WORKSPACE=kumaakh
BITBUCKET_REPO=ai-code-buddy
```

**Get app password:** https://bitbucket.org/account/settings/app-passwords/
- Permissions needed: Repositories (Read), Pipelines (Read)

The `.env.pipeline` file is git-ignored for security.

### 2. Test Setup

```bash
node .pipeline/scripts/debug-pipeline.js test-creds
```

## Core Tools

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

### `debug-pipeline.js`
Multi-purpose debugging tool for pipeline inspection and troubleshooting.

```bash
# Test credentials
node .pipeline/scripts/debug-pipeline.js test-creds

# Inspect pipeline structure
node .pipeline/scripts/debug-pipeline.js inspect <pipeline-number>

# Get error details
node .pipeline/scripts/debug-pipeline.js error <pipeline-number>

# Fetch all logs
node .pipeline/scripts/debug-pipeline.js logs <pipeline-number>
```

### `fetch-logs.js`
Downloads pipeline logs by UUID.

```bash
node .pipeline/scripts/fetch-logs.js <pipeline-uuid>
```

### `validate-yaml.js`
Validates `bitbucket-pipelines.yml` syntax before pushing.

```bash
node .pipeline/scripts/validate-yaml.js
```

## Usage Examples

### Monitor a build in real-time
```bash
git push && node .pipeline/scripts/monitor-pipeline.js main
```

### Debug a failed build
```bash
# Get error details
node .pipeline/scripts/debug-pipeline.js error 42

# Fetch full logs
node .pipeline/scripts/debug-pipeline.js logs 42

# Analyze logs
grep -i "error\|fail" logs/pipeline-42/*.log
```

### Autonomous fixing
```bash
# Let the tool fix issues automatically
node .pipeline/scripts/autonomous-fix.js main
```

## Features

- ✅ No external dependencies (uses Node.js built-ins only)
- ✅ Secure credential management via `.env.pipeline`
- ✅ Real-time pipeline monitoring
- ✅ Autonomous error detection and fixing
- ✅ Comprehensive log analysis
- ✅ Detailed error diagnostics
- ✅ Production-tested on this repository

## Learn More

See **[AUTONOMOUS_DEBUGGING.md](./AUTONOMOUS_DEBUGGING.md)** for:
- Complete debugging workflow
- Common issues and solutions
- Real-world case studies
- Best practices and advanced techniques
