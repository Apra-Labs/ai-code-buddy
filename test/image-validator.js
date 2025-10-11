#!/usr/bin/env node

/**
 * AI Code Buddy - Image Validator
 * Validates all images meet Chrome Web Store requirements
 * Usage: node image-validator.js
 */

const fs = require('fs');
const path = require('path');

// Use sharp from icons directory
const iconsDir = path.join(__dirname, '..', 'icons');
const sharp = require(path.join(iconsDir, 'node_modules', 'sharp'));

// Configuration
const BASE_DIR = path.join(__dirname, '..');

// Chrome Web Store requirements
const REQUIREMENTS = {
  icon: {
    sizes: [16, 48, 128],
    maxSize: 5 * 1024 * 1024, // 5MB
    formats: ['png']
  },
  promotional: {
    smallTile: { width: 440, height: 280 },
    marquee: { width: 1400, height: 560 },
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  screenshot: {
    minWidth: 640,
    minHeight: 400,
    recommendedWidth: 1280,
    recommendedHeight: 800,
    maxSize: 5 * 1024 * 1024,
    formats: ['png', 'jpg', 'jpeg']
  }
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

/**
 * Get image metadata using sharp
 */
async function getImageInfo(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = fs.statSync(imagePath);
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    return null;
  }
}

/**
 * Test extension icons
 */
async function testExtensionIcons() {
  console.log(`\n${colors.cyan}=== Testing Extension Icons ===${colors.reset}\n`);

  for (const size of REQUIREMENTS.icon.sizes) {
    const iconPath = path.join(BASE_DIR, 'icons', `icon${size}.png`);

    if (!fs.existsSync(iconPath)) {
      results.failed.push(`✗ Icon missing: icon${size}.png`);
      console.log(`${colors.red}✗${colors.reset} icon${size}.png (missing)`);
      continue;
    }

    const info = await getImageInfo(iconPath);
    if (!info) {
      results.failed.push(`✗ Cannot read icon: icon${size}.png`);
      console.log(`${colors.red}✗${colors.reset} icon${size}.png (cannot read)`);
      continue;
    }

    console.log(`${colors.blue}icon${size}.png:${colors.reset}`);
    console.log(`  Dimensions: ${info.width}x${info.height}`);
    console.log(`  Format: ${info.format}`);
    console.log(`  Size: ${info.sizeKB}KB`);

    // Check dimensions
    if (info.width === size && info.height === size) {
      results.passed.push(`✓ icon${size}.png: correct dimensions (${size}x${size})`);
      console.log(`  ${colors.green}✓${colors.reset} Dimensions correct`);
    } else {
      results.failed.push(`✗ icon${size}.png: wrong dimensions (${info.width}x${info.height}, expected ${size}x${size})`);
      console.log(`  ${colors.red}✗${colors.reset} Wrong dimensions (expected ${size}x${size})`);
    }

    // Check format
    if (info.format === 'png') {
      results.passed.push(`✓ icon${size}.png: correct format (PNG)`);
      console.log(`  ${colors.green}✓${colors.reset} Format: PNG`);
    } else {
      results.failed.push(`✗ icon${size}.png: wrong format (${info.format}, expected PNG)`);
      console.log(`  ${colors.red}✗${colors.reset} Wrong format (expected PNG)`);
    }

    // Check file size
    if (info.size <= REQUIREMENTS.icon.maxSize) {
      results.passed.push(`✓ icon${size}.png: size OK (${info.sizeKB}KB)`);
      console.log(`  ${colors.green}✓${colors.reset} Size OK (${info.sizeKB}KB < 5MB)`);
    } else {
      results.failed.push(`✗ icon${size}.png: file too large (${info.sizeMB}MB > 5MB)`);
      console.log(`  ${colors.red}✗${colors.reset} File too large (${info.sizeMB}MB)`);
    }

    console.log();
  }
}

/**
 * Test promotional images
 */
async function testPromotionalImages() {
  console.log(`${colors.cyan}=== Testing Promotional Images ===${colors.reset}\n`);

  // Small tile
  const smallTilePath = path.join(BASE_DIR, 'chrome-store', 'promotional-tile-small.png');
  if (fs.existsSync(smallTilePath)) {
    const info = await getImageInfo(smallTilePath);
    console.log(`${colors.blue}promotional-tile-small.png:${colors.reset}`);
    console.log(`  Dimensions: ${info.width}x${info.height}`);
    console.log(`  Format: ${info.format}`);
    console.log(`  Size: ${info.sizeKB}KB`);

    if (info.width === REQUIREMENTS.promotional.smallTile.width &&
        info.height === REQUIREMENTS.promotional.smallTile.height) {
      results.passed.push('✓ Small tile: correct dimensions (440x280)');
      console.log(`  ${colors.green}✓${colors.reset} Dimensions correct (440x280)`);
    } else {
      results.failed.push(`✗ Small tile: wrong dimensions (${info.width}x${info.height}, expected 440x280)`);
      console.log(`  ${colors.red}✗${colors.reset} Wrong dimensions (expected 440x280)`);
    }

    if (info.size <= REQUIREMENTS.promotional.maxSize) {
      results.passed.push(`✓ Small tile: size OK (${info.sizeKB}KB)`);
      console.log(`  ${colors.green}✓${colors.reset} Size OK (${info.sizeKB}KB < 5MB)`);
    } else {
      results.failed.push(`✗ Small tile: file too large (${info.sizeMB}MB > 5MB)`);
      console.log(`  ${colors.red}✗${colors.reset} File too large`);
    }
  } else {
    results.failed.push('✗ promotional-tile-small.png missing');
    console.log(`${colors.red}✗${colors.reset} promotional-tile-small.png (missing)`);
  }

  console.log();

  // Marquee
  const marqueePath = path.join(BASE_DIR, 'chrome-store', 'promotional-marquee.png');
  if (fs.existsSync(marqueePath)) {
    const info = await getImageInfo(marqueePath);
    console.log(`${colors.blue}promotional-marquee.png:${colors.reset}`);
    console.log(`  Dimensions: ${info.width}x${info.height}`);
    console.log(`  Format: ${info.format}`);
    console.log(`  Size: ${info.sizeKB}KB`);

    if (info.width === REQUIREMENTS.promotional.marquee.width &&
        info.height === REQUIREMENTS.promotional.marquee.height) {
      results.passed.push('✓ Marquee: correct dimensions (1400x560)');
      console.log(`  ${colors.green}✓${colors.reset} Dimensions correct (1400x560)`);
    } else {
      results.failed.push(`✗ Marquee: wrong dimensions (${info.width}x${info.height}, expected 1400x560)`);
      console.log(`  ${colors.red}✗${colors.reset} Wrong dimensions (expected 1400x560)`);
    }

    if (info.size <= REQUIREMENTS.promotional.maxSize) {
      results.passed.push(`✓ Marquee: size OK (${info.sizeKB}KB)`);
      console.log(`  ${colors.green}✓${colors.reset} Size OK (${info.sizeKB}KB < 5MB)`);
    } else {
      results.failed.push(`✗ Marquee: file too large (${info.sizeMB}MB > 5MB)`);
      console.log(`  ${colors.red}✗${colors.reset} File too large`);
    }
  } else {
    results.failed.push('✗ promotional-marquee.png missing');
    console.log(`${colors.red}✗${colors.reset} promotional-marquee.png (missing)`);
  }

  console.log();
}

/**
 * Check for screenshots
 */
async function checkScreenshots() {
  console.log(`${colors.cyan}=== Checking Screenshots ===${colors.reset}\n`);

  const screenshotsDir = path.join(BASE_DIR, 'chrome-store', 'screenshots');

  if (!fs.existsSync(screenshotsDir)) {
    results.warnings.push('⚠ Screenshots directory not found (chrome-store/screenshots/)');
    console.log(`${colors.yellow}⚠${colors.reset} Screenshots directory not found`);
    console.log(`  ${colors.yellow}→${colors.reset} Create screenshots following chrome-store/screenshot-guide.md`);
    console.log();
    return;
  }

  const files = fs.readdirSync(screenshotsDir)
    .filter(f => f.match(/\.(png|jpg|jpeg)$/i));

  if (files.length === 0) {
    results.warnings.push('⚠ No screenshots found (at least 1 required, 5 recommended)');
    console.log(`${colors.yellow}⚠${colors.reset} No screenshots found`);
    console.log(`  ${colors.yellow}→${colors.reset} Chrome Web Store requires at least 1 screenshot`);
    console.log(`  ${colors.yellow}→${colors.reset} 5 screenshots recommended for best presentation`);
    console.log();
    return;
  }

  console.log(`Found ${files.length} screenshot(s):\n`);

  for (const file of files) {
    const screenshotPath = path.join(screenshotsDir, file);
    const info = await getImageInfo(screenshotPath);

    console.log(`${colors.blue}${file}:${colors.reset}`);
    console.log(`  Dimensions: ${info.width}x${info.height}`);
    console.log(`  Format: ${info.format.toUpperCase()}`);
    console.log(`  Size: ${info.sizeKB}KB`);

    // Check minimum dimensions
    if (info.width >= REQUIREMENTS.screenshot.minWidth &&
        info.height >= REQUIREMENTS.screenshot.minHeight) {
      results.passed.push(`✓ ${file}: meets minimum dimensions`);
      console.log(`  ${colors.green}✓${colors.reset} Meets minimum size (640x400)`);
    } else {
      results.failed.push(`✗ ${file}: below minimum dimensions (${info.width}x${info.height}, min 640x400)`);
      console.log(`  ${colors.red}✗${colors.reset} Below minimum size (640x400)`);
    }

    // Check recommended dimensions
    if (info.width === REQUIREMENTS.screenshot.recommendedWidth &&
        info.height === REQUIREMENTS.screenshot.recommendedHeight) {
      results.passed.push(`✓ ${file}: recommended dimensions (1280x800)`);
      console.log(`  ${colors.green}✓${colors.reset} Recommended size (1280x800)`);
    } else if (info.width >= REQUIREMENTS.screenshot.minWidth &&
               info.height >= REQUIREMENTS.screenshot.minHeight) {
      results.warnings.push(`⚠ ${file}: not recommended dimensions (1280x800 recommended)`);
      console.log(`  ${colors.yellow}⚠${colors.reset} Recommended: 1280x800`);
    }

    // Check file size
    if (info.size <= REQUIREMENTS.screenshot.maxSize) {
      results.passed.push(`✓ ${file}: size OK`);
      console.log(`  ${colors.green}✓${colors.reset} Size OK (${info.sizeKB}KB < 5MB)`);
    } else {
      results.failed.push(`✗ ${file}: file too large (${info.sizeMB}MB > 5MB)`);
      console.log(`  ${colors.red}✗${colors.reset} File too large (${info.sizeMB}MB)`);
    }

    console.log();
  }

  // Recommendations
  if (files.length < 5) {
    results.warnings.push(`⚠ Only ${files.length} screenshot(s) found (5 recommended)`);
    console.log(`${colors.yellow}⚠ Recommendation:${colors.reset} Chrome Web Store recommends 5 screenshots`);
    console.log(`  ${colors.yellow}→${colors.reset} See chrome-store/screenshot-guide.md for details\n`);
  }
}

/**
 * Generate summary
 */
function generateSummary() {
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}     IMAGE VALIDATION SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}\n`);

  console.log(`${colors.green}Passed:${colors.reset}   ${results.passed.length}`);
  console.log(`${colors.red}Failed:${colors.reset}   ${results.failed.length}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}\n`);

  if (results.failed.length > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.failed.forEach(test => console.log(`  ${test}`));
    console.log();
  }

  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}Warnings:${colors.reset}`);
    results.warnings.forEach(warning => console.log(`  ${warning}`));
    console.log();
  }

  if (results.failed.length === 0) {
    console.log(`${colors.green}✓ All image validation tests passed!${colors.reset}\n`);
    if (results.warnings.length > 0) {
      console.log(`${colors.yellow}Note: There are warnings to address for optimal Chrome Web Store submission${colors.reset}\n`);
    }
    return true;
  } else {
    console.log(`${colors.red}✗ Some tests failed. Please fix the issues above.${colors.reset}\n`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  AI Code Buddy - Image Validator          ║${colors.reset}`);
  console.log(`${colors.cyan}║  Chrome Web Store Image Requirements      ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);

  await testExtensionIcons();
  await testPromotionalImages();
  await checkScreenshots();

  const success = generateSummary();
  process.exit(success ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
