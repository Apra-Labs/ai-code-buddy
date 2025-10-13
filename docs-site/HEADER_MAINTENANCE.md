# Header Maintenance Guide

## DRY Principle for Documentation Site Headers

All HTML pages in the `docs-site/` folder share a common header structure. To maintain consistency and follow the DRY (Don't Repeat Yourself) principle, please follow these guidelines when updating headers.

## Header Structure

There are **TWO header variants**:

### 1. Homepage Header (`index.html`)
Uses **hash navigation** for single-page scrolling:
```html
<nav class="nav">
  <a href="#features">Features</a>
  <a href="#quick-start">Quick Start</a>
  <a href="#docs">Docs</a>
  <a href="#feedback">Feedback</a>
  <a href="#" target="_blank" class="btn-primary install-link">Install Extension</a>
</nav>
```

### 2. Documentation Pages Header (all other `.html` files)
Uses **page links** for navigation between pages:
```html
<nav class="nav">
  <a href="index.html">Home</a>
  <a href="quick-start.html">Quick Start</a>
  <a href="api-keys.html">API Keys</a>
  <a href="security.html">Security</a>
  <a href="troubleshooting.html">Troubleshooting</a>
  <a href="#" target="_blank" class="btn-primary install-link">Install Extension</a>
</nav>
```

## How to Update Headers

### When changing the logo or branding:
1. Update the SVG/logo section in **ALL** HTML files
2. Files to update:
   - `index.html`
   - `api-keys.html`
   - `privacy.html`
   - `quick-start.html`
   - `security.html`
   - `site-permissions.html`
   - `site-specific-prompts.html`
   - `troubleshooting.html`

### When adding/removing navigation links:

**For homepage (`index.html`):**
- Add/remove hash links (`#section-name`)
- Ensure corresponding sections exist on the page

**For documentation pages (all others):**
- Add/remove page links (`pagename.html`)
- Update **ALL 7 documentation page** headers consistently
- Remember to update footer navigation as well!

### Checklist for Header Updates:
- [ ] Update logo/branding in all 8 HTML files
- [ ] Update nav links in index.html (hash links)
- [ ] Update nav links in 7 documentation pages (page links)
- [ ] Test all navigation links work correctly
- [ ] Verify mobile responsive menu (if applicable)
- [ ] Check footer navigation matches header navigation

## Why Not Use JavaScript?

We considered using a shared `header.js` to inject headers dynamically, but decided against it because:

1. **SEO**: Search engines prefer HTML content over JavaScript-injected content
2. **Performance**: No JavaScript execution delay for header rendering
3. **Accessibility**: Headers available immediately, no flash of unstyled content
4. **Different Nav Structures**: Homepage needs hash links, docs pages need page links
5. **Simplicity**: Static HTML is easier to debug and maintain

## Future Improvement

If the site grows significantly, consider:
- Using a static site generator (11ty, Hugo, Jekyll)
- Implementing a build step with templates
- Using server-side includes

## File Reference

Header files to keep in sync:
```
docs-site/
├── index.html                    (homepage - hash navigation)
├── api-keys.html                 (docs - page navigation)
├── privacy.html                  (docs - page navigation)
├── quick-start.html              (docs - page navigation)
├── security.html                 (docs - page navigation)
├── site-permissions.html         (docs - page navigation)
├── site-specific-prompts.html    (docs - page navigation)
└── troubleshooting.html          (docs - page navigation)
```

## Quick Find & Replace

When making updates, use these search patterns:

**Logo section:** Search for `<div class="logo">`

**Navigation:** Search for `<nav class="nav">`

**Footer:** Search for `<footer class="footer">`
