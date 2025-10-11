// AI Provider Configuration and Abstraction Layer
// Supports multiple AI services with unified interface

const AI_PROVIDERS = {
  // Anthropic Claude
  claude: {
    name: 'Claude (Anthropic)',
    apiKeyPattern: /^sk-ant-/,
    apiKeyPlaceholder: 'sk-ant-api03-...',
    configFields: ['apiKey', 'model'],
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet v2 (Best)', default: true },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast & Affordable)' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Most Capable)' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
    ],
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (config) => ({
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    }),
    buildRequest: (prompt, config) => ({
      model: config.model || 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.3,
      system: "You are a helpful assistant that improves and fixes scripts. You respond only with executable code, no explanations or markdown formatting.",
      messages: [{
        role: 'user',
        content: prompt
      }]
    }),
    parseResponse: (data) => {
      return data.content?.[0]?.text || '';
    },
    handleError: (response, data) => {
      if (response.status === 429) {
        return { retry: true, error: 'Rate limit exceeded, will retry...' };
      }
      return { retry: false, error: data.error?.message || `API error: ${response.status}` };
    }
  },

  // OpenAI GPT
  openai: {
    name: 'OpenAI (GPT-4/GPT-3.5)',
    apiKeyPattern: /^sk-/,
    apiKeyPlaceholder: 'sk-...',
    configFields: ['apiKey', 'model', 'organization'],
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cheap)', default: true },
      { id: 'gpt-4o', name: 'GPT-4o (Best - Multimodal)' },
      { id: 'o1-preview', name: 'o1-preview (Reasoning)' },
      { id: 'o1-mini', name: 'o1-mini (Fast Reasoning)' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (config) => {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      };
      if (config.organization) {
        headers['OpenAI-Organization'] = config.organization;
      }
      return headers;
    },
    buildRequest: (prompt, config) => ({
      model: config.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that improves and fixes scripts. You respond only with executable code, no explanations or markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
    parseResponse: (data) => {
      return data.choices?.[0]?.message?.content || '';
    },
    handleError: (response, data) => {
      if (response.status === 429) {
        return { retry: true, error: 'Rate limit exceeded, will retry...' };
      }
      return { retry: false, error: data.error?.message || `API error: ${response.status}` };
    }
  },

  // Google Gemini/PaLM
  gemini: {
    name: 'Google Gemini',
    apiKeyPattern: /^AIza/,
    apiKeyPlaceholder: 'AIza...',
    configFields: ['apiKey', 'model'],
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Free - Fast)', default: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Free - Best)' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)' },
      { id: 'gemini-pro', name: 'Gemini Pro (Legacy)' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision (Legacy)' }
    ],
    endpoint: (config) => `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent?key=${config.apiKey}`,
    headers: () => ({
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt) => ({
      contents: [{
        parts: [{
          text: `You are a helpful assistant that improves and fixes scripts. Given the following request, provide ONLY the improved executable code without any explanations or markdown formatting:\n\n${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000
      }
    }),
    parseResponse: (data) => {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
    handleError: (response, data) => {
      if (response.status === 429) {
        return { retry: true, error: 'Rate limit exceeded, will retry...' };
      }
      return { retry: false, error: data.error?.message || `API error: ${response.status}` };
    }
  },

  // Azure OpenAI
  azure: {
    name: 'Azure OpenAI',
    apiKeyPattern: /^[a-f0-9]{32}$/,
    apiKeyPlaceholder: '32-character key',
    configFields: ['apiKey', 'endpoint', 'deploymentName', 'apiVersion'],
    models: [], // Models are deployment-specific in Azure
    endpoint: (config) => `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion || '2023-05-15'}`,
    headers: (config) => ({
      'Content-Type': 'application/json',
      'api-key': config.apiKey
    }),
    buildRequest: (prompt, config) => ({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that improves and fixes scripts. You respond only with executable code, no explanations or markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
    parseResponse: (data) => {
      return data.choices?.[0]?.message?.content || '';
    },
    handleError: (response, data) => {
      if (response.status === 429) {
        return { retry: true, error: 'Rate limit exceeded, will retry...' };
      }
      return { retry: false, error: data.error?.message || `API error: ${response.status}` };
    }
  },

  // Cohere
  cohere: {
    name: 'Cohere',
    apiKeyPattern: /^[A-Za-z0-9]{40}$/,
    apiKeyPlaceholder: '40-character API key',
    configFields: ['apiKey', 'model'],
    models: [
      { id: 'command-light', name: 'Command Light (Fast & Cheap)', default: true },
      { id: 'command-r', name: 'Command R' },
      { id: 'command-r-plus', name: 'Command R+ (Best)' },
      { id: 'command', name: 'Command (Legacy)' }
    ],
    endpoint: 'https://api.cohere.ai/v1/generate',
    headers: (config) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    }),
    buildRequest: (prompt, config) => ({
      model: config.model || 'command-light',
      prompt: `You are a helpful assistant that improves and fixes scripts. Given the following request, provide ONLY the improved executable code without any explanations or markdown formatting:\n\n${prompt}\n\nImproved script:`,
      max_tokens: 2000,
      temperature: 0.3,
      stop_sequences: ['---', '```']
    }),
    parseResponse: (data) => {
      return data.generations?.[0]?.text || '';
    },
    handleError: (response, data) => {
      if (response.status === 429) {
        return { retry: true, error: 'Rate limit exceeded, will retry...' };
      }
      return { retry: false, error: data.message || `API error: ${response.status}` };
    }
  },

  // Hugging Face Inference API
  huggingface: {
    name: 'Hugging Face',
    apiKeyPattern: /^hf_/,
    apiKeyPlaceholder: 'hf_...',
    configFields: ['apiKey', 'model'],
    models: [
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B (Best)', default: true },
      { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B' },
      { id: 'codellama/CodeLlama-34b-Instruct-hf', name: 'CodeLlama 34B' },
      { id: 'deepseek-ai/deepseek-coder-33b-instruct', name: 'DeepSeek Coder 33B' },
      { id: 'bigcode/starcoder2-15b', name: 'StarCoder 2 15B' },
      { id: 'microsoft/phi-3-medium-4k-instruct', name: 'Phi-3 Medium' }
    ],
    endpoint: (config) => `https://api-inference.huggingface.co/models/${config.model || 'Qwen/Qwen2.5-Coder-32B-Instruct'}`,
    headers: (config) => ({
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt) => ({
      inputs: `<s>[INST] You are a helpful assistant that improves and fixes scripts. Given the following request, provide ONLY the improved executable code without any explanations:\n\n${prompt} [/INST]`,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.3,
        do_sample: true,
        top_p: 0.95
      }
    }),
    parseResponse: (data) => {
      if (Array.isArray(data)) {
        return data[0]?.generated_text || '';
      }
      return data.generated_text || '';
    },
    handleError: (response, data) => {
      if (response.status === 503) {
        return { retry: true, error: 'Model is loading, will retry...' };
      }
      return { retry: false, error: data.error || `API error: ${response.status}` };
    }
  },

  // Ollama (Local)
  ollama: {
    name: 'Ollama (Local)',
    apiKeyPattern: null, // No API key needed for local
    apiKeyPlaceholder: 'Not required (local)',
    configFields: ['endpoint', 'model'],
    models: [
      { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B (Fast)', default: true },
      { id: 'qwen2.5-coder:latest', name: 'Qwen 2.5 Coder (Best)' },
      { id: 'llama3.2:latest', name: 'Llama 3.2' },
      { id: 'llama3.1:latest', name: 'Llama 3.1' },
      { id: 'deepseek-coder-v2:latest', name: 'DeepSeek Coder v2' },
      { id: 'codellama:latest', name: 'Code Llama' },
      { id: 'gemma2:latest', name: 'Gemma 2' },
      { id: 'mistral:latest', name: 'Mistral' },
      { id: 'mixtral:latest', name: 'Mixtral' }
    ],
    endpoint: (config) => `${config.endpoint || 'http://localhost:11434'}/api/generate`,
    headers: () => ({
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt, config) => ({
      model: config.model || 'qwen2.5-coder:7b',
      prompt: `You are a helpful assistant that improves and fixes scripts. Given the following request, provide ONLY the improved executable code without any explanations or markdown formatting:\n\n${prompt}\n\nImproved script:`,
      stream: false,
      options: {
        temperature: 0.3
      }
    }),
    parseResponse: (data) => {
      return data.response || '';
    },
    handleError: (response, data) => {
      if (!response.ok && response.status === 0) {
        return { retry: false, error: 'Cannot connect to Ollama. Is it running?' };
      }
      return { retry: false, error: data.error || `API error: ${response.status}` };
    }
  },

  // GitHub Copilot (via API)
  // Note: GitHub Copilot doesn't have a direct public API for completions
  // This uses the GitHub API with Copilot-enabled tokens
  github: {
    name: 'GitHub Copilot',
    apiKeyPattern: /^gh[ps]_/,
    apiKeyPlaceholder: 'ghp_... or ghs_...',
    configFields: ['apiKey'],
    models: [],
    endpoint: 'https://api.github.com/copilot/completions',
    headers: (config) => ({
      'Authorization': `token ${config.apiKey}`,
      'Accept': 'application/vnd.github.copilot-preview+json',
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt) => ({
      prompt: `# Task: Improve and fix the following script\n# Requirement: Return only executable code without explanations\n\n${prompt}\n\n# Improved version:\n`,
      max_tokens: 2000,
      temperature: 0.3
    }),
    parseResponse: (data) => {
      return data.choices?.[0]?.text || '';
    },
    handleError: (response, data) => {
      if (response.status === 401) {
        return { retry: false, error: 'Invalid GitHub token or Copilot not enabled' };
      }
      if (response.status === 403) {
        return { retry: false, error: 'GitHub Copilot access required' };
      }
      return { retry: false, error: data.message || `API error: ${response.status}` };
    }
  },

  // Replicate (for open source models)
  replicate: {
    name: 'Replicate',
    apiKeyPattern: /^r8_/,
    apiKeyPlaceholder: 'r8_...',
    configFields: ['apiKey', 'model'],
    models: [
      { id: 'meta/meta-llama-3.1-8b-instruct', name: 'Llama 3.1 8B (Fast & Cheap)', default: true },
      { id: 'meta/meta-llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
      { id: 'meta/meta-llama-3.1-405b-instruct', name: 'Llama 3.1 405B (Best)' },
      { id: 'mistralai/mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B' },
      { id: 'deepseek-ai/deepseek-coder-33b-instruct', name: 'DeepSeek Coder 33B' }
    ],
    endpoint: 'https://api.replicate.com/v1/predictions',
    headers: (config) => ({
      'Authorization': `Token ${config.apiKey}`,
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt, config) => ({
      version: config.modelVersion || 'latest',
      input: {
        prompt: `You are a helpful assistant that improves and fixes scripts. Given the following request, provide ONLY the improved executable code without any explanations or markdown formatting:\n\n${prompt}`,
        max_new_tokens: 2000,
        temperature: 0.3
      }
    }),
    parseResponse: (data) => {
      // Replicate returns async results, need to poll
      return data.output || '';
    },
    handleError: (response, data) => {
      return { retry: false, error: data.detail || `API error: ${response.status}` };
    }
  },

  // Custom/Self-hosted
  custom: {
    name: 'Custom API',
    apiKeyPattern: null,
    apiKeyPlaceholder: 'Your API key',
    configFields: ['apiKey', 'endpoint', 'headers', 'requestTemplate', 'responseParser'],
    models: [],
    endpoint: (config) => config.endpoint,
    headers: (config) => {
      try {
        return JSON.parse(config.headers || '{}');
      } catch {
        return { 'Content-Type': 'application/json' };
      }
    },
    buildRequest: (prompt, config) => {
      try {
        const template = JSON.parse(config.requestTemplate || '{}');
        // Replace {prompt} placeholder
        const requestStr = JSON.stringify(template).replace('{prompt}', prompt);
        return JSON.parse(requestStr);
      } catch {
        return { prompt };
      }
    },
    parseResponse: (data) => {
      // Allow custom response parsing via user-defined path
      return data.response || data.text || data.content || JSON.stringify(data);
    },
    handleError: (response, data) => {
      return { retry: false, error: `API error: ${response.status}` };
    }
  }
};

// Provider abstraction layer
class AIProvider {
  constructor(providerType, config) {
    this.type = providerType;
    this.provider = AI_PROVIDERS[providerType];
    this.config = config;
    
    if (!this.provider) {
      throw new Error(`Unknown provider: ${providerType}`);
    }
  }

  // Validate configuration
  validateConfig() {
    const errors = [];
    
    // Check required fields
    for (const field of this.provider.configFields) {
      if (field === 'apiKey' && this.provider.apiKeyPattern) {
        if (!this.config.apiKey) {
          errors.push(`API key is required`);
        } else if (!this.provider.apiKeyPattern.test(this.config.apiKey)) {
          errors.push(`Invalid API key format`);
        }
      } else if (field === 'endpoint' && !this.config.endpoint) {
        errors.push(`Endpoint URL is required`);
      }
    }
    
    return errors;
  }

  // Get API endpoint
  getEndpoint() {
    if (typeof this.provider.endpoint === 'function') {
      return this.provider.endpoint(this.config);
    }
    return this.provider.endpoint;
  }

  // Get request headers
  getHeaders() {
    if (typeof this.provider.headers === 'function') {
      return this.provider.headers(this.config);
    }
    return this.provider.headers;
  }

  // Build API request
  buildRequest(prompt) {
    return this.provider.buildRequest(prompt, this.config);
  }

  // Parse API response
  parseResponse(data) {
    const content = this.provider.parseResponse(data);
    // Clean up common formatting issues
    return content
      .replace(/^```[\w]*\n/, '') // Remove opening code fence
      .replace(/\n```$/, '')      // Remove closing code fence
      .trim();
  }

  // Handle errors
  handleError(response, data) {
    return this.provider.handleError(response, data);
  }

  // Make API call with retry logic
  async callAPI(prompt, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

    try {
      const endpoint = this.getEndpoint();
      const headers = this.getHeaders();
      const requestBody = this.buildRequest(prompt);

      console.log(`Calling ${this.type} API...`, { endpoint });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorInfo = this.handleError(response, errorData);
        
        if (errorInfo.retry && retryCount < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return this.callAPI(prompt, retryCount + 1);
        }
        
        throw new Error(errorInfo.error);
      }

      const data = await response.json();
      const content = this.parseResponse(data);
      
      if (!content) {
        throw new Error('No content in API response');
      }

      return {
        success: true,
        content: content
      };
    } catch (error) {
      console.error(`${this.type} API error:`, error);
      
      // Network errors - retry
      if (retryCount < maxRetries && (error.name === 'NetworkError' || error.name === 'TypeError')) {
        console.log(`Network error, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.callAPI(prompt, retryCount + 1);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get provider info
  getInfo() {
    return {
      name: this.provider.name,
      models: this.provider.models || [],
      configFields: this.provider.configFields,
      apiKeyPattern: this.provider.apiKeyPattern,
      apiKeyPlaceholder: this.provider.apiKeyPlaceholder
    };
  }
}

// Export for use in extension (works in both service workers and content scripts)
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { AI_PROVIDERS, AIProvider };
} else if (typeof self !== 'undefined') {
  // Service worker or web worker environment
  self.AI_PROVIDERS = AI_PROVIDERS;
  self.AIProvider = AIProvider;

  // Also expose to window if available (for content scripts)
  if (typeof window !== 'undefined') {
    window.AI_PROVIDERS = AI_PROVIDERS;
    window.AIProvider = AIProvider;
  }
}