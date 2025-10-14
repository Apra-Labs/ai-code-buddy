# AI Code Buddy - Chrome Extension

<div align="center">

**by [Apra Labs](https://www.apralabs.com)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Documentation: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-green.svg)](docs/LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/Apra-Labs/ai-code-buddy)](https://github.com/Apra-Labs/ai-code-buddy/releases)
[![Build Status](https://github.com/Apra-Labs/ai-code-buddy/workflows/Build%20and%20Release/badge.svg)](https://github.com/Apra-Labs/ai-code-buddy/actions)

### 📚 [**Visit Full Documentation Site →**](https://apra-labs.github.io/ai-code-buddy/)

*Complete guides, tutorials, API keys setup, and more*

---

</div>

> *Turn any web terminal into an AI-powered command center*

A Chrome extension that integrates **multiple AI providers** (Claude, OpenAI, Gemini, Ollama, and more) directly into any web-based terminal, command interface, or code editor. Eliminate copy-paste between your terminal and AI tools!

**🎉 This project is now open source!** Feel free to use, modify, and contribute.

## Features

- **Universal Compatibility**: Works with any web-based terminal, code editor, or command interface
  - RPort, Cloud Shell, GitPod, VS Code Web, CodeSandbox, Replit, and more!
- **Multi-Provider Support**: Choose from 9+ AI providers including Claude, OpenAI, Gemini, Ollama, and more
- **Selection-Based Hover**: Select any text and get a Medium-style hover button - no buttons cluttering your page!
- **Improved Scripts**: Get AI-powered script improvements instantly
- **Auto-Insert**: Insert improved scripts directly into your terminal
- **Conversational Context**: AI learns from previous attempts and errors
- **Clean UX**: Only shows AI button when you need it - by selecting text
- **Custom Selectors**: Configure selectors for any specific web application
- **Privacy First**: API keys stored locally, fully open source, optional local AI with Ollama

## 🚀 Quick Start (5 Minutes)

### Step 1: Install the Extension (1 minute)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select the extension directory

✅ You should see "AI Code Buddy" appear in your extensions list!

### Step 2: Choose Your AI Provider (1 minute)

Pick one based on your needs:

| If you want... | Choose... | Cost |
|----------------|-----------|------|
| **Best code quality** | Claude | $20/month API |
| **General purpose** | OpenAI | $20/month API |
| **FREE option** | Gemini | FREE tier |
| **100% privacy** | Ollama | FREE (runs locally) |

**Don't have any?** Start with Gemini (it's free!) or Ollama (completely private).

### Step 3: Get Your API Key (2 minutes)

**For Gemini (FREE - Recommended for testing):**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

**For Claude:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Click "API Keys" → "Create Key"
3. Copy the key (starts with `sk-ant-...`)

**For OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)

**For Ollama (no key needed!):**
1. Install from [ollama.ai](https://ollama.ai/)
2. Run: `ollama pull codellama`
3. Your endpoint: `http://localhost:11434`

📚 **More providers:** See [docs/API-KEYS-GUIDE.md](docs/API-KEYS-GUIDE.md)

### Step 4: Configure the Extension (1 minute)

1. **Click** the extension icon in Chrome toolbar
2. **Select** your AI provider from the grid
3. **Enter** your API key (or endpoint for Ollama)
4. **Click** "Save Configuration"
5. **Click** "Test Connection" to verify

✅ Status should show "Connected" in green!

### Step 5: Use It! (30 seconds)

1. **Open** any web terminal (RPort, Cloud Shell, etc.)
2. **Run** any command
3. **Select the text** you want to analyze (terminal output, logs, errors)
4. A **hover button appears** above your selection
5. **Click the hover button** - AI analyzes and provides an improved script
6. **Click "Use Script"** to insert it into the terminal
7. **Run** the improved script!

🎉 **You're done!** If the script fails, select the error and repeat - the AI learns from previous attempts!

## Usage

### Basic Workflow

1. **Navigate to any web terminal** in Chrome (RPort, Cloud Shell, GitPod, etc.)
2. **Run a command** in your terminal
3. **Select the output text** you want to analyze (terminal output, logs, errors, code snippets)
4. A **hover button appears** above your selection (like Medium's annotation feature)
5. **Click the hover button** - AI analyzes the selection and provides insights/improvements
6. Review the AI's response in the modal, edit if needed
7. **Click "Use Script"** to insert it into the command input
8. Run the improved script
9. If it fails, **select the error output** and repeat - the AI learns from previous attempts!

### Compatible With

- **RPort** - Remote system management
- **Google Cloud Shell** - Cloud-based terminals
- **AWS CloudShell** - AWS command line interface
- **GitPod** - Cloud development environments
- **VS Code Web** - Browser-based VS Code
- **CodeSandbox** - Online code editor
- **Replit** - Collaborative coding platform
- **Any web app** with terminal/command input areas!

### Conversational Context

The extension maintains context of your last 5 attempts:
- AI remembers what scripts you tried
- AI sees what errors occurred
- AI won't repeat the same failed approach
- Session-based (resets on page refresh)

### Settings

Access via the extension popup:

**Setup Tab:**
- Select AI provider
- Configure API key/endpoint
- Test connection

**Settings Tab:**
- Auto-improve on failure
- Improve selected text
- Custom CSS selectors
- Clear all settings

**Advanced Tab:**
- Custom system prompts
- Max tokens (100-4000)
- Temperature (0-1)
- Request timeout
- Export/import configuration

## Security & Privacy

🔒 **Your API keys are safe** - [Read full security documentation](docs/SECURITY.md)

**Quick facts:**
- ✅ Stored locally in Chrome's encrypted storage
- ✅ Never sent to us (no backend server exists)
- ✅ Only sent to your chosen AI provider
- ✅ Fully open source (audit the code yourself)
- ✅ No tracking or analytics
- ✅ Works 100% offline with Ollama

**For maximum privacy:** Use Ollama (completely local, no API key, no network)

## Documentation

📚 **[Full Documentation Site](https://apra-labs.github.io/ai-code-buddy/)** - Complete guides, tutorials, and examples

**Key Documentation:**

- **[Site-Specific Prompts](https://apra-labs.github.io/ai-code-buddy/site-specific-prompts.html)** ✨ **NEW!** - Configure different AI behavior per website
- **[Quick Start Guide](https://apra-labs.github.io/ai-code-buddy/quick-start.html)** - Get up and running in 5 minutes
- **[API Keys Guide](https://apra-labs.github.io/ai-code-buddy/api-keys.html)** - How to get API keys for all providers
- **[Security Policy](https://apra-labs.github.io/ai-code-buddy/security.html)** - Complete security & privacy transparency
- **[Troubleshooting](https://apra-labs.github.io/ai-code-buddy/troubleshooting.html)** - Common issues and solutions

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed solutions.

### Quick Fixes

**Buttons Not Appearing:**
- Refresh the page
- Check browser console (F12)
- Configure custom selectors if needed

**CORS Errors:**
- Claude: Headers are automatically included
- Custom providers: Check CORS configuration

**Connection Test Fails:**
- Verify API key is correct
- Check provider status page
- Try Ollama for local testing

**Buttons Repeating Infinitely:**
- Fixed in v2.0.0 with triple protection
- Reload extension if issue persists

## Project Structure

```
ai-code-buddy/
├── manifest.json           # Extension configuration
├── content.js              # UI injection and interaction
├── background.js           # AI provider integration
├── providers.js            # Multi-provider abstraction layer
├── popup-multi.html        # Settings interface
├── popup-multi.js          # Popup functionality
├── styles.css              # Injected styles
├── icons/                  # Extension icons & generator
├── docs/                   # Comprehensive documentation
│   ├── API-KEYS-GUIDE.md   # API keys & provider comparisons
│   ├── SECURITY.md         # Security & privacy details
│   └── TROUBLESHOOTING.md  # Common issues & solutions
└── README.md               # This file
```

## Browser Compatibility

- Chrome/Chromium 88+
- Edge 88+
- Brave (latest)
- Other Chromium-based browsers with Manifest V3 support

## Development

### Testing

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test changes in RPort
5. Check browser console for debug logs

### Building for Production

**Important:** Use the build script to create a production package that excludes development files.

**Windows:**
```bash
build.bat
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

The build script will:
- ✅ Copy only essential extension files
- ✅ Include icons (PNG and SVG only)
- ✅ Include essential docs (SECURITY.md, TROUBLESHOOTING.md)
- ❌ Exclude `icons/node_modules/` (reduces size by ~20MB)
- ❌ Exclude `icons/generate-icons.js`, `icons/package*.json`
- ❌ Exclude `.git`, `.claude`, `.gitignore`
- ❌ Exclude `test/` directory
- ❌ Exclude legacy files (`popup.html`, `popup.js`)
- 📦 Create ZIP file: `ai-code-buddy-vX.X.X.zip`

**Manual Build:**
1. Update version in `manifest.json`
2. Test with multiple providers
3. Run the build script
4. Test the generated ZIP before uploading
5. Upload to Chrome Web Store

**Build Output:**
- Typical size: ~50KB (vs ~20MB with dev files)
- Ready for Chrome Web Store submission

## Version History

**v2.0.0** (Current)
- ✅ Multi-provider support (9+ providers)
- ✅ Conversational context (learns from errors)
- ✅ Ollama local AI support
- ✅ Fixed infinite button bug
- ✅ Fixed script insertion for contenteditable DIVs
- ✅ Comprehensive security documentation
- ✅ Enhanced troubleshooting guide

**v1.0.0**
- Initial release (Claude-only)

## Known Limitations

- Icons are placeholders (generate proper ones using included HTML tool)
- May need custom selectors for heavily customized RPort instances
- Conversation context limited to 5 previous attempts
- Some providers may have CORS restrictions

## Roadmap

- [ ] Streaming responses for faster feedback
- [ ] Provider fallback logic (auto-switch on failure)
- [ ] Script library (save frequently used scripts)
- [ ] Batch operations (improve multiple scripts at once)
- [ ] Team sharing (share improved scripts)
- [ ] Direct RPort API integration
- [ ] Browser action for quick provider switching

## Support

- **Issues & Bugs**: [GitHub Issues](https://github.com/Apra-Labs/ai-code-buddy/issues)
- **Security Issues**: See [docs/SECURITY.md](docs/SECURITY.md) for private disclosure
- **Extension Version**: 2.0.0
- **Tested with**: RPort, Google Cloud Shell, GitPod, VS Code Web, CodeSandbox, Replit, and more!

## License

This project is open source and available under two licenses:

- **Source Code**: [MIT License](LICENSE) - Free to use, modify, and distribute
- **Documentation**: [Creative Commons Attribution 4.0 International](docs/LICENSE) (CC BY 4.0)

You are free to:
- Use this extension for personal or commercial purposes
- Modify and customize it for your needs
- Distribute your modified versions
- Contribute improvements back to the project

See the [LICENSE](LICENSE) file for full details.

## Contributing

We welcome contributions! This is an open source project and we'd love your help.

**Ways to contribute:**
- Report bugs and request features via [GitHub Issues](https://github.com/Apra-Labs/ai-code-buddy/issues)
- Submit pull requests for bug fixes or new features
- Improve documentation
- Add support for new AI providers
- Add support for more web-based terminals and IDEs
- Share your use cases and success stories

**Getting started:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Credits

Built by **[Apra Labs](https://www.apralabs.com)** to streamline terminal and command-line workflows with AI assistance. Works universally with any web-based terminal or code interface.

### About Apra Labs

Apra Labs is a technology venture with proven experience in:
- Cloud computing and serverless technologies
- AI and Machine Learning solutions
- Video processing and embedded technologies
- Mobile and web application development

Learn more at [apralabs.com](https://www.apralabs.com)

---

**🔒 Security Note**: This extension has zero backend infrastructure. Your API keys are stored locally in Chrome's encrypted storage and only sent to your chosen AI provider. [Full details](docs/SECURITY.md)

