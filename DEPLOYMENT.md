# AI Code Buddy - Deployment Guide

## Version Tracking & Release Process

This project uses **Bitbucket Pipelines** for automated builds with full git traceability.

---

## 🔄 Automated Build Process

### What Gets Baked Into Each Build:

Every extension build automatically includes `build-info.json`:

```json
{
  "version": "2.0.0",
  "git_commit": "3fe6800",
  "git_commit_full": "3fe6800a1b2c3d4e5f6789...",
  "git_branch": "main",
  "git_tag": "v2.0.0",
  "build_date": "2025-10-11T10:30:00Z",
  "build_number": "42",
  "bitbucket_repo": "kumaakh/ai-code-buddy",
  "bitbucket_commit_url": "https://bitbucket.org/kumaakh/ai-code-buddy/commits/3fe6800",
  "github_docs": "https://github.com/Apra-Labs/ai-code-buddy",
  "github_pages": "https://apra-labs.github.io/ai-code-buddy/"
}
```

This ensures **every published version** can be traced back to exact source code.

---

## 📦 Release Workflow

### Option 1: Automatic Build on Push (Recommended)

**Every push to `main` automatically:**
1. ✅ Builds extension with git metadata
2. ✅ Runs validation tests
3. ✅ Creates ZIP artifact: `ai-code-buddy-v2.0.0-3fe6800.zip`
4. ✅ Creates git tag: `v2.0.0` (if doesn't exist)

**To deploy:**
```bash
# 1. Update version in manifest.json
nano manifest.json  # Change "version": "2.0.0" to "2.1.0"

# 2. Commit and push
git add manifest.json
git commit -m "Bump version to 2.1.0"
git push origin main

# 3. Bitbucket Pipelines automatically:
#    - Builds extension
#    - Creates artifact
#    - Tags commit as v2.1.0

# 4. Download artifact from Bitbucket Pipelines
#    Go to: https://bitbucket.org/kumaakh/ai-code-buddy/pipelines
#    Click on the latest successful build for main branch
#    Click "Artifacts" tab at the top
#    Download: ai-code-buddy-v2.1.0-{git-hash}.zip

# 5. Upload to Chrome Web Store
```

---

### Option 2: Tagged Release (For Major Releases)

**For major releases, use git tags:**

```bash
# 1. Update version in manifest.json
nano manifest.json  # Change to "2.1.0"

# 2. Commit changes
git add manifest.json
git commit -m "Release v2.1.0"

# 3. Create and push tag
git tag -a v2.1.0 -m "Release v2.1.0 - Added feature X"
git push origin v2.1.0

# 4. Bitbucket Pipelines triggers "tag" pipeline:
#    - Builds release
#    - Runs full validation
#    - Creates artifact with special release notes

# 5. Download from Pipelines
#    https://bitbucket.org/kumaakh/ai-code-buddy/pipelines
#    Select the build → Artifacts tab → Download ZIP
#
# 6. Upload to Chrome Web Store
```

---

## 🔍 Version Correspondence Tracking

### Finding Source Code for a Published Extension:

**Method 1: From Extension (Developer Mode)**
```bash
# 1. Install extension in Chrome
# 2. Go to chrome://extensions
# 3. Enable Developer Mode
# 4. Click "Inspect views: service worker"
# 5. In console, run:
fetch(chrome.runtime.getURL('build-info.json'))
  .then(r => r.json())
  .then(console.log)

# Output shows exact git commit, build date, and links
```

**Method 2: From Downloaded ZIP**
```bash
# Extract and check build-info.json
unzip -p ai-code-buddy-v2.0.0.zip build-info.json

# Shows exact commit hash and Bitbucket URL
```

**Method 3: From Bitbucket Artifacts**
```
Go to: https://bitbucket.org/kumaakh/ai-code-buddy/pipelines
Click: Build #42 → Artifacts tab
Download: ai-code-buddy-v2.0.0-3fe6800.zip
          ↑ This hash matches git commit

Artifacts are stored in each pipeline build and can be accessed via:
https://bitbucket.org/kumaakh/ai-code-buddy/pipelines/results/{BUILD_NUMBER}/artifacts
```

---

## 📊 Version History Tracking

### Update VERSION.json After Publication

After publishing to Chrome Web Store:

```bash
# 1. Get the Chrome Web Store URL
STORE_URL="https://chrome.google.com/webstore/detail/abc123..."

# 2. Update VERSION.json
nano VERSION.json

# 3. Add publication info:
{
  "version": "2.0.0",
  "chrome_web_store": {
    "status": "published",
    "submission_date": "2025-10-11",
    "published_date": "2025-10-13",
    "store_url": "https://chrome.google.com/webstore/detail/abc123..."
  }
}

# 4. Commit and push
git add VERSION.json
git commit -m "Update VERSION.json with Chrome Web Store publication info"
git push origin main
```

---

## 🛠️ Manual Build (Local Development)

For local testing without CI/CD:

```bash
# Build with git metadata
./build-extension.sh

# Or on Windows
./build-extension.bat

# Output: ai-code-buddy-v2.0.0.zip
# Note: Won't have build-info.json unless manually created
```

---

## 🔐 Chrome Web Store Auto-Deployment (Optional)

To enable automatic upload to Chrome Web Store:

### Setup:

1. **Get Chrome Web Store API credentials:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Get Client ID, Client Secret, and Refresh Token

2. **Add to Bitbucket Repository Variables:**
   ```
   Settings → Repository variables:
   - CHROME_CLIENT_ID
   - CHROME_CLIENT_SECRET (secured)
   - CHROME_REFRESH_TOKEN (secured)
   - CHROME_APP_ID (your extension ID)
   ```

3. **Add deployment step to bitbucket-pipelines.yml:**
   ```yaml
   - step:
       name: Deploy to Chrome Web Store
       script:
         - npm install -g chrome-webstore-upload-cli
         - webstore upload --source ai-code-buddy-*.zip --auto-publish
   ```

**Note:** Manual review is recommended for major releases.

---

## 📋 Pre-Release Checklist

Before creating a new release:

- [ ] Update `manifest.json` version
- [ ] Update `VERSION.json` release notes
- [ ] Run tests locally: `cd test && node link-validator.js && node image-validator.js`
- [ ] Update `README.md` if needed
- [ ] Update `SECURITY.md` if security changes
- [ ] Create screenshots if UI changed
- [ ] Push to `main` branch
- [ ] Wait for Bitbucket Pipelines to build
- [ ] Download artifact from Pipelines
- [ ] Test extension locally before uploading
- [ ] Upload to Chrome Web Store
- [ ] Wait for Chrome review (1-3 days)
- [ ] Update `VERSION.json` with store URL
- [ ] Create GitHub release with changelog

---

## 🌐 Repository Correspondence

### Source Code Locations:

| Repository | Purpose | URL |
|------------|---------|-----|
| **Bitbucket** | Private source code, CI/CD | https://bitbucket.org/kumaakh/ai-code-buddy |
| **GitHub** | Public documentation, issues | https://github.com/Apra-Labs/ai-code-buddy |
| **GitHub Pages** | Microsite, privacy policy | https://apra-labs.github.io/ai-code-buddy/ |
| **Chrome Web Store** | Published extension | (After publication) |

### Correspondence Mechanism:

```
manifest.json version → Git tag → Bitbucket Pipeline build → Artifact ZIP → Chrome Web Store
      ↓                    ↓              ↓                        ↓                ↓
    2.0.0            v2.0.0 tag    Build #42 (3fe6800)    ai-code-buddy-v2.0.0-3fe6800.zip
                                                                     ↓
                                                          build-info.json contains:
                                                          - git_commit: 3fe6800
                                                          - bitbucket_commit_url
                                                          - build_date
                                                          - build_number: 42
```

---

## 🚨 Emergency Rollback

If a bad version is published:

1. **Find previous good version:**
   ```bash
   git tag -l
   # v1.9.0, v2.0.0, v2.1.0 (bad)
   ```

2. **Checkout previous version:**
   ```bash
   git checkout v2.0.0
   ```

3. **Create hotfix tag:**
   ```bash
   git tag -a v2.1.1 -m "Hotfix: Rollback v2.1.0 issue"
   git push origin v2.1.1
   ```

4. **Download artifact from Pipelines**

5. **Upload to Chrome Web Store as v2.1.1**

---

## 📝 Build Artifact Naming Convention

| Filename | Purpose | When Created |
|----------|---------|--------------|
| `ai-code-buddy-v2.0.0-3fe6800.zip` | Unique build with git hash | Every build |
| `ai-code-buddy-v2.0.0.zip` | Latest build for version | Every build (copy) |
| `build-info.json` | Build metadata | Every build (artifact) |

The git hash in the filename ensures **no two builds are identical** even if version numbers match.

---

## 🎯 Best Practices

1. **Never manually edit version numbers** - Always update `manifest.json` and commit
2. **Always use Pipelines builds for releases** - Ensures traceability
3. **Keep VERSION.json updated** - Record Chrome Web Store publication dates
4. **Tag all releases** - `git tag v2.0.0` for easy reference
5. **Download artifacts from Pipelines** - Don't use local builds for production
6. **Test before tagging** - Push to main, test artifact, then create tag
7. **Document breaking changes** - Update VERSION.json release notes

---

## 📞 Support

- **Build Issues:** Check Bitbucket Pipelines logs
- **Version Tracking:** Review `build-info.json` in ZIP
- **Git History:** `git log --oneline --graph --all`
- **Tag History:** `git tag -l -n`

---

**Last Updated:** 2025-10-11
**Current Version:** 2.0.0
**Build System:** Bitbucket Pipelines + Git Tags
