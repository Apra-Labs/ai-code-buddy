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
  let improvedScript = null;
  let originalScript = null;
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
                  <span>Insert Script</span>
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

  // Check if current site is blocked
  function isCurrentSiteBlocked(blockedSites) {
    if (!blockedSites || blockedSites.length === 0) {
      return false;
    }

    const currentHostname = window.location.hostname.toLowerCase();

    return blockedSites.some(pattern => {
      const patternLower = pattern.toLowerCase().trim();

      // Handle wildcard patterns like *.example.com
      if (patternLower.startsWith('*.')) {
        const domain = patternLower.substring(2);
        return currentHostname.endsWith(domain) || currentHostname === domain.substring(0);
      }

      // Handle wildcard patterns like *example.com
      if (patternLower.startsWith('*')) {
        const domain = patternLower.substring(1);
        return currentHostname.includes(domain);
      }

      // Exact match or subdomain match
      return currentHostname === patternLower || currentHostname.endsWith('.' + patternLower);
    });
  }

  // Initialize extension
  async function init() {
    console.log('AI Code Buddy initializing...');

    // Load settings including blocked sites
    const settings = await chrome.storage.sync.get(['customSelectors', 'blockedSites']);

    // Check if current site is blocked
    if (settings.blockedSites && isCurrentSiteBlocked(settings.blockedSites)) {
      console.log('AI Code Buddy: Current site is blocked, extension disabled');
      return; // Exit early - don't inject anything
    }

    console.log('AI Code Buddy: Site not blocked, proceeding with initialization');

    // Load custom selectors if configured
    if (settings.customSelectors) {
      customSelectors = settings.customSelectors;
      console.log('✓ Custom selectors loaded');
    }

    // Set up observers and inject buttons
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
              element.closest('.claude-script-modal') ||
              element.classList.contains('claude-modal-script')) {
            continue;
          }

          // For OUTPUT elements: Skip if processed
          // For INPUT elements: Allow even if processed (we need to find them for "Use Script")
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
  function injectButtons() {
    // Find and process command output areas
    const outputElements = findElements(
      SELECTORS.commandOutput,
      customSelectors?.commandOutput
    );

    console.log(`[Button Injection] Found ${outputElements.length} output elements`);

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

    // Note: Insert buttons are no longer created since we always show the modal
    // The modal provides better UX with editable textareas and "Use Script" button
    // Keeping the input element detection code for future use if needed
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
    button.title = '📝 Insert improved script (Alt+Shift+I)';
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
      originalScript = '';

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
          if (!originalScript && (input.value || input.textContent)) {
            originalScript = input.value || input.textContent;
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
          script: originalScript,
          conversationHistory: conversationHistory, // Include previous attempts
          url: window.location.href // Include current page URL for site-specific prompts
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
        // The modal will use lastTriggeredInputElement for the "Use Script" button
        showImprovedScriptModal(improvedScript, outputElement, button);
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

  // Show improved script in a modal when no input fields found
  function showImprovedScriptModal(script, sourceOutputElement = null, sourceButton = null) {
    // Remove existing modal if any
    const existing = document.querySelector('.claude-script-modal');
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
    modal.className = 'claude-script-modal';
    modal.innerHTML = `
      <div class="claude-modal-overlay"></div>
      <div class="claude-modal-content">
        <div class="claude-modal-header">
          <h3>{+} AI Code Buddy</h3>
          <button class="claude-modal-close" title="Close">&times;</button>
        </div>
        <div class="claude-modal-body">
          <div class="claude-modal-section">
            <label class="claude-modal-label">Your Prompt (editable):</label>
            <textarea class="claude-modal-prompt" rows="4" placeholder="Describe what you want to achieve...">${escapeHtml(originalScript || lastCommandOutput || '')}</textarea>
          </div>
          <div class="claude-modal-section">
            <label class="claude-modal-label">Generated Script (editable):</label>
            <textarea class="claude-modal-script" rows="12">${escapeHtml(script)}</textarea>
          </div>
        </div>
        <div class="claude-modal-footer">
          <button class="claude-modal-use btn-primary">✓ Use Script</button>
          <button class="claude-modal-iterate btn-secondary">🔄 Improve Further</button>
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
    const scriptTextarea = modal.querySelector('.claude-modal-script');
    const useButton = modal.querySelector('.claude-modal-use');
    const copyButton = modal.querySelector('.claude-modal-copy');
    const iterateButton = modal.querySelector('.claude-modal-iterate');

    // "Use Script" button - inserts script into target input and closes modal
    if (targetInput) {
      useButton.addEventListener('click', () => {
        const scriptToInsert = scriptTextarea.value;

        // Insert into the target input field
        if (targetInput.tagName === 'TEXTAREA' || targetInput.tagName === 'INPUT') {
          targetInput.value = scriptToInsert;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (targetInput.isContentEditable || targetInput.contentEditable === 'true') {
          targetInput.innerText = scriptToInsert;
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
        const scriptToCopy = scriptTextarea.value;
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
        const currentScript = scriptTextarea.value;

        // Show big loading overlay on script section
        const scriptSection = scriptTextarea.closest('.claude-modal-section');
        scriptSection.classList.add('loading');

        // Create loading spinner and text
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'claude-loading-spinner';
        scriptSection.appendChild(loadingSpinner);

        const loadingText = document.createElement('div');
        loadingText.className = 'claude-loading-text';
        loadingText.textContent = 'AI is thinking...';
        scriptSection.appendChild(loadingText);

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

          if (response.success && response.improvedScript) {
            // Update the modal with new improved script
            improvedScript = response.improvedScript;
            scriptTextarea.value = improvedScript;

            // Update conversation history
            conversationHistory.push({
              script: currentPrompt,
              output: lastCommandOutput,
              improved: improvedScript,
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
          scriptSection.classList.remove('loading');
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
            improvedScript = response.improvedScript;
            originalScript = selectedText;
            lastCommandOutput = 'Selected text improvement';

            console.log('✓ Received improved script from selected text');

            // Try to find the closest input field for insertion
            const possibleInputs = findElements(SELECTORS.commandInput, customSelectors?.commandInput);
            lastTriggeredInputElement = possibleInputs.length > 0 ? possibleInputs[0] : null;

            // Show the modal with the improved script
            showImprovedScriptModal(improvedScript);

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
    // Alt+Shift+A: Send to AI (trigger first visible Send button)
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const sendButton = document.querySelector('.claude-send-btn:not(:disabled)');
      if (sendButton) {
        sendButton.click();
        showNotification('⌨️ Shortcut used: Alt+Shift+A', 'info');
      } else {
        showNotification('No output to analyze. Run a command first.', 'warning');
      }
    }

    // Alt+Shift+I: Insert improved script (trigger first visible Insert button)
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      const insertButton = document.querySelector('.claude-insert-btn:not(:disabled):not([style*="display: none"])');
      if (insertButton) {
        insertButton.click();
        showNotification('⌨️ Shortcut used: Alt+Shift+I', 'info');
      } else {
        showNotification('No improved script available. Analyze output first.', 'warning');
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