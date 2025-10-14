# Testing Guide: Blocked Sites Feature

This guide explains how to test the new blocked sites feature that prevents the extension from running on certain websites.

## What This Feature Does

The extension now has a "Blocked Sites" list that prevents it from injecting the "Send to AI" buttons on specific websites. This is useful for:
- Preventing the extension from interfering with social media sites
- Avoiding unnecessary buttons on Google/search engines
- Reducing clutter on email clients
- Improving performance by not running on sites where it's not needed

## Default Blocked Sites

On fresh install or update, these sites are automatically blocked:
- **Social Media**: facebook.com, linkedin.com, twitter.com, x.com, instagram.com, tiktok.com, snapchat.com
- **Search Engines**: google.com, bing.com, yahoo.com, duckduckgo.com
- **Email**: gmail.com, outlook.com, mail.yahoo.com, mail.google.com
- **Entertainment**: youtube.com, netflix.com, reddit.com, twitch.tv, news.google.com
- **Shopping**: amazon.com, ebay.com

## How to Test

### Step 1: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `c:\akhil\git\ai-code-buddy-2` directory
5. The extension should now be loaded

### Step 2: Verify Default Blocked Sites Are Loaded

1. Click the extension icon in Chrome toolbar
2. Go to the "Settings" tab
3. You should see a "Blocked Sites" textarea at the top with the default list
4. The list should contain sites like `facebook.com`, `google.com`, etc.

### Step 3: Test Blocking on a Blocked Site

1. **Visit Facebook** (https://www.facebook.com)
2. Open Chrome DevTools (F12)
3. Go to the Console tab
4. You should see: `AI Code Buddy: Current site is blocked, extension disabled`
5. **Verify**: No "Send to AI" buttons should appear anywhere on the page

### Step 4: Test on a Non-Blocked Site

1. **Visit any terminal/dev website** (e.g., https://replit.com, or a local dev server)
2. Open Chrome DevTools (F12)
3. Go to the Console tab
4. You should see: `AI Code Buddy: Site not blocked, proceeding with initialization`
5. **Verify**: "Send to AI" buttons should appear on command outputs (if any exist)

### Step 5: Test Adding a Custom Blocked Site

1. Click the extension icon
2. Go to "Settings" tab
3. Add a new site to the blocked list (e.g., `github.com`)
4. Click "Save Blocked Sites"
5. **Visit GitHub** (https://github.com)
6. Reload the page
7. **Verify**: Extension should be blocked (check console for confirmation message)

### Step 6: Test Wildcard Patterns

1. Add wildcard patterns to the blocked list:
   - `*.example.com` (blocks all subdomains of example.com)
   - `*stackoverflow` (blocks any site containing "stackoverflow")
2. Click "Save Blocked Sites"
3. Test on matching sites to verify they're blocked

### Step 7: Test Reset to Defaults

1. Click the extension icon
2. Go to "Settings" tab
3. Modify the blocked sites list (add or remove sites)
4. Click "Reset to Defaults"
5. Confirm the dialog
6. **Verify**: The list should be restored to the original default list

### Step 8: Test Extension on Already Blocked Site

1. Visit a blocked site (e.g., https://www.google.com)
2. **Expected behavior**:
   - No extension UI appears
   - Console shows: "AI Code Buddy: Current site is blocked, extension disabled"
   - No MutationObserver is running
   - No buttons are injected

## Console Messages to Look For

When testing, open Chrome DevTools Console to verify:

**On Blocked Site:**
```
AI Code Buddy initializing...
AI Code Buddy: Current site is blocked, extension disabled
```

**On Non-Blocked Site:**
```
AI Code Buddy initializing...
AI Code Buddy: Site not blocked, proceeding with initialization
✓ Custom selectors loaded (if configured)
[Button Injection] Found X output elements
```

## Pattern Matching Examples

The feature supports these pattern types:

| Pattern | Matches | Doesn't Match |
|---------|---------|---------------|
| `facebook.com` | facebook.com, www.facebook.com, m.facebook.com | myfacebook.com |
| `*.facebook.com` | www.facebook.com, m.facebook.com | facebook.com (exact) |
| `*facebook` | facebook.com, www.facebook.com, myfacebook.org | |
| `google.com` | google.com, mail.google.com, www.google.com | google.co.uk |

## Troubleshooting

### Extension still showing on blocked site?
- Make sure you **reloaded the page** after saving blocked sites
- Check DevTools console for initialization messages
- Verify the site pattern is correct in the Settings tab

### Extension not showing on any site?
- Check if you accidentally blocked all sites with a wildcard like `*`
- Click "Reset to Defaults" to restore the original list
- Check console for errors

### Changes not persisting?
- Make sure you clicked "Save Blocked Sites" button
- Check if Chrome sync storage is working: `chrome://extensions/` > Extension details > "Storage" section

## Performance Testing

The blocking logic runs **very early** in the content script initialization:
- Checks blocked sites list from storage (fast)
- Does hostname matching (fast string operations)
- Exits immediately if blocked (no DOM manipulation, no observers)

To verify performance:
1. Open Chrome Performance tab
2. Start recording
3. Visit a blocked site
4. Stop recording
5. Verify that content script exits quickly with minimal CPU usage

## Edge Cases to Test

1. **Subdomain handling**: Test `mail.google.com` when `google.com` is blocked
2. **Port numbers**: Test `localhost:3000` vs `localhost:8080`
3. **HTTP vs HTTPS**: Both should be blocked if domain matches
4. **Case sensitivity**: `Facebook.com` vs `facebook.com` (should both work)
5. **Empty lines in blocked list**: Should be ignored
6. **Whitespace in patterns**: Should be trimmed automatically

## Success Criteria

✅ Extension loads default blocked sites on installation
✅ Blocked sites show console message and no UI
✅ Non-blocked sites work normally
✅ Custom sites can be added to block list
✅ Wildcard patterns work correctly
✅ Reset to defaults button works
✅ Changes persist after browser restart
✅ Performance impact is minimal on blocked sites

## Next Steps

After testing, if everything works:
1. Run any existing extension tests: `npm test` (if available)
2. Test the extension on various websites
3. Commit the changes
4. Create a pull request with testing results

## Reporting Issues

If you find bugs during testing:
1. Note the exact site URL where the issue occurred
2. Copy the console messages
3. Note what you expected vs what happened
4. Check the extension's background page console as well: `chrome://extensions/` > Extension details > "Inspect views: background page"
