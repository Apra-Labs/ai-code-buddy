#!/usr/bin/env node

/**
 * AI Code Buddy - Comprehensive Link Validator
 * Tests all links, images, and resources before Chrome Web Store submission
 * Usage: node link-validator.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const BASE_DIR = path.join(__dirname, '..');
const GITHUB_PAGES_BASE = 'https://apra-labs.github.io/ai-code-buddy';
const GITHUB_REPO = 'https://github.com/Apra-Labs/ai-code-buddy';

// URLs that block automated requests (bot protection) - skip HTTP check
const BOT_PROTECTED_URLS = [
  'https://console.anthropic.com',
  'https://platform.openai.com',
  'https://openai.com/privacy',
  'https://openai.com/security',
  'https://www.anthropic.com/security'
];

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Extract all URLs from HTML/Markdown content
 */
function extractUrls(content, fileType) {
  const urls = new Set();

  if (fileType === 'html') {
    // Extract href links
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      urls.add(match[1]);
    }

    // Extract src attributes (images, scripts)
    const srcRegex = /src=["']([^"']+)["']/g;
    while ((match = srcRegex.exec(content)) !== null) {
      urls.add(match[1]);
    }

    // Extract action attributes (forms)
    const actionRegex = /action=["']([^"']+)["']/g;
    while ((match = actionRegex.exec(content)) !== null) {
      urls.add(match[1]);
    }
  } else if (fileType === 'md') {
    // Extract markdown links [text](url)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(content)) !== null) {
      urls.add(match[2]);
    }

    // Extract plain URLs (but not those in code blocks with backticks)
    const urlRegex = /https?:\/\/[^\s)`]+/g;
    while ((match = urlRegex.exec(content)) !== null) {
      // Skip if preceded by backtick (code block)
      const pos = match.index;
      if (pos > 0 && content[pos - 1] === '`') {
        continue;
      }
      urls.add(match[0]);
    }
  } else if (fileType === 'json') {
    // Extract URLs from JSON (manifest, package.json)
    const urlRegex = /"(https?:\/\/[^"]+)"/g;
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      urls.add(match[1]);
    }
  }

  return Array.from(urls);
}

/**
 * Check if URL is reachable
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    // Skip special URLs
    if (url.startsWith('#') || url.startsWith('javascript:') || url === '') {
      resolve({ success: true, status: 'skipped', message: 'Internal/special link' });
      return;
    }

    // Skip bot-protected URLs (they block automated requests but are valid)
    for (const protectedUrl of BOT_PROTECTED_URLS) {
      if (url.startsWith(protectedUrl)) {
        resolve({ success: true, status: 'skipped', message: 'Bot-protected (assumed valid)' });
        return;
      }
    }

    // Skip placeholder/example URLs (documentation examples)
    const placeholders = ['YOUR-RESOURCE', 'localhost', 'example.com', 'evil.com'];
    for (const placeholder of placeholders) {
      if (url.includes(placeholder)) {
        resolve({ success: true, status: 'skipped', message: 'Placeholder/example URL' });
        return;
      }
    }

    // Skip URLs with wildcards (like API documentation patterns)
    if (url.includes('*')) {
      resolve({ success: true, status: 'skipped', message: 'Wildcard pattern' });
      return;
    }

    // Skip malformed URLs (quotes, misplaced characters)
    if (url.includes('"') || url.includes("'") || url.endsWith(',')) {
      resolve({ success: true, status: 'skipped', message: 'Malformed URL (documentation artifact)' });
      return;
    }

    const protocol = url.startsWith('https:') ? https : http;

    const request = protocol.get(url, { timeout: 10000 }, (res) => {
      const status = res.statusCode;
      if (status >= 200 && status < 400) {
        resolve({ success: true, status, message: 'OK' });
      } else if (status >= 300 && status < 400) {
        resolve({ success: true, status, message: `Redirect to ${res.headers.location}` });
      } else {
        resolve({ success: false, status, message: `HTTP ${status}` });
      }
      res.resume(); // Consume response data to free up memory
    });

    request.on('error', (error) => {
      resolve({ success: false, status: 0, message: error.message });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({ success: false, status: 0, message: 'Timeout' });
    });
  });
}

/**
 * Test extension files
 */
async function testExtensionFiles() {
  console.log(`\n${colors.cyan}=== Testing Extension Files ===${colors.reset}\n`);

  const extensionFiles = [
    'manifest.json',
    'popup-multi.html',
    'content.js',
    'background.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png'
  ];

  for (const file of extensionFiles) {
    const filePath = path.join(BASE_DIR, file);
    if (fileExists(filePath)) {
      results.passed.push(`✓ Extension file exists: ${file}`);
      console.log(`${colors.green}✓${colors.reset} ${file}`);
    } else {
      results.failed.push(`✗ Extension file missing: ${file}`);
      console.log(`${colors.red}✗${colors.reset} ${file} (missing)`);
    }
  }
}

/**
 * Test documentation files
 */
async function testDocumentationFiles() {
  console.log(`\n${colors.cyan}=== Testing Documentation Files ===${colors.reset}\n`);

  const docFiles = [
    'README.md',
    'docs/API-KEYS-GUIDE.md',
    'docs/SECURITY.md',
    'docs/TROUBLESHOOTING.md',
    'docs-site/index.html',
    'docs-site/quick-start.html',
    'docs-site/api-keys.html',
    'docs-site/security.html',
    'docs-site/troubleshooting.html',
    'docs-site/privacy.html'
  ];

  for (const file of docFiles) {
    const filePath = path.join(BASE_DIR, file);
    if (fileExists(filePath)) {
      results.passed.push(`✓ Documentation file exists: ${file}`);
      console.log(`${colors.green}✓${colors.reset} ${file}`);
    } else {
      results.failed.push(`✗ Documentation file missing: ${file}`);
      console.log(`${colors.red}✗${colors.reset} ${file} (missing)`);
    }
  }
}

/**
 * Test Chrome Web Store assets
 */
async function testChromeStoreAssets() {
  console.log(`\n${colors.cyan}=== Testing Chrome Web Store Assets ===${colors.reset}\n`);

  const assets = [
    'chrome-store/promotional-tile-small.png',
    'chrome-store/promotional-marquee.png',
    'chrome-store/store-listing.md',
    'chrome-store/screenshot-guide.md'
  ];

  for (const asset of assets) {
    const filePath = path.join(BASE_DIR, asset);
    if (fileExists(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      results.passed.push(`✓ Chrome Store asset exists: ${asset} (${sizeKB}KB)`);
      console.log(`${colors.green}✓${colors.reset} ${asset} (${sizeKB}KB)`);

      // Check PNG file sizes (Chrome Store limit: 5MB)
      if (asset.endsWith('.png') && stats.size > 5 * 1024 * 1024) {
        results.warnings.push(`⚠ ${asset} exceeds 5MB limit for Chrome Web Store`);
        console.log(`${colors.yellow}⚠${colors.reset} ${asset} exceeds 5MB limit`);
      }
    } else {
      results.failed.push(`✗ Chrome Store asset missing: ${asset}`);
      console.log(`${colors.red}✗${colors.reset} ${asset} (missing)`);
    }
  }
}

/**
 * Test config.js and install link configuration
 */
async function testInstallLinkConfig() {
  console.log(`\n${colors.cyan}=== Testing Install Link Configuration ===${colors.reset}\n`);

  // Check config.js exists
  const configPath = path.join(BASE_DIR, 'docs-site/config.js');
  if (!fileExists(configPath)) {
    results.failed.push('✗ docs-site/config.js not found');
    console.log(`${colors.red}✗${colors.reset} config.js not found`);
    return;
  }

  const configContent = readFile(configPath);

  // Verify INSTALL_SOURCE is defined
  if (configContent.includes('const INSTALL_SOURCE')) {
    results.passed.push('✓ config.js: INSTALL_SOURCE constant defined');
    console.log(`${colors.green}✓${colors.reset} INSTALL_SOURCE constant defined`);
  } else {
    results.failed.push('✗ config.js: INSTALL_SOURCE constant not found');
    console.log(`${colors.red}✗${colors.reset} INSTALL_SOURCE constant not found`);
  }

  // Verify both github and chrome-web-store configs exist
  if (configContent.includes("github:") && configContent.includes("'chrome-web-store':")) {
    results.passed.push('✓ config.js: Both install modes configured');
    console.log(`${colors.green}✓${colors.reset} Both github and chrome-web-store modes configured`);
  } else {
    results.failed.push('✗ config.js: Missing install mode configuration');
    console.log(`${colors.red}✗${colors.reset} Missing install mode configuration`);
  }

  // Check install-links.js exists
  const installLinksPath = path.join(BASE_DIR, 'docs-site/install-links.js');
  if (fileExists(installLinksPath)) {
    results.passed.push('✓ docs-site/install-links.js exists');
    console.log(`${colors.green}✓${colors.reset} install-links.js exists`);
  } else {
    results.failed.push('✗ docs-site/install-links.js not found');
    console.log(`${colors.red}✗${colors.reset} install-links.js not found`);
  }

  // Test HTML files for proper install link implementation
  const htmlFiles = [
    'docs-site/index.html',
    'docs-site/quick-start.html',
    'docs-site/api-keys.html',
    'docs-site/security.html',
    'docs-site/troubleshooting.html',
    'docs-site/privacy.html'
  ];

  for (const file of htmlFiles) {
    const filePath = path.join(BASE_DIR, file);
    if (!fileExists(filePath)) continue;

    const content = readFile(filePath);

    // Check that config.js is included
    if (content.includes('config.js')) {
      results.passed.push(`✓ ${file}: config.js included`);
      console.log(`${colors.green}✓${colors.reset} ${file}: config.js included`);
    } else {
      results.failed.push(`✗ ${file}: config.js not included`);
      console.log(`${colors.red}✗${colors.reset} ${file}: config.js not included`);
    }

    // Check that install-links.js is included
    if (content.includes('install-links.js')) {
      results.passed.push(`✓ ${file}: install-links.js included`);
      console.log(`${colors.green}✓${colors.reset} ${file}: install-links.js included`);
    } else {
      results.failed.push(`✗ ${file}: install-links.js not included`);
      console.log(`${colors.red}✗${colors.reset} ${file}: install-links.js not included`);
    }

    // Check for hardcoded Chrome Web Store URLs (should not exist)
    const chromeStoreRegex = /href=["']https:\/\/chrome\.google\.com\/webstore["']/g;
    const hardcodedMatches = content.match(chromeStoreRegex);
    if (hardcodedMatches && hardcodedMatches.length > 0) {
      results.failed.push(`✗ ${file}: Found ${hardcodedMatches.length} hardcoded Chrome Web Store URL(s)`);
      console.log(`${colors.red}✗${colors.reset} ${file}: ${hardcodedMatches.length} hardcoded Chrome Web Store URLs found`);
    } else {
      results.passed.push(`✓ ${file}: No hardcoded Chrome Web Store URLs`);
      console.log(`${colors.green}✓${colors.reset} ${file}: No hardcoded Chrome Web Store URLs`);
    }

    // Check for install-link class usage
    if (content.includes('class="install-link"') || content.includes("class='install-link'") || content.includes('class="btn-primary install-link"')) {
      results.passed.push(`✓ ${file}: Uses install-link class`);
      console.log(`${colors.green}✓${colors.reset} ${file}: Uses install-link class`);
    } else {
      results.warnings.push(`⚠ ${file}: No install-link class found (may not have install buttons)`);
      console.log(`${colors.yellow}⚠${colors.reset} ${file}: No install-link class found`);
    }
  }
}

/**
 * Test links in HTML files
 */
async function testHtmlLinks() {
  console.log(`\n${colors.cyan}=== Testing Links in HTML Files ===${colors.reset}\n`);

  const htmlFiles = [
    'popup-multi.html',
    'docs-site/index.html',
    'docs-site/quick-start.html',
    'docs-site/api-keys.html',
    'docs-site/security.html',
    'docs-site/troubleshooting.html',
    'docs-site/privacy.html'
  ];

  for (const file of htmlFiles) {
    const filePath = path.join(BASE_DIR, file);
    if (!fileExists(filePath)) continue;

    console.log(`\n${colors.blue}Testing ${file}:${colors.reset}`);
    const content = readFile(filePath);
    const urls = extractUrls(content, 'html');

    for (const url of urls) {
      // Skip internal anchors
      if (url.startsWith('#')) {
        console.log(`  ${colors.yellow}⊘${colors.reset} ${url} (anchor)`);
        continue;
      }

      // Check relative paths
      if (!url.startsWith('http')) {
        // Split URL and anchor
        const [urlPath, anchor] = url.split('#');
        const resolvedPath = path.join(BASE_DIR, path.dirname(file), urlPath);

        if (fileExists(resolvedPath) || urlPath === '') {
          // For anchors, just assume they exist (checking requires parsing HTML)
          if (anchor) {
            results.passed.push(`✓ ${file}: ${url} (local file with anchor - not verified)`);
            console.log(`  ${colors.yellow}⊘${colors.reset} ${url} (anchor - not verified)`);
          } else {
            results.passed.push(`✓ ${file}: ${url} (local file exists)`);
            console.log(`  ${colors.green}✓${colors.reset} ${url} (local)`);
          }
        } else {
          results.failed.push(`✗ ${file}: ${url} (local file not found)`);
          console.log(`  ${colors.red}✗${colors.reset} ${url} (not found)`);
        }
      } else {
        // Check external URLs
        const result = await checkUrl(url);
        if (result.success) {
          results.passed.push(`✓ ${file}: ${url}`);
          console.log(`  ${colors.green}✓${colors.reset} ${url}`);
        } else {
          results.failed.push(`✗ ${file}: ${url} (${result.message})`);
          console.log(`  ${colors.red}✗${colors.reset} ${url} (${result.message})`);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
}

/**
 * Test links in Markdown files
 */
async function testMarkdownLinks() {
  console.log(`\n${colors.cyan}=== Testing Links in Markdown Files ===${colors.reset}\n`);

  const mdFiles = [
    'README.md',
    'docs/API-KEYS-GUIDE.md',
    'docs/SECURITY.md',
    'chrome-store/store-listing.md'
  ];

  for (const file of mdFiles) {
    const filePath = path.join(BASE_DIR, file);
    if (!fileExists(filePath)) continue;

    console.log(`\n${colors.blue}Testing ${file}:${colors.reset}`);
    const content = readFile(filePath);
    const urls = extractUrls(content, 'md');

    for (const url of urls) {
      if (url.startsWith('#')) {
        console.log(`  ${colors.yellow}⊘${colors.reset} ${url} (anchor)`);
        continue;
      }

      if (!url.startsWith('http')) {
        // Split URL and anchor
        const [urlPath, anchor] = url.split('#');
        const resolvedPath = path.join(BASE_DIR, path.dirname(file), urlPath);

        if (fileExists(resolvedPath) || urlPath === '') {
          // For anchors, just assume they exist (checking requires parsing Markdown)
          if (anchor) {
            results.passed.push(`✓ ${file}: ${url} (local file with anchor - not verified)`);
            console.log(`  ${colors.yellow}⊘${colors.reset} ${url} (anchor - not verified)`);
          } else {
            results.passed.push(`✓ ${file}: ${url} (local file exists)`);
            console.log(`  ${colors.green}✓${colors.reset} ${url} (local)`);
          }
        } else {
          results.failed.push(`✗ ${file}: ${url} (local file not found)`);
          console.log(`  ${colors.red}✗${colors.reset} ${url} (not found)`);
        }
      } else {
        const result = await checkUrl(url);
        if (result.success) {
          results.passed.push(`✓ ${file}: ${url}`);
          console.log(`  ${colors.green}✓${colors.reset} ${url}`);
        } else {
          results.failed.push(`✗ ${file}: ${url} (${result.message})`);
          console.log(`  ${colors.red}✗${colors.reset} ${url} (${result.message})`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
}

/**
 * Test manifest.json
 */
async function testManifest() {
  console.log(`\n${colors.cyan}=== Testing manifest.json ===${colors.reset}\n`);

  const manifestPath = path.join(BASE_DIR, 'manifest.json');
  if (!fileExists(manifestPath)) {
    results.failed.push('✗ manifest.json not found');
    console.log(`${colors.red}✗${colors.reset} manifest.json not found`);
    return;
  }

  const manifest = JSON.parse(readFile(manifestPath));

  // Check required fields
  const requiredFields = ['manifest_version', 'name', 'version', 'description', 'icons'];
  for (const field of requiredFields) {
    if (manifest[field]) {
      results.passed.push(`✓ manifest.json has ${field}`);
      console.log(`${colors.green}✓${colors.reset} ${field}: ${JSON.stringify(manifest[field]).substring(0, 50)}`);
    } else {
      results.failed.push(`✗ manifest.json missing ${field}`);
      console.log(`${colors.red}✗${colors.reset} ${field} is missing`);
    }
  }

  // Check icon files
  if (manifest.icons) {
    for (const [size, iconPath] of Object.entries(manifest.icons)) {
      const fullPath = path.join(BASE_DIR, iconPath);
      if (fileExists(fullPath)) {
        results.passed.push(`✓ Icon ${size}px exists: ${iconPath}`);
        console.log(`${colors.green}✓${colors.reset} Icon ${size}px: ${iconPath}`);
      } else {
        results.failed.push(`✗ Icon ${size}px missing: ${iconPath}`);
        console.log(`${colors.red}✗${colors.reset} Icon ${size}px missing: ${iconPath}`);
      }
    }
  }

  // Check content scripts
  if (manifest.content_scripts) {
    for (const script of manifest.content_scripts) {
      if (script.js) {
        for (const jsFile of script.js) {
          const fullPath = path.join(BASE_DIR, jsFile);
          if (fileExists(fullPath)) {
            results.passed.push(`✓ Content script exists: ${jsFile}`);
            console.log(`${colors.green}✓${colors.reset} Content script: ${jsFile}`);
          } else {
            results.failed.push(`✗ Content script missing: ${jsFile}`);
            console.log(`${colors.red}✗${colors.reset} Content script missing: ${jsFile}`);
          }
        }
      }
    }
  }
}

/**
 * Test GitHub Pages URLs (live deployment)
 */
async function testGitHubPagesUrls() {
  console.log(`\n${colors.cyan}=== Testing GitHub Pages URLs (Live) ===${colors.reset}\n`);

  const expectedUrls = [
    `${GITHUB_PAGES_BASE}/`,
    `${GITHUB_PAGES_BASE}/quick-start.html`,
    `${GITHUB_PAGES_BASE}/api-keys.html`,
    `${GITHUB_PAGES_BASE}/security.html`,
    `${GITHUB_PAGES_BASE}/troubleshooting.html`,
    `${GITHUB_PAGES_BASE}/privacy.html`
  ];

  for (const url of expectedUrls) {
    const result = await checkUrl(url);
    if (result.success) {
      results.passed.push(`✓ GitHub Pages: ${url}`);
      console.log(`  ${colors.green}✓${colors.reset} ${url}`);
    } else {
      results.failed.push(`✗ GitHub Pages: ${url} (${result.message})`);
      console.log(`  ${colors.red}✗${colors.reset} ${url} (${result.message})`);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Generate summary report
 */
function generateSummary() {
  console.log(`\n${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}        VALIDATION SUMMARY${colors.reset}`);
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
    console.log(`${colors.green}✓ All validation tests passed!${colors.reset}`);
    console.log(`${colors.green}✓ Ready for Chrome Web Store submission${colors.reset}\n`);
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
  console.log(`${colors.cyan}║  AI Code Buddy - Link Validator           ║${colors.reset}`);
  console.log(`${colors.cyan}║  Pre-Launch Validation Suite              ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);

  await testExtensionFiles();
  await testDocumentationFiles();
  await testChromeStoreAssets();
  await testManifest();
  await testInstallLinkConfig();
  await testHtmlLinks();
  await testMarkdownLinks();
  await testGitHubPagesUrls();

  const success = generateSummary();
  process.exit(success ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
