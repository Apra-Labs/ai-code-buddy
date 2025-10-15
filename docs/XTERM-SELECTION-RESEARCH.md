# xterm.js Selection Hover Research

**Last Updated**: 2025-10-15
**Status**: Under Investigation
**Issue**: Hover button requires right-click on xterm.js terminals (sshwifty), doesn't appear automatically after text selection

---

## Problem Statement

When using AI Code Buddy on sshwifty (a web-based SSH client), the selection hover button does not appear automatically after selecting text in the terminal. Users must right-click the selected text to trigger the button to appear. This behavior is specific to xterm.js-based terminals and doesn't occur on regular web pages.

### Observed Behavior

- **Normal web pages**: Select text → hover button appears automatically
- **xterm.js terminals (sshwifty)**: Select text → hover button doesn't appear → right-click → hover button appears

### User Quote
> "what I found/felt is that the mouse-up event during the text selection does not trigger our hover, but when I use it for right clicking it does."

---

## Sshwifty Architecture Analysis

### Technology Stack

Sshwifty is built with:
- **Vue.js**: Frontend framework for component structure
- **xterm.js v5.x**: Terminal emulator library for rendering terminal UI
- **Go**: Backend server

### Key Component: screen_console.vue

Location: `C:\akhil\git\sshwifty\ui\widgets\screen_console.vue`

**Terminal Initialization** (Lines 146-267):

```javascript
class Term {
  constructor(control) {
    this.term = new Terminal({
      allowProposedApi: true,
      allowTransparency: false,
      cursorBlink: true,
      cursorStyle: "block",
      fontFamily: termTypeFaces + ", " + termFallbackTypeFace,
      fontSize: this.fontSize,
      fontWeight: 400,
      fontWeightBold: 700,
      theme: this.theme,
      scrollback: 10000,
      tabStopWidth: 8,
    });

    // Event handling
    this.term.onData((data) => {
      if (this.closed) return;
      this.control.send(data);
    });

    // KEY INSIGHT: xterm has a textarea property
    this.term.textarea.dispatchEvent(event);
  }
}
```

**Critical Finding**: xterm.js creates an internal `textarea` element that handles keyboard input and potentially intercepts mouse events.

---

## xterm.js Architecture

### Internal Event Handling

xterm.js creates a hidden textarea element for input handling:

```javascript
.xterm .xterm-helper-textarea {
  position: absolute;
  opacity: 0;
  left: -9999em;
  top: 0;
  width: 0;
  height: 0;
  z-index: -5;
  white-space: nowrap;
  overflow: hidden;
  resize: none;
}
```

### Selection API

xterm.js provides its own selection API:

```javascript
// Listen to selection changes
term.onSelectionChange(() => {
  const selection = term.getSelection();
  console.log('Selection:', selection);
});

// Get current selection
const selectedText = term.getSelection();
```

This is separate from the standard DOM `window.getSelection()` API.

### User Interaction Settings

```javascript
.xterm {
  font-feature-settings: "liga" 0;
  position: relative;
  user-select: none;           // CSS prevents native selection
  -ms-user-select: none;
  -webkit-user-select: none;
}
```

**Important**: xterm uses `user-select: none` on the container, meaning it manages selection internally rather than using browser's native text selection.

---

## Event Flow Analysis

### Why `mouseup` Doesn't Trigger Our Handler

1. **xterm.js captures events first**: xterm likely has its own mouseup handler in the capture phase or stops propagation
2. **Internal selection handling**: xterm manages selection through its own API, not standard DOM selection
3. **Event stopPropagation**: xterm may call `event.stopPropagation()` on mouseup to prevent interference with terminal behavior

### Why `contextmenu` (Right-Click) Works

1. **Different event type**: Right-click triggers `contextmenu` event, not `mouseup`
2. **Less interference**: xterm may not block contextmenu events as aggressively
3. **Selection already established**: By the time user right-clicks, selection is already made and xterm has processed it

### Our Current Approach (Attempted Fixes)

**Attempt 1: Event Capture Phase**

```javascript
// content.js line 115-116
document.addEventListener('mouseup', handleSelection, true);
```

**Result**: No effect. User reported: "I dont see any effect of that change"

**Why It Didn't Work**: xterm likely handles the event even earlier in the capture phase, or uses a different mechanism entirely.

---

## Test Case Created

### test-selection-hover.html - Test Case 0

Added a complete xterm.js terminal to replicate sshwifty's behavior:

```html
<div class="test-case">
  <h4>🔥 Test Case 0: xterm.js Terminal (Like Sshwifty) - THE PROBLEM CASE</h4>
  <p><strong>THIS REPLICATES THE SSHWIFTY ISSUE!</strong> Select text in the terminal below:</p>
  <div id="terminal-container">
    <div id="terminal"></div>
  </div>
</div>
```

**JavaScript Initialization**:

```javascript
function initTerminal() {
  term = new Terminal({
    cursorBlink: true,
    cursorStyle: 'block',
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, Consolas, monospace',
    theme: {
      background: '#000000',
      foreground: '#ffffff',
      cursor: '#ffffff'
    },
    rows: 24,
    cols: 80
  });

  term.open(document.getElementById('terminal'));

  // Add error content for testing
  term.writeln('$ npm install express');
  term.writeln('\x1b[31mnpm ERR! code ENOENT\x1b[0m');

  // Hook into xterm's selection API
  term.onSelectionChange(() => {
    const selection = term.getSelection();
    console.log('📝 xterm selection changed:', selection);
  });
}
```

---

## Debug Logging Implementation

### content.js Debug Points

**handleSelection Function**:

```javascript
function handleSelection(e) {
  setTimeout(() => {
    console.log('🔍 handleSelection triggered', {
      eventType: e?.type,
      target: e?.target?.tagName,
      activeElement: document.activeElement?.tagName
    });

    // ... selection detection ...

    console.log('📝 Selection check:', {
      selectedText: selectedText.substring(0, 50),
      length: selectedText.length,
      rangeCount: selection.rangeCount
    });

    console.log('📐 Rect:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });
  }, 0);
}
```

### test-selection-hover.html Global Listeners

```javascript
// Global mouseup monitoring (capture phase)
document.addEventListener('mouseup', (e) => {
  console.log('🌍 Global mouseup event:', {
    target: e.target,
    tagName: e.target.tagName,
    className: e.target.className,
    inTerminal: e.target.closest('#terminal') !== null
  });
}, true);

// Monitor all selection changes
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection.toString().length > 0) {
    console.log('📋 Document selection changed:', {
      text: selection.toString().substring(0, 50),
      rangeCount: selection.rangeCount
    });
  }
});
```

---

## Hypotheses

### Hypothesis 1: Event Propagation Blocking
xterm.js stops `mouseup` event propagation during text selection to prevent interference with terminal behavior. Right-click uses a different event (`contextmenu`) which isn't blocked.

**Evidence**:
- User confirms mouseup doesn't trigger hover
- Right-click does trigger hover
- Event capture phase didn't help

### Hypothesis 2: DOM Selection API Incompatibility
`window.getSelection()` may not return xterm's internal selection because xterm manages selection through its own API.

**Evidence**:
- xterm has `term.getSelection()` and `term.onSelectionChange()`
- xterm uses `user-select: none` CSS
- Hidden textarea manages input

### Hypothesis 3: Timing Issue
The selection might be established after our mouseup handler fires, or xterm updates its selection asynchronously.

**Evidence**:
- Right-click (which happens after selection) works
- We already use `setTimeout(..., 0)` in handleSelection

---

## Proposed Solutions

### Solution 1: Hook into xterm.js Selection API (Recommended)

Detect when page uses xterm.js and attach to its selection events directly:

```javascript
// Detect xterm terminals on page load
function detectXtermTerminals() {
  const xtermElements = document.querySelectorAll('.xterm');

  xtermElements.forEach(el => {
    // Try to find the xterm instance
    // May need to use MutationObserver or wait for xterm to initialize

    // Hook into xterm's selection API
    if (el._xterm && el._xterm.onSelectionChange) {
      el._xterm.onSelectionChange(() => {
        const text = el._xterm.getSelection();
        if (text.length > 3) {
          showSelectionHoverButton(text, el);
        }
      });
    }
  });
}
```

**Challenges**:
- Need to access xterm instance (may be stored on DOM element or in closure)
- May need to use MutationObserver to detect when xterm initializes
- Need to maintain compatibility with non-xterm terminals

### Solution 2: Alternative Event Trigger

Use a different event that xterm doesn't block:

```javascript
// Try using selectionchange event exclusively for xterm
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Check if selection is inside xterm terminal
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const isInXterm = container.closest('.xterm');

    if (isInXterm && text.length > 3) {
      showSelectionHoverButton(text, range.getBoundingClientRect());
    }
  }
});
```

**Challenges**:
- `selectionchange` fires very frequently (on every character selection change)
- May impact performance
- Still might not work if xterm uses completely internal selection

### Solution 3: Keyboard Shortcut Fallback

Provide a keyboard shortcut (e.g., Ctrl+Shift+A) that users can press after selecting text in xterm terminals:

```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();

    // Try window.getSelection first
    let text = window.getSelection().toString().trim();

    // If empty, try to find xterm selection
    if (!text) {
      const xtermElements = document.querySelectorAll('.xterm');
      for (const el of xtermElements) {
        if (el._xterm && el._xterm.hasSelection()) {
          text = el._xterm.getSelection();
          break;
        }
      }
    }

    if (text.length > 3) {
      showSelectionHoverButton(text);
    }
  }
});
```

**Benefits**:
- Guaranteed to work regardless of xterm event handling
- User has explicit control
- Simple implementation

**Drawbacks**:
- Extra user action required
- Need to document the shortcut
- Less seamless UX

### Solution 4: Improve Right-Click UX

Since right-click already works, we could document this as the intended workflow for xterm terminals:

```javascript
// Add tooltip or hint for xterm terminals
function addXtermHint() {
  const xtermElements = document.querySelectorAll('.xterm');

  xtermElements.forEach(el => {
    const hint = document.createElement('div');
    hint.className = 'ai-buddy-xterm-hint';
    hint.textContent = 'Tip: Right-click selected text for AI analysis';
    hint.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(148, 186, 51, 0.9);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      animation: fadeIn 0.3s;
    `;

    el.parentElement.style.position = 'relative';
    el.parentElement.appendChild(hint);

    // Auto-hide after 5 seconds
    setTimeout(() => hint.remove(), 5000);
  });
}
```

---

## Testing Protocol

### Prerequisites
1. Load AI Code Buddy extension with debug build
2. Open test-selection-hover.html in Chrome
3. Open DevTools Console (F12)

### Test Sequence

**Test 1: Normal Div Behavior (Baseline)**
1. Select text in Test Case 1 (terminal error output div)
2. Observe console logs
3. Note: Should see mouseup event → handleSelection → hover button appears

**Test 2: xterm Terminal Behavior (Problem Case)**
1. Select text in Test Case 0 (xterm.js terminal)
2. Observe console logs
3. Expected: May NOT see mouseup event or handleSelection trigger

**Test 3: Right-Click Behavior**
1. Select text in Test Case 0 (xterm.js terminal)
2. Right-click on selected text
3. Observe console logs
4. Expected: Should see contextmenu event → handleSelection → hover button appears

**Test 4: xterm Selection API**
1. Select text in Test Case 0 (xterm.js terminal)
2. Check console for "📝 xterm selection changed" log
3. Compare with "🌍 Global mouseup event" logs
4. Determine if xterm API fires when DOM events don't

### Questions to Answer

1. Does `window.getSelection()` return xterm's selected text?
2. Does mouseup event fire at all when selecting in xterm?
3. Does `selectionchange` event fire for xterm selections?
4. Can we access xterm instance from DOM element?
5. Does xterm's `onSelectionChange` fire reliably?

---

## Next Steps

1. **Execute Testing Protocol**: Run through all test cases and collect console logs
2. **Analyze Event Flow**: Compare event sequence between normal divs and xterm terminal
3. **Test xterm API Access**: Determine if we can reliably hook into `term.onSelectionChange`
4. **Implement Solution**: Based on findings, implement one of the proposed solutions
5. **Update Documentation**: Add sshwifty-specific usage notes if workaround is needed

---

## References

- **xterm.js Repository**: https://github.com/xtermjs/xterm.js
- **xterm.js API Documentation**: https://xtermjs.org/docs/api/
- **Sshwifty Repository**: https://github.com/nirui/sshwifty
- **AI Code Buddy Test File**: [test/test-selection-hover.html](../test/test-selection-hover.html)
- **Content Script**: [content.js](../content.js)

---

## Related Files

- `content.js` - Main selection detection logic
- `test/test-selection-hover.html` - Test page with xterm.js terminal
- `docs-site/use-cases.html` - Documentation featuring sshwifty
- `C:\akhil\git\sshwifty\ui\widgets\screen_console.vue` - Sshwifty terminal implementation

---

## Status Log

**2025-10-15**: Initial research completed
- Analyzed sshwifty codebase
- Identified xterm.js as core issue
- Created test case with xterm.js terminal
- Implemented comprehensive debug logging
- Event capture phase approach didn't work
- Documented 4 potential solution approaches

**Next Session**: Execute testing protocol and implement fix
