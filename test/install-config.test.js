#!/usr/bin/env node

/**
 * AI Code Buddy - Install Configuration Tests
 * Tests the config.js system for switching between GitHub and Chrome Web Store
 */

const fs = require('fs');
const path = require('path');

// Test results storage
let passed = 0;
let failed = 0;

/**
 * Simple test assertion
 */
function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    failed++;
  }
}

/**
 * Test config.js structure and functions
 */
function testConfigStructure() {
  console.log('\nTesting config.js structure...\n');

  const configPath = path.join(__dirname, '../docs-site/config.js');
  const configContent = fs.readFileSync(configPath, 'utf8');

  // Test 1: INSTALL_SOURCE is defined
  assert(
    configContent.includes('const INSTALL_SOURCE'),
    'INSTALL_SOURCE constant is defined'
  );

  // Test 2: GitHub config exists
  assert(
    configContent.includes('github:') && configContent.includes('installUrl'),
    'GitHub configuration exists with installUrl'
  );

  // Test 3: Chrome Web Store config exists
  assert(
    configContent.includes("'chrome-web-store':") && configContent.includes('installUrl'),
    'Chrome Web Store configuration exists with installUrl'
  );

  // Test 4: Helper functions exist
  assert(
    configContent.includes('function getInstallUrl()'),
    'getInstallUrl() function exists'
  );

  assert(
    configContent.includes('function getInstallText()'),
    'getInstallText() function exists'
  );

  assert(
    configContent.includes('function showReviewSection()'),
    'showReviewSection() function exists'
  );

  // Test 5: GitHub config has correct URL
  assert(
    configContent.includes('https://github.com/Apra-Labs/ai-code-buddy/releases/latest'),
    'GitHub config points to releases/latest'
  );

  // Test 6: Review section is disabled for GitHub mode
  const githubConfigMatch = configContent.match(/github:\s*\{[^}]*showReviewSection:\s*false/s);
  assert(
    githubConfigMatch !== null,
    'GitHub mode disables review section'
  );

  // Test 7: Review section is enabled for Chrome Web Store mode
  const chromeConfigMatch = configContent.match(/'chrome-web-store':\s*\{[^}]*showReviewSection:\s*true/s);
  assert(
    chromeConfigMatch !== null,
    'Chrome Web Store mode enables review section'
  );
}

/**
 * Test install-links.js functionality
 */
function testInstallLinksScript() {
  console.log('\nTesting install-links.js...\n');

  const scriptPath = path.join(__dirname, '../docs-site/install-links.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  // Test 1: Script waits for DOM
  assert(
    scriptContent.includes('DOMContentLoaded'),
    'Script waits for DOM to load'
  );

  // Test 2: Script queries install links
  assert(
    scriptContent.includes("querySelectorAll('.install-link')"),
    'Script finds all install-link elements'
  );

  // Test 3: Script handles review cards
  assert(
    scriptContent.includes('review-card') || scriptContent.includes('review'),
    'Script handles review section visibility'
  );

  // Test 4: Script uses config functions
  assert(
    scriptContent.includes('getInstallUrl()'),
    'Script calls getInstallUrl()'
  );

  assert(
    scriptContent.includes('showReviewSection()'),
    'Script calls showReviewSection()'
  );
}

/**
 * Test HTML files use config correctly
 */
function testHtmlFiles() {
  console.log('\nTesting HTML files use config...\n');

  const htmlFiles = [
    'docs-site/index.html',
    'docs-site/api-keys.html',
    'docs-site/privacy.html',
    'docs-site/quick-start.html',
    'docs-site/security.html',
    'docs-site/troubleshooting.html'
  ];

  htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Test 1: Includes config.js
    assert(
      content.includes('<script src="config.js"></script>'),
      `${file}: Includes config.js`
    );

    // Test 2: Includes install-links.js
    assert(
      content.includes('<script src="install-links.js"></script>'),
      `${file}: Includes install-links.js`
    );

    // Test 3: No hardcoded Chrome Web Store URLs in links
    const hardcodedChromeLinks = content.match(/href=["']https:\/\/chrome\.google\.com\/webstore["']/g);
    assert(
      !hardcodedChromeLinks || hardcodedChromeLinks.length === 0,
      `${file}: No hardcoded Chrome Web Store URLs`
    );

    // Test 4: Uses install-link class
    const hasInstallLink = content.includes('class="install-link"') ||
                          content.includes('class="btn-primary install-link"') ||
                          content.includes("class='install-link'");
    assert(
      hasInstallLink,
      `${file}: Uses install-link class for dynamic URLs`
    );
  });
}

/**
 * Test switching between modes (simulate)
 */
function testModeSwitching() {
  console.log('\nTesting mode switching simulation...\n');

  const configPath = path.join(__dirname, '../docs-site/config.js');
  const configContent = fs.readFileSync(configPath, 'utf8');

  // Test current mode is set
  const currentModeMatch = configContent.match(/const INSTALL_SOURCE\s*=\s*['"]([^'"]+)['"]/);
  assert(
    currentModeMatch !== null,
    'INSTALL_SOURCE is set to a value'
  );

  if (currentModeMatch) {
    const currentMode = currentModeMatch[1];
    console.log(`  Current mode: ${currentMode}`);

    assert(
      currentMode === 'github' || currentMode === 'chrome-web-store',
      `Current mode is valid: ${currentMode}`
    );

    if (currentMode === 'github') {
      console.log('  ℹ Documentation currently points to GitHub Releases');
      console.log('  ℹ To switch to Chrome Web Store, change INSTALL_SOURCE to "chrome-web-store"');
    } else {
      console.log('  ℹ Documentation currently points to Chrome Web Store');
      console.log('  ℹ To switch to GitHub Releases, change INSTALL_SOURCE to "github"');
    }
  }

  // Test that both configurations are properly defined
  const githubUrlMatch = configContent.match(/github:\s*\{[^}]*installUrl:\s*['"]([^'"]+)['"]/s);
  const chromeUrlMatch = configContent.match(/'chrome-web-store':\s*\{[^}]*installUrl:\s*['"]([^'"]+)['"]/s);

  assert(
    githubUrlMatch !== null && githubUrlMatch[1].includes('github.com'),
    'GitHub mode has valid GitHub URL'
  );

  assert(
    chromeUrlMatch !== null && chromeUrlMatch[1].includes('chrome.google.com'),
    'Chrome Web Store mode has Chrome Web Store URL'
  );
}

/**
 * Test README documentation
 */
function testDocumentation() {
  console.log('\nTesting documentation for config switching...\n');

  const readmePath = path.join(__dirname, '../docs-site/README.md');

  // Check if README mentions the configuration
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Optional: Could check if README documents the config system
    const mentionsConfig = readmeContent.toLowerCase().includes('config.js') ||
                          readmeContent.toLowerCase().includes('install_source');

    if (mentionsConfig) {
      console.log('  ℹ README.md documents the config system');
    } else {
      console.log('  ℹ Consider documenting config.js in README.md');
    }
  }
}

/**
 * Main test runner
 */
function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Install Configuration Tests              ║');
  console.log('║  Testing GitHub ↔ Chrome Web Store Switch ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    testConfigStructure();
    testInstallLinksScript();
    testHtmlFiles();
    testModeSwitching();
    testDocumentation();

    console.log('\n' + '='.repeat(46));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(46) + '\n');

    if (failed === 0) {
      console.log('✓ All install configuration tests passed!');
      console.log('✓ Config system ready for mode switching\n');
      process.exit(0);
    } else {
      console.log('✗ Some tests failed. Please review above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
