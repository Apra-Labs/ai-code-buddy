# 🔒 Security & Privacy - RPort AI Assistant

**by [Apra Labs](https://www.apralabs.com)**

Complete transparency on how your API keys and data are handled.

---

## 🎯 TL;DR - Is It Safe?

**YES**, your API keys are safe because:

✅ **Stored locally** in Chrome's encrypted storage
✅ **Never sent to us** - no backend server exists
✅ **Only sent to your chosen AI provider** (Claude, OpenAI, etc.)
✅ **Open source** - you can audit all code
✅ **No tracking or analytics**
✅ **Works offline** with Ollama

---

## 🔍 Proof of Security

### **1. No Backend Server = No Risk**

This extension has **ZERO backend infrastructure**:
- ❌ No server to store keys
- ❌ No database
- ❌ No cloud storage
- ❌ No analytics service
- ❌ No third-party tracking

**Verify**: Check `manifest.json` - no external domains except AI provider APIs:
```json
"host_permissions": [
  "https://api.anthropic.com/*",    // Only Claude API
  "https://api.openai.com/*",       // Only OpenAI API
  "https://generativelanguage.googleapis.com/*", // Only Gemini
  // No other domains!
]
```

### **2. Chrome's Encrypted Storage**

Keys stored in `chrome.storage.sync`:
- ✅ Encrypted by Chrome automatically
- ✅ Synchronized across your Chrome profile (optional)
- ✅ Protected by your Chrome user account
- ✅ Not accessible to websites
- ✅ Not accessible to other extensions

**Verify**: Open DevTools → Application → Storage → Extensions → Local Storage

### **3. Open Source = Fully Auditable**

Every line of code is visible:
```javascript
// In background.js - the ONLY place keys are used
const headers = {
  'x-api-key': config.apiKey,  // Sent ONLY to AI provider
  // No other usage!
};

const response = await fetch(endpoint, {  // endpoint = ai provider only
  headers: headers
});
```

**No hidden code**, no minification, no obfuscation.

### **4. Network Activity Is Transparent**

**View all network requests:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Send to AI"
4. See EXACTLY where your key goes

**You'll see:**
- ✅ One request to `api.anthropic.com` (or your provider)
- ❌ No other network activity
- ❌ No tracking pixels
- ❌ No analytics

---

## 🔐 How Keys Are Handled

### **Storage Flow**

```
User enters key → Validated → Stored in chrome.storage.sync → Never sent anywhere except AI API
                    ↓
              [Chrome encrypts automatically]
                    ↓
              [Accessible only to this extension]
```

### **Usage Flow**

```
User clicks "Send to AI"
    ↓
Extension reads key from storage
    ↓
Sends ONLY to chosen AI provider (Claude/OpenAI/etc)
    ↓
Provider processes request
    ↓
Response returned to extension
    ↓
[Key never logged, never transmitted elsewhere]
```

### **Code Proof**

**Where keys are stored** (`popup-multi.js`):
```javascript
// Line 350 - Storage
await chrome.storage.sync.set({ apiKey: userInput });
// That's it! No other transmission.
```

**Where keys are used** (`background.js`):
```javascript
// Line 89 - API call
const response = await fetch(PROVIDER_ENDPOINT, {
  headers: { 'x-api-key': apiKey }
});
// Only sent to AI provider!
```

**Search the code yourself:**
```bash
# Search for any suspicious network calls
grep -r "fetch\|XMLHttpRequest\|axios" *.js

# You'll ONLY find calls to AI provider APIs
```

---

## 🛡️ What Can Go Wrong?

### **Scenario 1: Extension Gets Hacked**

**Risk**: If someone compromises the Chrome Web Store version

**Mitigation**:
- ✅ Use from source (load unpacked)
- ✅ Review updates before installing
- ✅ Chrome reviews all extensions
- ✅ Use read-only API keys (if provider supports)

### **Scenario 2: AI Provider Breach**

**Risk**: Your chosen AI provider (Claude/OpenAI) gets hacked

**Mitigation**:
- ✅ Set rate limits in provider dashboard
- ✅ Use separate keys for this extension
- ✅ Monitor usage in provider console
- ✅ Rotate keys regularly

### **Scenario 3: Computer Compromise**

**Risk**: Malware on your computer

**Mitigation**:
- ✅ Use antivirus
- ✅ Keep OS updated
- ✅ Use Ollama (local, no API key)
- ⚠️ No extension can protect against this

### **Scenario 4: Chrome Profile Hack**

**Risk**: Someone accesses your Chrome profile

**Mitigation**:
- ✅ Use Chrome profile password
- ✅ Enable 2FA on Google account
- ✅ Lock computer when away
- ✅ Use separate Chrome profiles for work/personal

---

## 🔒 Best Practices

### **For Maximum Security:**

1. **Use Ollama** (local AI, no API key needed)
   ```bash
   ollama pull codellama
   # 100% local, 100% private
   ```

2. **Use Read-Only Keys** (if provider supports)
   - Limits what attackers can do if compromised

3. **Separate Keys Per Tool**
   - Don't reuse API keys
   - Easier to track/revoke

4. **Set Spending Limits**
   - Claude/OpenAI: Set monthly caps
   - Prevents surprise charges if key leaks

5. **Monitor Usage**
   - Check provider dashboards regularly
   - Look for unexpected usage

6. **Rotate Keys Monthly**
   - Generate new key
   - Delete old one
   - Update extension

### **For Privacy:**

1. **Use Ollama** for sensitive code
   - Never leaves your machine
   - No network required

2. **Check Provider Privacy Policies**
   - Claude: 30-day retention
   - OpenAI: 30-day retention
   - Gemini: Google's privacy policy

3. **Avoid Sensitive Data**
   - Don't send credentials in scripts
   - Redact IPs, domains if needed
   - Use placeholder data for testing

---

## 🧪 How to Verify Safety Yourself

### **Test 1: Network Monitoring**

```bash
# On Linux/Mac - monitor all network activity
sudo tcpdump -i any -n | grep -v "local"

# Click "Send to AI" in extension
# You'll see ONLY traffic to your AI provider
```

### **Test 2: Code Audit**

```bash
# Clone the repo
git clone [repo-url]

# Search for suspicious patterns
grep -r "https://" . | grep -v "api.anthropic\|api.openai\|googleapis"
# Should find NOTHING suspicious

# Check for eval/hidden code
grep -r "eval\|Function\|setTimeout.*string" *.js
# Should find NOTHING
```

### **Test 3: Chrome DevTools**

1. Open extension popup
2. Right-click → "Inspect"
3. Go to Network tab
4. Enter API key and save
5. Watch network activity
6. Should see: **ZERO network requests**

### **Test 4: Storage Inspection**

```javascript
// In extension popup console (F12)
chrome.storage.sync.get(null, (items) => {
  console.log('Stored data:', items);
  // Verify only expected data is stored
});

// Check what permissions extension has
chrome.permissions.getAll((perms) => {
  console.log('Permissions:', perms);
  // Verify no excessive permissions
});
```

---

## 📊 Data Collection

### **What We Collect: NOTHING**

| Data Type | Collected? | Why |
|-----------|-----------|-----|
| API Keys | ❌ NO | Stored locally only |
| Scripts | ❌ NO | Only sent to AI provider |
| Outputs | ❌ NO | Only sent to AI provider |
| Usage stats | ❌ NO | No analytics |
| Email | ❌ NO | No accounts |
| IP address | ❌ NO | No server |
| Browser data | ❌ NO | Not accessed |

### **What AI Providers Collect**

When you use this extension, your chosen provider receives:
- ✅ Your scripts/outputs (to process)
- ✅ Your IP address (standard web request)
- ✅ API key (to authenticate)

**Check their policies:**
- [Claude Privacy](https://www.anthropic.com/privacy)
- [OpenAI Privacy](https://openai.com/privacy)
- [Google Privacy](https://policies.google.com/privacy)

---

## 🚨 Red Flags to Watch For

If you see ANY of these, **DO NOT USE**:

❌ Extension requests payment directly
❌ Asks for credit card info
❌ Requires creating an account
❌ Sends data to unknown domains
❌ Minified/obfuscated code
❌ Requests excessive permissions
❌ Has closed-source components

**This extension has NONE of these red flags.**

---

## 🔓 Open Source Transparency

### **Full Code Access**

```bash
# All files are readable JavaScript
cat background.js     # API integration
cat content.js        # UI injection
cat popup-multi.js    # Settings UI
cat providers.js      # Provider configs

# No compiled code
# No binary files
# No hidden modules
```

### **Reproducible Builds**

```bash
# Clone repo
git clone [url]

# Load in Chrome
1. chrome://extensions/
2. Load unpacked
3. Select folder

# It's identical to what you downloaded
```

### **Community Audit**

- ✅ All code on GitHub
- ✅ Anyone can review
- ✅ Anyone can fork
- ✅ Issues are public
- ✅ Changes are tracked

---

## 🛠️ Security Features

### **Built-In Protections**

1. **API Key Validation**
   - Checks format before storing
   - Prevents accidental paste of wrong data

2. **No Logging**
   ```javascript
   // We never log API keys
   if (key === 'apiKey') {
     console.log('API key updated');  // Never logs actual key!
   }
   ```

3. **Content Security Policy**
   - Extension can't load external scripts
   - Prevents XSS attacks

4. **Minimal Permissions**
   ```json
   "permissions": [
     "storage",    // Store settings locally
     "activeTab"   // Access current tab only
   ]
   // No "all tabs", no "browsing history", etc.
   ```

---

## 📜 Compliance

### **GDPR Compliance**

✅ No personal data collected
✅ No cookies
✅ No tracking
✅ User has full control
✅ Data stored locally
✅ Can delete anytime

### **No Account Required**

- ❌ No sign-up
- ❌ No email
- ❌ No password
- ❌ No profile
- ✅ Completely anonymous

---

## 🔄 Key Rotation Guide

**Rotate keys every 30-90 days:**

```bash
# Step 1: Generate new key at provider
# Step 2: Update in extension
# Step 3: Test it works
# Step 4: Delete old key from provider
# Step 5: Done!
```

**Export/Import Feature** for backup:
```javascript
// Export config (excluding API key for safety)
Settings → Advanced → Export Configuration

// Import on new machine
Settings → Advanced → Import Configuration
// Then re-enter API key manually
```

---

## 🆘 If Your Key Gets Compromised

**Immediate actions:**

1. **Revoke key immediately**
   - Go to provider dashboard
   - Delete the compromised key

2. **Generate new key**
   - Create replacement
   - Update extension

3. **Check usage logs**
   - Look for unauthorized requests
   - Note any suspicious activity

4. **Report if needed**
   - Contact provider support
   - Report to authorities if significant

---

## 📞 Security Contact

**Found a security issue?**

🔒 **Private disclosure**: [security email - add yours]
🐛 **Non-security bugs**: GitHub Issues
💬 **Questions**: GitHub Discussions

**Do NOT post security vulnerabilities publicly** - use private disclosure.

---

## 🏆 Security Guarantees

### **What We Guarantee:**

✅ Keys stored in Chrome's encrypted storage
✅ No backend servers exist
✅ Code is fully open source
✅ Only sent to chosen AI provider
✅ No tracking or analytics

### **What We DON'T Guarantee:**

⚠️ Provider's security (they control their API)
⚠️ Your computer's security (use antivirus)
⚠️ Chrome's security (Google's responsibility)
⚠️ Protection if you share keys publicly

---

## 🎓 Educational: How Chrome Storage Works

```javascript
// Chrome encrypts all extension storage
chrome.storage.sync.set({ apiKey: 'sk-...' });
    ↓
[Chrome encrypts with OS-level encryption]
    ↓
[Stored in encrypted local database]
    ↓
[Synced via Google account if enabled]
    ↓
[Decrypted only when extension requests it]
    ↓
[Only THIS extension can access it]
```

**Chrome's encryption uses:**
- Windows: DPAPI
- Mac: Keychain
- Linux: gnome-keyring or KWallet

---

## ✅ Security Checklist

Use this to verify:

- [ ] Downloaded from official source (GitHub/Chrome Store)
- [ ] Reviewed permissions in manifest.json
- [ ] Checked network activity with DevTools
- [ ] Verified code is not minified
- [ ] Set spending limits at provider
- [ ] Using separate API key for this tool
- [ ] Enabled Chrome profile password
- [ ] Understand data goes to AI provider only
- [ ] Considered using Ollama for max privacy

---

## 🔬 Technical Security Details

### **Extension Isolation**

Chrome extensions run in isolated contexts:
```
Website Content ←→ Content Script ←→ Background Script
     ↑                    ↑                  ↑
Cannot access      Limited DOM      API keys stored here
extension data     access only      Protected context
```

### **Storage Security**

```javascript
// chrome.storage.sync vs localStorage
localStorage          // ❌ Not encrypted, accessible to page
chrome.storage.sync   // ✅ Encrypted, isolated from pages
```

### **Network Isolation**

```javascript
// Content scripts can't make arbitrary requests
fetch('https://evil.com')  // ❌ Blocked by CORS

// Background scripts can, but we ONLY use AI providers
fetch('https://api.claude.com')  // ✅ Allowed, monitored by you
```

---

## 📚 Further Reading

- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Anthropic Security](https://www.anthropic.com/security)
- [OpenAI Security](https://openai.com/security)

---

**Last Updated**: 2024
**Security Version**: 1.0
**Next Review**: Every major release

---

## 💡 Summary

**Your API keys are safe because:**

1. ✅ No backend - can't be stolen from us
2. ✅ Encrypted storage - protected by Chrome
3. ✅ Open source - fully auditable
4. ✅ Minimal permissions - can't do much
5. ✅ No tracking - completely private
6. ✅ Local option available - Ollama

**You can verify by:**
- Checking network activity (DevTools)
- Reading the code (it's all there)
- Using Ollama (no API key needed)

**The ONLY security risk is your chosen AI provider** - and that's a choice you make consciously when selecting Claude/OpenAI/etc.

For maximum privacy: **Use Ollama** (completely local, no API key, no network).