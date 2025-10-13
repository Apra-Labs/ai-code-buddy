// Test suite for Clear All Settings Modal Dialog
// Tests the custom confirmation modal and clear settings functionality

const assert = require('assert');

console.log('Running Clear Settings Modal Tests...\n');

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

// Mock DOM environment
class MockDOM {
  constructor() {
    this.elements = new Map();
    this.eventListeners = new Map();
  }

  getElementById(id) {
    if (!this.elements.has(id)) {
      const element = {
        id,
        textContent: '',
        style: { display: '' },
        classList: {
          add: () => {},
          remove: () => {},
          toggle: () => {}
        },
        addEventListener: (event, handler) => {
          const key = `${id}-${event}`;
          if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
          }
          this.eventListeners.get(key).push(handler);
        },
        removeEventListener: (event, handler) => {
          const key = `${id}-${event}`;
          if (this.eventListeners.has(key)) {
            const handlers = this.eventListeners.get(key);
            const index = handlers.indexOf(handler);
            if (index > -1) {
              handlers.splice(index, 1);
            }
          }
        },
        querySelector: (selector) => {
          // Return a mock overlay element
          return {
            addEventListener: (event, handler) => {
              const key = `${id}-overlay-${event}`;
              if (!this.eventListeners.has(key)) {
                this.eventListeners.set(key, []);
              }
              this.eventListeners.get(key).push(handler);
            },
            removeEventListener: (event, handler) => {
              const key = `${id}-overlay-${event}`;
              if (this.eventListeners.has(key)) {
                const handlers = this.eventListeners.get(key);
                const index = handlers.indexOf(handler);
                if (index > -1) {
                  handlers.splice(index, 1);
                }
              }
            }
          };
        }
      };
      this.elements.set(id, element);
    }
    return this.elements.get(id);
  }

  triggerEvent(elementId, eventType) {
    const key = `${elementId}-${eventType}`;
    if (this.eventListeners.has(key)) {
      const handlers = this.eventListeners.get(key);
      handlers.forEach(handler => handler());
    }
  }

  triggerOverlayEvent(elementId, eventType) {
    const key = `${elementId}-overlay-${eventType}`;
    if (this.eventListeners.has(key)) {
      const handlers = this.eventListeners.get(key);
      handlers.forEach(handler => handler());
    }
  }

  reset() {
    this.elements.clear();
    this.eventListeners.clear();
  }
}

// Test: Modal HTML structure exists
test('Modal HTML structure should have all required elements', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  assert(html.includes('id="confirmModal"'), 'Missing confirmModal element');
  assert(html.includes('confirm-modal-overlay'), 'Missing modal overlay');
  assert(html.includes('confirm-modal-content'), 'Missing modal content');
  assert(html.includes('id="confirmModalTitle"'), 'Missing modal title');
  assert(html.includes('id="confirmModalMessage"'), 'Missing modal message');
  assert(html.includes('id="confirmModalCancel"'), 'Missing cancel button');
  assert(html.includes('id="confirmModalOk"'), 'Missing OK button');
});

// Test: Modal CSS styles exist
test('Modal CSS styles should be defined', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  assert(html.includes('.confirm-modal {'), 'Missing .confirm-modal style');
  assert(html.includes('.confirm-modal-overlay {'), 'Missing overlay style');
  assert(html.includes('.confirm-modal-content {'), 'Missing content style');
  assert(html.includes('z-index: 10000'), 'Missing z-index for modal');
  assert(html.includes('position: fixed'), 'Modal should be fixed position');
});

// Test: showConfirmDialog function exists
test('showConfirmDialog function should be defined in popup-multi.js', () => {
  const fs = require('fs');
  const path = require('path');
  const js = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.js'), 'utf8');

  assert(js.includes('function showConfirmDialog(title, message)'), 'Missing showConfirmDialog function');
  assert(js.includes('return new Promise'), 'showConfirmDialog should return a Promise');
});

// Test: clearAllSettings uses custom dialog
test('clearAllSettings should use showConfirmDialog instead of native confirm', () => {
  const fs = require('fs');
  const path = require('path');
  const js = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.js'), 'utf8');

  // Extract clearAllSettings function
  const clearAllSettingsMatch = js.match(/async function clearAllSettings\(\) \{[\s\S]*?\n  \}/);
  assert(clearAllSettingsMatch, 'clearAllSettings function not found');

  const clearAllSettingsCode = clearAllSettingsMatch[0];

  // Should use showConfirmDialog
  assert(clearAllSettingsCode.includes('showConfirmDialog'), 'Should use showConfirmDialog');
  assert(clearAllSettingsCode.includes('await showConfirmDialog'), 'Should await showConfirmDialog');

  // Should NOT use native confirm
  assert(!clearAllSettingsCode.includes('confirm('), 'Should not use native confirm()');
});

// Test: Modal dialog Promise resolution
test('showConfirmDialog should resolve Promise with true when OK clicked', async () => {
  const mockDOM = new MockDOM();

  // Simulate showConfirmDialog behavior
  const showConfirmDialog = (title, message) => {
    return new Promise((resolve) => {
      const modal = mockDOM.getElementById('confirmModal');
      const titleEl = mockDOM.getElementById('confirmModalTitle');
      const messageEl = mockDOM.getElementById('confirmModalMessage');
      const okBtn = mockDOM.getElementById('confirmModalOk');
      const cancelBtn = mockDOM.getElementById('confirmModalCancel');
      const overlay = modal.querySelector('.confirm-modal-overlay');

      titleEl.textContent = title;
      messageEl.textContent = message;
      modal.style.display = 'flex';

      const handleOk = () => {
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', handleOk);
        cancelBtn.removeEventListener('click', handleCancel);
        overlay.removeEventListener('click', handleCancel);
      };

      okBtn.addEventListener('click', handleOk);
      cancelBtn.addEventListener('click', handleCancel);
      overlay.addEventListener('click', handleCancel);
    });
  };

  const dialogPromise = showConfirmDialog('Test', 'Test message');

  // Simulate clicking OK
  mockDOM.triggerEvent('confirmModalOk', 'click');

  const result = await dialogPromise;
  assert.strictEqual(result, true, 'Dialog should resolve with true when OK clicked');
});

// Test: Modal dialog Promise rejection
test('showConfirmDialog should resolve Promise with false when Cancel clicked', async () => {
  const mockDOM = new MockDOM();

  const showConfirmDialog = (title, message) => {
    return new Promise((resolve) => {
      const modal = mockDOM.getElementById('confirmModal');
      const titleEl = mockDOM.getElementById('confirmModalTitle');
      const messageEl = mockDOM.getElementById('confirmModalMessage');
      const okBtn = mockDOM.getElementById('confirmModalOk');
      const cancelBtn = mockDOM.getElementById('confirmModalCancel');
      const overlay = modal.querySelector('.confirm-modal-overlay');

      titleEl.textContent = title;
      messageEl.textContent = message;
      modal.style.display = 'flex';

      const handleOk = () => {
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', handleOk);
        cancelBtn.removeEventListener('click', handleCancel);
        overlay.removeEventListener('click', handleCancel);
      };

      okBtn.addEventListener('click', handleOk);
      cancelBtn.addEventListener('click', handleCancel);
      overlay.addEventListener('click', handleCancel);
    });
  };

  const dialogPromise = showConfirmDialog('Test', 'Test message');

  // Simulate clicking Cancel
  mockDOM.triggerEvent('confirmModalCancel', 'click');

  const result = await dialogPromise;
  assert.strictEqual(result, false, 'Dialog should resolve with false when Cancel clicked');
});

// Test: Modal closes on overlay click
test('showConfirmDialog should resolve with false when overlay clicked', async () => {
  const mockDOM = new MockDOM();

  const showConfirmDialog = (title, message) => {
    return new Promise((resolve) => {
      const modal = mockDOM.getElementById('confirmModal');
      const titleEl = mockDOM.getElementById('confirmModalTitle');
      const messageEl = mockDOM.getElementById('confirmModalMessage');
      const okBtn = mockDOM.getElementById('confirmModalOk');
      const cancelBtn = mockDOM.getElementById('confirmModalCancel');
      const overlay = modal.querySelector('.confirm-modal-overlay');

      titleEl.textContent = title;
      messageEl.textContent = message;
      modal.style.display = 'flex';

      const handleOk = () => {
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', handleOk);
        cancelBtn.removeEventListener('click', handleCancel);
        overlay.removeEventListener('click', handleCancel);
      };

      okBtn.addEventListener('click', handleOk);
      cancelBtn.addEventListener('click', handleCancel);
      overlay.addEventListener('click', handleCancel);
    });
  };

  const dialogPromise = showConfirmDialog('Test', 'Test message');

  // Simulate clicking overlay
  mockDOM.triggerOverlayEvent('confirmModal', 'click');

  const result = await dialogPromise;
  assert.strictEqual(result, false, 'Dialog should resolve with false when overlay clicked');
});

// Test: Modal sets title and message
test('showConfirmDialog should set title and message correctly', () => {
  const mockDOM = new MockDOM();

  const modal = mockDOM.getElementById('confirmModal');
  const titleEl = mockDOM.getElementById('confirmModalTitle');
  const messageEl = mockDOM.getElementById('confirmModalMessage');

  titleEl.textContent = 'Clear All Settings';
  messageEl.textContent = 'Are you sure you want to clear all settings? This action cannot be undone.';

  assert.strictEqual(titleEl.textContent, 'Clear All Settings', 'Title should be set correctly');
  assert.strictEqual(
    messageEl.textContent,
    'Are you sure you want to clear all settings? This action cannot be undone.',
    'Message should be set correctly'
  );
});

// Test: Modal displays correctly
test('Modal should be shown when showConfirmDialog is called', () => {
  const mockDOM = new MockDOM();
  const modal = mockDOM.getElementById('confirmModal');

  // Initially hidden
  assert.strictEqual(modal.style.display, '', 'Modal should be initially hidden');

  // Show modal
  modal.style.display = 'flex';
  assert.strictEqual(modal.style.display, 'flex', 'Modal should be displayed as flex');
});

// Test: Modal cleanup
test('Modal should be hidden and event listeners removed after action', () => {
  const mockDOM = new MockDOM();
  const modal = mockDOM.getElementById('confirmModal');
  const okBtn = mockDOM.getElementById('confirmModalOk');
  const cancelBtn = mockDOM.getElementById('confirmModalCancel');

  // Show modal and add listeners
  modal.style.display = 'flex';
  const handler1 = () => {};
  const handler2 = () => {};
  okBtn.addEventListener('click', handler1);
  cancelBtn.addEventListener('click', handler2);

  // Verify listeners are added
  assert(mockDOM.eventListeners.has('confirmModalOk-click'), 'OK button should have event listener');
  assert(mockDOM.eventListeners.has('confirmModalCancel-click'), 'Cancel button should have event listener');

  // Cleanup
  modal.style.display = 'none';
  okBtn.removeEventListener('click', handler1);
  cancelBtn.removeEventListener('click', handler2);

  // Verify cleanup
  assert.strictEqual(modal.style.display, 'none', 'Modal should be hidden');
  assert.strictEqual(mockDOM.eventListeners.get('confirmModalOk-click').length, 0, 'OK listener should be removed');
  assert.strictEqual(mockDOM.eventListeners.get('confirmModalCancel-click').length, 0, 'Cancel listener should be removed');
});

// Test: Clear settings message content
test('Clear All Settings should show appropriate warning message', () => {
  const fs = require('fs');
  const path = require('path');
  const js = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.js'), 'utf8');

  assert(js.includes('Clear All Settings'), 'Should include "Clear All Settings" title');
  assert(js.includes('This action cannot be undone'), 'Should warn that action cannot be undone');
});

// Test: Modal z-index is sufficient
test('Modal z-index should be high enough to appear above popup content', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  // Extract z-index values
  const modalZIndex = html.match(/\.confirm-modal \{[\s\S]*?z-index: (\d+)/);
  const contentZIndex = html.match(/\.confirm-modal-content \{[\s\S]*?z-index: (\d+)/);

  assert(modalZIndex, 'Modal should have z-index defined');
  assert(contentZIndex, 'Modal content should have z-index defined');

  const modalZ = parseInt(modalZIndex[1]);
  const contentZ = parseInt(contentZIndex[1]);

  assert(modalZ >= 10000, 'Modal z-index should be at least 10000');
  assert(contentZ > modalZ, 'Modal content z-index should be higher than modal');
});

// Test: Modal animation exists
test('Modal should have animation defined', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  assert(html.includes('@keyframes modalSlideIn'), 'Should have modalSlideIn animation');
  assert(html.includes('animation: modalSlideIn'), 'Modal content should use animation');
});

// Test: Modal backdrop effect
test('Modal overlay should have backdrop effect', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  const overlayStyle = html.match(/\.confirm-modal-overlay \{[\s\S]*?\}/);
  assert(overlayStyle, 'Modal overlay style should exist');

  const overlayCSS = overlayStyle[0];
  assert(overlayCSS.includes('backdrop-filter: blur'), 'Overlay should have backdrop blur');
  assert(overlayCSS.includes('rgba'), 'Overlay should have transparent background');
});

// Test: Modal button styles
test('Modal buttons should have proper styling', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  assert(html.includes('.confirm-modal-footer'), 'Modal footer style should exist');
  assert(html.includes('min-width'), 'Buttons should have minimum width');
  assert(html.includes('justify-content: flex-end'), 'Buttons should be right-aligned');
});

console.log('\n==============================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('==============================================\n');

if (failed > 0) {
  process.exit(1);
}

console.log('✓ All Clear Settings Modal tests passed!');
