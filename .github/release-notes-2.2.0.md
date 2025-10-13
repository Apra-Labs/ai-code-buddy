# AI Code Buddy v2.2.0 - Site-Specific System Prompts

🚀 **Major Feature Release** - Configure different AI behavior for different websites!

## 🎯 What's New

### Site-Specific System Prompts
Configure different AI behavior based on which website you're using. Perfect for tailoring the AI's expertise to your specific use case:

- **Linux terminals** (RPort): "You are a Linux expert. Focus on bash commands."
- **DevOps portals**: "Expert in C#, Java, and Azure. Focus on cloud infrastructure."
- **Code review** (GitHub): "You are a senior code reviewer. Focus on best practices."
- **Log analysis**: "You are a log analysis expert. Focus on identifying errors and patterns."

#### Key Features
✅ **Pattern Matching**
  - Exact domain: `rport.io`
  - Wildcard subdomain: `*.example.com`
  - Wildcard prefix: `*github.com`
  - Automatic specificity-based selection (most specific wins)

✅ **Easy Management**
  - Full UI in Advanced tab
  - Enable/disable with toggle switches
  - Edit existing prompts with one click
  - Delete with confirmation dialog
  - Visual card-based interface

✅ **Automatic Application**
  - Backend automatically applies correct prompt per site
  - Works with all AI providers
  - Seamless integration with existing features

### UI Improvements

**Redesigned Footer**
- Reduced from 4 cramped lines to 2 clean rows
- Larger, more readable fonts (9px base)
- GitHub icon with "Open source" link
- Better spacing and professional appearance
- No additional space required

## 📊 Technical Details

- **45 new comprehensive tests** for site-specific prompts (All passing ✅)
- **184 total tests** (139 existing + 45 new) - Zero regressions ✅
- New `site-prompts.js` module with URL pattern matching
- Updated `content.js` to pass current page URL
- Updated `background.js` to retrieve and apply site-specific prompts
- Updated build scripts to include new module

## 📥 Installation

### From Source
1. Download `ai-code-buddy-v2.2.0.zip` from the assets below
2. Extract the ZIP file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted folder

### Using Git
```bash
git clone https://github.com/Apra-Labs/ai-code-buddy.git
cd ai-code-buddy
git checkout v2.2.0
# Load the directory as unpacked extension in Chrome
```

## 🎮 How to Use Site-Specific Prompts

1. Click the extension icon
2. Go to **Advanced** tab
3. Find **"Site-Specific System Prompts"** section
4. Click **"+ Add Site-Specific Prompt"**
5. Enter:
   - **Pattern**: `*.rport.io` (or your domain)
   - **Name**: `RPort Terminal` (optional)
   - **Prompt**: Your custom AI behavior
6. Click **Save**

The AI will now use your custom prompt when visiting matching sites!

## 📚 Documentation

- **[Full Documentation](https://apra-labs.github.io/ai-code-buddy/)**
- **[CHANGELOG](https://github.com/Apra-Labs/ai-code-buddy/blob/main/CHANGELOG.md)** - Complete version history
- **[Security Policy](https://github.com/Apra-Labs/ai-code-buddy/blob/main/docs/SECURITY.md)**
- **[Troubleshooting Guide](https://github.com/Apra-Labs/ai-code-buddy/blob/main/docs/TROUBLESHOOTING.md)**

## 🔒 Privacy & Security

- **Keys stored locally** - Never sent to Apra Labs servers
- **Open source** - Full transparency
- **GDPR/CCPA compliant**
- **No telemetry or tracking**

## 📜 License

- **Source Code**: MIT License
- **Documentation**: CC BY 4.0

## 🙏 Credits

Developed by **Akhil Kumar** @ **Apra Labs**

---

**Previous Versions:**
- [v2.1.3](https://github.com/Apra-Labs/ai-code-buddy/releases/tag/v2.1.3) - Fixed "Improve Selected Text" feature
- [v2.1.2](https://github.com/Apra-Labs/ai-code-buddy/releases/tag/v2.1.2) - Fixed "Clear All Settings" modal
- [v2.0.0](https://github.com/Apra-Labs/ai-code-buddy/releases/tag/v2.0.0) - Initial multi-provider release
