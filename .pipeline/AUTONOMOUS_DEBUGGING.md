# Autonomous Pipeline Debugging Guide

This guide documents the techniques and tools for autonomously debugging Bitbucket Pipelines, developed while fixing artifact publishing issues in this project.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Core Debugging Workflow](#core-debugging-workflow)
- [Tools](#tools)
- [Common Issues & Solutions](#common-issues--solutions)
- [Case Study: Artifact Publishing Fix](#case-study-artifact-publishing-fix)

---

## Overview

Autonomous pipeline debugging is a systematic approach to identifying and fixing CI/CD issues without manual intervention. The process involves:

1. **Automated monitoring** - Watch pipeline execution in real-time
2. **Log analysis** - Extract and analyze failure patterns
3. **Automated fixes** - Apply common fixes based on error patterns
4. **Verification** - Confirm fixes work by monitoring subsequent builds

### Key Benefits

- ✅ Faster iteration - Fix issues in minutes, not hours
- ✅ Reproducible - Document exact steps and solutions
- ✅ Autonomous - Minimal manual intervention required
- ✅ Learning - Build a knowledge base of common issues

---

## Setup

### 1. Create Credentials File

Create `.env.pipeline` in project root:

```bash
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password
BITBUCKET_WORKSPACE=workspace-name
BITBUCKET_REPO=repo-name
```

**Important:** The `.env.pipeline` file is git-ignored for security.

### 2. Generate App Password

1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Click "Create app password"
3. Name: `Pipeline Debugging`
4. Permissions needed:
   - **Repositories**: Read
   - **Pipelines**: Read
   - **Pull requests**: Write (optional, for autonomous fixes)

### 3. Test Credentials

```bash
node .pipeline/scripts/debug-pipeline.js test-creds
```

Expected output:
```
✅ Credentials are valid!
Repository: workspace/repo
Latest pipeline: #42
```

---

## Core Debugging Workflow

### Step 1: Monitor Pipeline

When you push changes, immediately start monitoring:

```bash
node .pipeline/scripts/monitor-pipeline.js main
```

This shows real-time progress:
```
⏳ Pipeline #42 is running...
   Build Chrome Extension: IN_PROGRESS (running)
   Validate Extension: PENDING (N/A)
```

### Step 2: Detect Failures

If the pipeline fails, the monitor will show:
```
❌ Pipeline #42 COMPLETED: FAILED
   Error: Missing or empty command string
```

### Step 3: Inspect & Diagnose

Get detailed error information:

```bash
node .pipeline/scripts/debug-pipeline.js error 42
```

Output shows exact error:
```json
{
  "type": "pipeline_error",
  "key": "plan-service.parse.detailed-parse-error",
  "message": "There is an error in your bitbucket-pipelines.yml at [script > 20]. Missing or empty command string."
}
```

### Step 4: Fetch Logs

Download full logs for analysis:

```bash
node .pipeline/scripts/debug-pipeline.js logs 42
```

Logs saved to `logs/pipeline-42/`:
- `build-chrome-extension.log`
- `validate-extension.log`
- `create-git-tag.log`

### Step 5: Analyze & Fix

Search logs for clues:

```bash
grep -i "error\|fail\|artifact" logs/pipeline-42/*.log
```

Apply fixes to `bitbucket-pipelines.yml`, commit, and push.

### Step 6: Verify

Monitor the new build to confirm the fix works.

---

## Tools

### `debug-pipeline.js` - Multi-purpose debugging tool

**Test credentials:**
```bash
node .pipeline/scripts/debug-pipeline.js test-creds
```

**Inspect pipeline:**
```bash
node .pipeline/scripts/debug-pipeline.js inspect 42
```
Shows: UUID, branch, state, result, steps status

**Get error details:**
```bash
node .pipeline/scripts/debug-pipeline.js error 42
```
Shows: Error type, message, location in YAML

**Fetch logs:**
```bash
node .pipeline/scripts/debug-pipeline.js logs 42
```
Downloads all step logs to `logs/pipeline-42/`

**Check artifacts:**
```bash
node .pipeline/scripts/debug-pipeline.js artifacts 42
```
Shows artifact information and web UI link (see [Artifact Limitations](#bitbucket-api-limitations))

**List Downloads:**
```bash
node .pipeline/scripts/debug-pipeline.js downloads
```
Lists files uploaded to repository Downloads section

---

### `monitor-pipeline.js` - Real-time monitoring

**Usage:**
```bash
node .pipeline/scripts/monitor-pipeline.js <branch-name>
```

**Example:**
```bash
node .pipeline/scripts/monitor-pipeline.js main
```

**Features:**
- Polls every 5 seconds
- Shows step progress
- Reports final result
- Displays error messages

**Output:**
```
🔍 Finding latest pipeline for branch: main
✅ Found pipeline: abc123...
🔗 URL: https://bitbucket.org/workspace/repo/pipelines/results/abc123

⏳ Pipeline #42 is running...
   Build Chrome Extension: COMPLETED (SUCCESSFUL)
   Validate Extension: IN_PROGRESS (running)
   Create Git Tag: PENDING (N/A)

✅ Pipeline #42 COMPLETED: SUCCESSFUL
🎉 Pipeline succeeded!
```

---

### `autonomous-fix.js` - Auto-fixing tool

**Usage:**
```bash
node .pipeline/scripts/autonomous-fix.js <branch-name>
```

**What it does:**
1. Monitors pipeline until completion
2. If failed, analyzes error message
3. Applies known fixes (e.g., removes problematic YAML)
4. Commits and pushes fix
5. Repeats up to 10 iterations

**Example error patterns it fixes:**
- `Missing or empty command string` → Removes empty/comment-only lines
- YAML validation errors → Fixes indentation/syntax

**Use cases:**
- Fixing known YAML issues automatically
- Rapid iteration on pipeline configuration
- Batch fixing multiple branches

**Limitations:**
- Only handles known error patterns
- Max 10 iterations to prevent infinite loops
- Cannot fix logic errors in build scripts

---

### `fetch-logs.js` - Log downloader

**Usage:**
```bash
node .pipeline/scripts/fetch-logs.js <pipeline-uuid>
```

**Features:**
- Downloads all step logs
- Saves to `logs/pipeline-{uuid}/`
- Shows last 20 lines of failed steps

---

### `validate-yaml.js` - YAML validator

**Usage:**
```bash
node .pipeline/scripts/validate-yaml.js
```

Validates `bitbucket-pipelines.yml` syntax before pushing.

---

## Common Issues & Solutions

### Issue 1: Variables Not Expanded in Artifacts Section

**Symptom:**
```
Searching for files matching artifact pattern ai-code-buddy-${VERSION}.zip
Artifact pattern matched 0 files
```

**Cause:** Bitbucket Pipelines doesn't support variable substitution in the `artifacts:` section.

**Solution:**
1. Create file with fixed name: `ai-code-buddy.zip`
2. Rename to versioned name: `ai-code-buddy-v${VERSION}-${COMMIT}.zip`
3. Use wildcard in artifacts: `ai-code-buddy-*.zip`

```yaml
script:
  - zip -r "../ai-code-buddy.zip" .
  - mv "ai-code-buddy.zip" "ai-code-buddy-v${VERSION}-${GIT_COMMIT}.zip"
artifacts:
  - ai-code-buddy-*.zip  # Matches the renamed file
```

---

### Issue 2: Empty Echo Commands

**Symptom:**
```
Error: Missing or empty command string at [script > 20]
```

**Cause:** `echo ""` is interpreted as empty command.

**Solution:** Remove empty echo or use `echo " "`:

```yaml
# ❌ Bad
- echo ""

# ✅ Good
- echo " "
# Or just remove it
```

---

### Issue 3: Artifacts Not Appearing in UI

**Diagnosis steps:**

1. **Check build logs** for artifact upload confirmation:
```bash
node .pipeline/scripts/debug-pipeline.js logs 42
grep -i "artifact" logs/pipeline-42/build-*.log
```

Look for:
```
Searching for files matching artifact pattern ai-code-buddy-*.zip
Artifact pattern matched 1 files with a total size of 26.8 KiB
Successfully uploaded artifact in 0 seconds
```

2. **Verify file exists** before artifact collection:
```yaml
script:
  - ls -lh ai-code-buddy-*.zip  # Verify file exists
artifacts:
  - ai-code-buddy-*.zip
```

3. **Check for path issues** - Artifacts paths are relative to workspace root:
```yaml
# ❌ Bad - if you're in subdirectory
artifacts:
  - build/output.zip

# ✅ Good - use correct relative path
artifacts:
  - output.zip  # If file is in workspace root
```

---

### Issue 4: Bitbucket API Limitations

#### Artifacts Not Accessible via API

**Symptom:**
```
Error: Status 404: Resource not found
Path: /pipelines/{uuid}/steps/{uuid}/artifacts
```

**Root Cause:** Bitbucket Pipelines API v2 **does not expose pipeline artifacts** through any REST endpoint. This is a platform limitation, not a bug.

**What We Know:**

1. **No API Endpoint Exists**
   - Tested endpoints: `/pipelines/{uuid}/artifacts`, `/steps/{uuid}/artifacts` → 404
   - Pipeline and step objects have NO artifact-related fields
   - No `links` field pointing to artifacts

2. **Web UI Only Access**
   - Artifacts are stored for 14 days
   - 1 GB total size limit per pipeline
   - Only accessible through web interface:
   ```
   https://bitbucket.org/{workspace}/{repo}/pipelines/results/{uuid}/artifacts
   ```

3. **API Research Findings**
   - Bitbucket API v2 documentation has NO artifacts endpoint for pipelines
   - Community forums confirm this limitation (2022-2025)
   - Atlassian developer portal: No pipeline artifacts API reference

**Workarounds:**

**Option 1: Use the Web UI** (14-day retention)
```bash
# Our tooling shows the direct link
node .pipeline/scripts/debug-pipeline.js artifacts 42
```

Output:
```
🔗 Access artifacts via web UI:
   https://bitbucket.org/workspace/repo/pipelines/results/{uuid}/artifacts

📦 Steps with artifact configuration:
✅ Build Chrome Extension
   Status: SUCCESSFUL
   Duration: 10s
```

**Option 2: Use Downloads API** (indefinite retention)

Upload artifacts to repository Downloads section, which HAS API support:

1. Add to `bitbucket-pipelines.yml`:
```yaml
- pipe: atlassian/bitbucket-upload-file:0.3.2
  variables:
    BITBUCKET_USERNAME: $BITBUCKET_USERNAME
    BITBUCKET_APP_PASSWORD: $BITBUCKET_APP_PASSWORD
    FILENAME: 'ai-code-buddy-*.zip'
```

2. Access via API:
```bash
# List all downloads
node .pipeline/scripts/debug-pipeline.js downloads

# Download via API
curl -u username:app-password -L -O <download-url>
```

**Option 3: Third-Party Storage**

Upload to S3, Azure Blob, or Artifactory and link using Bitbucket Build Status API:
```bash
- aws s3 cp artifact.zip s3://bucket/artifacts/
- curl -X POST https://api.bitbucket.org/2.0/repositories/.../commit/.../statuses/build
```

**Verification:**

To verify artifacts were uploaded successfully, check build logs:
```bash
node .pipeline/scripts/debug-pipeline.js logs 42
grep -i "artifact\|upload" logs/pipeline-42/build-*.log
```

Look for:
```
Searching for files matching artifact pattern ai-code-buddy-*.zip
Artifact pattern matched 1 files with a total size of 26.8 KiB
Successfully uploaded artifact in 0 seconds
```

**Impact on Automation:**

| Task | Possible? | Method |
|------|-----------|--------|
| List artifacts | ❌ No | Web UI only |
| Download artifacts | ❌ No | Web UI only (14 days) |
| Verify artifact uploaded | ✅ Yes | Parse build logs |
| Check artifact size | ✅ Yes | Parse build logs |
| Long-term storage | ✅ Yes | Downloads API or S3 |

**Recommendation:**

For DevOps automation and monitoring:
1. **Short-term (< 14 days)**: Use web UI link from our tooling
2. **Long-term**: Implement Downloads API upload in pipeline
3. **Verification**: Parse build logs to confirm artifact upload success

---

## Case Study: Artifact Publishing Fix

This case study documents the real debugging session that led to fixing artifact publishing in this repository.

### Problem Statement

ZIP artifacts were not appearing in the Bitbucket Pipelines artifacts section, only `build-info.json` was visible.

### Initial Hypothesis (Wrong)

❌ "The wildcard `ai-code-buddy-*.zip` is causing issues, need to use specific filename"

### Debugging Process

**Step 1: Verify pipeline status**
```bash
node .pipeline/scripts/check-artifacts.js main
```
Result: Pipeline successful, but no artifacts visible via API.

**Step 2: Fetch build logs**
```bash
node .pipeline/scripts/debug-pipeline.js logs 20
grep -i "artifact" logs/pipeline-20/*.log
```

**Step 3: Analyze artifact declaration**
```yaml
artifacts:
  - ai-code-buddy-v${VERSION}-${GIT_COMMIT}.zip  # ❌ Variables not expanded!
```

### Root Cause

Bitbucket Pipelines **does not support variable substitution** in the `artifacts:` section. The system was literally looking for a file named `ai-code-buddy-v${VERSION}-${GIT_COMMIT}.zip` (with dollar signs and braces).

### Solution

1. Create ZIP with fixed name
2. Rename to include version/commit
3. Use wildcard in artifacts section

```yaml
script:
  - cd build
  - zip -r "../ai-code-buddy.zip" .
  - cd ..
  - mv "ai-code-buddy.zip" "ai-code-buddy-v${VERSION}-${GIT_COMMIT}.zip"
  - ls -lh ai-code-buddy-*.zip  # Verify file exists
artifacts:
  - ai-code-buddy-*.zip  # Wildcard matches actual filename
  - build-info.json
```

### Verification

```bash
node .pipeline/scripts/debug-pipeline.js logs 22
grep -i "artifact" logs/pipeline-22/*.log
```

**Success indicators in logs:**
```
Searching for files matching artifact pattern ai-code-buddy-*.zip
Artifact pattern matched 1 files with a total size of 26.8 KiB
Successfully uploaded artifact in 0 seconds
```

### Lessons Learned

1. **Don't assume variable expansion works everywhere** - Test each YAML section
2. **Always check build logs** - API may not reflect actual artifact status
3. **Wildcard patterns work** - Use them to match dynamically-named files
4. **The file must exist when artifacts are collected** - Verify with `ls`

---

## Best Practices

### 1. Incremental Changes

Make small, testable changes. Each commit should:
- Fix one specific issue
- Include verification steps in commit message
- Be easily revertible

### 2. Document Discoveries

When you find a solution, document:
- The symptom
- The root cause
- The fix
- How to verify it works

### 3. Use Descriptive Commit Messages

```bash
# ✅ Good
git commit -m "Fix artifact publishing: use static filename then rename

- Bitbucket Pipelines doesn't expand variables in artifacts section
- Solution: Create fixed filename, rename with variables, match with wildcard
- Verified: 'Artifact pattern matched 1 files' in build logs"

# ❌ Bad
git commit -m "Fix artifacts"
```

### 4. Monitor Every Build

Don't push and walk away. Use `monitor-pipeline.js` to catch issues immediately:

```bash
git push && node .pipeline/scripts/monitor-pipeline.js main
```

### 5. Keep Logs Organized

Save important logs for future reference:
```bash
node .pipeline/scripts/debug-pipeline.js logs 42
mv logs/pipeline-42 logs/saved/2025-10-11-artifact-fix
```

---

## Troubleshooting the Tools

### "Error: BITBUCKET_USERNAME and BITBUCKET_APP_PASSWORD must be set"

**Solution:** Create `.env.pipeline` file with credentials (see [Setup](#setup))

### "Error: Status 401 Unauthorized"

**Causes:**
1. Wrong username/password
2. App password expired
3. Insufficient permissions

**Solution:**
1. Verify credentials in `.env.pipeline`
2. Generate new app password
3. Ensure permissions include "Repositories: Read" and "Pipelines: Read"

### "Error: Status 403 Forbidden"

**Cause:** App password missing required scopes

**Solution:** Create new app password with these permissions:
- Repositories: Read
- Pipelines: Read
- Pull requests: Write (if using autonomous-fix)

---

## Advanced Techniques

### Parallel Debugging

Debug multiple pipelines simultaneously:

```bash
# Terminal 1
node .pipeline/scripts/monitor-pipeline.js main

# Terminal 2
node .pipeline/scripts/monitor-pipeline.js feature-branch

# Terminal 3
node .pipeline/scripts/debug-pipeline.js logs 42
```

### Automated Testing

Test pipeline changes without pushing:

```bash
# 1. Validate YAML
node .pipeline/scripts/validate-yaml.js

# 2. Use custom branch for testing
git checkout -b test/pipeline-fix
git push origin test/pipeline-fix

# 3. Monitor
node .pipeline/scripts/monitor-pipeline.js test/pipeline-fix

# 4. If successful, merge to main
```

### Log Analysis Scripts

Create custom analysis scripts:

```bash
# Find all errors in recent logs
find logs/ -name "*.log" -exec grep -H "error\|fail" {} \;

# Count artifact uploads
grep -r "Successfully uploaded artifact" logs/ | wc -l

# Extract timing information
grep -r "in [0-9]* seconds" logs/
```

---

## Contributing

If you discover new issues or solutions:

1. Document the issue in this guide
2. Add example code/commands
3. Include verification steps
4. Update the Common Issues section

---

## Resources

- [Bitbucket Pipelines Documentation](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)
- [Bitbucket API v2 Reference](https://developer.atlassian.com/bitbucket/api/2/reference/)
- [YAML Specification](https://yaml.org/spec/1.2/spec.html)

---

**Last Updated:** 2025-10-11
**Authors:** Development Team
**Status:** Production-ready
