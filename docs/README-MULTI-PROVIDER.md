# RPort AI Assistant - Multi-Provider Chrome Extension

A powerful Chrome extension that integrates multiple AI providers (Claude, OpenAI, Gemini, and more) directly into the RPort web interface, eliminating the need to copy-paste commands and outputs.

## 🌟 Supported AI Providers

| Provider | Models | API Key Required | Notes |
|----------|--------|------------------|-------|
| **Claude (Anthropic)** | Claude 3 Opus/Sonnet/Haiku, Claude 2.1, Instant | Yes | Best for code analysis and improvements |
| **OpenAI** | GPT-4 Turbo, GPT-4, GPT-3.5 Turbo | Yes | Industry standard, wide model selection |
| **Google Gemini** | Gemini Pro, Gemini Pro Vision | Yes | Free tier available, good performance |
| **Azure OpenAI** | Your deployed models | Yes | Enterprise-ready, custom deployments |
| **Cohere** | Command, Command Nightly, Command Light | Yes | Cost-effective alternative |
| **Hugging Face** | CodeLlama, StarCoder, CodeGen, Phi-2 | Yes | Open-source models, free tier |
| **Ollama** | Llama 2, CodeLlama, Mistral, Mixtral | No | **Runs locally**, no API key needed |
| **Replicate** | Llama 2 70B, CodeLlama 34B, Mixtral | Yes | Pay-per-use cloud models |
| **GitHub Copilot** | Via GitHub API | GitHub Token | Requires Copilot subscription |
| **Custom API** | Any API | Configurable | Use your own AI service |

## 🚀 Features

- **Multi-Provider Support**: Choose from 10+ AI providers
- **One-Click Analysis**: Send command output to AI instantly
- **Auto-Insert**: Insert improved scripts directly into RPort
- **Local AI Support**: Use Ollama for completely offline operation
- **Flexible Detection**: Works with various terminal interfaces
- **Custom Configuration**: Support for self-hosted AI services

## 📦 Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## 🔧 Configuration

### Quick Setup by Provider

#### Claude (Anthropic)
1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Select Claude in extension popup
3. Enter API key (starts with `sk-ant-`)
4. Choose model (Sonnet recommended for balance)

#### OpenAI (GPT-4/GPT-3.5)
1. Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Select OpenAI in extension popup
3. Enter API key (starts with `sk-`)
4. Choose model (GPT-3.5 Turbo for speed, GPT-4 for quality)
5. (Optional) Enter organization ID

#### Google Gemini
1. Get API key from [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Select Gemini in extension popup
3. Enter API key (starts with `AIza`)
4. Gemini Pro is currently free!

#### Ollama (Local - No API Key!)
1. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Pull a model: `ollama pull codellama`
3. Select Ollama in extension popup
4. Set endpoint (default: `http://localhost:11434`)
5. Choose your installed model
6. **No API key or internet required!**

#### Azure OpenAI
1. Get credentials from Azure Portal
2. Select Azure in extension popup
3. Enter:
   - API Key (32-character hex)
   - Endpoint URL (https://YOUR-RESOURCE.openai.azure.com)
   - Deployment name
   - API version (default: 2023-05-15)

#### Hugging Face
1. Get API token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Select Hugging Face in extension popup
3. Enter token (starts with `hf_`)
4. Choose model (CodeLlama recommended)
5. Free tier available with rate limits

#### Custom API
1. Select Custom in extension popup
2. Configure:
   - Endpoint URL
   - Headers (JSON format)
   - Request template with `{prompt}` placeholder
   - Response parser path

## 💰 Cost Comparison

| Provider | Pricing | Free Tier | Best For |
|----------|---------|-----------|----------|
| **Ollama** | **Free** (local) | Unlimited | Privacy, offline use |
| **Gemini** | Free tier available | 60 requests/min | Getting started |
| **Hugging Face** | Free tier + paid | Limited free | Open-source models |
| **Claude** | $15-60/M tokens | No | Best quality |
| **OpenAI** | $2-60/M tokens | No | GPT-4 quality |
| **Azure** | Enterprise pricing | No | Corporate users |
| **Cohere** | $0.50-2/M tokens | Trial credits | Budget-conscious |
| **Replicate** | Pay-per-second | No | Occasional use |

## 🎯 Usage

### Basic Workflow
1. **Select Provider**: Click extension icon, choose your AI provider
2. **Configure**: Enter API credentials (skip for Ollama)
3. **Navigate to RPort**: Open your RPort interface
4. **Run Command**: Execute any command
5. **Analyze**: Click "Send to AI" button on output
6. **Insert**: Click "Insert Improved Script" to use the result

### Provider-Specific Tips

#### For Best Code Quality
- **Claude 3 Sonnet**: Best balance of speed and quality
- **GPT-4 Turbo**: Highest quality but slower
- **CodeLlama (via Ollama)**: Best local option

#### For Speed
- **Claude Haiku**: Fastest Claude model
- **GPT-3.5 Turbo**: Fast and affordable
- **Gemini Pro**: Fast with free tier
- **Ollama (local)**: No network latency

#### For Privacy
- **Ollama**: Completely local, no data leaves your machine
- **Azure OpenAI**: Enterprise data protection
- **Custom API**: Use your own infrastructure

## 🔒 Security & Privacy

### API Key Storage
- Keys stored in Chrome's encrypted storage
- Never sent anywhere except to chosen provider
- Keys isolated per provider

### Data Handling by Provider
| Provider | Data Retention | Privacy Notes |
|----------|---------------|---------------|
| **Ollama** | **None** (local) | Best privacy - runs on your machine |
| **Azure** | Enterprise policy | Corporate data protection |
| **Claude** | 30 days | SOC 2 compliant |
| **OpenAI** | 30 days | Used for safety monitoring |
| **Gemini** | Per Google policy | Standard Google privacy |
| **Custom** | Your control | Depends on your setup |

## 🧪 Testing Your Setup

### Test Each Provider
1. Open `test/extension-tester.html` in Chrome
2. Select your configured provider
3. Click "Run All Tests"
4. Verify buttons appear and API responds

### Provider-Specific Tests
```bash
# Test Ollama locally
curl http://localhost:11434/api/generate -d '{
  "model": "codellama",
  "prompt": "Write hello world in Python"
}'

# Test OpenAI
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hi"}]}'
```

## 🛠️ Advanced Configuration

### Custom System Prompts
1. Go to Advanced tab
2. Enter custom prompt template
3. Adjust temperature (0=deterministic, 1=creative)
4. Set max tokens (response length)

### Using Custom/Self-Hosted APIs
```json
// Example: LocalAI configuration
{
  "endpoint": "http://localhost:8080/v1/completions",
  "headers": {
    "Content-Type": "application/json"
  },
  "requestTemplate": {
    "model": "ggml-gpt4all",
    "prompt": "{prompt}",
    "max_tokens": 2000
  }
}
```

### Multiple Providers Setup
You can quickly switch between providers:
1. Configure multiple providers
2. Switch via popup dropdown
3. Each provider remembers its settings

## 📊 Performance Comparison

| Provider | Avg Response Time | Quality Score | Cost/1K requests |
|----------|------------------|--------------|------------------|
| Ollama (local) | <1s | 8/10 | $0 |
| Claude Haiku | 1-2s | 8/10 | $0.25 |
| GPT-3.5 Turbo | 1-3s | 7/10 | $2 |
| Gemini Pro | 1-2s | 7/10 | Free |
| Claude Sonnet | 2-4s | 9/10 | $15 |
| GPT-4 Turbo | 3-5s | 10/10 | $30 |

## 🐛 Troubleshooting

### Provider-Specific Issues

#### Ollama Not Connecting
```bash
# Check if Ollama is running
ollama list
# Start Ollama service
ollama serve
# Pull a model if needed
ollama pull codellama
```

#### OpenAI Rate Limits
- Error 429: You've hit rate limits
- Solution: Wait 60 seconds or upgrade tier

#### Gemini API Issues
- Check API key starts with "AIza"
- Verify API is enabled in Google Cloud Console

#### Azure Configuration
- Ensure deployment is complete in Azure Portal
- Check endpoint format: `https://YOUR-NAME.openai.azure.com`
- Verify API version matches deployment

### General Issues
- **No buttons appearing**: Refresh page, check console for errors
- **API errors**: Verify API key and network connection
- **Wrong model responses**: Check model selection and temperature

## 🎁 Free Options

### Completely Free
1. **Ollama** - Run locally, unlimited use
2. **Gemini** - Generous free tier (60 req/min)
3. **Hugging Face** - Limited free tier

### Free Trials/Credits
1. **OpenAI** - $5 trial credit
2. **Cohere** - Trial credits
3. **Anthropic** - No free tier (paid only)

## 📈 Future Enhancements

- [ ] Streaming responses for faster feedback
- [ ] Response caching to save API costs
- [ ] Batch processing for multiple scripts
- [ ] Integration with more providers (Mistral, Groq)
- [ ] Provider fallback/load balancing
- [ ] Usage analytics and cost tracking

## 🤝 Contributing

We welcome contributions! Especially:
- New provider integrations
- Improved error handling
- Better prompt templates
- UI/UX enhancements

## 📄 License

MIT License - Use freely in your projects

## 🔗 Resources

### API Documentation
- [Anthropic API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [OpenAI API](https://platform.openai.com/docs)
- [Gemini API](https://ai.google.dev/tutorials/rest_quickstart)
- [Ollama Docs](https://github.com/jmorganca/ollama/blob/main/docs/api.md)
- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Hugging Face API](https://huggingface.co/docs/api-inference/index)

### Get API Keys
- [Claude](https://console.anthropic.com)
- [OpenAI](https://platform.openai.com/api-keys)
- [Gemini](https://makersuite.google.com/app/apikey)
- [Hugging Face](https://huggingface.co/settings/tokens)
- [Cohere](https://dashboard.cohere.ai/api-keys)
- [Replicate](https://replicate.com/account/api-tokens)

---

## Quick Start Guide

### Option 1: Free & Local (Ollama)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Get CodeLlama
ollama pull codellama

# Configure extension
# 1. Select Ollama in popup
# 2. Done! No API key needed
```

### Option 2: Free Cloud (Gemini)
```bash
# 1. Get free API key from https://makersuite.google.com
# 2. Select Gemini in extension
# 3. Enter API key
# 4. Start using (60 free requests/minute)
```

### Option 3: Premium (Claude/GPT-4)
```bash
# 1. Get API key from provider
# 2. Select provider in extension
# 3. Enter API key
# 4. Choose model
# 5. Get best quality results
```

---

**Support**: Report issues at [GitHub Issues](https://github.com/your-repo/rport-ai-assistant/issues)