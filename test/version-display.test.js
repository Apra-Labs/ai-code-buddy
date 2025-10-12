// Unit tests for version display functionality
// Tests ensure version information is correctly formatted and displayed

const assert = require('assert');

/**
 * Format version string for display
 * Mirrors logic from popup-multi.js displayVersionInfo()
 */
function formatVersionString(version, gitCommitShort) {
  if (!version) {
    return 'Version info unavailable';
  }

  if (gitCommitShort) {
    return `v${version} (${gitCommitShort})`;
  }

  return `v${version}`;
}

/**
 * Validate version format
 */
function isValidVersionFormat(version) {
  // Semver format: X.Y.Z where X, Y, Z are numbers
  const semverPattern = /^\d+\.\d+\.\d+$/;
  return semverPattern.test(version);
}

/**
 * Validate git commit hash format
 */
function isValidGitHash(hash, short = false) {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  if (short) {
    // Short hash: 7 characters, hexadecimal
    const shortHashPattern = /^[0-9a-f]{7}$/i;
    return shortHashPattern.test(hash);
  } else {
    // Full hash: 40 characters, hexadecimal
    const fullHashPattern = /^[0-9a-f]{40}$/i;
    return fullHashPattern.test(hash);
  }
}

/**
 * Extract version info from VERSION.json data
 */
function extractVersionInfo(versionData) {
  if (!versionData || typeof versionData !== 'object') {
    return null;
  }

  return {
    version: versionData.version || null,
    gitCommit: versionData.git_commit || null,
    gitCommitShort: versionData.git_commit_short || null
  };
}

// Only define describe blocks if a test framework is available
if (typeof describe === 'function') {
describe('Version Display', () => {

  describe('Version String Formatting', () => {
    it('should format version with git commit', () => {
      const formatted = formatVersionString('2.1.0', '333bc70');
      assert.strictEqual(formatted, 'v2.1.0 (333bc70)');
    });

    it('should format version without git commit', () => {
      const formatted = formatVersionString('2.1.0', null);
      assert.strictEqual(formatted, 'v2.1.0');
    });

    it('should format version with undefined git commit', () => {
      const formatted = formatVersionString('2.1.0', undefined);
      assert.strictEqual(formatted, 'v2.1.0');
    });

    it('should format version with empty git commit', () => {
      const formatted = formatVersionString('2.1.0', '');
      assert.strictEqual(formatted, 'v2.1.0');
    });

    it('should handle missing version', () => {
      const formatted = formatVersionString(null, '333bc70');
      assert.strictEqual(formatted, 'Version info unavailable');
    });

    it('should handle undefined version', () => {
      const formatted = formatVersionString(undefined, '333bc70');
      assert.strictEqual(formatted, 'Version info unavailable');
    });

    it('should handle empty version', () => {
      const formatted = formatVersionString('', '333bc70');
      assert.strictEqual(formatted, 'Version info unavailable');
    });
  });

  describe('Version Format Validation', () => {
    it('should validate correct semver format', () => {
      assert.strictEqual(isValidVersionFormat('2.1.0'), true);
      assert.strictEqual(isValidVersionFormat('1.0.0'), true);
      assert.strictEqual(isValidVersionFormat('10.20.30'), true);
      assert.strictEqual(isValidVersionFormat('0.0.1'), true);
    });

    it('should reject invalid semver formats', () => {
      assert.strictEqual(isValidVersionFormat('2.1'), false);
      assert.strictEqual(isValidVersionFormat('2'), false);
      assert.strictEqual(isValidVersionFormat('2.1.0.0'), false);
      assert.strictEqual(isValidVersionFormat('v2.1.0'), false);
      assert.strictEqual(isValidVersionFormat('2.1.0-beta'), false);
    });

    it('should reject non-numeric versions', () => {
      assert.strictEqual(isValidVersionFormat('a.b.c'), false);
      assert.strictEqual(isValidVersionFormat('2.x.0'), false);
      assert.strictEqual(isValidVersionFormat('latest'), false);
    });

    it('should reject empty or null versions', () => {
      assert.strictEqual(isValidVersionFormat(''), false);
      assert.strictEqual(isValidVersionFormat(null), false);
      assert.strictEqual(isValidVersionFormat(undefined), false);
    });
  });

  describe('Git Hash Validation', () => {
    it('should validate correct short hash format', () => {
      assert.strictEqual(isValidGitHash('333bc70', true), true);
      assert.strictEqual(isValidGitHash('0ab78e4', true), true);
      assert.strictEqual(isValidGitHash('abcdef0', true), true);
      assert.strictEqual(isValidGitHash('1234567', true), true);
    });

    it('should validate correct full hash format', () => {
      const fullHash = '333bc7017ddf813d09437fef0b5688aba1fcf1b9';
      assert.strictEqual(isValidGitHash(fullHash, false), true);

      const anotherHash = '0ab78e4499a18bb7904ed6ef9567ea9797a39d30';
      assert.strictEqual(isValidGitHash(anotherHash, false), true);
    });

    it('should reject invalid short hash formats', () => {
      assert.strictEqual(isValidGitHash('333bc7', true), false); // too short
      assert.strictEqual(isValidGitHash('333bc701', true), false); // too long
      assert.strictEqual(isValidGitHash('gggggg', true), false); // invalid characters
      assert.strictEqual(isValidGitHash('333 c70', true), false); // contains space
    });

    it('should reject invalid full hash formats', () => {
      assert.strictEqual(isValidGitHash('333bc70', false), false); // too short
      assert.strictEqual(isValidGitHash('not-a-valid-hash', false), false);
      assert.strictEqual(isValidGitHash('333bc7017ddf813d09437fef0b5688aba1fcf1b', false), false); // 39 chars
    });

    it('should handle case insensitivity', () => {
      assert.strictEqual(isValidGitHash('333BC70', true), true);
      assert.strictEqual(isValidGitHash('ABC DEF0', true), false); // still invalid due to space
    });

    it('should reject null and undefined', () => {
      assert.strictEqual(isValidGitHash(null, true), false);
      assert.strictEqual(isValidGitHash(undefined, true), false);
      assert.strictEqual(isValidGitHash('', true), false);
    });

    it('should reject non-string values', () => {
      assert.strictEqual(isValidGitHash(1234567, true), false);
      assert.strictEqual(isValidGitHash({hash: '333bc70'}, true), false);
      assert.strictEqual(isValidGitHash(['333bc70'], true), false);
    });
  });

  describe('VERSION.json Extraction', () => {
    it('should extract all version info', () => {
      const versionData = {
        version: '2.1.0',
        git_commit: '333bc7017ddf813d09437fef0b5688aba1fcf1b9',
        git_commit_short: '333bc70'
      };

      const extracted = extractVersionInfo(versionData);
      assert.strictEqual(extracted.version, '2.1.0');
      assert.strictEqual(extracted.gitCommit, '333bc7017ddf813d09437fef0b5688aba1fcf1b9');
      assert.strictEqual(extracted.gitCommitShort, '333bc70');
    });

    it('should handle missing git commit fields', () => {
      const versionData = {
        version: '2.0.0'
      };

      const extracted = extractVersionInfo(versionData);
      assert.strictEqual(extracted.version, '2.0.0');
      assert.strictEqual(extracted.gitCommit, null);
      assert.strictEqual(extracted.gitCommitShort, null);
    });

    it('should handle missing version field', () => {
      const versionData = {
        git_commit: '333bc7017ddf813d09437fef0b5688aba1fcf1b9',
        git_commit_short: '333bc70'
      };

      const extracted = extractVersionInfo(versionData);
      assert.strictEqual(extracted.version, null);
      assert.strictEqual(extracted.gitCommit, '333bc7017ddf813d09437fef0b5688aba1fcf1b9');
      assert.strictEqual(extracted.gitCommitShort, '333bc70');
    });

    it('should handle empty object', () => {
      const extracted = extractVersionInfo({});
      assert.strictEqual(extracted.version, null);
      assert.strictEqual(extracted.gitCommit, null);
      assert.strictEqual(extracted.gitCommitShort, null);
    });

    it('should handle null input', () => {
      const extracted = extractVersionInfo(null);
      assert.strictEqual(extracted, null);
    });

    it('should handle undefined input', () => {
      const extracted = extractVersionInfo(undefined);
      assert.strictEqual(extracted, null);
    });

    it('should handle non-object input', () => {
      assert.strictEqual(extractVersionInfo('string'), null);
      assert.strictEqual(extractVersionInfo(123), null);
      assert.strictEqual(extractVersionInfo([]), null);
    });

    it('should extract from full VERSION.json structure', () => {
      const fullVersionData = {
        version: '2.1.0',
        git_commit: '333bc7017ddf813d09437fef0b5688aba1fcf1b9',
        git_commit_short: '333bc70',
        name: 'AI Code Buddy',
        description: 'Turn any web terminal into an AI-powered command center',
        release_date: '2025-10-11'
      };

      const extracted = extractVersionInfo(fullVersionData);
      assert.strictEqual(extracted.version, '2.1.0');
      assert.strictEqual(extracted.gitCommitShort, '333bc70');
    });
  });

  describe('Integration Scenarios', () => {
    it('should produce valid display string from VERSION.json', () => {
      const versionData = {
        version: '2.1.0',
        git_commit_short: '333bc70'
      };

      const info = extractVersionInfo(versionData);
      const displayString = formatVersionString(info.version, info.gitCommitShort);

      assert.strictEqual(displayString, 'v2.1.0 (333bc70)');
      assert.strictEqual(isValidVersionFormat(info.version), true);
      assert.strictEqual(isValidGitHash(info.gitCommitShort, true), true);
    });

    it('should handle manifest-only scenario (no git hash)', () => {
      const manifestVersion = '2.1.0';
      const displayString = formatVersionString(manifestVersion, null);

      assert.strictEqual(displayString, 'v2.1.0');
      assert.strictEqual(isValidVersionFormat(manifestVersion), true);
    });

    it('should handle fallback to error message', () => {
      const displayString = formatVersionString(null, null);
      assert.strictEqual(displayString, 'Version info unavailable');
    });
  });

  describe('Real World Scenarios', () => {
    it('should handle v2.0.0 release', () => {
      const versionData = {
        version: '2.0.0',
        git_commit_short: '83e2b61'
      };

      const info = extractVersionInfo(versionData);
      const displayString = formatVersionString(info.version, info.gitCommitShort);

      assert.strictEqual(displayString, 'v2.0.0 (83e2b61)');
    });

    it('should handle v2.1.0 release', () => {
      const versionData = {
        version: '2.1.0',
        git_commit_short: '333bc70'
      };

      const info = extractVersionInfo(versionData);
      const displayString = formatVersionString(info.version, info.gitCommitShort);

      assert.strictEqual(displayString, 'v2.1.0 (333bc70)');
    });

    it('should handle development versions', () => {
      const versionData = {
        version: '2.2.0',
        git_commit_short: 'dev1234'
      };

      const info = extractVersionInfo(versionData);
      const displayString = formatVersionString(info.version, info.gitCommitShort);

      assert.strictEqual(displayString, 'v2.2.0 (dev1234)');
      assert.strictEqual(isValidVersionFormat(info.version), true);
      // Note: 'dev1234' is not a valid hex hash but still displayed
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long version numbers', () => {
      const version = '999.999.999';
      assert.strictEqual(isValidVersionFormat(version), true);
      const displayString = formatVersionString(version, 'abc1234');
      assert.strictEqual(displayString, 'v999.999.999 (abc1234)');
    });

    it('should handle version with leading zeros', () => {
      const version = '2.01.0';
      const displayString = formatVersionString(version, '333bc70');
      assert.strictEqual(displayString, 'v2.01.0 (333bc70)');
    });

    it('should handle special characters in git hash gracefully', () => {
      // Invalid hash, but still display it
      const displayString = formatVersionString('2.1.0', 'invalid-hash');
      assert.strictEqual(displayString, 'v2.1.0 (invalid-hash)');
      assert.strictEqual(isValidGitHash('invalid-hash', true), false);
    });
  });
});
} // End of describe block conditional

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Version Display Tests...\n');

  const tests = [
    // Formatting tests
    () => {
      console.log('✓ Formats version with git commit');
      assert.strictEqual(formatVersionString('2.1.0', '333bc70'), 'v2.1.0 (333bc70)');
    },
    () => {
      console.log('✓ Formats version without git commit');
      assert.strictEqual(formatVersionString('2.1.0', null), 'v2.1.0');
    },
    () => {
      console.log('✓ Handles missing version');
      assert.strictEqual(formatVersionString(null, '333bc70'), 'Version info unavailable');
    },

    // Version validation
    () => {
      console.log('✓ Validates correct semver format');
      assert.strictEqual(isValidVersionFormat('2.1.0'), true);
      assert.strictEqual(isValidVersionFormat('10.20.30'), true);
    },
    () => {
      console.log('✓ Rejects invalid semver formats');
      assert.strictEqual(isValidVersionFormat('2.1'), false);
      assert.strictEqual(isValidVersionFormat('v2.1.0'), false);
    },

    // Git hash validation
    () => {
      console.log('✓ Validates short git hash');
      assert.strictEqual(isValidGitHash('333bc70', true), true);
      assert.strictEqual(isValidGitHash('0ab78e4', true), true);
    },
    () => {
      console.log('✓ Validates full git hash');
      const fullHash = '333bc7017ddf813d09437fef0b5688aba1fcf1b9';
      assert.strictEqual(isValidGitHash(fullHash, false), true);
    },
    () => {
      console.log('✓ Rejects invalid hash formats');
      assert.strictEqual(isValidGitHash('333bc7', true), false); // too short
      assert.strictEqual(isValidGitHash('gggggg', true), false); // invalid chars
    },

    // VERSION.json extraction
    () => {
      console.log('✓ Extracts version info from VERSION.json');
      const data = { version: '2.1.0', git_commit_short: '333bc70' };
      const info = extractVersionInfo(data);
      assert.strictEqual(info.version, '2.1.0');
      assert.strictEqual(info.gitCommitShort, '333bc70');
    },
    () => {
      console.log('✓ Handles missing fields in VERSION.json');
      const data = { version: '2.0.0' };
      const info = extractVersionInfo(data);
      assert.strictEqual(info.version, '2.0.0');
      assert.strictEqual(info.gitCommitShort, null);
    },
    () => {
      console.log('✓ Handles null VERSION.json');
      assert.strictEqual(extractVersionInfo(null), null);
    },

    // Integration scenarios
    () => {
      console.log('✓ Integration: Full version display');
      const data = { version: '2.1.0', git_commit_short: '333bc70' };
      const info = extractVersionInfo(data);
      const display = formatVersionString(info.version, info.gitCommitShort);
      assert.strictEqual(display, 'v2.1.0 (333bc70)');
    },
    () => {
      console.log('✓ Integration: Manifest-only display');
      const display = formatVersionString('2.1.0', null);
      assert.strictEqual(display, 'v2.1.0');
    },

    // Real world
    () => {
      console.log('✓ Real world: v2.0.0 release');
      const data = { version: '2.0.0', git_commit_short: '83e2b61' };
      const info = extractVersionInfo(data);
      const display = formatVersionString(info.version, info.gitCommitShort);
      assert.strictEqual(display, 'v2.0.0 (83e2b61)');
    },
    () => {
      console.log('✓ Real world: v2.1.0 release');
      const data = { version: '2.1.0', git_commit_short: '333bc70' };
      const info = extractVersionInfo(data);
      const display = formatVersionString(info.version, info.gitCommitShort);
      assert.strictEqual(display, 'v2.1.0 (333bc70)');
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    try {
      test();
      passed++;
    } catch (error) {
      console.error(`✗ Test ${index + 1} failed:`, error.message);
      failed++;
    }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

module.exports = { formatVersionString, isValidVersionFormat, isValidGitHash, extractVersionInfo };
