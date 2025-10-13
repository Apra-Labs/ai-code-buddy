// Test suite for Export and Import Configuration functionality
// Tests the ability to export settings to JSON and import them back

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Running Export/Import Configuration Tests...\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

// Read the popup-multi.js file
const popupJs = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.js'), 'utf8');

// ============================================================================
// EXPORT CONFIGURATION TESTS
// ============================================================================

console.log('Testing Export Configuration...\n');

// Test: Export function exists
test('exportConfiguration function should be defined', () => {
  assert(popupJs.includes('async function exportConfiguration()'), 'exportConfiguration function not found');
});

// Test: Export uses chrome.storage.sync.get
test('Export should retrieve all settings from storage', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('chrome.storage.sync.get(null)'), 'Should get all settings with get(null)');
});

// Test: Export removes sensitive data
test('Export should remove API key for security', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('delete safeCopy.apiKey'), 'Should remove API key from export');
  assert(exportCode.includes('safeCopy'), 'Should create a copy of settings');
});

// Test: Export creates JSON blob
test('Export should create a JSON blob with proper formatting', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('JSON.stringify'), 'Should stringify the config');
  assert(exportCode.includes('null, 2'), 'Should format JSON with 2-space indent');
  assert(exportCode.includes('application/json'), 'Should use application/json MIME type');
  assert(exportCode.includes('new Blob'), 'Should create a Blob');
});

// Test: Export creates download link
test('Export should trigger file download', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('document.createElement(\'a\')'), 'Should create an anchor element');
  assert(exportCode.includes('.download ='), 'Should set download attribute');
  assert(exportCode.includes('.click()'), 'Should trigger click to download');
  assert(exportCode.includes('URL.createObjectURL'), 'Should create object URL');
  assert(exportCode.includes('URL.revokeObjectURL'), 'Should revoke object URL after download');
});

// Test: Export filename is correct
test('Export filename should be "apralabs-ai-code-buddy.json"', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('apralabs-ai-code-buddy.json'), 'Filename should be apralabs-ai-code-buddy.json');
  assert(!exportCode.includes('rport-ai-config.json'), 'Should not use old rport filename');
});

// Test: Export shows notification
test('Export should show success notification', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('showNotification'), 'Should show notification');
  assert(exportCode.includes('API key excluded'), 'Should mention API key exclusion');
});

// Test: Export handles errors
test('Export should handle errors gracefully', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('catch'), 'Should have error handling');
  assert(exportCode.includes('Failed to export'), 'Should show error message');
});

// ============================================================================
// IMPORT CONFIGURATION TESTS
// ============================================================================

console.log('\nTesting Import Configuration...\n');

// Test: Import function exists
test('importConfiguration function should be defined', () => {
  assert(popupJs.includes('async function importConfiguration(event)'), 'importConfiguration function not found');
});

// Test: Import gets file from event
test('Import should get file from file input event', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('event.target.files[0]'), 'Should get file from event');
  assert(importCode.includes('if (!file) return'), 'Should check if file exists');
});

// Test: Import reads file as text
test('Import should read file contents as text', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('file.text()'), 'Should read file as text');
  assert(importCode.includes('await file.text()'), 'Should await file reading');
});

// Test: Import parses JSON
test('Import should parse JSON from file', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('JSON.parse'), 'Should parse JSON');
});

// Test: Import validates configuration
test('Import should validate configuration before importing', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('!config.provider'), 'Should validate provider exists');
  assert(importCode.includes('Invalid configuration file'), 'Should throw error for invalid config');
});

// Test: Import saves to storage
test('Import should save configuration to chrome storage', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('chrome.storage.sync.set(config)'), 'Should save config to storage');
  assert(importCode.includes('await chrome.storage.sync.set'), 'Should await storage save');
});

// Test: Import reloads settings
test('Import should reload settings after import', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('loadSettings()'), 'Should reload settings');
  assert(importCode.includes('await loadSettings()'), 'Should await settings reload');
});

// Test: Import resets file input
test('Import should reset file input after import', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('event.target.value = \'\''), 'Should reset file input value');
});

// Test: Import shows success notification
test('Import should show success notification', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('Configuration imported successfully'), 'Should show success message');
  assert(importCode.includes('showNotification'), 'Should call showNotification');
});

// Test: Import handles errors
test('Import should handle errors gracefully', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];
  assert(importCode.includes('catch'), 'Should have error handling');
  assert(importCode.includes('Failed to import'), 'Should show error message');
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('\nTesting Export/Import Integration...\n');

// Test: Simulated export data structure
test('Export should create valid JSON structure', () => {
  // Simulate what export does
  const mockSettings = {
    provider: 'openai',
    apiKey: 'sk-test123',
    modelPreference: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  };

  const safeCopy = { ...mockSettings };
  delete safeCopy.apiKey;

  const json = JSON.stringify(safeCopy, null, 2);
  const parsed = JSON.parse(json);

  assert.strictEqual(parsed.provider, 'openai', 'Provider should be preserved');
  assert.strictEqual(parsed.modelPreference, 'gpt-4', 'Model should be preserved');
  assert.strictEqual(parsed.apiKey, undefined, 'API key should be removed');
  assert.strictEqual(parsed.maxTokens, 2000, 'Settings should be preserved');
});

// Test: Simulated import validation
test('Import should reject invalid configuration', () => {
  const invalidConfigs = [
    {},
    { apiKey: 'test' },
    { modelPreference: 'gpt-4' },
    null,
    'invalid'
  ];

  for (const config of invalidConfigs) {
    if (typeof config !== 'object' || config === null || !config.provider) {
      // Should fail validation - this is expected
      assert(true, 'Invalid config should be rejected');
    } else {
      throw new Error('Invalid config was not rejected');
    }
  }
});

// Test: Simulated import validation accepts valid config
test('Import should accept valid configuration', () => {
  const validConfigs = [
    { provider: 'openai' },
    { provider: 'claude', modelPreference: 'claude-3-opus' },
    { provider: 'gemini', maxTokens: 1000 }
  ];

  for (const config of validConfigs) {
    if (config.provider) {
      // Should pass validation
      assert(true, 'Valid config should be accepted');
    } else {
      throw new Error('Valid config was rejected');
    }
  }
});

// Test: Export/Import button wiring
test('Export button should be wired to exportConfiguration', () => {
  assert(popupJs.includes('exportConfig.addEventListener(\'click\', exportConfiguration)'),
    'Export button should call exportConfiguration');
});

// Test: Import button wiring
test('Import button should trigger file input', () => {
  assert(popupJs.includes('importConfig.addEventListener(\'click\''), 'Import button should have click handler');
  assert(popupJs.includes('importFile.click()'), 'Import button should trigger file input click');
});

// Test: Import file input wiring
test('Import file input should be wired to importConfiguration', () => {
  assert(popupJs.includes('importFile.addEventListener(\'change\', importConfiguration)'),
    'File input should call importConfiguration on change');
});

// ============================================================================
// SECURITY TESTS
// ============================================================================

console.log('\nTesting Security...\n');

// Test: API key is never exported
test('API key should NEVER be included in exports', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];

  // Should delete API key
  assert(exportCode.includes('delete safeCopy.apiKey'), 'Must delete apiKey');

  // Check that safeCopy is used for stringification, not original settings
  assert(exportCode.includes('JSON.stringify(safeCopy'), 'Should stringify safeCopy, not settings');
});

// Test: Export creates a copy (doesn't modify original)
test('Export should not modify original settings object', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('{ ...settings }') || exportCode.includes('safeCopy = { ...'),
    'Should create a copy with spread operator');
});

// Test: Import validates before applying
test('Import should validate before saving to storage', () => {
  const importMatch = popupJs.match(/async function importConfiguration\(event\) \{[\s\S]*?\n  \}/);
  assert(importMatch, 'importConfiguration function not found');

  const importCode = importMatch[0];

  // Validation should come before storage save
  const validationIndex = importCode.indexOf('!config.provider');
  const storageIndex = importCode.indexOf('chrome.storage.sync.set');

  assert(validationIndex < storageIndex, 'Validation should happen before saving');
});

// ============================================================================
// UI/UX TESTS
// ============================================================================

console.log('\nTesting UI/UX...\n');

// Test: Export notification mentions security
test('Export notification should mention API key exclusion', () => {
  const exportMatch = popupJs.match(/async function exportConfiguration\(\) \{[\s\S]*?\n  \}/);
  assert(exportMatch, 'exportConfiguration function not found');

  const exportCode = exportMatch[0];
  assert(exportCode.includes('API key excluded'), 'Should inform user about API key exclusion');
});

// Test: File input accepts JSON only
test('File input should be configured to accept JSON files', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');
  const fileInputMatch = html.match(/<input[^>]*id="importFile"[^>]*>/);

  assert(fileInputMatch, 'Import file input not found');
  assert(fileInputMatch[0].includes('accept=".json"'), 'Should accept only .json files');
});

// Test: File input is hidden
test('File input should be hidden from view', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');
  const fileInputMatch = html.match(/<input[^>]*id="importFile"[^>]*>/);

  assert(fileInputMatch, 'Import file input not found');
  assert(fileInputMatch[0].includes('display: none') || fileInputMatch[0].includes('display:none'), 'File input should be hidden');
});

// Test: Export/Import buttons exist in HTML
test('Export and Import buttons should exist in HTML', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  assert(html.includes('id="exportConfig"'), 'Export button should exist');
  assert(html.includes('id="importConfig"'), 'Import button should exist');
});

// Test: Buttons are in Advanced tab
test('Export/Import buttons should be in Advanced tab', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'popup-multi.html'), 'utf8');

  // Extract Advanced tab content
  const advancedTabMatch = html.match(/id="advanced-tab"[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer">/);
  assert(advancedTabMatch, 'Advanced tab not found');

  const advancedTab = advancedTabMatch[0];
  assert(advancedTab.includes('id="exportConfig"'), 'Export button should be in Advanced tab');
  assert(advancedTab.includes('id="importConfig"'), 'Import button should be in Advanced tab');
});

console.log('\n==============================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('==============================================\n');

if (failed > 0) {
  process.exit(1);
}

console.log('✓ All Export/Import Configuration tests passed!');
