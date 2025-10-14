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

# Get current git commit info
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "📝 Updating VERSION.json with git commit: $GIT_COMMIT_SHORT"

# Copy and update VERSION.json with current git commit
if [ -f VERSION.json ]; then
  # Update VERSION.json with current git commit before copying
  cat VERSION.json | \
    sed "s/\"git_commit\": \"[^\"]*\"/\"git_commit\": \"$GIT_COMMIT\"/" | \
    sed "s/\"git_commit_short\": \"[^\"]*\"/\"git_commit_short\": \"$GIT_COMMIT_SHORT\"/" | \
    sed "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" \
    > "$BUILD_DIR/VERSION.json"
else
  echo "⚠️  Warning: VERSION.json not found, skipping"
fi

# Copy essential extension files
cp manifest.json "$BUILD_DIR/"
cp content.js "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp providers.js "$BUILD_DIR/"
cp site-prompts.js "$BUILD_DIR/"
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

echo ""
echo "✅ Build directory created: $BUILD_DIR/"
echo ""

# Detect if running in CI/CD
IS_CI="${CI:-false}"
if [ "$GITHUB_ACTIONS" = "true" ]; then
  IS_CI="true"
fi

# Try to create ZIP (optional for local, required for CI/CD)
if command -v zip &> /dev/null; then
  echo "📦 Creating ZIP file for release..."
  cd "$BUILD_DIR"
  zip -r "../$OUTPUT_FILE" . -q
  ZIP_EXIT_CODE=$?
  cd ..

  if [ -f "$OUTPUT_FILE" ] && [ $ZIP_EXIT_CODE -eq 0 ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ ZIP created: $OUTPUT_FILE ($SIZE)"
    echo ""
    echo "🚀 Ready to upload to Chrome Web Store!"
  else
    echo "❌ ERROR: ZIP creation failed!"
    if [ "$IS_CI" = "true" ]; then
      echo "   CI/CD build requires ZIP file - failing build"
      exit 1
    else
      echo "   (Continuing anyway for local development)"
    fi
  fi
else
  echo "ℹ️  ZIP command not found - skipping ZIP creation"
  if [ "$IS_CI" = "true" ]; then
    echo "❌ ERROR: ZIP command required in CI/CD environment"
    exit 1
  else
    echo "   (This is normal for local development)"
  fi
fi

echo ""
echo "📂 For local development:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the '$BUILD_DIR/' folder"
echo ""
echo "📦 For Chrome Web Store:"
echo "   - Upload $OUTPUT_FILE (created in CI/CD)"
