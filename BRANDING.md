# Apra Labs Branding Guide

This document outlines the Apra Labs branding applied to the RPort AI Assistant extension.

## Brand Colors

### Primary Brand Color
- **Apra Green**: `#94BA33`
- **Apra Green Dark**: `#6d8c26` (used for gradients)
- **RGB**: `rgb(148, 186, 51)`

### Usage
The Apra Labs green is used throughout the extension:
- Header backgrounds
- Primary buttons
- Active states
- Gradients
- Links and accents
- Provider selection highlights

### Color Contrast
The green color has been chosen from the official Apra Labs website (www.apralabs.com) and provides:
- ✅ Good contrast against white backgrounds
- ✅ Professional technology-focused appearance
- ✅ Distinctive brand identity
- ✅ Accessibility compliance for text

## Branded Elements

### 1. Extension Popup ([popup-multi.html](popup-multi.html))
- **Header background**: Linear gradient from `#94BA33` to `#6d8c26`
- **Header text**: "by Apra Labs • Multi-Provider AI Integration"
- **Primary buttons**: Apra green gradient
- **Active tab color**: `#94BA33`
- **Provider selection**: Green border and background tint when selected
- **Footer**: "Powered by Apra Labs" with link to apralabs.com
- **All link colors**: `#94BA33`

### 2. Content Styles ([styles.css](styles.css))
- **"Send to AI" buttons**: Apra green gradient background
- **Button hover effects**: Apra green glow
- **Loading states**: Lighter Apra green tint
- **Modal copy buttons**: Apra green gradient

### 3. Extension Manifest ([manifest.json](manifest.json))
- **Name**: "RPort AI Assistant by Apra Labs"
- **Description**: "...by Apra Labs..."

### 4. Documentation
Updated branding in:
- **README.md**: Header with Apra Labs link, Credits section with company info
- **QUICKSTART.md**: Header attribution
- **SECURITY.md**: Header attribution

### 5. Icons ([icons/generate_icons.html](icons/generate_icons.html))
- Icon generator updated with Apra green gradient
- SVG icon includes robot emoji and "RPort AI" text
- Professional appearance with Apra brand colors

## Typography

Following modern web standards:
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`
- **Headers**: Bold weight (600-700)
- **Body**: Regular weight (400-500)

## About Apra Labs

**Website**: [www.apralabs.com](https://www.apralabs.com)

**Expertise**:
- Cloud computing and serverless technologies
- AI and Machine Learning solutions
- Video processing and embedded technologies
- Mobile and web application development

**Location**: India

**Tagline**: #MakeInIndia

## Brand Consistency

To maintain brand consistency when extending this project:

1. **Use the official Apra green** (`#94BA33`) for all primary interactive elements
2. **Include Apra Labs attribution** in visible areas (popups, documentation)
3. **Link to apralabs.com** where appropriate
4. **Follow the gradient pattern**: Primary green to darker green (135deg angle)
5. **Maintain professional tone** in all user-facing text

## Color Reference

```css
/* Primary Colors */
--apra-green: #94BA33;
--apra-green-dark: #6d8c26;
--apra-green-light: #a8c957;

/* Gradients */
background: linear-gradient(135deg, #94BA33 0%, #6d8c26 100%);

/* Hover Effects */
box-shadow: 0 4px 12px rgba(148, 186, 51, 0.4);

/* Focus States */
border-color: #94BA33;
box-shadow: 0 0 0 3px rgba(148, 186, 51, 0.1);

/* Selected States */
background: #f4f9eb; /* Light tint for selected items */
border-color: #94BA33;
```

## Files Modified

Complete list of files updated with Apra Labs branding:

1. ✅ `manifest.json` - Extension name and description
2. ✅ `popup-multi.html` - Colors, gradients, header, footer
3. ✅ `styles.css` - Button colors, hover states, modal colors
4. ✅ `README.md` - Header attribution and credits section
5. ✅ `QUICKSTART.md` - Header attribution
6. ✅ `docs/SECURITY.md` - Header attribution
7. ✅ `icons/generate_icons.html` - Icon colors and branding

## Next Steps

To generate branded icons:

1. Open `icons/generate_icons.html` in a browser
2. Download the three PNG files (16x16, 48x48, 128x128)
3. Replace the placeholder PNGs in the `icons/` directory
4. Reload the extension in Chrome

## Verification

To verify the branding is correctly applied:

1. Load the extension in Chrome
2. Click the extension icon - should see Apra green header
3. Check footer - should say "Powered by Apra Labs"
4. Hover buttons - should glow with Apra green
5. Select a provider - should highlight with green border
6. All documentation should include Apra Labs attribution

---

**Branding Version**: 1.0
**Last Updated**: 2025-10-11
**Contact**: [www.apralabs.com](https://www.apralabs.com)
