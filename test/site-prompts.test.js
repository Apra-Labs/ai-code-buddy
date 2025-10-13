// Test suite for Site-Specific System Prompts
// Tests URL matching, prompt selection, and validation

const assert = require('assert');
const {
  matchHostnamePattern,
  findMatchingPrompt,
  getPromptForUrl,
  validateSitePattern,
  normalizeSitePattern
} = require('../site-prompts.js');

console.log('Running Site-Specific Prompts Tests...\n');

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

// ============================================================================
// HOSTNAME PATTERN MATCHING TESTS
// ============================================================================

console.log('Testing Hostname Pattern Matching...\n');

test('Exact match: rport.io matches rport.io', () => {
  assert.strictEqual(matchHostnamePattern('rport.io', 'rport.io'), true);
});

test('Exact match: case insensitive', () => {
  assert.strictEqual(matchHostnamePattern('RPort.IO', 'rport.io'), true);
});

test('No match: different domains', () => {
  assert.strictEqual(matchHostnamePattern('github.com', 'rport.io'), false);
});

test('Wildcard subdomain: *.rport.io matches app.rport.io', () => {
  assert.strictEqual(matchHostnamePattern('app.rport.io', '*.rport.io'), true);
});

test('Wildcard subdomain: *.rport.io matches multi.level.rport.io', () => {
  assert.strictEqual(matchHostnamePattern('multi.level.rport.io', '*.rport.io'), true);
});

test('Wildcard subdomain: *.rport.io does NOT match rport.io', () => {
  assert.strictEqual(matchHostnamePattern('rport.io', '*.rport.io'), false);
});

test('Wildcard prefix: *github.com matches github.com', () => {
  assert.strictEqual(matchHostnamePattern('github.com', '*github.com'), true);
});

test('Wildcard prefix: *github.com matches my.github.com', () => {
  assert.strictEqual(matchHostnamePattern('my.github.com', '*github.com'), true);
});

test('Wildcard prefix: *github.com matches any.prefix.github.com', () => {
  assert.strictEqual(matchHostnamePattern('any.prefix.github.com', '*github.com'), true);
});

test('Wildcard: does NOT match different domain', () => {
  assert.strictEqual(matchHostnamePattern('example.com', '*.rport.io'), false);
});

test('Edge case: empty hostname', () => {
  assert.strictEqual(matchHostnamePattern('', 'rport.io'), false);
});

test('Edge case: empty pattern', () => {
  assert.strictEqual(matchHostnamePattern('rport.io', ''), false);
});

test('Edge case: both empty', () => {
  assert.strictEqual(matchHostnamePattern('', ''), false);
});

// ============================================================================
// FIND MATCHING PROMPT TESTS
// ============================================================================

console.log('\nTesting Find Matching Prompt...\n');

const testPrompts = {
  'rport.io': {
    name: 'RPort',
    prompt: 'Linux expert',
    enabled: true
  },
  '*.github.com': {
    name: 'GitHub',
    prompt: 'Git expert',
    enabled: true
  },
  '*devops.com': {
    name: 'DevOps',
    prompt: 'DevOps expert',
    enabled: true
  },
  'disabled.com': {
    name: 'Disabled',
    prompt: 'Should not match',
    enabled: false
  }
};

test('Find exact match: rport.io', () => {
  const match = findMatchingPrompt('rport.io', testPrompts);
  assert.strictEqual(match.pattern, 'rport.io');
  assert.strictEqual(match.prompt, 'Linux expert');
});

test('Find wildcard match: app.github.com', () => {
  const match = findMatchingPrompt('app.github.com', testPrompts);
  assert.strictEqual(match.pattern, '*.github.com');
  assert.strictEqual(match.prompt, 'Git expert');
});

test('Find wildcard match: my.devops.com', () => {
  const match = findMatchingPrompt('my.devops.com', testPrompts);
  assert.strictEqual(match.pattern, '*devops.com');
  assert.strictEqual(match.prompt, 'DevOps expert');
});

test('No match: example.com', () => {
  const match = findMatchingPrompt('example.com', testPrompts);
  assert.strictEqual(match, null);
});

test('Disabled prompt not matched', () => {
  const match = findMatchingPrompt('disabled.com', testPrompts);
  assert.strictEqual(match, null);
});

test('Full URL: https://rport.io/path', () => {
  const match = findMatchingPrompt('https://rport.io/path', testPrompts);
  assert.strictEqual(match.pattern, 'rport.io');
});

test('Specificity: exact match wins over wildcard', () => {
  const prompts = {
    'github.com': { prompt: 'Exact', enabled: true },
    '*.github.com': { prompt: 'Wildcard', enabled: true }
  };
  const match = findMatchingPrompt('github.com', prompts);
  assert.strictEqual(match.prompt, 'Exact');
});

test('Specificity: more specific wildcard wins', () => {
  const prompts = {
    '*hub.com': { prompt: 'Less specific', enabled: true },
    '*github.com': { prompt: 'More specific', enabled: true }
  };
  const match = findMatchingPrompt('mygithub.com', prompts);
  assert.strictEqual(match.prompt, 'More specific');
});

// ============================================================================
// GET PROMPT FOR URL TESTS
// ============================================================================

console.log('\nTesting Get Prompt For URL...\n');

test('Get prompt: matched site', () => {
  const prompt = getPromptForUrl('rport.io', testPrompts, 'Default');
  assert.strictEqual(prompt, 'Linux expert');
});

test('Get prompt: unmatched site uses default', () => {
  const prompt = getPromptForUrl('example.com', testPrompts, 'Default prompt');
  assert.strictEqual(prompt, 'Default prompt');
});

test('Get prompt: no default returns empty', () => {
  const prompt = getPromptForUrl('example.com', testPrompts);
  assert.strictEqual(prompt, '');
});

test('Get prompt: with full URL', () => {
  const prompt = getPromptForUrl('https://rport.io/path?query=1', testPrompts, 'Default');
  assert.strictEqual(prompt, 'Linux expert');
});

// ============================================================================
// VALIDATE SITE PATTERN TESTS
// ============================================================================

console.log('\nTesting Validate Site Pattern...\n');

test('Valid pattern: rport.io', () => {
  const result = validateSitePattern('rport.io');
  assert.strictEqual(result.valid, true);
});

test('Valid pattern: *.example.com', () => {
  const result = validateSitePattern('*.example.com');
  assert.strictEqual(result.valid, true);
});

test('Valid pattern: *github.com', () => {
  const result = validateSitePattern('*github.com');
  assert.strictEqual(result.valid, true);
});

test('Valid pattern: with numbers', () => {
  const result = validateSitePattern('site123.com');
  assert.strictEqual(result.valid, true);
});

test('Valid pattern: with hyphens', () => {
  const result = validateSitePattern('my-site.com');
  assert.strictEqual(result.valid, true);
});

test('Invalid pattern: empty string', () => {
  const result = validateSitePattern('');
  assert.strictEqual(result.valid, false);
  assert(result.error.includes('empty'));
});

test('Invalid pattern: whitespace only', () => {
  const result = validateSitePattern('   ');
  assert.strictEqual(result.valid, false);
});

test('Invalid pattern: special characters', () => {
  const result = validateSitePattern('site!.com');
  assert.strictEqual(result.valid, false);
  assert(result.error.includes('invalid characters'));
});

test('Invalid pattern: multiple wildcards', () => {
  const result = validateSitePattern('**.example.com');
  assert.strictEqual(result.valid, false);
  assert(result.error.includes('consecutive wildcards'));
});

test('Invalid pattern: wildcard in middle', () => {
  const result = validateSitePattern('my*.example.com');
  assert.strictEqual(result.valid, false);
  assert(result.error.includes('beginning'));
});

test('Invalid pattern: wildcard without domain', () => {
  const result = validateSitePattern('*');
  assert.strictEqual(result.valid, false);
  assert(result.error.includes('domain'));
});

// ============================================================================
// NORMALIZE SITE PATTERN TESTS
// ============================================================================

console.log('\nTesting Normalize Site Pattern...\n');

test('Normalize: lowercase', () => {
  assert.strictEqual(normalizeSitePattern('RPort.IO'), 'rport.io');
});

test('Normalize: trim whitespace', () => {
  assert.strictEqual(normalizeSitePattern('  rport.io  '), 'rport.io');
});

test('Normalize: both', () => {
  assert.strictEqual(normalizeSitePattern('  GitHub.COM  '), 'github.com');
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('\nTesting Integration Scenarios...\n');

test('Real world: RPort terminal with wildcard', () => {
  const prompts = {
    '*rport.io': {
      name: 'RPort Terminal',
      prompt: 'You are a Linux system administrator expert. Focus on bash commands.',
      enabled: true
    }
  };
  const url = 'https://app.rport.io/terminal/session-123';
  const prompt = getPromptForUrl(url, prompts, 'Generic AI');
  assert(prompt.includes('Linux system administrator'));
});

test('Real world: GitHub code review', () => {
  const prompts = {
    '*github.com': {
      name: 'GitHub',
      prompt: 'You are a code review expert. Focus on best practices.',
      enabled: true
    }
  };
  const url = 'https://github.com/user/repo/pull/123';
  const prompt = getPromptForUrl(url, prompts, 'Generic AI');
  assert(prompt.includes('code review expert'));
});

test('Real world: DevOps portal with C#', () => {
  const prompts = {
    'devops.company.com': {
      name: 'Company DevOps',
      prompt: 'You are a C# and Azure DevOps expert.',
      enabled: true
    }
  };
  const url = 'https://devops.company.com/project/pipeline';
  const prompt = getPromptForUrl(url, prompts, 'Generic AI');
  assert(prompt.includes('C# and Azure'));
});

test('Real world: Log analysis site', () => {
  const prompts = {
    'logs.monitoring.com': {
      name: 'Log Analyzer',
      prompt: 'You analyze logs only. Focus on error patterns and debugging.',
      enabled: true
    }
  };
  const url = 'https://logs.monitoring.com/dashboard';
  const prompt = getPromptForUrl(url, prompts, 'Generic AI');
  assert(prompt.includes('analyze logs'));
});

test('Real world: Multiple matches, most specific wins', () => {
  const prompts = {
    '*.company.com': {
      name: 'Company Wide',
      prompt: 'Company context',
      enabled: true
    },
    'devops.company.com': {
      name: 'DevOps Specific',
      prompt: 'DevOps context',
      enabled: true
    }
  };
  const url = 'devops.company.com';
  const prompt = getPromptForUrl(url, prompts, 'Default');
  assert.strictEqual(prompt, 'DevOps context');
});

test('Real world: Disabled site falls back to default', () => {
  const prompts = {
    'test.com': {
      name: 'Test',
      prompt: 'Test prompt',
      enabled: false
    }
  };
  const url = 'test.com';
  const prompt = getPromptForUrl(url, prompts, 'Fallback prompt');
  assert.strictEqual(prompt, 'Fallback prompt');
});

console.log('\n==============================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('==============================================\n');

if (failed > 0) {
  process.exit(1);
}

console.log('✓ All Site-Specific Prompts tests passed!');
