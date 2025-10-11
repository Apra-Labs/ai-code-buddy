# RPort AI Assistant - Quick Start Guide

**by [Apra Labs](https://www.apralabs.com)**

Get up and running in **5 minutes**! 🚀

---

## Step 1: Install the Extension (1 minute)

1. Download or clone this repository
2. Open Chrome and go to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right corner)
4. Click **"Load unpacked"**
5. Select the `claude-rporthelper` folder

✅ You should see "RPort AI Assistant" appear in your extensions list!

---

## Step 2: Choose Your AI Provider (1 minute)

Pick one based on your needs:

| If you want... | Choose... | Cost |
|----------------|-----------|------|
| **Best code quality** | Claude | $20/month API |
| **General purpose** | OpenAI | $20/month API |
| **FREE option** | Gemini | FREE tier |
| **100% privacy** | Ollama | FREE (runs locally) |

**Don't have any?** Start with Gemini (it's free!) or Ollama (completely private).

---

## Step 3: Get Your API Key (2 minutes)

### For Gemini (FREE - Recommended for testing):
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### For Claude:
1. Go to: https://console.anthropic.com/
2. Click "API Keys" → "Create Key"
3. Copy the key (starts with `sk-ant-...`)

### For OpenAI:
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)

### For Ollama (no key needed!):
1. Install: https://ollama.ai/
2. Run: `ollama pull codellama`
3. Your endpoint: `http://localhost:11434`

**More providers:** See [docs/API-KEYS-GUIDE.md](docs/API-KEYS-GUIDE.md)

---

## Step 4: Configure the Extension (1 minute)

1. **Click** the extension icon in Chrome toolbar
2. **Select** your AI provider from the grid
3. **Enter** your API key (or endpoint for Ollama)
4. **Click** "Save Configuration"
5. **Click** "Test Connection" to verify

✅ Status should show "Connected" in green!

---

## Step 5: Use It! (30 seconds)

1. **Open RPort** in your browser
2. **Run any command** in RPort
3. **Look for** the purple "Send to AI" button near the output
4. **Click it** - AI will analyze and provide an improved script
5. **Click** green "Insert Improved Script" button
6. **Run** the improved script!

If the script fails, click "Send to AI" again - **the AI learns from previous attempts**!

---

## 🎉 You're Done!

That's it! You're now saving time with AI-assisted RPort scripting.

---

## Common First-Time Issues

### "I don't see any buttons"
- Make sure you're on an RPort page
- Refresh the page (F5)
- Check browser console (F12) for errors
- Try setting custom selectors in Settings tab

### "CORS error"
- For Claude: Headers are automatically included
- For custom providers: Check their CORS policy
- Try Ollama instead (no CORS issues)

### "Connection test failed"
- Double-check your API key
- Make sure you copied the entire key
- Check provider status page
- Try a different provider

### "Buttons keep repeating"
- This was fixed in v2.0.0
- Go to `chrome://extensions/` and click reload on the extension
- Refresh your RPort page

---

## Pro Tips 💡

### Conversational Context
The AI remembers your last 5 attempts! If a script fails:
1. Click "Send to AI" on the error
2. AI will see what you tried before
3. AI won't repeat the same mistake
4. You get a better solution!

### Privacy Mode
Want **complete privacy**? Use Ollama:
- ✅ Runs 100% on your computer
- ✅ No API key needed
- ✅ No network requests
- ✅ FREE forever

```bash
# Install Ollama
brew install ollama  # Mac
# or download from ollama.ai

# Pull a model
ollama pull codellama

# Configure extension
Endpoint: http://localhost:11434
Model: codellama
```

### Custom Selectors
If RPort uses non-standard HTML:
1. Open extension popup
2. Go to **Settings** tab
3. Find "Custom Selectors"
4. Enter CSS selectors for output/input areas
5. Save and refresh page

### Multiple Providers
You can switch providers anytime:
1. Click extension icon
2. Select different provider
3. Enter that provider's API key
4. Save

Settings are remembered per-provider!

---

## Next Steps

### Learn More
- **Full docs**: [README.md](README.md)
- **All providers**: [docs/API-KEYS-GUIDE.md](docs/API-KEYS-GUIDE.md)
- **Security details**: [docs/SECURITY.md](docs/SECURITY.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

### Get Help
- **Issues**: GitHub Issues (link in README)
- **Security concerns**: See docs/SECURITY.md
- **Questions**: Check troubleshooting guide first

### Contribute
Found a bug? Have an idea? Contributions welcome!

---

## Feature Highlights

### What Makes This Extension Special?

✨ **Multi-Provider Support**
- Not locked into one AI
- Switch anytime
- Use the best tool for the job

🧠 **Learns From Errors**
- Remembers previous attempts
- Won't repeat mistakes
- Gets smarter with each try

🔒 **Privacy First**
- Keys stored locally only
- No backend to hack
- Ollama = 100% private
- Fully open source

⚡ **Zero Copy-Paste**
- Click → Improve → Insert
- Never leave RPort
- Save hours per week

---

## Success Stories

### Before This Extension:
1. Write script in VSCode
2. Copy to RPort
3. Run → Error
4. Copy error
5. Paste in VSCode
6. Ask AI for fix
7. Copy improved script
8. Paste in RPort
9. Run → Maybe works?
10. **Repeat 5-10 times** 😫

### With This Extension:
1. Run script in RPort
2. Click "Send to AI"
3. Click "Insert"
4. Run → Works! ✅
5. **Done in 30 seconds** 🎉

---

## Quick Reference

### Extension Popup Tabs

**Setup Tab:**
- Select AI provider
- Enter API key
- Test connection

**Settings Tab:**
- Auto-improve on failure
- Custom CSS selectors
- Quick actions

**Advanced Tab:**
- Custom prompts
- Token limits
- Temperature
- Import/export config

### Keyboard Shortcuts (Future)
*Coming in v2.1:*
- `Ctrl+Shift+A` - Send to AI
- `Ctrl+Shift+I` - Insert script
- `Ctrl+Shift+E` - Open extension

---

## Troubleshooting Checklist

If something's not working:

- [ ] Extension is enabled in `chrome://extensions/`
- [ ] Provider is selected in popup
- [ ] API key is entered and saved
- [ ] Connection test passes
- [ ] You're on an RPort page
- [ ] Page has been refreshed
- [ ] Browser console shows no errors
- [ ] Extension has been reloaded

**Still stuck?** See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed help.

---

## Version Info

**Current Version:** 2.0.0
**Release Date:** October 2024
**Supports:** Chrome 88+, Edge 88+, Brave

**Changelog:**
- ✅ Multi-provider support
- ✅ Conversational context
- ✅ Fixed infinite button bug
- ✅ Fixed script insertion issues
- ✅ Added Ollama support
- ✅ Comprehensive documentation

---

**Ready to save time?** Load the extension and start using it now! 🚀

**Questions?** Check the [full documentation](README.md) or [troubleshooting guide](docs/TROUBLESHOOTING.md).

**Privacy concerned?** Read our [security policy](docs/SECURITY.md) - your keys never leave your browser!
