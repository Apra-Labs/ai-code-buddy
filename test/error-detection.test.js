// Unit tests for error detection functionality in content.js
// Tests ensure the extension correctly identifies errors in terminal output

const assert = require('assert');

/**
 * Detect if output contains error patterns
 * This is extracted from content.js for testing
 */
function detectError(outputText) {
  const errorPatterns = [
    /error:/i,
    /exception:/i,
    /failed/i,
    /failure/i,
    /not found/i,
    /permission denied/i,
    /access denied/i,
    /cannot/i,
    /unable to/i,
    /invalid/i,
    /syntax error/i,
    /fatal:/i,
    /critical:/i,
    /exit code: [1-9]/i,
    /exit status [1-9]/i,
    /\[ERROR\]/i,
    /\[FATAL\]/i,
    /traceback/i,
    /stack trace/i
  ];

  return errorPatterns.some(pattern => pattern.test(outputText));
}

// Only define describe blocks if a test framework is available
if (typeof describe === 'function') {
describe('Error Detection', () => {

  describe('Common Error Patterns', () => {
    it('should detect "error:" keyword', () => {
      assert.strictEqual(detectError('error: command not found'), true);
      assert.strictEqual(detectError('Error: file missing'), true);
      assert.strictEqual(detectError('ERROR: connection failed'), true);
    });

    it('should detect "exception:" keyword', () => {
      assert.strictEqual(detectError('exception: null pointer'), true);
      assert.strictEqual(detectError('Exception: IndexOutOfBounds'), true);
      assert.strictEqual(detectError('EXCEPTION: timeout'), true);
    });

    it('should detect "failed" keyword', () => {
      assert.strictEqual(detectError('operation failed'), true);
      assert.strictEqual(detectError('Failed to connect'), true);
      assert.strictEqual(detectError('FAILED: test suite'), true);
    });

    it('should detect "failure" keyword', () => {
      assert.strictEqual(detectError('failure detected'), true);
      assert.strictEqual(detectError('Failure: authentication'), true);
      assert.strictEqual(detectError('BUILD FAILURE'), true);
    });

    it('should detect "not found" errors', () => {
      assert.strictEqual(detectError('file not found'), true);
      assert.strictEqual(detectError('command not found'), true);
      assert.strictEqual(detectError('404 Not Found'), true);
    });

    it('should detect permission errors', () => {
      assert.strictEqual(detectError('permission denied'), true);
      assert.strictEqual(detectError('Permission Denied'), true);
      assert.strictEqual(detectError('access denied'), true);
      assert.strictEqual(detectError('Access Denied: insufficient privileges'), true);
    });

    it('should detect "cannot" errors', () => {
      assert.strictEqual(detectError('cannot open file'), true);
      assert.strictEqual(detectError('Cannot connect to database'), true);
      assert.strictEqual(detectError('CANNOT load module'), true);
    });

    it('should detect "unable to" errors', () => {
      assert.strictEqual(detectError('unable to resolve host'), true);
      assert.strictEqual(detectError('Unable to locate package'), true);
      assert.strictEqual(detectError('UNABLE TO complete request'), true);
    });

    it('should detect "invalid" errors', () => {
      assert.strictEqual(detectError('invalid syntax'), true);
      assert.strictEqual(detectError('Invalid argument'), true);
      assert.strictEqual(detectError('INVALID input'), true);
    });

    it('should detect syntax errors', () => {
      assert.strictEqual(detectError('syntax error near unexpected token'), true);
      assert.strictEqual(detectError('SyntaxError: Unexpected identifier'), true);
      assert.strictEqual(detectError('SYNTAX ERROR at line 42'), true);
    });

    it('should detect fatal errors', () => {
      assert.strictEqual(detectError('fatal: not a git repository'), true);
      assert.strictEqual(detectError('Fatal error: out of memory'), true);
      assert.strictEqual(detectError('FATAL: database connection lost'), true);
    });

    it('should detect critical errors', () => {
      assert.strictEqual(detectError('critical: system failure'), true);
      assert.strictEqual(detectError('Critical error detected'), true);
      assert.strictEqual(detectError('CRITICAL: disk full'), true);
    });

    it('should detect exit codes', () => {
      assert.strictEqual(detectError('exit code: 1'), true);
      assert.strictEqual(detectError('process exited with exit code: 127'), true);
      assert.strictEqual(detectError('Exit Code: 2'), true);
      assert.strictEqual(detectError('exit status 1'), true);
      assert.strictEqual(detectError('Exit Status 255'), true);
    });

    it('should detect bracketed error markers', () => {
      assert.strictEqual(detectError('[ERROR] Connection timeout'), true);
      assert.strictEqual(detectError('[FATAL] Unhandled exception'), true);
      assert.strictEqual(detectError('2025-01-11 [ERROR] Failed to start'), true);
    });

    it('should detect stack traces', () => {
      assert.strictEqual(detectError('Traceback (most recent call last):'), true);
      assert.strictEqual(detectError('Stack trace:\n  at function1'), true);
      assert.strictEqual(detectError('TRACEBACK: memory allocation failed'), true);
    });
  });

  describe('Case Insensitivity', () => {
    it('should be case insensitive for all patterns', () => {
      assert.strictEqual(detectError('error: test'), true);
      assert.strictEqual(detectError('Error: test'), true);
      assert.strictEqual(detectError('ERROR: test'), true);
      assert.strictEqual(detectError('eRrOr: test'), true);
    });

    it('should handle mixed case in multiple words', () => {
      assert.strictEqual(detectError('Not Found'), true);
      assert.strictEqual(detectError('not found'), true);
      assert.strictEqual(detectError('NOT FOUND'), true);
      assert.strictEqual(detectError('Permission Denied'), true);
      assert.strictEqual(detectError('permission denied'), true);
    });
  });

  describe('No False Positives', () => {
    it('should not detect errors in success messages', () => {
      assert.strictEqual(detectError('Operation completed successfully'), false);
      assert.strictEqual(detectError('All tests passed'), false);
      assert.strictEqual(detectError('Build successful'), false);
    });

    it('should not detect errors in normal command output', () => {
      assert.strictEqual(detectError('total 42\ndrwxr-xr-x 2 user group'), false);
      assert.strictEqual(detectError('Hello World'), false);
      assert.strictEqual(detectError('Processing... done'), false);
    });

    it('should not detect errors in informational messages', () => {
      assert.strictEqual(detectError('Server started on port 3000'), false);
      assert.strictEqual(detectError('Listening on http://localhost:8080'), false);
      assert.strictEqual(detectError('Ready to accept connections'), false);
    });

    it('should not detect word fragments', () => {
      // "error" should match "error:" but these should NOT match
      assert.strictEqual(detectError('terrorize'), false); // contains "error" but as fragment
      assert.strictEqual(detectError('errorbyte'), false); // "error" without delimiter
    });

    it('should handle exit code 0 correctly', () => {
      assert.strictEqual(detectError('exit code: 0'), false); // success exit code
      assert.strictEqual(detectError('exit status 0'), false);
    });
  });

  describe('Real World Error Messages', () => {
    it('should detect bash command not found', () => {
      assert.strictEqual(detectError('bash: kubectl: command not found'), true);
      assert.strictEqual(detectError('sh: 1: docker: not found'), true);
    });

    it('should detect Python errors', () => {
      assert.strictEqual(detectError('ModuleNotFoundError: No module named \'requests\''), true);
      assert.strictEqual(detectError('TypeError: cannot concatenate str and int'), true);
      assert.strictEqual(detectError('SyntaxError: invalid syntax'), true);
    });

    it('should detect Node.js errors', () => {
      assert.strictEqual(detectError('Error: Cannot find module \'express\''), true);
      assert.strictEqual(detectError('TypeError: Cannot read property of undefined'), true);
      assert.strictEqual(detectError('SyntaxError: Unexpected token }'), true);
    });

    it('should detect Docker errors', () => {
      assert.strictEqual(detectError('Error: Cannot connect to Docker daemon'), true);
      assert.strictEqual(detectError('docker: Error response from daemon'), true);
      assert.strictEqual(detectError('Error: failed to start container'), true);
    });

    it('should detect Git errors', () => {
      assert.strictEqual(detectError('fatal: not a git repository'), true);
      assert.strictEqual(detectError('error: failed to push some refs'), true);
      assert.strictEqual(detectError('Permission denied (publickey)'), true);
    });

    it('should detect npm/yarn errors', () => {
      assert.strictEqual(detectError('npm ERR! code ENOENT'), true);
      assert.strictEqual(detectError('error An unexpected error occurred'), true);
      assert.strictEqual(detectError('npm ERR! 404 Not Found'), true);
    });

    it('should detect SQL errors', () => {
      assert.strictEqual(detectError('ERROR 1064 (42000): Syntax error'), true);
      assert.strictEqual(detectError('ERROR: relation "users" does not exist'), true);
      assert.strictEqual(detectError('ERROR: permission denied for table'), true);
    });

    it('should detect HTTP errors', () => {
      assert.strictEqual(detectError('404 Not Found'), true);
      assert.strictEqual(detectError('500 Internal Server Error'), true);
      assert.strictEqual(detectError('403 Forbidden: Access Denied'), true);
    });

    it('should detect Kubernetes errors', () => {
      assert.strictEqual(detectError('Error: namespace "production" not found'), true);
      assert.strictEqual(detectError('error: unable to recognize "deployment.yaml"'), true);
      assert.strictEqual(detectError('Error from server (NotFound): pods "app" not found'), true);
    });

    it('should detect compilation errors', () => {
      assert.strictEqual(detectError('gcc: error: unrecognized command line option'), true);
      assert.strictEqual(detectError('error: expected ; before } token'), true);
      assert.strictEqual(detectError('fatal error: iostream: No such file or directory'), true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      assert.strictEqual(detectError(''), false);
    });

    it('should handle whitespace only', () => {
      assert.strictEqual(detectError('   '), false);
      assert.strictEqual(detectError('\n\n\n'), false);
      assert.strictEqual(detectError('\t\t'), false);
    });

    it('should handle null gracefully', () => {
      // In real implementation, this might throw or return false
      // Here we test expected behavior
      try {
        const result = detectError(null);
        assert.strictEqual(typeof result, 'boolean');
      } catch (e) {
        // Also acceptable to throw on null
        assert.ok(true);
      }
    });

    it('should handle very long output', () => {
      const longOutput = 'success '.repeat(1000) + 'error: failure' + ' success'.repeat(1000);
      assert.strictEqual(detectError(longOutput), true);
    });

    it('should handle multiline output with error', () => {
      const multiline = `Line 1: processing
Line 2: processing
Line 3: error: something went wrong
Line 4: cleanup`;
      assert.strictEqual(detectError(multiline), true);
    });

    it('should handle output with special characters', () => {
      assert.strictEqual(detectError('error: file "path/with spaces & special.txt" not found'), true);
      assert.strictEqual(detectError('error: invalid regex pattern: [unclosed'), true);
    });

    it('should handle unicode characters', () => {
      assert.strictEqual(detectError('エラー: error occurred'), true);
      assert.strictEqual(detectError('❌ Error: failed'), true);
    });
  });

  describe('Performance Cases', () => {
    it('should handle repeated patterns efficiently', () => {
      const output = 'error: test\n'.repeat(100);
      const startTime = Date.now();
      const result = detectError(output);
      const duration = Date.now() - startTime;

      assert.strictEqual(result, true);
      assert.ok(duration < 100, `Detection should be fast, took ${duration}ms`);
    });

    it('should short-circuit on first match', () => {
      // First pattern should match immediately
      const output = 'error: immediate match';
      assert.strictEqual(detectError(output), true);
    });
  });
});
} // End of describe block conditional

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Error Detection Tests...\n');

  const tests = [
    // Common patterns
    () => {
      console.log('✓ Detects "error:" keyword');
      assert.strictEqual(detectError('error: command not found'), true);
    },
    () => {
      console.log('✓ Detects "exception:" keyword');
      assert.strictEqual(detectError('Exception: timeout'), true);
    },
    () => {
      console.log('✓ Detects "failed" keyword');
      assert.strictEqual(detectError('operation failed'), true);
    },
    () => {
      console.log('✓ Detects "not found" errors');
      assert.strictEqual(detectError('file not found'), true);
    },
    () => {
      console.log('✓ Detects permission errors');
      assert.strictEqual(detectError('permission denied'), true);
    },
    () => {
      console.log('✓ Detects exit codes');
      assert.strictEqual(detectError('exit code: 1'), true);
      assert.strictEqual(detectError('exit code: 0'), false);
    },
    () => {
      console.log('✓ Case insensitive detection');
      assert.strictEqual(detectError('ERROR: test'), true);
      assert.strictEqual(detectError('error: test'), true);
    },

    // No false positives
    () => {
      console.log('✓ No false positive on success messages');
      assert.strictEqual(detectError('Operation completed successfully'), false);
    },
    () => {
      console.log('✓ No false positive on normal output');
      assert.strictEqual(detectError('Hello World'), false);
    },
    () => {
      console.log('✓ No false positive on word fragments');
      assert.strictEqual(detectError('terrorize'), false);
    },

    // Real world cases
    () => {
      console.log('✓ Real world: bash command not found');
      assert.strictEqual(detectError('bash: kubectl: command not found'), true);
    },
    () => {
      console.log('✓ Real world: Python ModuleNotFoundError');
      assert.strictEqual(detectError('ModuleNotFoundError: No module named \'requests\''), true);
    },
    () => {
      console.log('✓ Real world: Docker error');
      assert.strictEqual(detectError('Error: Cannot connect to Docker daemon'), true);
    },
    () => {
      console.log('✓ Real world: Git fatal error');
      assert.strictEqual(detectError('fatal: not a git repository'), true);
    },
    () => {
      console.log('✓ Real world: HTTP 404');
      assert.strictEqual(detectError('404 Not Found'), true);
    },

    // Edge cases
    () => {
      console.log('✓ Edge case: empty string');
      assert.strictEqual(detectError(''), false);
    },
    () => {
      console.log('✓ Edge case: multiline with error');
      const multiline = 'Line 1\nerror: failed\nLine 3';
      assert.strictEqual(detectError(multiline), true);
    },
    () => {
      console.log('✓ Edge case: special characters');
      assert.strictEqual(detectError('error: file "path with spaces" not found'), true);
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

module.exports = { detectError };
