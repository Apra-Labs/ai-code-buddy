// RPort Claude Assistant - Popup Script
// Handles extension settings and user interactions

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const testApiKeyBtn = document.getElementById('testApiKey');
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const modelSelect = document.getElementById('model');
  const autoImproveCheckbox = document.getElementById('autoImprove');
  const improveSelectedBtn = document.getElementById('improveSelected');
  const clearSettingsBtn = document.getElementById('clearSettings');
  const outputSelectorInput = document.getElementById('outputSelector');
  const inputSelectorInput = document.getElementById('inputSelector');
  const saveSelectorsBtn = document.getElementById('saveSelectors');
  const notification = document.getElementById('notification');

  // Load saved settings
  await loadSettings();

  // Event listeners
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  testApiKeyBtn.addEventListener('click', testApiKey);
  modelSelect.addEventListener('change', saveModelPreference);
  autoImproveCheckbox.addEventListener('change', saveAutoImprove);
  improveSelectedBtn.addEventListener('click', improveSelectedText);
  clearSettingsBtn.addEventListener('click', clearAllSettings);
  saveSelectorsBtn.addEventListener('click', saveCustomSelectors);

  // Enter key saves API key
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });

  // Load settings from storage
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'apiKey',
        'modelPreference',
        'autoImprove',
        'customSelectors'
      ]);

      if (settings.apiKey) {
        apiKeyInput.value = settings.apiKey;
        updateStatus(true);
      } else {
        updateStatus(false);
      }

      if (settings.modelPreference) {
        modelSelect.value = settings.modelPreference;
      }

      if (settings.autoImprove !== undefined) {
        autoImproveCheckbox.checked = settings.autoImprove;
      }

      if (settings.customSelectors) {
        outputSelectorInput.value = settings.customSelectors.commandOutput || '';
        inputSelectorInput.value = settings.customSelectors.commandInput || '';
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('Error loading settings', 'error');
    }
  }

  // Save API key
  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showNotification('Please enter an API key', 'error');
      return;
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-ant-')) {
      showNotification('Invalid API key format. Should start with "sk-ant-"', 'error');
      return;
    }

    // Show loading state
    saveApiKeyBtn.classList.add('loading');
    saveApiKeyBtn.disabled = true;

    try {
      await chrome.storage.sync.set({ apiKey });
      updateStatus(true);
      showNotification('API key saved successfully!', 'success');
      
      // Optionally test the key immediately
      setTimeout(() => testApiKey(), 500);
    } catch (error) {
      console.error('Error saving API key:', error);
      showNotification('Failed to save API key', 'error');
    } finally {
      saveApiKeyBtn.classList.remove('loading');
      saveApiKeyBtn.disabled = false;
    }
  }

  // Test API key
  async function testApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showNotification('Please enter an API key first', 'error');
      return;
    }

    // Show loading state
    testApiKeyBtn.classList.add('loading');
    testApiKeyBtn.disabled = true;

    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelSelect.value || 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{
            role: 'user',
            content: 'Test'
          }]
        })
      });

      if (response.ok) {
        showNotification('API key is valid and working!', 'success');
        updateStatus(true);
      } else if (response.status === 401) {
        showNotification('Invalid API key', 'error');
        updateStatus(false);
      } else {
        const error = await response.json().catch(() => ({}));
        showNotification(error.error?.message || 'API test failed', 'error');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      showNotification('Network error. Check your connection.', 'error');
    } finally {
      testApiKeyBtn.classList.remove('loading');
      testApiKeyBtn.disabled = false;
    }
  }

  // Update status indicator
  function updateStatus(connected) {
    if (connected) {
      statusDiv.className = 'status connected';
      statusText.textContent = 'Connected to Claude API';
    } else {
      statusDiv.className = 'status disconnected';
      statusText.textContent = 'API Key Not Configured';
    }
  }

  // Save model preference
  async function saveModelPreference() {
    try {
      await chrome.storage.sync.set({ modelPreference: modelSelect.value });
      showNotification('Model preference saved', 'success');
    } catch (error) {
      console.error('Error saving model preference:', error);
      showNotification('Failed to save preference', 'error');
    }
  }

  // Save auto-improve setting
  async function saveAutoImprove() {
    try {
      await chrome.storage.sync.set({ autoImprove: autoImproveCheckbox.checked });
      showNotification('Auto-improve setting saved', 'success');
    } catch (error) {
      console.error('Error saving auto-improve setting:', error);
      showNotification('Failed to save setting', 'error');
    }
  }

  // Improve selected text
  async function improveSelectedText() {
    try {
      // Send message to content script in active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showNotification('No active tab found', 'error');
        return;
      }

      // Check if API key is configured
      const settings = await chrome.storage.sync.get('apiKey');
      if (!settings.apiKey) {
        showNotification('Please configure your API key first', 'error');
        return;
      }

      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, { action: 'improveSelected' });
      showNotification('Check the page for improved script', 'success');
      
      // Close popup after action
      setTimeout(() => window.close(), 1500);
    } catch (error) {
      console.error('Error improving selected text:', error);
      showNotification('Failed to improve text. Is text selected?', 'error');
    }
  }

  // Clear all settings
  async function clearAllSettings() {
    if (!confirm('Are you sure you want to clear all settings including your API key?')) {
      return;
    }

    try {
      await chrome.storage.sync.clear();
      apiKeyInput.value = '';
      modelSelect.value = 'claude-3-sonnet-20240229';
      autoImproveCheckbox.checked = false;
      outputSelectorInput.value = '';
      inputSelectorInput.value = '';
      updateStatus(false);
      showNotification('All settings cleared', 'success');
    } catch (error) {
      console.error('Error clearing settings:', error);
      showNotification('Failed to clear settings', 'error');
    }
  }

  // Save custom selectors
  async function saveCustomSelectors() {
    try {
      const customSelectors = {
        commandOutput: outputSelectorInput.value.trim(),
        commandInput: inputSelectorInput.value.trim()
      };

      // Validate selectors if provided
      if (customSelectors.commandOutput) {
        try {
          document.querySelector(customSelectors.commandOutput);
        } catch (e) {
          showNotification('Invalid output selector syntax', 'error');
          return;
        }
      }

      if (customSelectors.commandInput) {
        try {
          document.querySelector(customSelectors.commandInput);
        } catch (e) {
          showNotification('Invalid input selector syntax', 'error');
          return;
        }
      }

      await chrome.storage.sync.set({ customSelectors });
      showNotification('Custom selectors saved', 'success');
      
      // Reload content scripts to apply new selectors
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('Error saving custom selectors:', error);
      showNotification('Failed to save selectors', 'error');
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide after 3 seconds
    clearTimeout(notification.hideTimeout);
    notification.hideTimeout = setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
});