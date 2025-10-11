# AI Code Buddy - Project Summary

## Overview
Chrome extension that integrates AI (Claude, OpenAI, Gemini, Ollama) into web-based terminals (RPort, Cloud Shell, GitPod) to help developers debug scripts and fix errors.

## Repositories
- **Bitbucket (source):** https://bitbucket.org/kumaakh/ai-code-buddy
- **GitHub (docs):** https://github.com/Apra-Labs/ai-code-buddy
- **GitHub Pages:** https://apra-labs.github.io/ai-code-buddy/

## Current Status - Chrome Web Store Submission

### ✅ Completed
- Extension code (v2.0.0) with modern { } branding
- Bitbucket Pipelines CI/CD with git traceability
- Build package: ai-code-buddy-v2.0.0.zip
- Promotional images (440x280, 1400x560)
- Store listing copy with privacy justifications
- Privacy policy (GDPR/CCPA compliant)
- Icon (128x128 PNG)
- Documentation microsite (GitHub Pages)

### ⏳ In Progress
- **Screenshots** (1-5 needed, dimensions: 640x800 for popup, 1280x800 for web pages)
- **Promo video** (optional)

### 📁 Key Files
- `manifest.json` - Extension manifest (v2.0.0)
- `popup-multi.html` - Main popup UI
- `content.js` - Content script for terminals
- `chrome-store/store-listing.md` - Complete submission guide
- `bitbucket-pipelines.yml` - CI/CD configuration
- `VERSION.json` - Release tracking

---

## 🎯 Current Task: Redesign Popup UI

**Problem:**
The popup window is not user-friendly:
- Provider tiles take too much space
- Save button is hidden below fold
- Requires scrolling (scroll bar appears)
- Not clean/simple appearance

**Goal:**
Redesign `popup-multi.html` for better UX:
- Simpler, cleaner layout
- All essential controls visible without scrolling
- Save button easily accessible
- More compact provider selection

**Files to modify:**
- `popup-multi.html` (main UI)
- `popup-multi.js` (if layout changes affect logic)
- `styles.css` (styling)

---

**Last Updated:** 2025-10-11
**Version:** 2.0.0
**Status:** Preparing for Chrome Web Store submission
