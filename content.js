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
  }

  // State management
  let improvedCode = null;
  let originalCode = null;
  let lastCommandOutput = null;
  let customSelectors = null;
  let processedElements = new WeakSet(); // Track which elements already have buttons
  let lastTriggeredInputElement = null; // Track which input element triggered the AI

  // Conversation history for context
  let conversationHistory = []; // Array of {script, output, improved} objects
  const MAX_HISTORY = 5; // Keep last 5 interactions

  // Show keyboard shortcuts banner (first-time only)
  async function showKeyboardShortcutsBanner() {
    try {
      const result = await chrome.storage.local.get('shortcutsBannerShown');

      // Only show if not shown before
      if (!result.shortcutsBannerShown) {
        // Wait a bit for the page to settle
        setTimeout(() => {
          const banner = document.createElement('div');
          banner.className = 'claude-shortcuts-banner';
          banner.setAttribute('data-claude-extension', 'true');
          banner.innerHTML = `
            <div class="claude-shortcuts-banner-header">
              <div class="claude-shortcuts-banner-title">
                💡 Keyboard Shortcuts Available
              </div>
              <button class="claude-shortcuts-banner-close" title="Close">×</button>
            </div>
            <div class="claude-shortcuts-banner-content">
              <p style="margin: 0 0 8px 0;">Work faster with these shortcuts:</p>
              <ul class="claude-shortcuts-list">
                <li>
                  <span class="claude-shortcuts-key">Alt+Shift+A</span>
                  <span>Send to AI</span>
                </li>
                <li>
                  <span class="claude-shortcuts-key">Alt+Shift+I</span>
                  <span>Insert Code</span>
                </li>
              </ul>
            </div>
          `;

          document.body.appendChild(banner);

          // Close button handler
          const closeBtn = banner.querySelector('.claude-shortcuts-banner-close');
          closeBtn.addEventListener('click', () => {
            banner.style.animation = 'slide-in 0.3s ease reverse';
            setTimeout(() => banner.remove(), 300);
          });

          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            if (banner.parentElement) {
              banner.style.animation = 'slide-in 0.3s ease reverse';
              setTimeout(() => banner.remove(), 300);
            }
          }, 8000);

          // Mark as shown
          chrome.storage.local.set({ shortcutsBannerShown: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Error showing shortcuts banner:', error);
    }
  }

  // Selection hover button state
  let selectionHoverButton = null;

  // Setup selection-based hover button for Feature 2 (readonly content)
  function setupSelectionHover() {
    // Use capture phase (third parameter: true) to catch events before they're stopped by libraries like xterm.js
    document.addEventListener('mouseup', handleSelection, true);
    document.addEventListener('selectionchange', handleSelection);

    // Also handle keyboard selection (Shift+Arrow keys)
    document.addEventListener('keyup', (e) => {
      if (e.shiftKey) {
        handleSelection(e);
      }
    });

    console.log('✓ Selection-based hover enabled for readonly content');
  }

  // Handle text selection and show/hide hover button
  function handleSelection(e) {
    // Small delay to let selection settle
    setTimeout(() => {
      console.log('🔍 handleSelection triggered', {
        eventType: e?.type,
        target: e?.target?.tagName,
        activeElement: document.activeElement?.tagName
      });

      let selectedText = '';
      let rect = null;
      let sourceElement = null;

      // Check if selection is from textarea/input (they don't use window.getSelection)
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
        // For textarea/input, use selectionStart/selectionEnd
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;

        if (start !== end) {
          selectedText = activeElement.value.substring(start, end).trim();
          sourceElement = activeElement;

          // Get the bounding rect of the input/textarea
          rect = activeElement.getBoundingClientRect();
        }
      } else {
        // For contenteditable and regular text, use window.getSelection
        const selection = window.getSelection();
        selectedText = selection.toString().trim();

        console.log('📝 Selection check:', {
          selectedText: selectedText.substring(0, 50),
          length: selectedText.length,
          rangeCount: selection.rangeCount
        });

        if (selectedText && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          rect = range.getBoundingClientRect();

          console.log('📐 Rect:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });

          const container = range.commonAncestorContainer;
          sourceElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
        }
      }

      // Remove existing hover button if selection is empty or too short
      if (!selectedText || selectedText.length < 3) {
        console.log('❌ Selection too short or empty, removing button');
        removeSelectionHoverButton();
        return;
      }

      console.log('✅ Showing hover button for selection:', selectedText.substring(0, 50));

      // Don't show inside our own modal
      if (sourceElement && sourceElement.closest && sourceElement.closest('.claude-code-modal')) {
        removeSelectionHoverButton();
        return;
      }

      // Show or update the hover button position
      // Now works for BOTH editable and non-editable text
      showSelectionHoverButton(rect, selectedText, sourceElement);
    }, 10);
  }

  // Show the selection hover button (like Medium's annotation button)
  function showSelectionHoverButton(rect, selectedText, sourceElement) {
    // Remove existing button if any
    removeSelectionHoverButton();

    // Create the hover button
    const button = document.createElement('button');
    button.className = 'claude-selection-hover-btn';
    button.setAttribute('data-claude-extension', 'true');
    button.innerHTML = `
      <span class="claude-selection-icon">✨</span>
      <span class="claude-selection-text">Send to AI</span>
    `;
    button.title = 'Send selected text to AI (Alt+Shift+A)';

    // Position the button above the selection (like Medium)
    // Use fixed positioning since getBoundingClientRect() returns viewport-relative coordinates
    // This ensures correct positioning even in scrollable containers
    let buttonTop = rect.top - 45; // 45px above selection (viewport-relative)
    const buttonLeft = rect.left + (rect.width / 2); // Center horizontally (viewport-relative)

    // Bounds checking: ensure button stays within visible viewport
    // If selection is too close to top (would place button above viewport), move it below selection instead
    const minTopPosition = 10; // At least 10px from top of viewport
    const buttonHeight = 40; // Approximate button height

    if (buttonTop < minTopPosition) {
      // Not enough space above - place button below the selection instead
      buttonTop = rect.bottom + 10; // 10px below selection
      console.log('📍 Button repositioned below selection (not enough space above)');
    }

    // Also check if button would be below viewport
    const maxTopPosition = window.innerHeight - buttonHeight - 10;
    if (buttonTop > maxTopPosition) {
      // Would be below viewport - clamp to bottom of viewport
      buttonTop = maxTopPosition;
      console.log('📍 Button repositioned to bottom of viewport (selection too low)');
    }

    button.style.position = 'fixed';
    button.style.top = `${buttonTop}px`;
    button.style.left = `${buttonLeft}px`;
    button.style.transform = 'translateX(-50%)'; // Center the button
    button.style.zIndex = '2147483647'; // Ensure button stays on top

    // Store the selected text and source element for click handler
    button._selectedText = selectedText;
    button._sourceElement = sourceElement;

    // Click handler
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Use the stored selected text
        const currentSelection = button._selectedText;

        if (!currentSelection) {
          showNotification('Selection was cleared', 'warning');
          removeSelectionHoverButton();
          return;
        }

        // Check if API key is configured (IMMEDIATE ERROR - no modal)
        const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
        const providerName = settings.provider ?
          (AI_PROVIDERS[settings.provider]?.name || settings.provider) :
          'your AI provider';

        if (!settings.apiKey && settings.provider !== 'ollama') {
          showNotification(`Please configure credentials for ${providerName} in the extension popup`, 'error');
          removeSelectionHoverButton();
          return;
        }

        // Check if selection came from an editable field
        const sourceElem = button._sourceElement;
        const isFromEditableField = sourceElem && (
          sourceElem.tagName === 'TEXTAREA' ||
          sourceElem.tagName === 'INPUT' ||
          sourceElem.isContentEditable ||
          sourceElem.contentEditable === 'true'
        );

        // If from editable field, set that as the target
        if (isFromEditableField) {
          lastTriggeredInputElement = sourceElem;
        } else {
          // From readonly field - try to find closest input
          const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);
          lastTriggeredInputElement = possibleInputs.length > 0 ? possibleInputs[0] : null;
        }

        // Store for modal
        originalCode = currentSelection;
        lastCommandOutput = currentSelection;

        // SHOW MODAL IMMEDIATELY with loading state (null = loading)
        showImprovedCodeModalWithLoading(currentSelection, !isFromEditableField);

        // Remove the hover button
        removeSelectionHoverButton();

        // NOW send to AI for processing (async in background)
        const response = await chrome.runtime.sendMessage({
          action: 'analyzeOutput',
          data: {
            output: currentSelection,
            script: '', // No original script for selection
            conversationHistory: conversationHistory,
            url: window.location.href
          }
        });

        // Find the modal (it should still be open)
        const modal = document.querySelector('.claude-code-modal');
        if (!modal) return; // User closed it

        if (response.success) {
          improvedCode = response.improvedCode;

          // Add to conversation history
          conversationHistory.push({
            script: '',
            output: currentSelection,
            improved: improvedCode,
            timestamp: Date.now()
          });

          if (conversationHistory.length > MAX_HISTORY) {
            conversationHistory = conversationHistory.slice(-MAX_HISTORY);
          }

          // Update modal with the code
          updateModalWithCode(modal, improvedCode);

        } else {
          // Show error in modal
          updateModalWithError(modal, response.error || 'Failed to analyze text');
        }

      } catch (error) {
        console.error('Error analyzing selection:', error);
        // Try to update modal with error
        const modal = document.querySelector('.claude-code-modal');
        if (modal) {
          updateModalWithError(modal, error.message);
        } else {
          showNotification('Error: ' + error.message, 'error');
        }
        removeSelectionHoverButton();
      }
    });

    // Add to page
    document.body.appendChild(button);
    selectionHoverButton = button;

    // Animate in
    setTimeout(() => {
      button.classList.add('visible');
    }, 10);
  }

  // Remove the selection hover button
  function removeSelectionHoverButton() {
    if (selectionHoverButton) {
      console.log('🗑️ Removing selection hover button');
      selectionHoverButton.remove();
      selectionHoverButton = null;
    }
  }

  // Initialize extension
  async function init() {
    console.log('AI Code Buddy initializing...');

    // Load custom selectors if configured
    const settings = await chrome.storage.sync.get(['customSelectors']);
    if (settings.customSelectors) {
      customSelectors = settings.customSelectors;
      console.log('✓ Custom selectors loaded');
    }

    // Setup selection-based hover for Feature 2 (readonly content)
    setupSelectionHover();

    // Set up observers (for future features if needed)
    observePageChanges();
    injectButtons();

    // Show keyboard shortcuts banner (first-time only)
    showKeyboardShortcutsBanner();
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
          // Check if it's an input-like element
          const isInputLike = element.tagName === 'TEXTAREA' ||
                              element.tagName === 'INPUT' ||
                              element.isContentEditable ||
                              element.contentEditable === 'true';

          // Skip if:
          // - Already in the list
          // - Is part of our extension UI
          // - Is inside our modal
          // For INPUT elements: Don't skip just because they're processed - we need to find them!
          if (elements.includes(element) ||
              element.hasAttribute('data-claude-extension') ||
              element.querySelector('.claude-assist-btn') ||
              element.closest('[data-claude-extension]') ||
              element.closest('.claude-code-modal') ||
              element.classList.contains('claude-modal-code')) {
            continue;
          }

          // For OUTPUT elements: Skip if processed
          // For INPUT elements: Allow even if processed (we need to find them for "Use Code")
          if (!isInputLike && element.hasAttribute('data-claude-processed')) {
            continue;
          }

          // Additional validation - check if element has content
          // For input elements, we don't require text content (they could be empty)
          if (isInputLike) {
            // Input elements are valid even if empty
            elements.push(element);
          } else if (element.textContent && element.textContent.trim().length > 0) {
            // Other elements need content
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
  // NOTE: Feature 1 (editable inputs) and Feature 2 (readonly outputs) are now separate
  // Feature 1: Buttons for editable textareas/inputs (unchanged - still works)
  // Feature 2: Selection-based hover for readonly content (NEW - no automatic buttons)
  function injectButtons() {
    // Feature 1: Find and process command INPUT areas only (editable textareas)
    // These get buttons if they meet specific criteria (optional - currently disabled)

    // Feature 2 is now handled by selection-based hover (see setupSelectionHover())
    // No automatic buttons are injected for read-only output elements

    console.log('[Button Injection] Selection-based hover mode active - no automatic buttons');
  }

  // Detect if output contains error patterns
  function detectError(outputText) {
    const errorPatterns = [
      /error:/i,
      /exception:/i,
      /failed/i,
      /failure/i,
      /not found/i,
      /permission denied/i,
      /access denied/i,
      /cannot/i,
      /unable to/i,
      /invalid/i,
      /syntax error/i,
      /fatal:/i,
      /critical:/i,
      /exit code: [1-9]/i,
      /exit status [1-9]/i,
      /\[ERROR\]/i,
      /\[FATAL\]/i,
      /traceback/i,
      /stack trace/i
    ];

    return errorPatterns.some(pattern => pattern.test(outputText));
  }

  // Add "Send to Claude" button to output element
  function addSendToClaudeButton(outputElement) {
    // Mark element as processed
    outputElement.setAttribute('data-claude-processed', 'true');

    const button = document.createElement('button');
    button.className = 'claude-assist-btn claude-send-btn';
    button.innerHTML = `
      <span class="claude-btn-icon">✨</span>
      <span class="claude-btn-text">Send to AI</span>
    `;

    // Check if output contains errors
    const outputText = outputElement.textContent || outputElement.innerText || '';
    const hasError = detectError(outputText);

    if (hasError) {
      button.classList.add('error-detected');
      button.title = '⚠️ Error detected! Click to get AI help (Alt+Shift+A)';
    } else {
      button.title = '✨ Send to AI (Alt+Shift+A)';
    }

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

  // Add "Insert Improved Code" button to input element
  function addInsertButton(inputElement) {
    // Mark element as processed
    inputElement.setAttribute('data-claude-processed', 'true');

    const button = document.createElement('button');
    button.className = 'claude-assist-btn claude-insert-btn';
    button.innerHTML = `
      <span class="claude-btn-icon">📝</span>
      <span class="claude-btn-text">Insert Improved Code</span>
    `;
    button.title = '📝 Insert improved code (Alt+Shift+I)';
    button.style.display = 'none'; // Initially hidden
    button.disabled = true;

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleInsertCode(inputElement, button);
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
    // Log the trigger source for debugging
    console.log('🔵 handleSendToClaide triggered');
    console.log('  - Output element:', outputElement);
    console.log('  - Button:', button);
    console.log('  - Stack trace:', new Error().stack);

    // Update button state
    button.classList.add('loading');
    button.querySelector('.claude-btn-text').textContent = 'Analyzing...';
    button.disabled = true;

    try {
      // Capture the output text
      lastCommandOutput = outputElement.textContent || outputElement.innerText || '';

      // Try to find associated script/command (look for input field above)
      const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);
      originalCode = '';

      // Find the closest input element (usually above the output) and STORE IT
      let closestInputToOutput = null;
      if (possibleInputs.length > 0) {
        closestInputToOutput = possibleInputs[0];
        let minDistance = Math.abs(outputElement.compareDocumentPosition(possibleInputs[0]));

        for (const input of possibleInputs) {
          const distance = Math.abs(outputElement.compareDocumentPosition(input));
          if (distance < minDistance) {
            minDistance = distance;
            closestInputToOutput = input;
          }
          // Also try to get the original script from any input with content
          if (!originalCode && (input.value || input.textContent)) {
            originalCode = input.value || input.textContent;
          }
        }
      }

      // STORE THIS NOW - before the AI responds!
      lastTriggeredInputElement = closestInputToOutput;

      // Check if API key is configured
      const settings = await chrome.storage.sync.get(['apiKey', 'provider']);

      // Get provider display name from AI_PROVIDERS (defined in providers.js)
      const providerName = settings.provider ?
        (AI_PROVIDERS[settings.provider]?.name || settings.provider) :
        'your AI provider';

      if (!settings.apiKey && settings.provider !== 'ollama') {
        showNotification(`Please configure credentials for ${providerName} in the extension popup`, 'error');
        resetButton(button);
        return;
      }

      // Send to background script for processing with conversation history
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeOutput',
        data: {
          output: lastCommandOutput,
          script: originalCode,
          conversationHistory: conversationHistory, // Include previous attempts
          url: window.location.href // Include current page URL for site-specific prompts
        }
      });

      console.log(`📜 Sending request with ${conversationHistory.length} previous attempts in history`);

      if (response.success) {
        improvedCode = response.improvedCode;

        console.log('✓ Received improved code:', improvedCode?.substring(0, 100) + '...');

        if (!improvedCode || improvedCode.trim().length === 0) {
          showNotification('AI returned empty response. Try again or check console.', 'error');
          console.error('Empty improved code received');
          return;
        }

        // Add to conversation history for context in future requests
        conversationHistory.push({
          script: originalCode,
          output: lastCommandOutput,
          improved: improvedCode,
          timestamp: Date.now()
        });

        // Keep only last MAX_HISTORY items
        if (conversationHistory.length > MAX_HISTORY) {
          conversationHistory = conversationHistory.slice(-MAX_HISTORY);
        }

        console.log(`📜 Updated conversation history (${conversationHistory.length} items)`);

        showNotification('Script improved successfully!', 'success');

        // Find and show ONLY the insert button closest to this output element
        const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);

        // Find the closest input element FIRST, before deciding what to do
        let closestInput = null;
        if (possibleInputs.length > 0) {
          closestInput = possibleInputs[0];
          let minDistance = Math.abs(outputElement.compareDocumentPosition(possibleInputs[0]));

          for (const input of possibleInputs) {
            const distance = Math.abs(outputElement.compareDocumentPosition(input));
            if (distance < minDistance) {
              minDistance = distance;
              closestInput = input;
            }
          }
        }

        // ALWAYS store the closest input (even if we're showing modal)
        lastTriggeredInputElement = closestInput;

        // ALWAYS show the modal - it provides better UX with editable textareas
        // The modal will use lastTriggeredInputElement for the "Use Code" button
        showImprovedCodeModal(improvedCode, outputElement, button);
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

  // Handle inserting improved code
  async function handleInsertCode(inputElement, button) {
    console.log('🔘 Insert button clicked!');
    console.log('Input element:', inputElement);
    console.log('Improved script available:', !!improvedCode);
    console.log('Script length:', improvedCode?.length);

    if (!improvedCode) {
      showNotification('No improved code available', 'error');
      console.error('No improved code in memory');
      return;
    }

    try {
      console.log('Attempting to insert into:', inputElement.tagName, inputElement.type);
      console.log('Element contentEditable:', inputElement.contentEditable);
      console.log('Element isContentEditable:', inputElement.isContentEditable);

      // Set the value based on element type
      if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
        console.log('Setting value on TEXTAREA/INPUT');
        inputElement.value = improvedCode;
        // Trigger input event for frameworks that listen to it
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (inputElement.isContentEditable || inputElement.contentEditable === 'true') {
        console.log('Setting innerText on contenteditable DIV');
        // For contenteditable, use innerText which preserves line breaks
        inputElement.innerText = improvedCode;
        // Also try textContent as fallback
        if (!inputElement.innerText) {
          inputElement.textContent = improvedCode;
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
          realInput.value = improvedCode;
          realInput.dispatchEvent(new Event('input', { bubbles: true }));
          realInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // Last resort - try everything
          inputElement.innerText = improvedCode;
          inputElement.textContent = improvedCode;
          inputElement.value = improvedCode;
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
    button.querySelector('.claude-btn-text').textContent = 'Send to AI';
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

  // Show modal immediately with loading animation (for selection hover workflow)
  function showImprovedCodeModalWithLoading(selectedText, hideUseButton = false) {
    // Remove existing modal if any
    const existing = document.querySelector('.claude-code-modal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'claude-code-modal';
    modal.innerHTML = `
      <div class="claude-modal-overlay"></div>
      <div class="claude-modal-content">
        <div class="claude-modal-header">
          <h3>✨ AI Code Buddy</h3>
          <button class="claude-modal-close" title="Close">&times;</button>
        </div>
        <div class="claude-modal-body">
          <div class="claude-modal-section">
            <label class="claude-modal-label">Your Prompt (editable):</label>
            <textarea class="claude-modal-prompt" rows="4" placeholder="Describe what you want to achieve...">${escapeHtml(selectedText)}</textarea>
          </div>
          <div class="claude-modal-section loading">
            <label class="claude-modal-label">Generated Code (editable):</label>
            <textarea class="claude-modal-code" rows="12" placeholder="AI is generating code..."></textarea>
            <div class="claude-loading-spinner"></div>
            <div class="claude-loading-text">AI is thinking...</div>
          </div>
        </div>
        <div class="claude-modal-footer">
          <button class="claude-modal-use btn-primary" style="${hideUseButton ? 'display: none;' : ''}" disabled>✓ Use Code</button>
          <button class="claude-modal-iterate btn-secondary" disabled>🔄 Generate</button>
          <button class="claude-modal-copy btn-tertiary" disabled>📋 Copy</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners for closing modal
    const closeButtons = modal.querySelectorAll('.claude-modal-close, .claude-modal-overlay');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Esc key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return modal;
  }

  // Update modal with generated code (stops loading, shows code)
  function updateModalWithCode(modal, code) {
    const codeSection = modal.querySelector('.claude-modal-section.loading');
    const codeTextarea = modal.querySelector('.claude-modal-code');
    const loadingSpinner = modal.querySelector('.claude-loading-spinner');
    const loadingText = modal.querySelector('.claude-loading-text');

    // Remove loading state
    if (codeSection) {
      codeSection.classList.remove('loading');
    }
    if (loadingSpinner) {
      loadingSpinner.remove();
    }
    if (loadingText) {
      loadingText.remove();
    }

    // Set code value
    if (codeTextarea) {
      codeTextarea.value = code;
    }

    // Enable buttons
    const useButton = modal.querySelector('.claude-modal-use');
    const copyButton = modal.querySelector('.claude-modal-copy');
    const iterateButton = modal.querySelector('.claude-modal-iterate');

    if (useButton && !useButton.style.display.includes('none')) {
      useButton.disabled = false;
    }
    if (copyButton) {
      copyButton.disabled = false;
    }
    if (iterateButton) {
      iterateButton.disabled = false;
    }

    // Setup button event listeners now that we have code
    setupModalButtonListeners(modal);
  }

  // Update modal with error (stops loading, shows error toast)
  function updateModalWithError(modal, errorMessage) {
    const codeSection = modal.querySelector('.claude-modal-section.loading');
    const loadingSpinner = modal.querySelector('.claude-loading-spinner');
    const loadingText = modal.querySelector('.claude-loading-text');

    // Remove loading state
    if (codeSection) {
      codeSection.classList.remove('loading');
    }
    if (loadingSpinner) {
      loadingSpinner.remove();
    }
    if (loadingText) {
      loadingText.remove();
    }

    // Show error notification
    showNotification(errorMessage, 'error');

    // Enable Generate button so user can try again
    const iterateButton = modal.querySelector('.claude-modal-iterate');
    if (iterateButton) {
      iterateButton.disabled = false;
    }

    // Setup button listeners (for Generate button retry)
    setupModalButtonListeners(modal);
  }

  // Setup modal button event listeners (shared between all modal display modes)
  function setupModalButtonListeners(modal) {
    const promptTextarea = modal.querySelector('.claude-modal-prompt');
    const codeTextarea = modal.querySelector('.claude-modal-code');
    const useButton = modal.querySelector('.claude-modal-use');
    const copyButton = modal.querySelector('.claude-modal-copy');
    const iterateButton = modal.querySelector('.claude-modal-iterate');

    // Remove old listeners by cloning (prevents duplicate listeners)
    const newUseButton = useButton.cloneNode(true);
    const newCopyButton = copyButton.cloneNode(true);
    const newIterateButton = iterateButton.cloneNode(true);
    useButton.replaceWith(newUseButton);
    copyButton.replaceWith(newCopyButton);
    iterateButton.replaceWith(newIterateButton);

    // "Use Code" button
    newUseButton.addEventListener('click', () => {
      const codeToInsert = codeTextarea.value;
      const targetInput = lastTriggeredInputElement;

      if (!targetInput) {
        showNotification('No input field found to insert code', 'error');
        return;
      }

      // Insert into the target input field
      if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
        targetInput.value = codeToInsert;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (targetInput.isContentEditable || targetInput.contentEditable === 'true') {
        targetInput.innerText = codeToInsert;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Focus the input
      targetInput.focus();

      // Flash success
      showNotification('Code inserted successfully!', 'success');

      // Close modal
      modal.remove();
    });

    // "Copy" button
    newCopyButton.addEventListener('click', async () => {
      try {
        const codeToCopy = codeTextarea.value;
        await navigator.clipboard.writeText(codeToCopy);
        showNotification('Copied to clipboard', 'success');
        modal.remove();
      } catch (error) {
        showNotification('Failed to copy to clipboard', 'error');
      }
    });

    // "Generate" button (was "Improve Further")
    newIterateButton.addEventListener('click', async () => {
      const currentPrompt = promptTextarea.value;
      const codeSection = codeTextarea.closest('.claude-modal-section');

      // Show loading state
      codeSection.classList.add('loading');

      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'claude-loading-spinner';
      codeSection.appendChild(loadingSpinner);

      const loadingText = document.createElement('div');
      loadingText.className = 'claude-loading-text';
      loadingText.textContent = 'AI is thinking...';
      codeSection.appendChild(loadingText);

      // Disable buttons
      newIterateButton.disabled = true;
      newUseButton.disabled = true;
      newCopyButton.disabled = true;

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'analyzeOutput',
          data: {
            output: lastCommandOutput,
            script: currentPrompt,
            conversationHistory: conversationHistory,
            url: window.location.href
          }
        });

        if (response.success && response.improvedCode) {
          improvedCode = response.improvedCode;
          codeTextarea.value = improvedCode;

          conversationHistory.push({
            script: currentPrompt,
            output: lastCommandOutput,
            improved: improvedCode,
            timestamp: Date.now()
          });

          if (conversationHistory.length > MAX_HISTORY) {
            conversationHistory = conversationHistory.slice(-MAX_HISTORY);
          }

          showNotification('Code improved! Edit further or use it.', 'success');
        } else {
          showNotification(response.error || 'Failed to improve code', 'error');
        }
      } catch (error) {
        console.error('Error improving code:', error);
        showNotification('Error: ' + error.message, 'error');
      } finally {
        // Remove loading state
        codeSection.classList.remove('loading');
        loadingSpinner.remove();
        loadingText.remove();

        // Re-enable buttons
        newIterateButton.disabled = false;
        newUseButton.disabled = false;
        newCopyButton.disabled = false;
      }
    });
  }

  // Show improved code in a modal when no input fields found
  function showImprovedCodeModal(script, sourceOutputElement = null, sourceButton = null, hideUseButton = false) {
    // Remove existing modal if any
    const existing = document.querySelector('.claude-code-modal');
    if (existing) {
      existing.remove();
    }

    // Use the lastTriggeredInputElement that we stored when "Send to AI" was clicked
    // This is the textarea/input the user was working in!
    let targetInput = lastTriggeredInputElement;

    // Fallback: if no lastTriggeredInputElement, try to find closest input
    if (!targetInput && sourceOutputElement) {
      const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);
      if (possibleInputs.length > 0) {
        // Find closest input to the output element
        let minDistance = Infinity;
        for (const input of possibleInputs) {
          const distance = Math.abs(sourceOutputElement.compareDocumentPosition(input));
          if (distance < minDistance) {
            minDistance = distance;
            targetInput = input;
          }
        }
      }
    }

    const modal = document.createElement('div');
    modal.className = 'claude-code-modal';
    modal.innerHTML = `
      <div class="claude-modal-overlay"></div>
      <div class="claude-modal-content">
        <div class="claude-modal-header">
          <h3>✨ AI Code Buddy</h3>
          <button class="claude-modal-close" title="Close">&times;</button>
        </div>
        <div class="claude-modal-body">
          <div class="claude-modal-section">
            <label class="claude-modal-label">Your Prompt (editable):</label>
            <textarea class="claude-modal-prompt" rows="4" placeholder="Describe what you want to achieve...">${escapeHtml(originalCode || lastCommandOutput || '')}</textarea>
          </div>
          <div class="claude-modal-section">
            <label class="claude-modal-label">Generated Code (editable):</label>
            <textarea class="claude-modal-code" rows="12">${escapeHtml(script)}</textarea>
          </div>
        </div>
        <div class="claude-modal-footer">
          <button class="claude-modal-use btn-primary" style="${hideUseButton ? 'display: none;' : ''}">✓ Use Code</button>
          <button class="claude-modal-iterate btn-secondary">🔄 Generate</button>
          <button class="claude-modal-copy btn-tertiary">📋 Copy</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners for closing modal
    const closeButtons = modal.querySelectorAll('.claude-modal-close, .claude-modal-overlay');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Esc key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Get modal elements
    const promptTextarea = modal.querySelector('.claude-modal-prompt');
    const codeTextarea = modal.querySelector('.claude-modal-code');
    const useButton = modal.querySelector('.claude-modal-use');
    const copyButton = modal.querySelector('.claude-modal-copy');
    const iterateButton = modal.querySelector('.claude-modal-iterate');

    // "Use Code" button - inserts code into target input and closes modal
    if (targetInput && !hideUseButton) {
      useButton.addEventListener('click', () => {
        const codeToInsert = codeTextarea.value;

        // Insert into the target input field
        if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
          targetInput.value = codeToInsert;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (targetInput.isContentEditable || targetInput.contentEditable === 'true') {
          targetInput.innerText = codeToInsert;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Focus the input
        targetInput.focus();

        // Flash success
        showNotification('Script inserted successfully!', 'success');

        // Close modal
        modal.remove();
      });
    } else {
      // No target input found, disable the button
      useButton.disabled = true;
      useButton.title = 'No input field found to insert script';
      useButton.style.opacity = '0.5';
    }

    // "Copy" button - copies script to clipboard and closes modal
    copyButton.addEventListener('click', async () => {
      try {
        const scriptToCopy = codeTextarea.value;
        await navigator.clipboard.writeText(scriptToCopy);
        showNotification('Copied to clipboard', 'success');
        // Close modal after copying
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      } catch (error) {
        showNotification('Failed to copy to clipboard', 'error');
      }
    });

    // "Improve Further" button - sends current prompt back to AI for iteration
    // Always enable this button - it works with or without source context
    iterateButton.addEventListener('click', async () => {
        // Get current values from textareas
        const currentPrompt = promptTextarea.value;
        const currentScript = codeTextarea.value;

        // Show big loading overlay on script section
        const codeSection = codeTextarea.closest('.claude-modal-section');
        codeSection.classList.add('loading');

        // Create loading spinner and text
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'claude-loading-spinner';
        codeSection.appendChild(loadingSpinner);

        const loadingText = document.createElement('div');
        loadingText.className = 'claude-loading-text';
        loadingText.textContent = 'AI is thinking...';
        codeSection.appendChild(loadingText);

        // Disable button
        iterateButton.disabled = true;

        try {
          // Make the AI call with the user's edited prompt
          const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
          const response = await chrome.runtime.sendMessage({
            action: 'analyzeOutput',
            data: {
              output: lastCommandOutput,
              script: currentPrompt, // Use the user's edited prompt
              conversationHistory: conversationHistory,
              url: window.location.href // Include current page URL for site-specific prompts
            }
          });

          if (response.success && response.improvedCode) {
            // Update the modal with new improved code
            improvedCode = response.improvedCode;
            codeTextarea.value = improvedCode;

            // Update conversation history
            conversationHistory.push({
              script: currentPrompt,
              output: lastCommandOutput,
              improved: improvedCode,
              timestamp: Date.now()
            });

            if (conversationHistory.length > MAX_HISTORY) {
              conversationHistory = conversationHistory.slice(-MAX_HISTORY);
            }

            showNotification('Script improved! Edit further or use it.', 'success');
          } else {
            showNotification(response.error || 'Failed to improve script', 'error');
          }
        } catch (error) {
          console.error('Error improving script:', error);
          showNotification('Error: ' + error.message, 'error');
        } finally {
          // Remove loading overlay
          codeSection.classList.remove('loading');
          loadingSpinner.remove();
          loadingText.remove();

          // Reset button state
          iterateButton.disabled = false;
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
      console.log('🔵 improveSelected action received');
      console.log('  - Request:', request);
      console.log('  - Sender:', sender);
      console.log('  - Stack trace:', new Error().stack);

      // Handle text selection improvement
      const selectedText = window.getSelection().toString().trim();
      console.log('  - Selected text length:', selectedText.length);

      if (selectedText) {
        // Show loading notification
        showNotification('Analyzing selected text...', 'info');

        // Send to background for AI processing
        chrome.runtime.sendMessage({
          action: 'improveScript',
          data: {
            script: selectedText,
            url: window.location.href // Include current page URL for site-specific prompts
          }
        }).then(response => {
          if (response && response.success) {
            improvedCode = response.improvedCode;
            originalCode = selectedText;
            lastCommandOutput = 'Selected text improvement';

            console.log('✓ Received improved code from selected text');

            // Try to find the closest input field for insertion
            const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);
            lastTriggeredInputElement = possibleInputs.length > 0 ? possibleInputs[0] : null;

            // Show the modal with the improved code
            showImprovedCodeModal(improvedCode);

            showNotification('Text improved! Check the modal.', 'success');
          } else {
            const errorMsg = response?.error || 'Failed to improve text';
            showNotification(errorMsg, 'error');
            console.error('improveSelected error:', errorMsg);
          }
        }).catch(error => {
          console.error('Error improving selected text:', error);
          showNotification('Error: ' + error.message, 'error');
        });
      } else {
        showNotification('Please select some text first', 'warning');
        console.warn('No text selected');
      }

      // Return true to indicate async response
      return true;
    }
  });

  // Keyboard shortcuts handler
  document.addEventListener('keydown', async (e) => {
    // Alt+Shift+A: Send to AI
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();

      // First, check if there's a visible hover button (from selection)
      const hoverButton = document.querySelector('.claude-selection-hover-btn.visible');
      if (hoverButton) {
        hoverButton.click();
        showNotification('⌨️ Shortcut: Alt+Shift+A', 'info');
        return;
      }

      // Fallback: Check if there's selected text and trigger handleSelection
      let hasSelection = false;
      const activeElement = document.activeElement;

      // Check textarea/input selection
      if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        if (start !== end) {
          hasSelection = true;
          handleSelection(e); // This will show the hover button
          // Wait a bit for button to appear, then click it
          setTimeout(() => {
            const btn = document.querySelector('.claude-selection-hover-btn');
            if (btn) btn.click();
          }, 50);
        }
      } else {
        // Check window selection
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText && selectedText.length >= 3) {
          hasSelection = true;
          handleSelection(e); // This will show the hover button
          // Wait a bit for button to appear, then click it
          setTimeout(() => {
            const btn = document.querySelector('.claude-selection-hover-btn');
            if (btn) btn.click();
          }, 50);
        }
      }

      if (!hasSelection) {
        showNotification('Please select text first to use Alt+Shift+A', 'warning');
      }
    }

    // Alt+Shift+I: Insert last AI output into focused editable field
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();

      if (!improvedCode) {
        showNotification('No AI output available. Use Alt+Shift+A first.', 'warning');
        return;
      }

      // Get the currently focused element
      const activeElement = document.activeElement;

      if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
        // Insert into textarea/input
        activeElement.value = improvedCode;
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        activeElement.dispatchEvent(new Event('change', { bubbles: true }));
        activeElement.focus();
        showNotification('⌨️ Shortcut: Alt+Shift+I - Code inserted!', 'success');
      } else if (activeElement && (activeElement.isContentEditable || activeElement.contentEditable === 'true')) {
        // Insert into contenteditable
        activeElement.innerText = improvedCode;
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        activeElement.focus();
        showNotification('⌨️ Shortcut: Alt+Shift+I - Code inserted!', 'success');
      } else {
        showNotification('Please focus an editable field first to use Alt+Shift+I', 'warning');
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