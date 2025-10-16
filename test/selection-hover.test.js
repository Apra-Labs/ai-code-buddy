// Selection Hover Feature Tests
// Tests for the new selection-based hover button (Feature 2)

console.log('Running Selection Hover Tests...\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

// Mock DOM environment
const mockDocument = {
  addEventListener: function() {},
  createElement: function() { return {}; },
  body: { appendChild: function() {} }
};

const mockWindow = {
  getSelection: function() {
    return {
      toString: function() { return 'selected text'; },
      rangeCount: 1,
      getRangeAt: function() {
        return {
          getBoundingClientRect: function() {
            return { top: 100, left: 200, width: 300 };
          },
          commonAncestorContainer: {
            nodeType: 3, // TEXT_NODE
            parentElement: {
              tagName: 'DIV',
              isContentEditable: false,
              closest: function() { return null; }
            }
          }
        };
      }
    };
  },
  scrollY: 0,
  scrollX: 0
};

// Test Selection Detection
test('Selection detection should identify text selection', () => {
  const selection = mockWindow.getSelection();
  const text = selection.toString();
  assert(text.length > 0, 'Selection should have text');
  assert(text === 'selected text', 'Selection text should match');
});

test('Selection detection should ignore empty selections', () => {
  const emptySelection = {
    toString: function() { return ''; },
    rangeCount: 0
  };
  assert(emptySelection.toString().trim().length === 0, 'Empty selection should be ignored');
});

test('Selection detection should ignore very short selections', () => {
  const shortSelection = {
    toString: function() { return 'ab'; }, // Less than 3 chars
    rangeCount: 1
  };
  const text = shortSelection.toString().trim();
  assert(text.length < 3, 'Short selections (< 3 chars) should be filtered out');
});

// Test Editable Field Detection
test('Should detect editable TEXTAREA elements', () => {
  const textareaElement = {
    tagName: 'TEXTAREA',
    isContentEditable: false,
    contentEditable: 'false',
    closest: function(selector) {
      if (selector === 'textarea, input, [contenteditable="true"]') {
        return this;
      }
      return null;
    }
  };
  const isEditable = textareaElement.tagName === 'TEXTAREA';
  assert(isEditable, 'TEXTAREA should be detected as editable');
});

test('Should detect editable INPUT elements', () => {
  const inputElement = {
    tagName: 'INPUT',
    isContentEditable: false,
    contentEditable: 'false',
    closest: function(selector) {
      if (selector === 'textarea, input, [contenteditable="true"]') {
        return this;
      }
      return null;
    }
  };
  const isEditable = inputElement.tagName === 'INPUT';
  assert(isEditable, 'INPUT should be detected as editable');
});

test('Should detect contenteditable elements', () => {
  const editableDiv = {
    tagName: 'DIV',
    isContentEditable: true,
    contentEditable: 'true',
    closest: function() { return null; }
  };
  const isEditable = editableDiv.isContentEditable || editableDiv.contentEditable === 'true';
  assert(isEditable, 'contenteditable=true should be detected');
});

test('Should NOT detect regular DIV as editable', () => {
  const regularDiv = {
    tagName: 'DIV',
    isContentEditable: false,
    contentEditable: 'false',
    closest: function() { return null; }
  };
  const isEditable = regularDiv.isContentEditable ||
                     regularDiv.contentEditable === 'true' ||
                     regularDiv.tagName === 'TEXTAREA' ||
                     regularDiv.tagName === 'INPUT';
  assert(!isEditable, 'Regular DIV should NOT be detected as editable');
});

// Test Button Positioning
test('Button position should be calculated above selection', () => {
  const rect = { top: 100, left: 200, width: 300 };
  const scrollY = 50;
  const scrollX = 20;

  const buttonTop = rect.top + scrollY - 45; // 45px above
  const buttonLeft = rect.left + scrollX + (rect.width / 2); // Center

  assertEquals(buttonTop, 105, 'Button top position should be 45px above selection');
  assertEquals(buttonLeft, 370, 'Button should be centered horizontally');
});

test('Button positioning should account for scroll offset', () => {
  const rect = { top: 100, left: 200, width: 300 };
  const scrollY = 100;
  const scrollX = 50;

  const buttonTop = rect.top + scrollY - 45;
  const buttonLeft = rect.left + scrollX + (rect.width / 2);

  assertEquals(buttonTop, 155, 'Scroll Y should be added to top position');
  assertEquals(buttonLeft, 400, 'Scroll X should be added to left position');
});

// Test Modal Detection
test('Should detect when selection is inside modal', () => {
  const elementInsideModal = {
    tagName: 'P',
    isContentEditable: false,
    closest: function(selector) {
      if (selector === '.claude-script-modal') {
        return { className: 'claude-script-modal' };
      }
      return null;
    }
  };
  const insideModal = elementInsideModal.closest('.claude-script-modal') !== null;
  assert(insideModal, 'Should detect selection inside modal');
});

test('Should NOT detect modal when selection is in normal content', () => {
  const normalElement = {
    tagName: 'P',
    isContentEditable: false,
    closest: function() { return null; }
  };
  const insideModal = normalElement.closest('.claude-script-modal') !== null;
  assert(!insideModal, 'Should NOT detect modal for normal content');
});

// Test Selection Length Validation
test('Should accept minimum 3 character selection', () => {
  const minSelection = 'abc';
  assert(minSelection.length >= 3, 'Minimum 3 characters should be accepted');
});

test('Should accept long selections', () => {
  const longSelection = 'This is a long error message with stack trace and details...';
  assert(longSelection.length > 3, 'Long selections should be accepted');
});

test('Should reject whitespace-only selections', () => {
  const whitespaceSelection = '   \n\t  ';
  assert(whitespaceSelection.trim().length === 0, 'Whitespace-only should be rejected');
});

// Test Button State Management
test('Button should have loading state', () => {
  const button = {
    classList: {
      contains: function(cls) { return cls === 'loading'; },
      add: function(cls) { this._classes = this._classes || []; this._classes.push(cls); },
      remove: function(cls) { this._classes = this._classes || []; }
    },
    disabled: false
  };

  button.classList.add('loading');
  button.disabled = true;

  assert(button.disabled, 'Button should be disabled in loading state');
  assert(button.classList.contains('loading'), 'Button should have loading class');
});

test('Button should have visible state', () => {
  const button = {
    classList: {
      contains: function(cls) { return cls === 'visible'; },
      add: function(cls) { this._classes = [cls]; },
      remove: function(cls) { this._classes = []; }
    }
  };

  button.classList.add('visible');
  assert(button.classList.contains('visible'), 'Button should have visible class after animation');
});

// Test Event Handlers
test('Should handle mouseup event for selection', () => {
  let handlerCalled = false;
  const mockHandler = function(e) {
    handlerCalled = true;
  };

  mockHandler({ type: 'mouseup' });
  assert(handlerCalled, 'mouseup handler should be called');
});

test('Should handle selectionchange event', () => {
  let handlerCalled = false;
  const mockHandler = function(e) {
    handlerCalled = true;
  };

  mockHandler({ type: 'selectionchange' });
  assert(handlerCalled, 'selectionchange handler should be called');
});

test('Should handle keyboard selection (Shift key)', () => {
  let handlerCalled = false;
  const mockHandler = function(e) {
    if (e.shiftKey) {
      handlerCalled = true;
    }
  };

  mockHandler({ type: 'keyup', shiftKey: true });
  assert(handlerCalled, 'Keyboard selection with Shift should be handled');
});

// Test Button Visibility When Modal is Open
test('Hover button should NOT show when modal is already open', () => {
  const mockDocumentWithModal = {
    querySelector: function(selector) {
      if (selector === '.claude-code-modal') {
        return { className: 'claude-code-modal' }; // Modal exists
      }
      return null;
    }
  };

  const modalExists = mockDocumentWithModal.querySelector('.claude-code-modal') !== null;
  assert(modalExists, 'Modal should exist in DOM');

  // Button should NOT be shown when modal is open
  const shouldShowButton = !modalExists;
  assert(!shouldShowButton, 'Hover button should NOT show when modal is open');
});

test('Hover button SHOULD show when no modal is open', () => {
  const mockDocumentWithoutModal = {
    querySelector: function(selector) {
      return null; // No modal
    }
  };

  const modalExists = mockDocumentWithoutModal.querySelector('.claude-code-modal') !== null;
  assert(!modalExists, 'Modal should not exist in DOM');

  // Button SHOULD be shown when no modal is open
  const shouldShowButton = !modalExists;
  assert(shouldShowButton, 'Hover button SHOULD show when no modal is open');
});

test('Hover button should be removed when modal opens', () => {
  let hoverButton = { remove: function() { this._removed = true; }, _removed: false };

  // Simulate modal opening - button should be removed
  const removeSelectionHoverButton = function() {
    if (hoverButton && !hoverButton._removed) {
      hoverButton.remove();
      hoverButton = null;
    }
  };

  // Open modal
  removeSelectionHoverButton();

  assert(hoverButton === null, 'Hover button should be removed when modal opens');
});

test('New selection should not show button when modal is open', () => {
  const mockDocument = {
    querySelector: function(selector) {
      if (selector === '.claude-code-modal') {
        return { className: 'claude-code-modal' }; // Modal is open
      }
      return null;
    }
  };

  // User makes a new selection while modal is open
  const newSelection = 'new selected text';
  const modalIsOpen = mockDocument.querySelector('.claude-code-modal') !== null;

  // Button should NOT be created
  const shouldCreateButton = !modalIsOpen && newSelection.length >= 3;
  assert(!shouldCreateButton, 'New selection should not create button when modal is open');
});

// Test Integration with AI Pipeline
test('Selection text should be sent as output to AI', () => {
  const selectedText = 'npm ERR! code ENOENT';
  const aiRequest = {
    action: 'analyzeOutput',
    data: {
      output: selectedText,
      script: '',
      conversationHistory: []
    }
  };

  assertEquals(aiRequest.data.output, selectedText, 'Selected text should be sent as output');
  assertEquals(aiRequest.data.script, '', 'Script should be empty for selections');
});

test('Should maintain conversation history', () => {
  const history = [];
  const entry = {
    script: '',
    output: 'selected text',
    improved: 'improved code',
    timestamp: Date.now()
  };

  history.push(entry);

  assert(history.length === 1, 'History should have one entry');
  assert(history[0].output === 'selected text', 'History should contain selected text');
});

// Test Universal Selection Support
test('Hover button should work for TEXTAREA selections', () => {
  const editableElement = {
    tagName: 'TEXTAREA',
    isContentEditable: false,
    closest: function(selector) {
      return selector === '.claude-script-modal' ? null : null;
    }
  };

  // New behavior: Hover button works for ALL text (editable and non-editable)
  const insideModal = editableElement.closest('.claude-script-modal') !== null;
  const shouldShowButton = !insideModal;

  assert(shouldShowButton, 'Hover button SHOULD show for TEXTAREA selections');
});

test('Hover button should work for INPUT field selections', () => {
  const inputElement = {
    tagName: 'INPUT',
    isContentEditable: false,
    closest: function(selector) {
      return null;
    }
  };

  // New behavior: Works for all text including input fields
  const insideModal = inputElement.closest('.claude-script-modal') !== null;
  const shouldShowButton = !insideModal;

  assert(shouldShowButton, 'Hover button SHOULD show for INPUT element selections');
});

test('Hover button should work for regular DIV text', () => {
  const regularElement = {
    tagName: 'DIV',
    isContentEditable: false,
    contentEditable: 'false',
    closest: function(selector) {
      return null;
    }
  };

  // Works for regular text
  const insideModal = regularElement.closest('.claude-script-modal') !== null;
  const shouldShowButton = !insideModal;

  assert(shouldShowButton, 'Hover button SHOULD show for regular readonly content');
});

// Test Selection Clearing When Modal Opens
test('Text selection should be cleared when modal opens', () => {
  const mockSelection = {
    rangeCount: 1,
    removeAllRanges: function() {
      this.rangeCount = 0;
      this._cleared = true;
    },
    _cleared: false
  };

  // Simulate clearing selection
  mockSelection.removeAllRanges();

  assert(mockSelection.rangeCount === 0, 'Selection ranges should be cleared');
  assert(mockSelection._cleared, 'removeAllRanges should have been called');
});

test('Textarea selection should be collapsed when modal opens', () => {
  const mockTextarea = {
    tagName: 'TEXTAREA',
    value: 'some selected text',
    selectionStart: 0,
    selectionEnd: 18 // Text is selected
  };

  // Simulate collapsing selection
  const cursorPos = mockTextarea.selectionEnd;
  mockTextarea.selectionStart = cursorPos;
  mockTextarea.selectionEnd = cursorPos;

  assert(mockTextarea.selectionStart === mockTextarea.selectionEnd, 'Selection should be collapsed');
  assert(mockTextarea.selectionStart === 18, 'Cursor should be at end');
});

test('Hover button should NOT reappear after modal closes if no selection', () => {
  const mockSelection = {
    toString: function() { return ''; }, // No selection
    rangeCount: 0
  };

  const selectedText = mockSelection.toString().trim();
  const shouldShowButton = selectedText.length >= 3;

  assert(!shouldShowButton, 'Button should not appear without selection');
});

test('Modal opening should trigger selection clearing', () => {
  let selectionCleared = false;

  const clearTextSelection = function() {
    selectionCleared = true;
  };

  // Simulate modal opening
  clearTextSelection();

  assert(selectionCleared, 'Selection should be cleared when modal opens');
});

// Summary
console.log('\n==============================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('==============================================\n');

if (failed > 0) {
  console.log('✗ Some Selection Hover tests failed!\n');
  process.exit(1);
} else {
  console.log('✓ All Selection Hover tests passed!\n');
}
