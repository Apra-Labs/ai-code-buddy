# Chrome Web Store Screenshot Guide

Chrome Web Store requires **at least 1 screenshot** but recommends **5 screenshots** for best presentation.

## Screenshot Requirements

- **Dimensions:** 1280x800 or 640x400 (recommended: 1280x800)
- **Format:** PNG or JPG
- **File size:** Max 5MB per image
- **Aspect ratio:** 16:10
- **Content:** Should showcase key features

---

## Recommended 5 Screenshots

### Screenshot 1: Extension Popup - Provider Selection
**Filename:** `01-provider-selection.png` (1280x800)

**What to capture:**
1. Open extension popup (click extension icon)
2. Ensure "Select AI Provider" section is visible
3. Show all 4 provider options:
   - Claude (Anthropic)
   - OpenAI
   - Google Gemini
   - Ollama (Local)
4. Have one provider selected to show UI state

**Annotations to add (optional):**
- Arrow pointing to provider dropdown: "Choose your AI provider"
- Arrow pointing to model dropdown: "Select model"

**Instructions:**
```bash
# Use a screenshot tool with full-page capture
# Windows: Win+Shift+S or Snipping Tool
# Mac: Cmd+Shift+4
# Or use browser DevTools device emulator at 1280x800
```

---

### Screenshot 2: Extension Popup - Configuration
**Filename:** `02-configuration.png` (1280x800)

**What to capture:**
1. Extension popup with API key section visible
2. Show model selection dropdown expanded (showing available models)
3. Show temperature and max tokens sliders
4. Show advanced options section
5. Ensure "Save" button is visible

**Annotations to add (optional):**
- "Enter your API key securely"
- "Customize AI behavior"
- "Keys stored locally in Chrome"

**Instructions:**
- Use placeholder text for API key (e.g., "sk-ant-api03-•••••")
- Show meaningful values for sliders (temperature: 0.7, max tokens: 2000)

---

### Screenshot 3: RPort Terminal with Send Button
**Filename:** `03-rport-terminal-button.png` (1280x800)

**What to capture:**
1. Navigate to RPort demo or actual RPort instance
2. Run a command that produces output (e.g., `ls -la` or a script with error)
3. Show the "Send to AI" button appearing in the UI
4. Ensure terminal output is visible
5. Capture the hover state of the button if possible

**Example commands to run:**
```bash
# Command that shows useful output
python3 -m venv myenv && source myenv/bin/activate

# Or a command with a typical error
cat /nonexistent/file.txt

# Or a script to debug
#!/bin/bash
for i in {1..10}; do
  echo "Processing item $i"
done
```

**Annotations to add (optional):**
- Arrow pointing to "Send to AI" button
- "Works with any web terminal"
- "One-click AI analysis"

---

### Screenshot 4: AI Response with Improved Script
**Filename:** `04-ai-response.png` (1280x800)

**What to capture:**
1. The AI response panel/popup after clicking "Send to AI"
2. Show a sample AI response explaining an error or providing improved code
3. Ensure the "Insert to Terminal" or similar action button is visible
4. Show syntax highlighting in the response if present

**Sample AI response to show:**
```
Your script has a few issues:

1. Missing error handling for file operations
2. Inefficient loop - can be optimized

Here's the improved version:

```bash
#!/bin/bash
set -e  # Exit on error

if [ ! -f "input.txt" ]; then
  echo "Error: input.txt not found"
  exit 1
fi

# More efficient with xargs
cat input.txt | xargs -P 4 -I {} process_item {}
```

This version:
✓ Adds error checking
✓ Uses parallel processing (-P 4)
✓ Exits gracefully on errors
```

**Annotations to add (optional):**
- "AI explains the issue"
- "Get improved code instantly"
- "One-click to insert fix"

---

### Screenshot 5: Settings/Advanced Features
**Filename:** `05-advanced-settings.png` (1280x800)

**What to capture:**
1. Extension popup with "Advanced" tab or section open
2. Show options like:
   - System message customization
   - Temperature control
   - Max tokens slider
   - Button position settings
   - Export/Import configuration
3. Show all advanced features visible

**Annotations to add (optional):**
- "Customize AI behavior"
- "Fine-tune responses"
- "Export/import settings"

---

## Alternative Screenshot Ideas

If you want variety or more than 5 screenshots:

### Screenshot 6: Google Cloud Shell Integration
- Show extension working in Cloud Shell
- Demonstrate cross-platform compatibility

### Screenshot 7: Multiple AI Providers Comparison
- Split-screen showing responses from different providers
- Highlight provider flexibility

### Screenshot 8: Security/Privacy Focus
- Extension settings showing local storage
- Privacy policy link
- Security badges

### Screenshot 9: Quick Start Guide
- Extension popup with tooltips/hints
- First-time user experience
- Setup wizard if present

### Screenshot 10: Mobile/Responsive View
- Show extension working on different screen sizes
- Demonstrate responsive design

---

## Screenshot Best Practices

### Composition
- Use clean, uncluttered backgrounds
- Ensure text is readable (minimum 14px font)
- Use consistent window sizes across all screenshots
- Center important elements

### Content
- Use realistic but clean sample data
- Avoid sensitive information (real API keys, server IPs)
- Show successful states (not errors unless demonstrating error handling)
- Include visible UI elements (buttons, dropdowns fully visible)

### Branding
- Use consistent color scheme (Apra Labs green: #94BA33)
- Show extension icon where appropriate
- Maintain professional appearance

### Technical Quality
- Use PNG format (better quality)
- Ensure 1280x800 resolution
- No pixelation or blurriness
- Proper color calibration

---

## Tools for Screenshots

### Native Tools
- **Windows:** Snipping Tool, Snip & Sketch (Win+Shift+S)
- **Mac:** Screenshot app (Cmd+Shift+5)
- **Linux:** GNOME Screenshot, Flameshot

### Browser Tools
- **Chrome DevTools Device Emulator**
  - Open DevTools (F12)
  - Toggle device toolbar (Ctrl+Shift+M)
  - Set dimensions to 1280x800
  - Capture screenshot

### Professional Tools
- **Flameshot** (Linux/Windows) - Annotations, arrows
- **Greenshot** (Windows) - Free, annotations
- **Lightshot** - Cross-platform
- **ShareX** (Windows) - Advanced features
- **Skitch** (Mac) - Annotations

### Online Editors (for annotations)
- **Canva** - Add arrows, text, highlights
- **Photopea** - Free Photoshop alternative
- **GIMP** - Open source image editor

---

## Annotation Guidelines

If adding annotations to screenshots:

### Arrows
- Use green (#94BA33) or high-contrast color
- Point to key features
- Keep minimal (2-3 per screenshot max)

### Text Overlays
- Use readable font (Arial, Helvetica)
- Minimum 18px font size
- High contrast (white text on dark background or vice versa)
- Keep text concise (3-5 words max)

### Highlights
- Use subtle highlights (20-30% opacity)
- Green or yellow for positive features
- Avoid covering important UI elements

### Borders
- Optional: Add subtle border/shadow to make screenshots pop
- 1-2px border in #dee2e6 (light gray)

---

## Quality Checklist

Before submitting screenshots, verify:

- [ ] All screenshots are 1280x800 resolution
- [ ] PNG format (not JPG for better quality)
- [ ] File size under 5MB each
- [ ] No sensitive information visible (real API keys, server IPs, emails)
- [ ] Text is readable (no tiny fonts)
- [ ] UI elements are fully visible (not cut off)
- [ ] Consistent visual style across all screenshots
- [ ] Each screenshot shows a distinct feature
- [ ] Screenshots are numbered/ordered logically
- [ ] Colors are accurate (not washed out or over-saturated)
- [ ] No browser tabs/bookmarks showing sensitive info

---

## Capturing Process

### Step-by-Step for Clean Screenshots

1. **Prepare Environment**
   ```bash
   # Close unnecessary browser tabs
   # Use clean Chrome profile or Incognito
   # Clear terminal history if needed
   ```

2. **Set Up Display**
   - Use 1920x1080 or higher monitor resolution
   - Use Chrome DevTools device emulator at 1280x800
   - Or capture full screen and crop to 1280x800

3. **Prepare Sample Content**
   - Have sample scripts ready
   - Use placeholder API keys (sk-ant-api03-•••••)
   - Prepare realistic but clean terminal outputs

4. **Capture**
   - Use native screenshot tool or browser DevTools
   - Capture consistent window sizes
   - Save as PNG with descriptive filenames

5. **Edit (if needed)**
   - Add annotations sparingly
   - Crop to exact 1280x800
   - Add subtle drop shadows if desired
   - Export as optimized PNG

6. **Review**
   - View at 100% zoom to check clarity
   - Check for any sensitive information
   - Verify all text is readable
   - Compare with other screenshots for consistency

---

## Sample Screenshot Workflow

```bash
# 1. Create screenshots directory
mkdir -p chrome-store/screenshots

# 2. Capture screenshots using tool of choice

# 3. Name files consistently
# 01-provider-selection.png
# 02-configuration.png
# 03-rport-terminal-button.png
# 04-ai-response.png
# 05-advanced-settings.png

# 4. Verify dimensions
file chrome-store/screenshots/*.png | grep "1280 x 800"

# 5. Optimize file size (optional)
# Using optipng (install: apt install optipng)
optipng -o7 chrome-store/screenshots/*.png

# 6. Final check
ls -lh chrome-store/screenshots/
```

---

## Example Screenshot Descriptions

When uploading to Chrome Web Store, you'll need captions:

**Screenshot 1:**
"Choose from Claude, OpenAI, Gemini, or local Ollama - switch providers anytime"

**Screenshot 2:**
"Simple configuration - enter your API key, select model, and customize AI behavior"

**Screenshot 3:**
"One-click 'Send to AI' button appears on any web terminal - works with RPort, Cloud Shell, GitPod"

**Screenshot 4:**
"Get instant AI analysis, error explanations, and improved code with syntax highlighting"

**Screenshot 5:**
"Advanced settings for power users - fine-tune temperature, tokens, and system prompts"

---

## Final Notes

- Chrome Web Store reviews screenshot quality
- Clear, professional screenshots improve approval chances
- Screenshots are often the first thing users see
- Take time to make them look polished
- Test how they look in the store listing preview before submitting

**Estimated time to create all 5 screenshots:** 30-45 minutes

---

**Ready to capture? Follow this guide and you'll have professional Chrome Web Store screenshots in no time!**
