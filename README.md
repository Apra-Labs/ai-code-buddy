# AI Code Buddy - Chrome Extension

**by [Apra Labs](https://www.apralabs.com)**

> *Turn any web terminal into an AI-powered command center*

A Chrome extension that integrates **multiple AI providers** (Claude, OpenAI, Gemini, Ollama, and more) directly into any web-based terminal, command interface, or code editor. Eliminate copy-paste between your terminal and AI tools!

## Features

- **Universal Compatibility**: Works with any web-based terminal, code editor, or command interface
  - RPort, Cloud Shell, GitPod, VS Code Web, CodeSandbox, Replit, and more!
- **Multi-Provider Support**: Choose from 9+ AI providers including Claude, OpenAI, Gemini, Ollama, and more
- **Send to AI**: Analyze command outputs with one click
- **Improved Scripts**: Get AI-powered script improvements instantly
- **Auto-Insert**: Insert improved scripts directly into your terminal
- **Conversational Context**: AI learns from previous attempts and errors
- **Flexible Detection**: Automatically detects terminals using smart pattern matching
- **Custom Selectors**: Configure selectors for any specific web application
- **Privacy First**: API keys stored locally, fully open source, optional local AI with Ollama

## Installation

### Development Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory

### Icon Setup (Optional)

1. Open `icons/generate_icons.html` in Chrome
2. Click each download link to save the PNG icons
3. Replace the placeholder PNG files in the `icons` directory

## Setup

### 1. Choose Your AI Provider

The extension supports multiple providers:

| Provider | Best For | Cost | Privacy |
|----------|----------|------|---------|
| **Claude** | Code quality & safety | $$ | Cloud |
| **OpenAI** | General purpose | $$ | Cloud |
| **Gemini** | Google integration | FREE tier | Cloud |
| **Ollama** | Complete privacy | FREE | 100% Local |
| **Azure** | Enterprise | $$$ | Cloud |
| **Cohere** | Specialized tasks | $$ | Cloud |
| And more... | | | |

### 2. Get Your API Key

See our comprehensive guide: [docs/API-KEYS-GUIDE.md](docs/API-KEYS-GUIDE.md)

Quick links:
- [Anthropic Console](https://console.anthropic.com/) for Claude
- [OpenAI Platform](https://platform.openai.com/api-keys) for OpenAI
- [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini (FREE)
- [Ollama Installation](https://ollama.ai/) for local AI (no key needed)

### 3. Configure the Extension

1. Click the extension icon in Chrome toolbar
2. Select your AI provider from the grid
3. Enter your API key (or endpoint for Ollama/custom)
4. Click "Save Configuration"
5. Click "Test Connection" to verify

## Usage

### Basic Workflow

1. **Navigate to any web terminal** in Chrome (RPort, Cloud Shell, GitPod, etc.)
2. **Run a command** in your terminal
3. **Click "Send to AI"** button that appears near the output
4. AI analyzes the output and provides an improved script
5. **Click "Insert Improved Script"** to insert it into the command input
6. Run the improved script
7. If it fails, click "Send to AI" again - the AI will learn from the previous attempt!

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

Comprehensive guides available:

- **[API Keys Guide](docs/API-KEYS-GUIDE.md)** - How to get API keys for all providers
- **[Security Policy](docs/SECURITY.md)** - Complete security & privacy transparency
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Multi-Provider Guide](docs/README-MULTI-PROVIDER.md)** - Detailed provider information

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
├── icons/                  # Extension icons
├── docs/                   # Comprehensive documentation
│   ├── API-KEYS-GUIDE.md
│   ├── SECURITY.md
│   ├── TROUBLESHOOTING.md
│   └── README-MULTI-PROVIDER.md
└── README.md              # This file
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

1. Generate proper PNG icons from the SVG
2. Update version in `manifest.json`
3. Test with multiple providers
4. Zip all files except `.git` and test directories
5. Upload to Chrome Web Store (optional)

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

- **Issues & Bugs**: [GitHub Issues](https://github.com/your-repo/ai-code-buddy)
- **Security Issues**: See [docs/SECURITY.md](docs/SECURITY.md) for private disclosure
- **Extension Version**: 2.0.0
- **Tested with**: RPort, Google Cloud Shell, GitPod, VS Code Web, CodeSandbox, Replit, and more!

## Contributing

Contributions welcome! Areas for improvement:
- Additional AI provider integrations
- Support for more web-based terminals and IDEs
- UI/UX enhancements
- Documentation improvements

## License

This extension is provided as-is for use with RPort and supported AI services.

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
