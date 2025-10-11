// RPort AI Assistant - Multi-Provider Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // State
  let currentProvider = null;
  let providerConfig = {};

  // Elements
  const elements = {
    // Tabs
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Provider selection
    providerCards: document.querySelectorAll('.provider-card'),
    providerTitle: document.getElementById('provider-title'),
    configFields: document.getElementById('config-fields'),
    providerConfigSection: document.getElementById('provider-config'),
    
    // Status
    statusDiv: document.getElementById('status'),
    statusText: document.getElementById('status-text'),
    notification: document.getElementById('notification'),
    
    // Buttons
    saveConfig: document.getElementById('saveConfig'),
    testConnection: document.getElementById('testConnection'),
    improveSelected: document.getElementById('improveSelected'),
    clearSettings: document.getElementById('clearSettings'),
    saveSelectors: document.getElementById('saveSelectors'),
    exportConfig: document.getElementById('exportConfig'),
    importConfig: document.getElementById('importConfig'),
    importFile: document.getElementById('importFile'),
    
    // Settings
    autoImprove: document.getElementById('autoImprove'),
    outputSelector: document.getElementById('outputSelector'),
    inputSelector: document.getElementById('inputSelector'),
    
    // Advanced
    customPrompt: document.getElementById('customPrompt'),
    maxTokens: document.getElementById('maxTokens'),
    temperature: document.getElementById('temperature'),
    timeout: document.getElementById('timeout')
  };

  // Initialize
  await loadSettings();
  setupEventListeners();
  setupProviderScrollButtons();

  // Load saved settings
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'provider',
        'apiKey',
        'modelPreference',
        'endpoint',
        'deploymentName',
        'apiVersion',
        'organization',
        'autoImprove',
        'customSelectors',
        'customPrompt',
        'maxTokens',
        'temperature',
        'timeout'
      ]);

      // Load provider selection
      if (settings.provider) {
        selectProvider(settings.provider);
        
        // Load provider-specific config
        providerConfig = {
          apiKey: settings.apiKey,
          model: settings.modelPreference,
          endpoint: settings.endpoint,
          deploymentName: settings.deploymentName,
          apiVersion: settings.apiVersion,
          organization: settings.organization
        };
        
        // Update status if API key exists
        if (settings.apiKey || settings.provider === 'ollama') {
          updateStatus(true, settings.provider);
        }
      }

      // Load other settings
      if (settings.autoImprove !== undefined) {
        elements.autoImprove.checked = settings.autoImprove;
      }

      if (settings.customSelectors) {
        elements.outputSelector.value = settings.customSelectors.commandOutput || '';
        elements.inputSelector.value = settings.customSelectors.commandInput || '';
      }

      // Load advanced settings
      if (settings.customPrompt) elements.customPrompt.value = settings.customPrompt;
      if (settings.maxTokens) elements.maxTokens.value = settings.maxTokens;
      if (settings.temperature) elements.temperature.value = settings.temperature;
      if (settings.timeout) elements.timeout.value = settings.timeout;

    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('Error loading settings', 'error');
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Provider selection
    elements.providerCards.forEach(card => {
      card.addEventListener('click', () => selectProvider(card.dataset.provider));
    });

    // Save configuration
    elements.saveConfig.addEventListener('click', saveConfiguration);
    
    // Test connection
    elements.testConnection.addEventListener('click', testConnection);
    
    // Other buttons
    elements.improveSelected.addEventListener('click', improveSelectedText);
    elements.clearSettings.addEventListener('click', clearAllSettings);
    elements.saveSelectors.addEventListener('click', saveCustomSelectors);
    elements.exportConfig.addEventListener('click', exportConfiguration);
    elements.importConfig.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', importConfiguration);
    
    // Auto-save checkboxes
    elements.autoImprove.addEventListener('change', async () => {
      await chrome.storage.sync.set({ autoImprove: elements.autoImprove.checked });
      showNotification('Auto-improve setting saved', 'success');
    });
  }

  // Switch tabs
  function switchTab(tabName) {
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    elements.tabContents.forEach(content => {
      const contentId = `${tabName}-tab`;
      content.classList.toggle('active', content.id === contentId);
    });
  }

  // Select provider
  function selectProvider(providerType) {
    currentProvider = providerType;
    
    // Update UI
    elements.providerCards.forEach(card => {
      card.classList.toggle('selected', card.dataset.provider === providerType);
    });

    // Get provider info
    const provider = AI_PROVIDERS[providerType];
    if (!provider) return;

    // Update title
    elements.providerTitle.textContent = `${provider.name} Configuration`;

    // Generate configuration fields
    generateConfigFields(provider, providerType);
    
    // Load existing config for this provider
    loadProviderConfig(providerType);
  }

  // Generate configuration fields
  function generateConfigFields(provider, providerType) {
    let html = '';
    let credentialsHtml = '';

    // Add provider-specific note if needed
    if (providerType === 'ollama') {
      html += `<div class="config-note">Ollama runs locally. Make sure it's running at the specified endpoint.</div>`;
    } else if (providerType === 'azure') {
      html += `<div class="config-note">Azure OpenAI requires your deployment details from Azure Portal.</div>`;
    } else if (providerType === 'custom') {
      html += `<div class="config-note">Configure your custom API endpoint and request format.</div>`;
    }

    // Model selection (if applicable) - ALWAYS VISIBLE
    if (provider.models && provider.models.length > 0) {
      html += `
        <div class="form-group">
          <label for="config-model">Model</label>
          <select id="config-model">
            ${provider.models.map(model =>
              `<option value="${model.id}" ${model.default ? 'selected' : ''}>${model.name}</option>`
            ).join('')}
          </select>
        </div>`;
    }

    // API Key field (if needed) - COLLAPSIBLE
    if (provider.configFields.includes('apiKey')) {
      credentialsHtml += `
        <div class="form-group">
          <label for="config-apiKey">API Key</label>
          <input type="password" id="config-apiKey" placeholder="${provider.apiKeyPlaceholder || 'Enter API key'}" autocomplete="off">
          ${provider.name === 'Claude (Anthropic)' ?
            '<div class="help-text">Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a></div>' :
          provider.name === 'OpenAI (GPT-4/GPT-3.5)' ?
            '<div class="help-text">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></div>' :
          provider.name === 'Google Gemini' ?
            '<div class="help-text">Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></div>' :
            ''}
        </div>`;
    }

    // Endpoint field (for Azure, Ollama, Custom) - COLLAPSIBLE
    if (provider.configFields.includes('endpoint')) {
      const defaultEndpoint = providerType === 'ollama' ? 'http://localhost:11434' : '';
      credentialsHtml += `
        <div class="form-group">
          <label for="config-endpoint">Endpoint URL</label>
          <input type="url" id="config-endpoint" placeholder="${defaultEndpoint || 'https://your-endpoint.com'}" value="${defaultEndpoint}">
        </div>`;
    }

    // Azure-specific fields - COLLAPSIBLE
    if (providerType === 'azure') {
      credentialsHtml += `
        <div class="form-group">
          <label for="config-deploymentName">Deployment Name</label>
          <input type="text" id="config-deploymentName" placeholder="your-deployment-name">
        </div>
        <div class="form-group">
          <label for="config-apiVersion">API Version</label>
          <input type="text" id="config-apiVersion" placeholder="2023-05-15" value="2023-05-15">
        </div>`;
    }

    // OpenAI organization field - COLLAPSIBLE
    if (providerType === 'openai') {
      credentialsHtml += `
        <div class="form-group">
          <label for="config-organization">Organization ID (Optional)</label>
          <input type="text" id="config-organization" placeholder="org-...">
        </div>`;
    }

    // Custom provider fields - COLLAPSIBLE
    if (providerType === 'custom') {
      credentialsHtml += `
        <div class="form-group">
          <label for="config-headers">Request Headers (JSON)</label>
          <textarea id="config-headers" placeholder='{"Authorization": "Bearer YOUR_KEY"}'></textarea>
        </div>
        <div class="form-group">
          <label for="config-requestTemplate">Request Body Template (JSON)</label>
          <textarea id="config-requestTemplate" placeholder='{"prompt": "{prompt}", "max_tokens": 2000}'></textarea>
          <div class="help-text">Use {prompt} as placeholder for the input prompt</div>
        </div>`;
    }

    // Add collapsible credentials section if there are any credentials fields
    if (credentialsHtml) {
      html += `
        <div class="advanced-toggle" id="credentials-toggle">
          <span class="advanced-toggle-text">
            <span class="twistie">▸</span>
            API Credentials & Settings
          </span>
          <span style="font-size: 9px; color: #888;">(configured)</span>
        </div>
        <div class="advanced-content credentials-section" id="credentials-content">
          ${credentialsHtml}
        </div>`;
    }

    elements.configFields.innerHTML = html;

    // Setup toggle functionality
    const toggle = document.getElementById('credentials-toggle');
    const content = document.getElementById('credentials-content');
    if (toggle && content) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('expanded');
        content.classList.toggle('show');
      });
    }
  }

  // Load provider configuration
  async function loadProviderConfig(providerType) {
    try {
      const settings = await chrome.storage.sync.get([
        'provider',
        'apiKey',
        'modelPreference',
        'endpoint',
        'deploymentName',
        'apiVersion',
        'organization',
        'customHeaders',
        'requestTemplate'
      ]);

      // Only load if this is the currently saved provider
      if (settings.provider === providerType) {
        // Fill in the fields
        const fields = {
          'apiKey': settings.apiKey,
          'model': settings.modelPreference,
          'endpoint': settings.endpoint,
          'deploymentName': settings.deploymentName,
          'apiVersion': settings.apiVersion,
          'organization': settings.organization,
          'headers': settings.customHeaders,
          'requestTemplate': settings.requestTemplate
        };

        for (const [key, value] of Object.entries(fields)) {
          const field = document.getElementById(`config-${key}`);
          if (field && value) {
            field.value = value;
          }
        }
      }
    } catch (error) {
      console.error('Error loading provider config:', error);
    }
  }

  // Save configuration
  async function saveConfiguration() {
    if (!currentProvider) {
      showNotification('Please select a provider first', 'error');
      return;
    }

    elements.saveConfig.classList.add('loading');
    elements.saveConfig.disabled = true;

    try {
      const config = {
        provider: currentProvider
      };

      // Collect field values
      const fields = ['apiKey', 'model', 'endpoint', 'deploymentName', 'apiVersion', 'organization', 'headers', 'requestTemplate'];
      
      for (const field of fields) {
        const element = document.getElementById(`config-${field}`);
        if (element && element.value) {
          const storageKey = field === 'model' ? 'modelPreference' : 
                            field === 'headers' ? 'customHeaders' :
                            field;
          config[storageKey] = element.value;
        }
      }

      // Validate based on provider
      const provider = new AIProvider(currentProvider, config);
      const errors = provider.validateConfig();
      
      if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
      }

      // Save to storage
      await chrome.storage.sync.set(config);

      updateStatus(true, currentProvider);
      showNotification('Configuration saved successfully! Click "Test Connection" to verify.', 'success');
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      showNotification('Failed to save configuration', 'error');
    } finally {
      elements.saveConfig.classList.remove('loading');
      elements.saveConfig.disabled = false;
    }
  }

  // Test connection
  async function testConnection() {
    const settings = await chrome.storage.sync.get(['provider', 'apiKey']);

    if (!settings.provider) {
      showNotification('Please configure a provider first', 'error');
      return;
    }

    if (!settings.apiKey && settings.provider !== 'ollama') {
      showNotification('Please enter an API key first', 'error');
      return;
    }

    elements.testConnection.classList.add('loading');
    elements.testConnection.disabled = true;

    try {
      // Send test request to background script with a simple test
      const response = await chrome.runtime.sendMessage({
        action: 'improveScript',
        data: {
          script: 'echo "test"'
        }
      });

      if (response && response.success) {
        showNotification(`✓ Connected to ${AI_PROVIDERS[settings.provider]?.name || settings.provider}!`, 'success');
        updateStatus(true, settings.provider);
      } else {
        const errorMsg = response?.error || 'Connection failed';
        // Don't show full CORS errors, just a friendly message
        if (errorMsg.includes('CORS') || errorMsg.includes('Failed to fetch')) {
          showNotification('Network error. Check your API key and try again.', 'error');
        } else {
          showNotification(errorMsg, 'error');
        }
        updateStatus(false);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      const errorMsg = error.message || 'Connection test failed';
      if (errorMsg.includes('CORS') || errorMsg.includes('Failed to fetch')) {
        showNotification('Network error. Check your configuration.', 'error');
      } else {
        showNotification(errorMsg, 'error');
      }
      updateStatus(false);
    } finally {
      elements.testConnection.classList.remove('loading');
      elements.testConnection.disabled = false;
    }
  }

  // Update status indicator
  function updateStatus(connected, providerName = '') {
    if (connected) {
      elements.statusDiv.className = 'status connected';
      elements.statusText.textContent = `Connected to ${AI_PROVIDERS[providerName]?.name || providerName}`;
    } else {
      elements.statusDiv.className = 'status disconnected';
      elements.statusText.textContent = 'No Provider Configured';
    }
  }

  // Improve selected text
  async function improveSelectedText() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showNotification('No active tab found', 'error');
        return;
      }

      const settings = await chrome.storage.sync.get(['provider', 'apiKey']);
      if (!settings.provider || (!settings.apiKey && settings.provider !== 'ollama')) {
        showNotification('Please configure a provider first', 'error');
        return;
      }

      await chrome.tabs.sendMessage(tab.id, { action: 'improveSelected' });
      showNotification('Check the page for improved script', 'success');
      
      setTimeout(() => window.close(), 1500);
    } catch (error) {
      console.error('Error improving selected text:', error);
      showNotification('Failed to improve text', 'error');
    }
  }

  // Save custom selectors
  async function saveCustomSelectors() {
    try {
      const customSelectors = {
        commandOutput: elements.outputSelector.value.trim(),
        commandInput: elements.inputSelector.value.trim()
      };

      await chrome.storage.sync.set({ customSelectors });
      showNotification('Custom selectors saved', 'success');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('Error saving selectors:', error);
      showNotification('Failed to save selectors', 'error');
    }
  }

  // Clear all settings
  async function clearAllSettings() {
    if (!confirm('Are you sure you want to clear all settings?')) {
      return;
    }

    try {
      await chrome.storage.sync.clear();
      
      // Reset UI
      elements.providerCards.forEach(card => card.classList.remove('selected'));
      currentProvider = null;
      elements.configFields.innerHTML = '';
      elements.autoImprove.checked = false;
      elements.outputSelector.value = '';
      elements.inputSelector.value = '';
      
      updateStatus(false);
      showNotification('All settings cleared', 'success');
    } catch (error) {
      console.error('Error clearing settings:', error);
      showNotification('Failed to clear settings', 'error');
    }
  }

  // Export configuration
  async function exportConfiguration() {
    try {
      const settings = await chrome.storage.sync.get(null);
      
      // Remove sensitive data option
      const safeCopy = { ...settings };
      delete safeCopy.apiKey; // Remove API key for safety
      
      const blob = new Blob([JSON.stringify(safeCopy, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rport-ai-config.json';
      a.click();
      
      URL.revokeObjectURL(url);
      showNotification('Configuration exported (API key excluded)', 'info');
    } catch (error) {
      console.error('Error exporting configuration:', error);
      showNotification('Failed to export configuration', 'error');
    }
  }

  // Import configuration
  async function importConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      // Validate config
      if (!config.provider) {
        throw new Error('Invalid configuration file');
      }
      
      // Save imported config
      await chrome.storage.sync.set(config);
      
      // Reload settings
      await loadSettings();
      
      showNotification('Configuration imported successfully', 'success');
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error importing configuration:', error);
      showNotification('Failed to import configuration', 'error');
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = elements.notification;
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    clearTimeout(notification.hideTimeout);
    notification.hideTimeout = setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // Setup provider scroll buttons
  function setupProviderScrollButtons() {
    const grid = document.getElementById('provider-grid');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');

    if (!grid || !leftBtn || !rightBtn) return;

    // Function to update button visibility
    function updateScrollButtons() {
      const scrollLeft = grid.scrollLeft;
      const scrollWidth = grid.scrollWidth;
      const clientWidth = grid.clientWidth;
      const isScrollable = scrollWidth > clientWidth;

      // Show/hide buttons based on scroll position and scrollability
      if (!isScrollable) {
        leftBtn.classList.remove('show');
        rightBtn.classList.remove('show');
      } else {
        // Show left button if not at start
        leftBtn.classList.toggle('show', scrollLeft > 5);
        // Show right button if not at end
        rightBtn.classList.toggle('show', scrollLeft < scrollWidth - clientWidth - 5);
      }
    }

    // Scroll handler
    function scrollGrid(direction) {
      const scrollAmount = 200; // Scroll by ~2 cards
      const targetScroll = direction === 'left'
        ? grid.scrollLeft - scrollAmount
        : grid.scrollLeft + scrollAmount;

      grid.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }

    // Event listeners
    leftBtn.addEventListener('click', () => scrollGrid('left'));
    rightBtn.addEventListener('click', () => scrollGrid('right'));

    // Update on scroll
    grid.addEventListener('scroll', updateScrollButtons);

    // Update on resize
    window.addEventListener('resize', updateScrollButtons);

    // Initial update
    setTimeout(updateScrollButtons, 100);
  }
});