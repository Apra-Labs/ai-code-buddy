// RPort Claude Assistant - Content Script
// Handles UI injection and interaction in RPort interface

(function() {
  'use strict';

  // Configuration for flexible element detection
  const SELECTORS = {
    // Common selectors for command output areas
    commandOutput: [
      'pre', 
      'code', 
      '.terminal', 
      '.output', 
      '.console',
      '.command-output',
      '.terminal-output',
      '[class*="output"]',
      '[class*="terminal"]',
      '[class*="console"]',
      '[id*="output"]',
      '[id*="terminal"]'
    ],
    // Common selectors for command input areas
    commandInput: [
      'textarea',
      'input[type="text"]',
      '.command-input',
      '.terminal-input',
      '[class*="command"]',
      '[class*="input"]',
      '[contenteditable="true"]',
      '[id*="command"]',
      '[id*="input"]'
    ]
  };

  // State management
  let improvedScript = null;
  let originalScript = null;
  let lastCommandOutput = null;
  let customSelectors = null;
  let processedElements = new WeakSet(); // Track which elements already have buttons

  // Conversation history for context
  let conversationHistory = []; // Array of {script, output, improved} objects
  const MAX_HISTORY = 5; // Keep last 5 interactions

  // Initialize extension
  async function init() {
    console.log('RPort Claude Assistant initialized');
    
    // Load custom selectors if configured
    const settings = await chrome.storage.sync.get('customSelectors');
    if (settings.customSelectors) {
      customSelectors = settings.customSelectors;
    }

    // Set up observers and inject buttons
    observePageChanges();
    injectButtons();
  }

  // Observe DOM changes for dynamic content
  function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations are relevant (not our own buttons)
      const isRelevant = mutations.some(mutation => {
        // Ignore our own button additions
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.classList &&
                (node.classList.contains('claude-button-wrapper') ||
                 node.classList.contains('claude-notification'))) {
              return false; // Skip - this is our own content
            }
          }
        }
        return true; // This is relevant content
      });

      if (!isRelevant) return;

      // Debounce to avoid excessive processing
      clearTimeout(observer.timeout);
      observer.timeout = setTimeout(() => {
        injectButtons();
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false, // Don't watch attribute changes
      characterData: false // Don't watch text changes
    });
  }

  // Find elements using flexible selectors
  function findElements(selectorArray, customSelector = null) {
    const elements = [];
    
    // Try custom selector first if provided
    if (customSelector) {
      try {
        const customElements = document.querySelectorAll(customSelector);
        elements.push(...customElements);
      } catch (e) {
        console.warn('Invalid custom selector:', customSelector);
      }
    }

    // Try each selector in the array
    for (const selector of selectorArray) {
      try {
        const found = document.querySelectorAll(selector);
        for (const element of found) {
          // Skip if:
          // - Already in the list
          // - Already processed (has our marker attribute)
          // - Already has our button
          // - Is part of our extension UI
          if (elements.includes(element) ||
              element.hasAttribute('data-claude-processed') ||
              element.hasAttribute('data-claude-extension') ||
              element.querySelector('.claude-assist-btn') ||
              element.closest('[data-claude-extension]')) {
            continue;
          }

          // Additional validation - check if element has content
          if (element.textContent && element.textContent.trim().length > 0) {
            elements.push(element);
          }
        }
      } catch (e) {
        console.warn('Invalid selector:', selector);
      }
    }

    return elements;
  }

  // Inject buttons into the page
  function injectButtons() {
    // Find and process command output areas
    const outputElements = findElements(
      SELECTORS.commandOutput,
      customSelectors?.commandOutput
    );

    outputElements.forEach(element => {
      // Check if we've already processed this element
      if (processedElements.has(element)) {
        return;
      }

      // Double-check it doesn't have our button
      if (!element.querySelector('.claude-send-btn') &&
          !element.nextElementSibling?.querySelector('.claude-send-btn')) {
        addSendToClaudeButton(element);
        processedElements.add(element);
      }
    });

    // Find and process command input areas
    const inputElements = findElements(
      SELECTORS.commandInput,
      customSelectors?.commandInput
    );

    inputElements.forEach(element => {
      // Check if we've already processed this element
      if (processedElements.has(element)) {
        return;
      }

      // Double-check it doesn't have our button
      if (!element.parentElement?.querySelector('.claude-insert-btn') &&
          !element.nextElementSibling?.querySelector('.claude-insert-btn')) {
        addInsertButton(element);
        processedElements.add(element);
      }
    });
  }

  // Add "Send to Claude" button to output element
  function addSendToClaudeButton(outputElement) {
    // Mark element as processed
    outputElement.setAttribute('data-claude-processed', 'true');

    const button = document.createElement('button');
    button.className = 'claude-assist-btn claude-send-btn';
    button.innerHTML = `
      <span class="claude-btn-icon">🤖</span>
      <span class="claude-btn-text">Send to AI</span>
    `;
    button.title = 'Analyze this output with AI';

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleSendToClaide(outputElement, button);
    });

    // Position button relative to output element
    const wrapper = document.createElement('div');
    wrapper.className = 'claude-button-wrapper';
    wrapper.setAttribute('data-claude-extension', 'true');
    wrapper.appendChild(button);

    // Try to insert after the element, or append to parent
    if (outputElement.nextSibling) {
      outputElement.parentNode.insertBefore(wrapper, outputElement.nextSibling);
    } else {
      outputElement.parentNode.appendChild(wrapper);
    }
  }

  // Add "Insert Improved Script" button to input element
  function addInsertButton(inputElement) {
    // Mark element as processed
    inputElement.setAttribute('data-claude-processed', 'true');

    const button = document.createElement('button');
    button.className = 'claude-assist-btn claude-insert-btn';
    button.innerHTML = `
      <span class="claude-btn-icon">📝</span>
      <span class="claude-btn-text">Insert Improved Script</span>
    `;
    button.title = 'Insert the improved script';
    button.style.display = 'none'; // Initially hidden
    button.disabled = true;

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleInsertScript(inputElement, button);
    });

    // Position button near input element
    const wrapper = document.createElement('div');
    wrapper.className = 'claude-button-wrapper claude-insert-wrapper';
    wrapper.setAttribute('data-claude-extension', 'true');
    wrapper.appendChild(button);

    // Try to insert after the input element
    if (inputElement.nextSibling) {
      inputElement.parentNode.insertBefore(wrapper, inputElement.nextSibling);
    } else {
      inputElement.parentNode.appendChild(wrapper);
    }
  }

  // Handle sending output to Claude
  async function handleSendToClaide(outputElement, button) {
    // Update button state
    button.classList.add('loading');
    button.querySelector('.claude-btn-text').textContent = 'Analyzing...';
    button.disabled = true;

    try {
      // Capture the output text
      lastCommandOutput = outputElement.textContent || outputElement.innerText || '';
      
      // Try to find associated script/command (look for input field above)
      const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);
      originalScript = '';
      
      // Find the closest input element (usually above the output)
      for (const input of possibleInputs) {
        if (input.value || input.textContent) {
          originalScript = input.value || input.textContent;
          break;
        }
      }

      // Check if API key is configured
      const settings = await chrome.storage.sync.get('apiKey');
      if (!settings.apiKey) {
        showNotification('Please configure your Claude API key in the extension popup', 'error');
        resetButton(button);
        return;
      }

      // Send to background script for processing with conversation history
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeOutput',
        data: {
          output: lastCommandOutput,
          script: originalScript,
          conversationHistory: conversationHistory // Include previous attempts
        }
      });

      console.log(`📜 Sending request with ${conversationHistory.length} previous attempts in history`);

      if (response.success) {
        improvedScript = response.improvedScript;

        console.log('✓ Received improved script:', improvedScript?.substring(0, 100) + '...');

        if (!improvedScript || improvedScript.trim().length === 0) {
          showNotification('AI returned empty response. Try again or check console.', 'error');
          console.error('Empty improved script received');
          return;
        }

        // Add to conversation history for context in future requests
        conversationHistory.push({
          script: originalScript,
          output: lastCommandOutput,
          improved: improvedScript,
          timestamp: Date.now()
        });

        // Keep only last MAX_HISTORY items
        if (conversationHistory.length > MAX_HISTORY) {
          conversationHistory = conversationHistory.slice(-MAX_HISTORY);
        }

        console.log(`📜 Updated conversation history (${conversationHistory.length} items)`);

        showNotification('Script improved successfully! Click "Insert Improved Script" to use it.', 'success');

        // Show all insert buttons
        const insertButtons = document.querySelectorAll('.claude-insert-btn');
        console.log(`Found ${insertButtons.length} insert buttons to show`);

        insertButtons.forEach(btn => {
          btn.style.display = 'inline-flex';
          btn.disabled = false;
          btn.classList.add('ready');
          console.log('Showing insert button:', btn);
        });

        if (insertButtons.length === 0) {
          // No insert buttons found - show the script directly
          showImprovedScriptModal(improvedScript);
        }
      } else {
        showNotification(response.error || 'Failed to analyze output', 'error');
        console.error('API error:', response.error);
      }
    } catch (error) {
      console.error('Error sending to Claude:', error);
      showNotification('Error: ' + error.message, 'error');
    } finally {
      resetButton(button);
    }
  }

  // Handle inserting improved script
  async function handleInsertScript(inputElement, button) {
    console.log('🔘 Insert button clicked!');
    console.log('Input element:', inputElement);
    console.log('Improved script available:', !!improvedScript);
    console.log('Script length:', improvedScript?.length);

    if (!improvedScript) {
      showNotification('No improved script available', 'error');
      console.error('No improved script in memory');
      return;
    }

    try {
      console.log('Attempting to insert into:', inputElement.tagName, inputElement.type);
      console.log('Element contentEditable:', inputElement.contentEditable);
      console.log('Element isContentEditable:', inputElement.isContentEditable);

      // Set the value based on element type
      if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
        console.log('Setting value on TEXTAREA/INPUT');
        inputElement.value = improvedScript;
        // Trigger input event for frameworks that listen to it
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (inputElement.isContentEditable || inputElement.contentEditable === 'true') {
        console.log('Setting innerText on contenteditable DIV');
        // For contenteditable, use innerText which preserves line breaks
        inputElement.innerText = improvedScript;
        // Also try textContent as fallback
        if (!inputElement.innerText) {
          inputElement.textContent = improvedScript;
        }
        // Trigger input event for contenteditable
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // Unknown type - try all methods
        console.warn('Unknown element type, trying all methods');

        // Try finding a real input inside this element
        const realInput = inputElement.querySelector('textarea, input[type="text"]');
        if (realInput) {
          console.log('Found real input inside:', realInput.tagName);
          realInput.value = improvedScript;
          realInput.dispatchEvent(new Event('input', { bubbles: true }));
          realInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // Last resort - try everything
          inputElement.innerText = improvedScript;
          inputElement.textContent = improvedScript;
          inputElement.value = improvedScript;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      console.log('✓ Script inserted successfully');

      // Focus the input
      inputElement.focus();

      // Flash success state
      inputElement.classList.add('claude-success-flash');
      setTimeout(() => {
        inputElement.classList.remove('claude-success-flash');
      }, 1000);

      showNotification('Improved script inserted!', 'success');

      // Hide insert buttons after use
      setTimeout(() => {
        button.style.display = 'none';
        button.classList.remove('ready');
      }, 2000);
    } catch (error) {
      console.error('Error inserting script:', error);
      showNotification('Failed to insert script: ' + error.message, 'error');
    }
  }

  // Reset button state
  function resetButton(button) {
    button.classList.remove('loading');
    button.querySelector('.claude-btn-text').textContent = 'Send to Claude';
    button.disabled = false;
  }

  // Show notification
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.claude-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `claude-notification claude-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  // Show improved script in a modal when no input fields found
  function showImprovedScriptModal(script) {
    // Remove existing modal if any
    const existing = document.querySelector('.claude-script-modal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'claude-script-modal';
    modal.innerHTML = `
      <div class="claude-modal-overlay"></div>
      <div class="claude-modal-content">
        <div class="claude-modal-header">
          <h3>✨ Improved Script</h3>
          <button class="claude-modal-close" title="Close">&times;</button>
        </div>
        <div class="claude-modal-body">
          <pre class="claude-modal-script">${escapeHtml(script)}</pre>
        </div>
        <div class="claude-modal-footer">
          <button class="claude-modal-copy btn">📋 Copy to Clipboard</button>
          <button class="claude-modal-close-btn btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeButtons = modal.querySelectorAll('.claude-modal-close, .claude-modal-close-btn, .claude-modal-overlay');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    const copyButton = modal.querySelector('.claude-modal-copy');
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(script);
        copyButton.textContent = '✓ Copied!';
        setTimeout(() => {
          copyButton.textContent = '📋 Copy to Clipboard';
        }, 2000);
      } catch (error) {
        showNotification('Failed to copy to clipboard', 'error');
      }
    });
  }

  // Escape HTML for display
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'improveSelected') {
      // Handle text selection improvement
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        chrome.runtime.sendMessage({
          action: 'improveScript',
          data: {
            script: selectedText
          }
        }).then(response => {
          if (response.success) {
            improvedScript = response.improvedScript;
            showNotification('Script improved! Click "Insert Improved Script" to use it.', 'success');
            
            // Show insert buttons
            document.querySelectorAll('.claude-insert-btn').forEach(btn => {
              btn.style.display = 'inline-flex';
              btn.disabled = false;
              btn.classList.add('ready');
            });
          }
        });
      } else {
        showNotification('Please select some text first', 'warning');
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();