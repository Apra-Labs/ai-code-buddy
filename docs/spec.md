# RPort Claude Assistant - Chrome Extension Specification

## Project Overview
Build a Chrome extension that integrates Claude AI directly into the RPort web interface, eliminating the need to copy-paste commands and outputs between RPort and Claude Code/VSCode.

## User Workflow (Current Pain Point)
1. User develops script using Claude Code in VSCode
2. User logs into RPort server via Chrome browser
3. User selects a test/dev server in RPort
4. User opens command window in RPort
5. User **copies** script from VSCode and **pastes** into RPort
6. If script fails, user **copies** error output from RPort
7. User **pastes** error into VSCode for Claude to analyze
8. Repeat steps 5-7 until script works

## Solution Goal
Enable user to:
1. Click "Send to Claude" button on any command output in RPort
2. Have Claude analyze the output and improve the script
3. Click "Insert" to automatically fill improved script into RPort command input
4. Never leave Chrome browser

---

## Technical Requirements

### 1. Extension Structure

```
rport-claude-assistant/
├── manifest.json
├── content.js
├── background.js
├── popup.html
├── popup.js
├── styles.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 2. manifest.json Configuration

```json
{
  "manifest_version": 3,
  "name": "RPort Claude Assistant",
  "version": "1.0.0",
  "description": "Integrate Claude AI into RPort for script improvement and analysis",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.anthropic.com/*",
    "https://*/*"
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 3. Content Script (content.js)

**Responsibilities:**
- Detect RPort interface elements
- Inject "Send to Claude" and "Insert Improved Script" buttons
- Capture command output and script text
- Display improved scripts from Claude
- Handle user interactions

**Key Features:**

```javascript
// 1. Detect RPort UI Elements
// - Find command output areas (likely in <pre>, <code>, or specific class divs)
// - Find command input fields/textareas
// - Use MutationObserver to handle dynamic content loading

// 2. Add "Send to Claude" Button
// - Insert button near command output
// - Style to match RPort UI (or use distinct Claude branding)
// - On click: capture output text and send to background script

// 3. Add "Insert Improved Script" Button
// - Insert button near command input area
// - Initially hidden/disabled
// - Shows when improved script is ready
// - On click: populate command input with improved script

// 4. Message Passing
// - Send captured output to background.js
// - Receive improved script from background.js
// - Handle loading states and errors
```

**Selectors Strategy:**
Since we don't know RPort's exact HTML structure, use flexible detection:
```javascript
// Look for common patterns:
// - Command output: pre, code, .terminal, .output, .console
// - Command input: textarea, input[type="text"], .command-input
// - Allow user to configure selectors via popup if needed
```

### 4. Background Script (background.js)

**Responsibilities:**
- Store and manage Claude API key
- Handle API calls to Anthropic
- Process requests from content script
- Return improved scripts

**API Integration:**

```javascript
// Use Anthropic Messages API
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// Request format:
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: PROMPT
    }]
  })
}
```

**Prompt Engineering:**

```javascript
// Context-aware prompts based on action:

// For analyzing failed command output:
const ANALYZE_PROMPT = `
You are helping debug an RPort script that failed. 
Analyze the following command output and provide an improved script.

Original Script:
${originalScript}

Command Output/Error:
${commandOutput}

Provide ONLY the improved script with no explanation. 
The script should be ready to run immediately.
`;

// For general script improvement:
const IMPROVE_PROMPT = `
Improve the following RPort script for better error handling, 
efficiency, and reliability:

${script}

Provide ONLY the improved script with no explanation.
`;
```

### 5. Popup UI (popup.html + popup.js)

**Features:**
- API Key configuration (stored securely in chrome.storage.sync)
- Status indicator (connected/not connected)
- Quick actions:
  - "Improve selected text" for any highlighted script
  - Settings/preferences
- Usage stats (optional)

**Storage Schema:**
```javascript
{
  apiKey: 'sk-ant-...', // Encrypted in chrome.storage.sync
  autoImprove: false,   // Auto-improve on command failure
  modelPreference: 'claude-sonnet-4-20250514',
  customSelectors: {    // Allow user to customize if needed
    commandOutput: '.output-area',
    commandInput: '#command-input'
  }
}
```

### 6. Styles (styles.css)

**Requirements:**
- Buttons should be visually distinct but not obtrusive
- Match RPort's design language if possible
- Include loading states (spinner/pulse)
- Success/error visual feedback
- Responsive design

```css
/* Example button styling */
.claude-assist-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin: 4px;
  transition: all 0.2s;
}

.claude-assist-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.claude-assist-btn.loading {
  opacity: 0.7;
  cursor: wait;
}
```

---

## Implementation Steps

### Phase 1: Basic Setup (30 min)
1. Create project structure
2. Set up manifest.json
3. Create basic popup with API key input
4. Test extension loads in Chrome

### Phase 2: Content Script Integration (1-2 hours)
1. Implement flexible element detection for RPort UI
2. Add "Send to Claude" button injection
3. Add "Insert Improved Script" button injection
4. Test button placement and capture functionality

### Phase 3: Claude API Integration (1 hour)
1. Implement background script API calls
2. Add message passing between content and background scripts
3. Implement error handling and retries
4. Test with real Claude API

### Phase 4: Polish & UX (1 hour)
1. Add loading states and animations
2. Implement success/error notifications
3. Add keyboard shortcuts (optional)
4. Improve styling to match RPort

### Phase 5: Testing & Refinement (30 min)
1. Test with various RPort scenarios
2. Handle edge cases (empty output, network errors, etc.)
3. Optimize performance

---

## Edge Cases & Error Handling

### Must Handle:
1. **No API key configured**: Show clear message in popup
2. **API errors**: Display user-friendly error messages
3. **Network failures**: Retry logic with exponential backoff
4. **RPort UI changes**: Flexible selectors that don't break easily
5. **Large outputs**: Truncate if needed (API token limits)
6. **Empty/invalid responses**: Validate Claude's response before inserting

### Security Considerations:
1. **API Key Storage**: Use chrome.storage.sync (encrypted by Chrome)
2. **Never log API keys**: Sanitize all console logs
3. **Content Security Policy**: Proper CSP in manifest
4. **Input validation**: Sanitize all text before sending to API

---

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and saves API key
- [ ] Buttons appear in RPort interface
- [ ] "Send to Claude" captures output correctly
- [ ] Claude API call succeeds
- [ ] Improved script displays correctly
- [ ] "Insert" button populates command input
- [ ] Works with multiple RPort tabs
- [ ] Handles API errors gracefully
- [ ] Loading states display correctly
- [ ] Works after RPort page navigation

---

## Future Enhancements (V2)

1. **Context awareness**: Remember previous scripts in session
2. **Script library**: Save frequently used improved scripts
3. **Batch operations**: Improve multiple scripts at once
4. **Advanced prompts**: Allow custom prompt templates
5. **Analytics**: Track improvement success rate
6. **Team sharing**: Share improved scripts with team
7. **RPort API integration**: Direct execution via RPort API (if available)

---

## Success Metrics

The extension is successful if:
1. User never needs to copy-paste between VSCode and RPort
2. Script improvement takes < 5 seconds
3. Improved scripts work on first try > 80% of the time
4. User saves > 10 minutes per session

---

## Development Notes

- Use modern JavaScript (ES6+)
- Follow Chrome Extension best practices
- Keep bundle size minimal (< 500KB)
- No external dependencies if possible (vanilla JS)
- Comprehensive error logging for debugging

---

## Installation & Usage Instructions

### For Developer:
```bash
1. Clone/create project directory
2. Load unpacked extension in Chrome (chrome://extensions)
3. Enable Developer Mode
4. Click "Load unpacked" and select project directory
```

### For End User:
1. Install extension from Chrome Web Store (future)
2. Click extension icon
3. Enter Claude API key
4. Navigate to RPort
5. Use "Send to Claude" and "Insert" buttons as needed

---

## API Key Setup Guide

Include in popup or documentation:

1. Go to https://console.anthropic.com/
2. Navigate to API Keys section
3. Create new key
4. Copy key and paste into extension
5. Key is securely stored and never leaves your browser

---

## Questions for RPort Discovery

When implementing, investigate:
1. What is the exact URL pattern for RPort? (for manifest matches)
2. What classes/IDs does RPort use for command areas?
3. Does RPort use iframes or shadow DOM?
4. Are there any existing RPort plugins/extensions for reference?
5. Does RPort have an API we could leverage later?

---

## Deliverables

1. Complete Chrome extension source code
2. README.md with setup instructions
3. Screenshots for Chrome Web Store listing (future)
4. Privacy policy (if publishing to store)

---

## Timeline Estimate

- **Minimum Viable Product**: 3-4 hours
- **Polished V1**: 6-8 hours
- **Production Ready**: 10-12 hours (with testing)

---

## Command for Claude Code

To use this spec with Claude Code, run:

```bash
claude code "Using the specification in rport-claude-assistant-spec.md, build a complete Chrome extension that integrates Claude AI into RPort. Create all necessary files (manifest.json, content.js, background.js, popup.html, popup.js, styles.css) following the detailed requirements. Use flexible element detection since we don't know RPort's exact HTML structure. Include comprehensive error handling and follow Chrome extension best practices."
```

---

## Notes

- This extension works with ANY web-based terminal/command interface, not just RPort
- Can be adapted for other use cases (AWS Console, Azure Portal, etc.)
- Architecture is simple enough to extend but robust enough for production use