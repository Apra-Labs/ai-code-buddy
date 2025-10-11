# 🔧 Troubleshooting Guide

Quick fixes for common issues with the RPort AI Assistant extension.

---

## 🚨 Extension Won't Load

### Error: "Service worker registration failed"
**Cause**: JavaScript error in extension files

**Fix**:
1. Go to `chrome://extensions/`
2. Click "Errors" button on the extension
3. Check which file has the error
4. Reload extension after fixing

### Error: "window is not defined"
**Cause**: Using browser APIs in service worker

**Fixed**: This was resolved by updating `providers.js` to use `self` instead of `window`

---

## 🔑 API Key Issues

### Error: "No Provider Configured"
**Cause**: Provider not selected or settings not saved

**Fix**:
1. Click extension icon
2. Select a provider from the grid
3. Enter your API key
4. Click "Save Configuration"
5. Wait for "Configuration saved" message

### Error: "Invalid API key format"
**Cause**: Wrong API key or copied with extra spaces

**Fix**:
- **Claude**: Must start with `sk-ant-`
- **OpenAI**: Must start with `sk-`
- **Gemini**: Must start with `AIza`
- **HuggingFace**: Must start with `hf_`
- **Ollama**: No API key needed!

**Tips**:
- Copy entire key without spaces
- Don't include quotes
- Generate new key if unsure

---

## 🌐 Connection / CORS Errors

### Error: "CORS requests must set 'anthropic-dangerous-direct-browser-access' header"
**Cause**: Claude API requires special header for browser requests

**Fixed**: Automatically added in v2.0. Just reload the extension.

**Manual Fix** (if still seeing this):
1. Reload extension: `chrome://extensions/` → Click refresh
2. This header is now included automatically

### Error: "Failed to fetch" or "Network error"
**Causes**:
- Invalid API key
- Network connectivity issue
- API endpoint down
- CORS blocking

**Fix**:
1. **Check API Key**:
   - Go to provider's dashboard
   - Verify key is active
   - Generate new key if needed

2. **Check Network**:
   ```bash
   # Test if API is reachable
   curl https://api.anthropic.com/v1/messages
   # Should get a response (even if error)
   ```

3. **Check Provider Status**:
   - [Anthropic Status](https://status.anthropic.com/)
   - [OpenAI Status](https://status.openai.com/)
   - [Google Status](https://status.cloud.google.com/)

4. **Try Different Provider**:
   - Switch to Gemini (has free tier)
   - Or use Ollama (local, no network needed)

### Error: "Connection test failed"
**Fix**:
1. Click "Test Connection" button manually
2. Check console for detailed error (F12)
3. Verify you clicked "Save Configuration" first
4. Try selecting provider again

---

## 🔁 Button Spam / Infinite Loop

### Issue: "Send to AI" button appears repeatedly
**Cause**: MutationObserver triggered by own changes

**Fixed**: Added triple protection:
- WeakSet tracking
- Data attributes
- Mutation filtering

**If still seeing this**:
1. Reload extension
2. Refresh the page
3. Check console for errors

### Issue: Buttons appearing everywhere
**Cause**: Selectors too broad, matching everything

**Fix**:
1. Open extension popup
2. Go to "Settings" tab
3. Add custom selectors:
   - Output: `.specific-output-class`
   - Input: `#specific-input-id`
4. Click "Save Selectors"
5. Refresh page

---

## 🦙 Ollama Issues

### Error: "Cannot connect to Ollama. Is it running?"
**Fix**:
```bash
# Check if Ollama is running
ollama list

# If not, start it
ollama serve

# Pull a model if none installed
ollama pull codellama
```

### Error: "Model not found"
**Fix**:
```bash
# List installed models
ollama list

# Pull the model you want
ollama pull codellama
ollama pull llama2
ollama pull mistral
```

### Ollama running but still not connecting
**Fix**:
1. Check endpoint in extension: `http://localhost:11434`
2. Verify Ollama port:
   ```bash
   # Should show Ollama running on 11434
   netstat -an | findstr 11434
   ```
3. Test manually:
   ```bash
   curl http://localhost:11434/api/tags
   # Should list your models
   ```

---

## 🎯 Provider-Specific Issues

### Claude: Rate Limit Exceeded
**Error**: "Rate limit exceeded, will retry..."

**Fix**:
- Wait 60 seconds
- Upgrade to higher tier
- Switch to different provider temporarily

### OpenAI: Insufficient Credits
**Error**: "You exceeded your current quota"

**Fix**:
1. Go to [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Add payment method
3. Add credits

### Gemini: API Not Enabled
**Error**: "API key not valid or API is not enabled"

**Fix**:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable "Generative Language API"
3. Wait 5 minutes
4. Try again

### Azure: Deployment Not Found
**Error**: "The API deployment for this resource does not exist"

**Fix**:
1. Go to Azure Portal
2. Check your deployment name (case-sensitive)
3. Update in extension settings
4. Verify endpoint URL format:
   ```
   https://YOUR-RESOURCE.openai.azure.com
   ```

---

## 🔴 Popup Issues

### Popup won't open
**Fix**:
1. Right-click extension icon → "Inspect popup"
2. Check console for errors
3. Reload extension
4. Try restarting Chrome

### Settings not saving
**Fix**:
1. Check Chrome storage:
   - Open popup
   - Press F12
   - Console tab
   - Run: `chrome.storage.sync.get(null, console.log)`
2. If empty, try:
   - Clear browser cache
   - Reload extension
   - Re-enter settings

### Provider selection not working
**Fix**:
1. Click provider card
2. Wait for config fields to appear
3. If nothing happens:
   - Open console (F12)
   - Check for JavaScript errors
   - Reload extension

---

## 📝 Content Script Issues

### Buttons not appearing on page
**Fix**:
1. Check page uses standard elements
2. Try custom selectors:
   - Right-click → Inspect
   - Note the class/ID of output area
   - Add in extension settings
3. Refresh page after saving

### "Send to AI" does nothing
**Fix**:
1. Open browser console (F12)
2. Click button
3. Check for errors
4. Common issues:
   - No provider configured
   - API key missing
   - Network blocked

### Script not inserting
**Fix**:
1. Verify button shows "Insert Improved Script"
2. Check if input field is contenteditable or textarea
3. Try clicking in input field first
4. Check console for errors

---

## 🐛 Performance Issues

### Extension slowing down browser
**Fix**:
1. Go to Settings tab
2. Check "Custom Selectors"
3. Use specific selectors instead of generic ones
4. Disable extension on pages you don't need it

### Too many API calls
**Fix**:
1. Disable "Auto-improve" in Settings
2. Only click "Send to AI" when needed
3. Monitor usage in provider dashboard

---

## 🔐 Security Concerns

### Is my API key safe?
**Answer**:
- ✅ Stored in Chrome's encrypted storage
- ✅ Never sent anywhere except to your chosen provider
- ✅ Not accessible to websites
- ⚠️ Visible in extension popup (by design)

### Can others see my scripts?
**Answer**:
- **Cloud providers** (Claude, OpenAI, etc.): Yes, sent to their API
- **Ollama**: NO! Completely local
- See each provider's privacy policy

### How to secure my setup?
**Best Practices**:
1. Use different API keys for different projects
2. Set API rate limits in provider dashboard
3. Rotate keys regularly
4. Use Ollama for sensitive code

---

## 💾 Storage Issues

### Error: "QUOTA_BYTES quota exceeded"
**Cause**: Chrome storage limit reached

**Fix**:
```javascript
// In popup console (F12):
chrome.storage.sync.get(null, (items) => {
  const size = JSON.stringify(items).length;
  console.log(`Using ${size} bytes of ${chrome.storage.sync.QUOTA_BYTES}`);
});

// Clear if needed:
chrome.storage.sync.clear();
```

---

## 🔄 Update Issues

### Extension not updating
**Fix**:
1. Go to `chrome://extensions/`
2. Click "Update" button (top of page)
3. Or manually:
   - Remove extension
   - Re-load from folder

### Lost settings after update
**Fix**:
1. Export settings before updating:
   - Open popup
   - Settings tab
   - Export Configuration
2. After update:
   - Import Configuration

---

## 🧪 Testing Tools

### Test if extension is working
1. Open: `file:///path/to/extension/test/test-extension-load.html`
2. Check all tests pass
3. Click "Check for Buttons"

### Test provider connection
```bash
# Claude
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-dangerous-direct-browser-access: true" \
  -d '{"model":"claude-3-sonnet-20240229","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'

# OpenAI
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"hi"}],"max_tokens":10}'

# Ollama
curl http://localhost:11434/api/generate \
  -d '{"model":"codellama","prompt":"hi","stream":false}'
```

---

## 📞 Getting Help

### Still having issues?

1. **Check Console**:
   - Press F12
   - Look for errors in red
   - Copy full error message

2. **Check Extension Errors**:
   - Go to `chrome://extensions/`
   - Click "Errors" button
   - Copy error details

3. **Gather Info**:
   - Chrome version
   - Extension version
   - Provider being used
   - Exact error message
   - Steps to reproduce

4. **Report Issue**:
   - GitHub Issues: [Your repo]
   - Include all info above
   - Add screenshots if helpful

---

## 💡 Common Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Won't load | Check Errors button, reload extension |
| CORS error | Already fixed in v2.0, reload extension |
| No buttons | Try custom selectors, refresh page |
| Connection fails | Verify API key, try test connection |
| Ollama not working | Run `ollama serve` and `ollama pull codellama` |
| Settings not saving | Check storage, reload extension |
| Button spam | Already fixed, reload extension and page |
| Rate limited | Wait 60s or switch provider |

---

## 🎓 Pro Tips

1. **Use Gemini or Ollama for testing** - they're free!
2. **Set custom selectors** for better performance
3. **Export settings** before major changes
4. **Check console first** when debugging
5. **Test connection** after saving settings

---

**Last Updated**: After fixing CORS and infinite loop issues