#!/bin/bash

# AI Code Buddy - Build Script
# Creates a production-ready ZIP file for Chrome Web Store

echo "🔨 Building AI Code Buddy Extension..."
echo ""

# Set version from manifest
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
BUILD_DIR="build"
OUTPUT_FILE="ai-code-buddy-v${VERSION}.zip"

# Clean previous build
rm -rf "$BUILD_DIR"
rm -f ai-code-buddy-*.zip

# Create build directory
mkdir -p "$BUILD_DIR"

echo "📦 Copying extension files..."

# Copy essential extension files
cp manifest.json "$BUILD_DIR/"
cp content.js "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp providers.js "$BUILD_DIR/"
cp popup-multi.html "$BUILD_DIR/"
cp popup-multi.js "$BUILD_DIR/"
cp styles.css "$BUILD_DIR/"

# Copy only PNG icons (not the generator)
mkdir -p "$BUILD_DIR/icons"
cp icons/*.png "$BUILD_DIR/icons/" 2>/dev/null || true
cp icons/icon.svg "$BUILD_DIR/icons/" 2>/dev/null || true

# Copy essential documentation only
mkdir -p "$BUILD_DIR/docs"
cp docs/SECURITY.md "$BUILD_DIR/docs/" 2>/dev/null || true
cp docs/TROUBLESHOOTING.md "$BUILD_DIR/docs/" 2>/dev/null || true
cp README.md "$BUILD_DIR/" 2>/dev/null || true

echo ""
echo "🚫 Excluding from build:"
echo "   - .git, .claude, .gitignore"
echo "   - icons/node_modules, icons/package*.json, icons/generate-icons.js"
echo "   - icons/generate_icons.html (icon generator)"
echo "   - test/ directory"
echo "   - popup.html, popup.js (legacy files)"
echo "   - docs/API-KEYS-GUIDE.md (users can find online)"

# Create ZIP
cd "$BUILD_DIR"
zip -r "../$OUTPUT_FILE" . -q

cd ..

# Get file size
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Output: $OUTPUT_FILE"
echo "📏 Size: $SIZE"
echo ""
echo "🚀 Ready to upload to Chrome Web Store!"
echo ""
echo "To test the build:"
echo "  1. Unzip $OUTPUT_FILE to a test directory"
echo "  2. Load unpacked in chrome://extensions/"
echo "  3. Test all features work correctly"
