# Testing Guide

## Quick Start

**Run tests before committing:**

```bash
# Windows
run-tests.bat

# Unix/Linux/Mac
./run-tests.sh
```

---

## Test Commands

### Unit Tests (Fast - 2 seconds)

```bash
npm test                        # All unit tests
npm run test:model-migration    # Model migration only
npm run test:conversation       # Conversation context only
```

### Validation Tests (Slower - 30-60 seconds)

```bash
npm run test:images            # Image validation
npm run test:links             # Link validation
npm run test:validate          # Both image + link validation
```

### Everything

```bash
npm run test:all              # Unit + validation tests
```

---

## What's Tested

### Unit Tests (17 tests)

**Model Migration** (`popup-multi.test.js`) - 7 tests
- Legacy models auto-migrate to current defaults
- Users stay with their chosen provider (Gemini → Gemini, not Gemini → OpenAI)
- Handles null/undefined values

**Conversation Context** (`conversation-context.test.js`) - 10 tests
- Builds context from previous attempts
- Emphasizes "try DIFFERENT approach" after failures
- Handles 1, 2, 3+ attempts correctly

### Validation Tests

**Images** (`image-validator.js`)
- Icon sizes (16px, 48px, 128px)
- Promotional images for Chrome Web Store
- File sizes under 5MB

**Links** (`link-validator.js`)
- All links in HTML/Markdown work
- Local files exist
- External URLs are reachable

---

## Pipeline Integration

Tests run automatically on:
- **Every commit** - Unit tests → Build → Validate
- **Main branch** - Unit tests → Build → Validate → Tag
- **Release tags** - Unit tests → Build → Validate → Chrome Web Store prep

---

## Writing New Tests

### Unit Test Template

```javascript
const assert = require('assert');

function myFunction(input) {
  return input * 2;
}

// Standalone runner (no framework needed)
if (require.main === module) {
  console.log('Running tests...\n');

  const tests = [
    () => {
      console.log('✓ Test: doubles the input');
      assert.strictEqual(myFunction(5), 10);
    }
  ];

  let passed = 0, failed = 0;
  tests.forEach((test, i) => {
    try {
      test();
      passed++;
    } catch (error) {
      console.error(`✗ Test ${i + 1} failed:`, error.message);
      failed++;
    }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
```

### Add to Test Suite

1. Create `test/my-feature.test.js`
2. Add to `package.json`:
   ```json
   "test": "node test/popup-multi.test.js && node test/conversation-context.test.js && node test/my-feature.test.js"
   ```
3. Run `npm test` to verify

---

## Coverage Priorities

**Already Covered (100%)**
- ✅ Model migration logic
- ✅ Conversation context management

**High Priority (Not Yet Covered)**
- ⏳ Provider configuration validation
- ⏳ API key format validation
- ⏳ Request building for each provider
- ⏳ Error handling and retry logic

**Medium Priority**
- ⏳ UI state management
- ⏳ Build process validation
- ⏳ Terminal integration

---

## Troubleshooting

### Tests won't run

```bash
# Check Node.js is installed
node --version

# If missing, install from https://nodejs.org/
```

### Image validator fails

```bash
# Install dependencies
cd icons && npm install && cd ..
npm run test:images
```

### Link validator times out

Edit `test/link-validator.js` and increase timeout:
```javascript
const request = protocol.get(url, { timeout: 60000 }, (res) => {
```

### Bot-protected URLs fail

Add URL to `BOT_PROTECTED_URLS` array in `test/link-validator.js`.

---

## Pre-Commit Checklist

Before committing:
1. ✅ Run `./run-tests.bat` or `./run-tests.sh`
2. ✅ All 17 unit tests pass
3. ✅ No new console errors

Before pushing to main:
1. ✅ Run `npm run test:all`
2. ✅ Build succeeds: `./build-extension.bat`
3. ✅ Manual smoke test in browser

---

## Test Files

```
test/
├── README.md                      # This file
├── popup-multi.test.js            # Model migration (7 tests)
├── conversation-context.test.js   # Conversation context (10 tests)
├── image-validator.js             # Image validation
├── link-validator.js              # Link validation
└── test-scripts.js                # Legacy utilities
```

**Total: 17 unit tests + 2 validators**

---

## Future Test Ideas

### Providers (High Priority)

Test `providers.js` configuration:
- API key pattern matching for each provider
- Endpoint generation (Claude, OpenAI, Gemini, Azure, etc.)
- Request body building
- Response parsing
- Retry logic (429, 503 errors)
- Exponential backoff

### Message Handling (High Priority)

Test `background.js` integration:
- Chrome API message routing
- Provider selection
- Configuration validation
- Error handling

### Terminal Integration (Medium Priority)

Test `content.js`:
- Error pattern detection
- Command extraction
- Auto-improvement triggers
- Rate limiting

---

**Last Updated:** 2025-10-11
**Test Count:** 17 unit tests + 2 validators
**Status:** All passing ✓
