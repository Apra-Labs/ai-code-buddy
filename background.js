// AI Code Buddy - Background Script
// Handles multiple AI provider integrations and message passing

// Import provider configuration
importScripts('providers.js');

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // Base delay in ms

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeOutput') {
    handleAnalyzeOutput(request.data).then(sendResponse);
    return true; // Will respond asynchronously
  } else if (request.action === 'improveScript') {
    handleImproveScript(request.data).then(sendResponse);
    return true; // Will respond asynchronously
  }
});

// Handle output analysis request
async function handleAnalyzeOutput(data) {
  try {
    const { output, script, conversationHistory = [] } = data;

    // Get settings including provider type
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

    // Default to Claude if no provider set
    const providerType = settings.provider || 'claude';

    // Check if API key is configured (unless using local providers)
    if (!settings.apiKey && providerType !== 'ollama') {
      return { success: false, error: 'API key not configured' };
    }

    // Build conversation context if there's history
    let contextSection = '';
    if (conversationHistory.length > 0) {
      contextSection = '\n\n## Previous Attempts (learn from these!):\n';
      conversationHistory.forEach((attempt, index) => {
        contextSection += `\nAttempt ${index + 1}:\n`;
        contextSection += `Script tried:\n${attempt.script}\n`;
        contextSection += `Result/Error:\n${attempt.output}\n`;
        contextSection += `Improvement made:\n${attempt.improved}\n`;
        contextSection += `---\n`;
      });
      contextSection += '\nThe script is STILL failing. Learn from previous attempts and try a DIFFERENT approach.\n';
    }

    // Construct the analysis prompt with conversation awareness
    const prompt = `You are helping debug a command or script that ${conversationHistory.length > 0 ? 'is STILL failing after ' + conversationHistory.length + ' attempts' : 'may have failed or produced unexpected output'}.
${contextSection}

## Current Attempt:
${script ? `Current Script:\n${script}\n\n` : ''}Latest Output/Error:
${output}

${conversationHistory.length > 0 ?
  'IMPORTANT: The previous approaches did NOT work. Try a COMPLETELY DIFFERENT solution. Consider:\n' +
  '- Different tools or commands\n' +
  '- Alternative logic or approach\n' +
  '- Checking different error conditions\n' +
  '- Using different syntax or methods\n\n'
  : ''}Provide ONLY the improved script with no explanation, ready to run immediately.
Focus on:
- Fixing any errors shown in the output
- Adding better error handling
- Improving efficiency and reliability
- Making the script more robust
${conversationHistory.length > 0 ? '- Using a DIFFERENT approach than previous attempts' : ''}

Return only the executable script code, nothing else.`;

    console.log(`[Background] Processing request with ${conversationHistory.length} previous attempts`);

    // Create provider instance
    const provider = new AIProvider(providerType, {
      apiKey: settings.apiKey,
      model: settings.modelPreference,
      endpoint: settings.endpoint,
      deploymentName: settings.deploymentName,
      apiVersion: settings.apiVersion,
      organization: settings.organization,
      headers: settings.customHeaders,
      requestTemplate: settings.requestTemplate
    });
    
    // Validate configuration
    const validationErrors = provider.validateConfig();
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Configuration error: ${validationErrors.join(', ')}`
      };
    }
    
    // Call AI API
    const response = await provider.callAPI(prompt);
    
    if (response.success) {
      return {
        success: true,
        improvedScript: response.content
      };
    } else {
      return {
        success: false,
        error: response.error
      };
    }
  } catch (error) {
    console.error('Error in handleAnalyzeOutput:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle script improvement request
async function handleImproveScript(data) {
  try {
    const { script } = data;
    
    // Get settings including provider type
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
    
    // Default to Claude if no provider set
    const providerType = settings.provider || 'claude';
    
    // Check if API key is configured (unless using local providers)
    if (!settings.apiKey && providerType !== 'ollama') {
      return { success: false, error: 'API key not configured' };
    }

    // Construct the improvement prompt
    const prompt = `Improve the following command or script for better error handling, efficiency, and reliability:

${script}

Provide ONLY the improved script with no explanation, ready to run immediately.
Focus on:
- Adding comprehensive error handling
- Improving performance and efficiency
- Making the script more maintainable
- Adding necessary validation
- Ensuring idempotency where appropriate

Return only the executable script code, nothing else.`;

    // Create provider instance
    const provider = new AIProvider(providerType, {
      apiKey: settings.apiKey,
      model: settings.modelPreference,
      endpoint: settings.endpoint,
      deploymentName: settings.deploymentName,
      apiVersion: settings.apiVersion,
      organization: settings.organization,
      headers: settings.customHeaders,
      requestTemplate: settings.requestTemplate
    });
    
    // Validate configuration
    const validationErrors = provider.validateConfig();
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Configuration error: ${validationErrors.join(', ')}`
      };
    }
    
    // Call AI API
    const response = await provider.callAPI(prompt);
    
    if (response.success) {
      return {
        success: true,
        improvedScript: response.content
      };
    } else {
      return {
        success: false,
        error: response.error
      };
    }
  } catch (error) {
    console.error('Error in handleImproveScript:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open popup on first install
    chrome.action.openPopup();
    
    // Set default settings
    chrome.storage.sync.set({
      provider: 'claude', // Default to Claude
      autoImprove: false
    });
  }
});

// Monitor storage changes for debugging
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'apiKey') {
      console.log('API key updated');
    } else {
      console.log(`Storage key "${key}" changed:`, { oldValue, newValue });
    }
  }
});