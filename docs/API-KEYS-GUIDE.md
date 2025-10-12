# 🔑 API Keys Guide - AI Code Buddy

Quick guide to getting API keys for all supported providers.

---

## 🌟 Claude (Anthropic)

### Get Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Name your key (e.g., "RPort Assistant")
6. Copy the key (starts with `sk-ant-`)

### Pricing
- **Pay as you go** (no subscription)
- Claude 3 Haiku: ~$0.25 per million tokens
- Claude 3 Sonnet: ~$3 per million tokens
- Claude 3 Opus: ~$15 per million tokens
- **No free tier**

### Cost Example
- Typical script improvement: ~500 tokens
- 100 improvements ≈ $0.15 (Sonnet)

### Notes
- ⚠️ Different from claude.ai subscription
- ⚠️ Requires payment method
- ✅ Best code quality

---

## 💬 OpenAI (GPT-4 / GPT-3.5)

### Get Your API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Click your profile → **"View API keys"**
4. Click **"Create new secret key"**
5. Name your key
6. Copy the key (starts with `sk-`)

### Organization ID (Optional)
1. Go to [platform.openai.com/account/organization](https://platform.openai.com/account/organization)
2. Copy your **Organization ID** (starts with `org-`)
3. Paste in extension settings

### Pricing
- **Pay as you go**
- GPT-3.5 Turbo: $0.50 per million tokens
- GPT-4 Turbo: $10 per million tokens
- GPT-4: $30 per million tokens
- **$5 free trial credit** (new accounts)

### Cost Example
- 100 improvements ≈ $0.05 (GPT-3.5)
- 100 improvements ≈ $1.50 (GPT-4)

### Notes
- ✅ $5 free credit for new users
- ⚠️ Requires payment method after trial
- ✅ Industry standard

---

## ✨ Google Gemini

### Get Your API Key

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the key (starts with `AIza`)

### Alternative: Google AI Studio
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API key"**
3. Follow the same steps

### Pricing
- **FREE tier available!**
- Free: 60 requests per minute
- Paid: Starting at $0.50 per million tokens
- No credit card required for free tier

### Cost Example
- **FREE** for typical usage
- Paid plans very affordable

### Notes
- ✅ **Best free option** (cloud-based)
- ✅ No credit card for free tier
- ✅ Good quality
- ⚠️ Rate limited (60/min free)

---

## 🦙 Ollama (Local - NO API KEY!)

### Setup (Windows)

1. **Download Ollama**
   ```
   https://ollama.ai/download
   ```

2. **Install and Run**
   - Run the installer
   - Ollama starts automatically

3. **Pull a Model**
   ```bash
   # Open PowerShell/CMD
   ollama pull codellama

   # Or other models:
   ollama pull llama2
   ollama pull mistral
   ollama pull deepseek-coder
   ```

4. **Verify Running**
   ```bash
   ollama list
   # Should show downloaded models
   ```

5. **Configure Extension**
   - Select "Ollama" in extension
   - Endpoint: `http://localhost:11434` (default)
   - Model: Choose from your pulled models
   - **No API key needed!**

### Setup (Mac/Linux)

```bash
# Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull codellama

# Verify
ollama list
```

### Pricing
- **100% FREE**
- **Unlimited usage**
- **No internet required** (after download)

### Model Sizes
- Llama 2 7B: ~4GB download
- CodeLlama 7B: ~4GB download
- Mistral 7B: ~4GB download
- Mixtral 8x7B: ~26GB download

### System Requirements
- Windows 10/11, macOS 12+, or Linux
- 8GB RAM minimum (16GB recommended)
- 10GB+ free disk space

### Notes
- ✅ **Completely free and private**
- ✅ **No API key or internet needed**
- ✅ **Data never leaves your machine**
- ⚠️ Requires decent hardware
- ⚠️ Slower than cloud APIs

---

## ☁️ Azure OpenAI

### Prerequisites
- Azure account with subscription
- Access to Azure OpenAI Service (requires approval)

### Get Access

1. **Request Access**
   - Go to [aka.ms/oai/access](https://aka.ms/oai/access)
   - Fill out the form
   - Wait for approval (can take days)

2. **Create Resource**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Create "Azure OpenAI" resource
   - Note your **resource name**

3. **Deploy Model**
   - Open your Azure OpenAI resource
   - Go to **"Deployments"**
   - Click **"Create new deployment"**
   - Choose model (e.g., gpt-35-turbo)
   - Note your **deployment name**

4. **Get API Key**
   - Go to **"Keys and Endpoint"**
   - Copy **"KEY 1"** (32-character hex)
   - Copy **"Endpoint"** URL

### Configuration in Extension
```
API Key: [32-character key from Azure]
Endpoint: https://YOUR-RESOURCE.openai.azure.com
Deployment Name: [your deployment name]
API Version: 2023-05-15
```

### Pricing
- Enterprise pricing
- Pay per usage
- Committed pricing available

### Notes
- ⚠️ Requires approval
- ⚠️ Complex setup
- ✅ Enterprise SLA and compliance
- ✅ Corporate data protection

---

## 🧠 Hugging Face

### Get Your API Token

1. Go to [huggingface.co](https://huggingface.co)
2. Sign up or log in
3. Click your profile → **"Settings"**
4. Click **"Access Tokens"**
5. Click **"New token"**
6. Choose **"Read"** permission (or Write if needed)
7. Copy the token (starts with `hf_`)

### Pricing
- **FREE tier available**
- Limited requests per hour (free)
- Paid: Inference Endpoints from $0.60/hour

### Cost Example
- **FREE** for typical usage
- Rate limits apply

### Recommended Models
- **codellama/CodeLlama-34b-Instruct-hf** (best for code)
- bigcode/starcoder
- microsoft/phi-2

### Notes
- ✅ Free tier available
- ✅ Open source models
- ⚠️ May be slow (models loading)
- ⚠️ Rate limits on free tier

---

## 🔮 Cohere

### Get Your API Key

1. Go to [dashboard.cohere.ai](https://dashboard.cohere.ai)
2. Sign up or log in
3. Click **"API Keys"** in sidebar
4. Copy your trial key OR click **"Create Production Key"**
5. Key is ~40 characters

### Pricing
- **Free trial**: Limited requests
- Production: $1-2 per million tokens
- Very affordable

### Notes
- ✅ Trial credits available
- ✅ Good quality
- ✅ Affordable pricing

---

## 🔄 Replicate

### Get Your API Token

1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in
3. Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Copy your token (starts with `r8_`)

### Pricing
- **Pay per second** of compute
- ~$0.0005 per second
- Very affordable for occasional use

### Notes
- ✅ Access to latest open source models
- ✅ No upfront cost
- ⚠️ Pay per use

---

## 💾 GitHub Copilot (Experimental)

### Prerequisites
- GitHub Copilot subscription ($10/month)
- GitHub account with Copilot enabled

### Get Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name: "AI Code Buddy"
4. Select scopes: (basic read access)
5. Click **"Generate token"**
6. Copy token (starts with `ghp_`)

### Pricing
- Requires GitHub Copilot subscription ($10/month)
- Token is free if you have subscription

### Notes
- ⚠️ **Experimental** - may not work reliably
- ⚠️ Requires Copilot subscription
- ⚠️ Not officially supported for this use

---

## 🔧 Custom API

For self-hosted AI services (LocalAI, vLLM, etc.)

### Required Information
1. **Endpoint URL**: Your API endpoint
2. **API Key**: If required by your service
3. **Request Format**: JSON template
4. **Response Format**: How to parse response

### Example: LocalAI
```
Endpoint: http://localhost:8080/v1/completions
Headers: {"Content-Type": "application/json"}
Request Template: {"model": "ggml-gpt4all", "prompt": "{prompt}", "max_tokens": 2000}
```

### Notes
- ✅ Full control
- ✅ Privacy
- ⚠️ Requires technical setup

---

## 🏆 Quick Comparison

| Provider | Free? | Speed | Quality | Privacy | Setup |
|----------|-------|-------|---------|---------|-------|
| **Ollama** | ✅ Yes | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium |
| **Gemini** | ✅ Yes | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Easy |
| **GPT-3.5** | Trial | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Easy |
| **Claude** | ❌ No | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Easy |
| **GPT-4** | Trial | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Easy |
| **HuggingFace** | ✅ Yes | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Easy |
| **Azure** | ❌ No | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Hard |

---

## 💡 Recommendations

### For Getting Started (Free)
1. **Gemini** - Easy cloud option, no credit card
2. **Ollama** - Best for privacy, runs locally

### For Best Quality
1. **Claude Sonnet** - Best balance
2. **GPT-4** - Highest quality

### For Speed
1. **GPT-3.5 Turbo** - Very fast, affordable
2. **Claude Haiku** - Fast Claude option

### For Privacy
1. **Ollama** - Completely local
2. **Azure OpenAI** - Enterprise compliance

### For Budget
1. **Gemini** - Free tier
2. **GPT-3.5** - Very cheap ($0.50/M tokens)

---

## 🆘 Troubleshooting

### "Invalid API Key"
- Check key starts with correct prefix
- No extra spaces when copying
- Key hasn't been revoked

### "Rate Limit Exceeded"
- Wait 60 seconds
- Upgrade to paid tier
- Try different provider

### "Connection Failed" (Ollama)
- Check Ollama is running: `ollama list`
- Verify endpoint: `http://localhost:11434`
- Pull a model: `ollama pull codellama`

### "Model Not Found"
- Azure: Check deployment name
- Ollama: Pull model first
- HuggingFace: Model may be loading (retry)

---

## 🔒 Security Tips

✅ **DO:**
- Keep API keys private
- Rotate keys regularly
- Use environment-specific keys
- Monitor usage

❌ **DON'T:**
- Share keys in code/screenshots
- Commit keys to Git
- Use same key everywhere
- Share keys with others

---

## 📊 Cost Calculator

### Typical Script Improvement
- Input: 200 tokens (original script + output)
- Output: 300 tokens (improved script)
- **Total: 500 tokens per request**

### Monthly Cost (100 improvements)
- Gemini: **FREE**
- GPT-3.5: **$0.05**
- Claude Haiku: **$0.25**
- GPT-4: **$1.50**
- Claude Sonnet: **$3.00**
- Ollama: **FREE**

---

## 🚀 Quick Start Recommendation

### Option 1: Free Cloud (Easiest)
```
1. Get Gemini API key (no credit card)
2. Paste in extension
3. Start using immediately
```

### Option 2: Free Local (Most Private)
```
1. Install Ollama
2. Run: ollama pull codellama
3. Select Ollama in extension
4. No API key needed!
```

### Option 3: Best Quality (Paid)
```
1. Get Claude API key ($15 credit to start)
2. Use Claude Sonnet model
3. Best code improvements
```

---

## 📋 Provider Feature Comparison

### Supported Models by Provider

| Provider | Models Available | Best For |
|----------|-----------------|----------|
| **Claude** | Claude 3 Opus/Sonnet/Haiku, Claude 2.1 | Code analysis & improvements |
| **OpenAI** | GPT-4 Turbo, GPT-4, GPT-3.5 Turbo | General purpose, wide selection |
| **Gemini** | Gemini Pro, Gemini Pro Vision | Google integration, free tier |
| **Azure** | Your deployed models | Enterprise, compliance |
| **Ollama** | Llama 2, CodeLlama, Mistral, Mixtral | Local/offline, privacy |
| **HuggingFace** | CodeLlama, StarCoder, Phi-2 | Open source, experimentation |
| **Cohere** | Command, Command Nightly, Command Light | Cost-effective alternative |
| **Replicate** | Llama 2 70B, CodeLlama 34B, Mixtral | Pay-per-use, latest models |

### Performance Comparison

| Provider | Avg Response Time | Quality Score | Cost/1K requests |
|----------|------------------|--------------|------------------|
| Ollama (local) | <1s | 8/10 | $0 |
| Claude Haiku | 1-2s | 8/10 | $0.25 |
| GPT-3.5 Turbo | 1-3s | 7/10 | $2 |
| Gemini Pro | 1-2s | 7/10 | Free |
| Claude Sonnet | 2-4s | 9/10 | $15 |
| GPT-4 Turbo | 3-5s | 10/10 | $30 |

### Data Privacy by Provider

| Provider | Data Retention | Privacy Notes |
|----------|---------------|---------------|
| **Ollama** | None (local) | ⭐⭐⭐⭐⭐ Best - runs on your machine |
| **Azure** | Enterprise policy | ⭐⭐⭐⭐⭐ Corporate data protection |
| **Claude** | 30 days | ⭐⭐⭐ SOC 2 compliant |
| **OpenAI** | 30 days | ⭐⭐⭐ Used for safety monitoring |
| **Gemini** | Per Google policy | ⭐⭐⭐ Standard Google privacy |
| **Custom** | Your control | ⭐⭐⭐⭐⭐ Depends on your setup |

---

## 🎯 Use Case Recommendations

### For Code Quality
- **Best**: Claude Sonnet or GPT-4 Turbo
- **Fast**: Claude Haiku
- **Local**: CodeLlama via Ollama

### For Speed
- GPT-3.5 Turbo (fastest cloud)
- Ollama (no network latency)
- Claude Haiku (fast + quality)

### For Privacy
- Ollama (100% local, no data leaves machine)
- Azure OpenAI (enterprise compliance)
- Custom API (self-hosted)

### For Cost
- Gemini (free tier, 60 req/min)
- Ollama (completely free, unlimited)
- HuggingFace (free tier available)

---

**Need help?** Check the [main README](../README.md) or [troubleshooting guide](TROUBLESHOOTING.md)