# Chrome Web Store - Privacy Practices & Justifications

## Required Justifications for AI Code Buddy v2.0.0

---

## 1. Single Purpose Description

**Single Purpose:**
```
AI Code Buddy integrates AI assistance into web-based terminals and text areas to help developers debug scripts, fix errors, and optimize code.
```

**Detailed explanation (if needed):**
```
This extension adds AI-powered code analysis capabilities to web terminals (like RPort, Cloud Shell, GitPod). Users select terminal output or scripts, click a button to send to AI, and receive explanations, fixes, and improvements. The extension does one thing: bridge web terminals with AI providers for development assistance.
```

---

## 2. Permission Justifications

### A. activeTab Permission

**Justification:**
```
Required to inject the "Send to AI" button into web pages and read selected text when the user explicitly activates the extension. This allows users to select terminal output or code snippets and send them to AI for analysis. The extension only accesses the active tab when the user clicks the extension icon or "Send to AI" button.
```

**Data handling:**
```
The selected text is read only when explicitly requested by the user and is sent directly to the user's chosen AI provider (Claude, OpenAI, or Gemini) using the user's own API key. No data is collected, stored on servers, or transmitted to our servers.
```

---

### B. storage Permission

**Justification:**
```
Required to securely store user preferences and API keys locally in the browser using Chrome's encrypted storage API. This includes:
- User's AI provider choice (Claude, OpenAI, Gemini, or Ollama)
- User's API key (encrypted by Chrome)
- AI model selection and parameters (temperature, max tokens)
- UI preferences (button position, theme)

All data is stored locally on the user's device and never transmitted to our servers. Users can export, import, or delete their settings at any time.
```

**Data handling:**
```
API keys and settings are stored exclusively in Chrome's local storage using chrome.storage.local API. This data never leaves the user's browser except when the user explicitly sends a request to their chosen AI provider using their own API key. We do not have access to this data.
```

---

### C. Host Permissions

**Required hosts:**
```
- https://api.anthropic.com/* - Claude AI API
- https://api.openai.com/* - OpenAI GPT API
- https://generativelanguage.googleapis.com/* - Google Gemini API
- https://api.cohere.ai/* - Cohere API (optional provider)
- https://api-inference.huggingface.co/* - HuggingFace models (optional)
- https://api.replicate.com/* - Replicate API (optional provider)
- https://api.github.com/* - GitHub API (future feature)
- https://*/* and http://*/* - All websites for content script injection
```

**Justification:**
```
Host permissions are required for two purposes:

1. AI Provider APIs: The extension needs to make direct API calls to the user's chosen AI provider (Claude, OpenAI, Gemini, etc.) using the user's own API key. These are HTTPS requests containing the selected code/text and receiving AI responses.

2. Content Script Injection: Permission to inject our "Send to AI" button into any web-based terminal or text area (RPort, Cloud Shell, GitPod, AWS CloudShell, VS Code Web, etc.). The extension works across multiple terminal platforms, so broad host permissions are necessary.

All API calls are made directly from the user's browser to the AI provider - there is no intermediary server. The user controls which text is sent and can inspect all network requests.
```

**Data handling:**
```
Selected text/code is sent only to the user's chosen AI provider using their API key. We do not intercept, store, or transmit this data to any other servers. The extension acts as a client-side bridge between web terminals and AI APIs.
```

---

### D. Remote Code Use

**Justification:**
```
This extension does NOT execute remote code. All extension code is included in the package and reviewed during Chrome Web Store submission.

If this refers to API responses from AI providers: The extension receives text responses from AI APIs (Claude, OpenAI, Gemini) which may contain code suggestions. These are displayed to the user as plain text. The user can choose to manually copy and use the suggestions, but the extension does not automatically execute any code from AI responses.

No eval(), Function(), or similar dynamic code execution is used in this extension.
```

**Clarification:**
```
The extension does not load external scripts or execute remotely-hosted code. All JavaScript files are bundled in the extension package:
- background.js (service worker)
- content.js (content script)
- popup-multi.js (popup UI)
- providers.js (AI provider configurations)

AI responses are treated as plain text and displayed in a dialog for user review.
```

---

## 3. Data Usage Certification

### Data Collected: NONE

**Certification statement:**
```
AI Code Buddy does NOT collect, transmit, or store any user data on external servers.

✓ NO data collection
✓ NO analytics or tracking
✓ NO user accounts or authentication
✓ NO backend servers
✓ NO third-party data sharing (except direct user-to-AI-provider communication)

All data (API keys, settings) is stored locally using Chrome's encrypted storage and never transmitted to our servers. The extension facilitates direct communication between the user's browser and their chosen AI provider (Claude, OpenAI, Gemini) using the user's own API key.
```

### Privacy Policy URL:
```
https://apra-labs.github.io/ai-code-buddy/privacy.html
```

### Compliance:
- ✓ GDPR compliant (no personal data collection)
- ✓ CCPA compliant (no personal data sale)
- ✓ Chrome Developer Program Policies compliant
- ✓ User Data Privacy policies compliant

---

## 4. Data Handling Disclosure (for Privacy Practices Tab)

### Does your extension collect or transmit user data?
**Answer: NO**

### What data is accessed?
**Answer:**
```
- Selected text/code from web pages (only when user clicks "Send to AI")
- User's AI provider API key (stored locally, encrypted by Chrome)
- User preferences (AI model, settings - stored locally)
```

### How is data used?
**Answer:**
```
Selected text is sent directly to the user's chosen AI provider (Claude/OpenAI/Gemini) using the user's API key. API keys and preferences are stored locally in Chrome's encrypted storage for user convenience. No data is sent to our servers or third parties.
```

### Is data encrypted in transit?
**Answer: YES**
```
All API communication uses HTTPS/TLS encryption. Data is sent directly from the user's browser to the AI provider (Anthropic, OpenAI, Google) over encrypted connections.
```

### Is data encrypted at rest?
**Answer: YES**
```
Chrome automatically encrypts data stored via chrome.storage.local API. API keys are stored using this encrypted storage mechanism.
```

### Will you sell or transfer user data?
**Answer: NO**
```
We do not collect user data, therefore cannot sell or transfer it. The extension has no backend servers and no data collection infrastructure.
```

---

## 5. Icon Requirements

**Icon files included in package:**
- icons/icon16.png (16x16 pixels)
- icons/icon48.png (48x48 pixels)
- icons/icon128.png (128x128 pixels)

**Note:** The 128x128 icon should be automatically extracted from the ZIP during upload. If not recognized, manually upload icons/icon128.png from the extension package.

**Icon design:**
- Modern code brackets { } with AI spark element
- Apra Labs green (#94BA33) branding
- PNG format with transparency
- Square aspect ratio

---

## 6. Screenshots

**Requirement:** At least 1 screenshot (1280x800 recommended)

**Location in project:**
```
chrome-store/screenshot-guide.md - Detailed guide for creating screenshots
```

**Recommended screenshots (5 total):**
1. Extension popup - Provider selection
2. Configuration screen with API key entry
3. RPort terminal with "Send to AI" button visible
4. AI response dialog with code improvement
5. Advanced settings panel

**If not yet created:**
- See chrome-store/screenshot-guide.md for detailed instructions
- Minimum 1 screenshot required to proceed
- 1280x800 pixels recommended
- PNG format

---

## 7. Privacy Practices Tab - Complete Checklist

### Required Actions in Chrome Web Store Developer Console:

1. **Go to Privacy Practices tab**

2. **Single Purpose:**
   - Paste: "AI Code Buddy integrates AI assistance into web-based terminals and text areas to help developers debug scripts, fix errors, and optimize code."

3. **Data Usage:**
   - Select: "This item does not collect user data"
   - OR if that's not available, select minimal options and explain in justifications

4. **Permission Justifications:**
   - activeTab: Paste justification from Section 2.A above
   - storage: Paste justification from Section 2.B above
   - host permissions: Paste justification from Section 2.C above

5. **Remote Code:**
   - If asked: Select "No" or paste justification from Section 2.D above

6. **Privacy Policy:**
   - Enter: https://apra-labs.github.io/ai-code-buddy/privacy.html

7. **Certification:**
   - Check box: "I certify that my data usage complies with the Developer Program Policies"

8. **Save Privacy Practices**

9. **Upload Icon:**
   - If not auto-detected, manually upload icons/icon128.png

10. **Upload Screenshot(s):**
    - Upload at least 1 screenshot (1280x800)
    - Follow chrome-store/screenshot-guide.md to create

11. **Submit for Review**

---

## Quick Copy-Paste Responses

### Single Purpose (132 chars max):
```
Integrates AI assistance into web terminals to help developers debug scripts, fix errors, and optimize code.
```

### activeTab Justification (short):
```
Required to inject the "Send to AI" button and read user-selected text only when the user explicitly activates the extension by clicking the button. No automatic data collection.
```

### storage Justification (short):
```
Stores user API keys and preferences locally in Chrome's encrypted storage. Data never leaves the user's device except when user sends requests to their chosen AI provider.
```

### host permissions Justification (short):
```
Required to: (1) Make API calls to user's chosen AI provider (Claude/OpenAI/Gemini) using user's API key, (2) Inject "Send to AI" button into web-based terminals (RPort, Cloud Shell, GitPod, etc.). All data sent directly to AI provider, not to our servers.
```

### Remote Code Justification (short):
```
No remote code execution. All extension code is bundled in the package. AI responses are displayed as plain text only, not executed. No eval() or dynamic code loading used.
```

### Data Collection Statement:
```
This extension does NOT collect user data. API keys and preferences are stored locally using Chrome's encrypted storage. Selected text is sent directly to user's chosen AI provider (Claude/OpenAI/Gemini) using user's own API key. No backend servers, no analytics, no tracking.
```

---

## Support Resources

- **Privacy Policy:** https://apra-labs.github.io/ai-code-buddy/privacy.html
- **Security:** https://apra-labs.github.io/ai-code-buddy/security.html
- **Documentation:** https://apra-labs.github.io/ai-code-buddy/
- **Issue Tracker:** https://github.com/Apra-Labs/ai-code-buddy/issues
- **Contact:** akhil@apralabs.com

---

**Last Updated:** 2025-10-11
**Version:** 2.0.0
**Prepared for:** Chrome Web Store Submission
