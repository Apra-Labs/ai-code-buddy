# AI Code Buddy - Project Summary

## Overview
Chrome extension that integrates AI (Claude, OpenAI, Gemini, Ollama) into web-based terminals (RPort, Cloud Shell, GitPod) to help developers debug scripts and fix errors.

**🎉 Now Open Source!** - MIT License for code, CC BY 4.0 for documentation

## Repositories
- **GitHub (primary):** https://github.com/Apra-Labs/ai-code-buddy
- **GitHub Pages:** https://apra-labs.github.io/ai-code-buddy/

## Current Status - Open Source on GitHub

### ✅ Completed (v2.1.0)
- Extension code with modern { } branding
- **GitHub Actions CI/CD**
- **MIT License** for source code
- **Creative Commons CC BY 4.0** for documentation
- **Open Source Release** on GitHub
- Build automation with GitHub Releases
- Documentation site on GitHub Pages
- CONTRIBUTING.md and PR/Issue templates
- Promotional images (440x280, 1400x560)
- Privacy policy (GDPR/CCPA compliant)
- Icon (128x128 PNG)

### 📁 Key Files
- `manifest.json` - Extension manifest
- `LICENSE` - MIT License for source code
- `docs/LICENSE` - CC BY 4.0 for documentation
- `.github/workflows/build-and-release.yml` - GitHub Actions CI/CD
- `CONTRIBUTING.md` - Contribution guidelines
- `MIGRATION-TO-GITHUB.md` - Migration guide
- `popup-multi.html` - Main popup UI
- `content.js` - Content script for terminals
- `VERSION.json` - Release tracking

## GitHub Actions Workflow

The project now uses GitHub Actions for CI/CD:

1. **Test Job**: Runs all unit tests
2. **Validate Job**: Validates images and links
3. **Build Job**: Creates release package with build-info.json
4. **Create Release Job**: Automatically creates GitHub releases
5. **Publish Docs Job**: Deploys documentation to GitHub Pages

Workflow triggers:
- Every push to `main` branch (runs all jobs + creates release)
- Every pull request (runs test, validate, build only)
- Manual workflow dispatch

Build artifacts:
- Chrome extension ZIP with commit hash
- Build info JSON with metadata
- Automatic GitHub Release creation

---

**Last Updated:** 2025-10-12
**Version:** 2.1.0
**Status:** Open Source on GitHub
