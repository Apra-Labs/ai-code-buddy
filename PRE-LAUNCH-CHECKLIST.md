# AI Code Buddy - Pre-Launch Checklist

Complete checklist before Chrome Web Store submission.

## Repository Status

### Bitbucket (Source Code)
- [ ] All code committed to Bitbucket
- [ ] Latest build package created (ai-code-buddy-v2.0.0.zip)
- [ ] All tests passing
- [ ] No uncommitted changes

### GitHub (Public Documentation)
- [ ] GitHub repository created: https://github.com/Apra-Labs/ai-code-buddy
- [ ] GitHub repository files pushed:
  - [ ] LICENSE
  - [ ] README.md
  - [ ] CONTRIBUTING.md
  - [ ] CODE_OF_CONDUCT.md
  - [ ] SECURITY.md
  - [ ] Issue templates (.github/ISSUE_TEMPLATE/)
- [ ] GitHub Pages enabled
- [ ] docs-site/ folder published to GitHub Pages
- [ ] GitHub Pages URL working: https://apra-labs.github.io/ai-code-buddy/

---

## Extension Files

### Core Files
- [ ] manifest.json (version 2.0.0)
- [ ] popup-multi.html (updated with correct links)
- [ ] popup.html (updated with correct links)
- [ ] content.js
- [ ] background.js
- [ ] config.js

### Icons
- [ ] icons/icon16.png (16x16)
- [ ] icons/icon48.png (48x48)
- [ ] icons/icon128.png (128x128)
- [ ] All icons use modern { } design (not robot emoji)

### Build Package
- [ ] Build script tested (build-extension.sh / build-extension.bat)
- [ ] ZIP file generated: ai-code-buddy-v2.0.0.zip
- [ ] ZIP size reasonable (~43KB, not 20MB)
- [ ] node_modules excluded from ZIP
- [ ] Test files excluded from ZIP

---

## Documentation

### Main Documentation
- [ ] README.md (updated, concise)
- [ ] API-KEYS-GUIDE.md (comprehensive)
- [ ] SECURITY.md (updated for 2025)

### Microsite (docs-site/)
- [ ] index.html (homepage)
- [ ] quick-start.html
- [ ] api-keys.html
- [ ] security.html
- [ ] troubleshooting.html
- [ ] privacy.html (NEW - required for Chrome Web Store)
- [ ] All pages use 2025 copyright
- [ ] All internal links working
- [ ] All external links working
- [ ] Responsive design tested

### Chrome Web Store Assets
- [ ] chrome-store/promotional-tile-small.png (440x280)
- [ ] chrome-store/promotional-marquee.png (1400x560)
- [ ] chrome-store/store-listing.md (complete)
- [ ] chrome-store/screenshot-guide.md

---

## Chrome Web Store Submission Requirements

### Required Assets
- [ ] Extension ZIP package
- [ ] At least 1 screenshot (1280x800 recommended)
- [ ] Promotional small tile (440x280)
- [ ] Store listing text (short + detailed description)
- [ ] Privacy policy URL
- [ ] Category selected (Developer Tools)

### Recommended Assets (5 screenshots @ 1280x800)
- [ ] Screenshot 1: Provider selection
- [ ] Screenshot 2: Configuration settings
- [ ] Screenshot 3: RPort terminal with button
- [ ] Screenshot 4: AI response with improved code
- [ ] Screenshot 5: Advanced settings

### Store Listing Information
- [ ] Short description (132 chars) written
- [ ] Detailed description written
- [ ] Keywords/tags identified
- [ ] Privacy policy URL ready: https://apra-labs.github.io/ai-code-buddy/privacy.html
- [ ] Support URL ready: https://github.com/Apra-Labs/ai-code-buddy/issues
- [ ] Homepage URL ready: https://apra-labs.github.io/ai-code-buddy/

---

## Validation Tests

### Automated Tests
Run these tests before submission:

```bash
# Link validation
cd test
node link-validator.js

# Image validation
node image-validator.js
```

### Link Validation
- [ ] All HTML links tested
- [ ] All Markdown links tested
- [ ] All relative paths verified
- [ ] All external URLs reachable
- [ ] No broken links in extension popup
- [ ] No broken links in documentation

### Image Validation
- [ ] Extension icons validated (16, 48, 128px)
- [ ] Promotional images validated (440x280, 1400x560)
- [ ] Screenshots validated (if created)
- [ ] All images under 5MB limit
- [ ] All images correct dimensions
- [ ] All images correct format (PNG)

### Manual Testing
- [ ] Extension loads in Chrome without errors
- [ ] Extension popup opens correctly
- [ ] Settings save and load properly
- [ ] API key storage working
- [ ] "Send to AI" button appears on test pages
- [ ] AI response received from at least one provider
- [ ] Links in popup work correctly
- [ ] Privacy policy link opens correctly

---

## Security & Privacy

### Code Review
- [ ] No hardcoded API keys
- [ ] No sensitive data in code
- [ ] Local storage implemented correctly
- [ ] No tracking or analytics
- [ ] No external data collection

### Privacy Policy
- [ ] Privacy policy created (docs-site/privacy.html)
- [ ] Policy emphasizes zero data collection
- [ ] Policy explains local storage
- [ ] Policy covers GDPR/CCPA requirements
- [ ] Policy linked from extension popup
- [ ] Policy linked in Chrome Web Store listing

### Security Audit
- [ ] SECURITY.md up to date
- [ ] Security contact email listed (akhil@apralabs.com)
- [ ] No known vulnerabilities
- [ ] Dependencies reviewed (sharp in dev only)

---

## Branding & Design

### Visual Identity
- [ ] All robot emojis replaced with { } or sparkle icons
- [ ] Apra Labs green (#94BA33) used consistently
- [ ] Modern icon design throughout
- [ ] Professional appearance
- [ ] Consistent typography

### Copyright & Attribution
- [ ] All copyright notices show 2025
- [ ] Author: Akhil Kumar (akhil@apralabs.com)
- [ ] No attribution to AI tools in commits or docs
- [ ] Company: Apra Labs
- [ ] Website: apralabs.com

---

## GitHub Pages Setup

### Before Publishing
- [ ] docs-site/ folder committed to GitHub
- [ ] GitHub Pages enabled in repository settings
- [ ] Source set to: root / docs-site folder (or main branch)
- [ ] Custom domain configured (if applicable)

### After Publishing
- [ ] Visit https://apra-labs.github.io/ai-code-buddy/
- [ ] Test all pages load correctly
- [ ] Test all navigation links
- [ ] Test all footer links
- [ ] Test privacy policy loads
- [ ] Verify responsive design on mobile

---

## Chrome Web Store Submission Steps

### 1. Developer Account
- [x] Chrome Web Store developer account created
- [x] $5 registration fee paid

### 2. Upload Extension
- [ ] Visit https://chrome.google.com/webstore/devconsole
- [ ] Click "New Item"
- [ ] Upload ai-code-buddy-v2.0.0.zip
- [ ] Wait for ZIP analysis

### 3. Store Listing
- [ ] Add store listing details:
  - [ ] Product name: AI Code Buddy
  - [ ] Summary: (132 chars from store-listing.md)
  - [ ] Detailed description: (from store-listing.md)
  - [ ] Category: Developer Tools
  - [ ] Language: English (US)

### 4. Graphics
- [ ] Upload icon (128x128 from ZIP)
- [ ] Upload small tile (440x280)
- [ ] Upload marquee (1400x560 - optional)
- [ ] Upload screenshots (1-5 images)

### 5. Privacy & Legal
- [ ] Single purpose description
- [ ] Privacy policy URL: https://apra-labs.github.io/ai-code-buddy/privacy.html
- [ ] Permissions justification (if prompted)

### 6. Distribution
- [ ] Visibility: Public
- [ ] Regions: All regions
- [ ] Pricing: Free

### 7. Submit
- [ ] Review all information
- [ ] Click "Submit for Review"
- [ ] Note submission date: _______________
- [ ] Expected review time: 1-3 business days

---

## Post-Submission

### Monitoring
- [ ] Check email for Chrome Web Store updates
- [ ] Monitor submission status in developer console
- [ ] Respond to any review feedback within 7 days

### If Approved
- [ ] Extension published
- [ ] Test installation from Chrome Web Store
- [ ] Share extension URL with team
- [ ] Announce on social media (if applicable)
- [ ] Monitor initial reviews and feedback

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Fix issues mentioned
- [ ] Re-test thoroughly
- [ ] Re-submit with explanation of changes

---

## Marketing & Launch

### Announcement Channels
- [ ] GitHub repository announcement
- [ ] Apra Labs website
- [ ] Social media (if applicable)
- [ ] Email existing RPort users (if applicable)

### Documentation Links
- [ ] Update any marketing materials with Chrome Web Store link
- [ ] Update README with installation badge
- [ ] Add "Get it on Chrome Web Store" badge

---

## Maintenance Plan

### Regular Updates
- [ ] Monitor GitHub issues weekly
- [ ] Respond to user feedback within 48 hours
- [ ] Plan feature updates (v2.1, v2.2, etc.)
- [ ] Security updates as needed

### Documentation Updates
- [ ] Keep API-KEYS-GUIDE updated with provider changes
- [ ] Update troubleshooting guide based on common issues
- [ ] Add FAQ section based on user questions

---

## Test Results

### Link Validator
```bash
cd test
node link-validator.js
```

**Results:**
- Date run: _______________
- Passed: ___ / ___
- Failed: ___ / ___
- Status: ☐ PASS ☐ FAIL

### Image Validator
```bash
cd test
node image-validator.js
```

**Results:**
- Date run: _______________
- Passed: ___ / ___
- Failed: ___ / ___
- Status: ☐ PASS ☐ FAIL

---

## Sign-Off

### Technical Review
- [ ] All tests passing
- [ ] All links verified
- [ ] All images validated
- [ ] Extension loads without errors
- [ ] Documentation complete

**Reviewed by:** _______________
**Date:** _______________

### Business Review
- [ ] Branding consistent
- [ ] Marketing materials ready
- [ ] Support channels ready
- [ ] Privacy policy compliant
- [ ] Ready for public launch

**Approved by:** _______________
**Date:** _______________

---

## Quick Launch Command Reference

```bash
# Generate icons
cd icons
node generate-icons.js

# Generate promotional images
cd chrome-store
node generate-promotional-images.js

# Build extension package
./build-extension.sh
# or on Windows:
./build-extension.bat

# Run validation tests
cd test
node link-validator.js
node image-validator.js

# Git status
git status
git log --oneline -5

# Commit and push (if needed)
git add .
git commit -m "Prepare for Chrome Web Store submission"
git push origin main
```

---

**Last Updated:** 2025-10-11
**Version:** 2.0.0
**Status:** ☐ Ready for Submission ☐ In Progress ☐ Blocked

**Notes:**
_Add any additional notes or blockers here..._
