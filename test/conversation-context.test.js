// Unit tests for conversation context management in background.js
// Tests ensure the extension maintains conversational context across multiple attempts

const assert = require('assert');

/**
 * Builds conversation context section from history
 * This is the core logic from background.js that we're testing
 */
function buildConversationContext(conversationHistory) {
  let contextSection = '';
  if (conversationHistory.length > 0) {
    contextSection = '\n\n## Previous Attempts (learn from these!):\n';
    conversationHistory.forEach((attempt, index) => {
      contextSection += `\nAttempt ${index + 1}:\n`;
      contextSection += `Script tried:\n${attempt.code}\n`;
      contextSection += `Result/Error:\n${attempt.output}\n`;
      contextSection += `Improvement made:\n${attempt.improved}\n`;
      contextSection += `---\n`;
    });
    contextSection += '\nThe code is STILL failing. Learn from previous attempts and try a DIFFERENT approach.\n';
  }
  return contextSection;
}

/**
 * Builds the complete prompt with conversation awareness
 * Mirrors the logic from background.js handleAnalyzeOutput()
 */
function buildPromptWithContext(output, code, conversationHistory = []) {
  const contextSection = buildConversationContext(conversationHistory);

  const prompt = `You are helping debug a command or code that ${conversationHistory.length > 0 ? 'is STILL failing after ' + conversationHistory.length + ' attempts' : 'may have failed or produced unexpected output'}.
${contextSection}

## Current Attempt:
${code ? `Current Script:\n${code}\n\n` : ''}Latest Output/Error:
${output}

${conversationHistory.length > 0 ?
  'IMPORTANT: The previous approaches did NOT work. Try a COMPLETELY DIFFERENT solution. Consider:\n' +
  '- Different tools or commands\n' +
  '- Alternative logic or approach\n' +
  '- Checking different error conditions\n' +
  '- Using different syntax or methods\n\n'
  : ''}Provide ONLY the improved code with no explanation, ready to run immediately.
Focus on:
- Fixing any errors shown in the output
- Adding better error handling
- Improving efficiency and reliability
- Making the code more robust
${conversationHistory.length > 0 ? '- Using a DIFFERENT approach than previous attempts' : ''}

Return only the executable code code, nothing else.`;

  return prompt;
}

/**
 * Counts how many times a substring appears in a string
 */
function countOccurrences(str, substring) {
  return (str.match(new RegExp(substring, 'g')) || []).length;
}

// Only define describe blocks if a test framework is available
if (typeof describe === 'function') {
describe('Conversation Context Management', () => {

  describe('Context Building - No History', () => {
    it('should return empty context when history is empty', () => {
      const context = buildConversationContext([]);
      assert.strictEqual(context, '');
    });

    it('should not mention "STILL failing" when no history exists', () => {
      const prompt = buildPromptWithContext('error: command not found', 'rm -rf /tmp/test', []);
      assert.ok(!prompt.includes('STILL failing'));
      assert.ok(!prompt.includes('previous attempts'));
    });

    it('should use gentle language for first attempt', () => {
      const prompt = buildPromptWithContext('error: file not found', 'cat missing.txt', []);
      assert.ok(prompt.includes('may have failed or produced unexpected output'));
    });

    it('should not include "DIFFERENT approach" section for first attempt', () => {
      const prompt = buildPromptWithContext('error', 'code', []);
      assert.ok(!prompt.includes('COMPLETELY DIFFERENT solution'));
    });
  });

  describe('Context Building - Single Attempt', () => {
    it('should include previous attempt details', () => {
      const history = [{
        code: 'ls /nonexistent',
        output: 'ls: cannot access',
        improved: 'ls -la /tmp'
      }];

      const context = buildConversationContext(history);
      assert.ok(context.includes('Previous Attempts'));
      assert.ok(context.includes('Attempt 1:'));
      assert.ok(context.includes('ls /nonexistent'));
      assert.ok(context.includes('ls: cannot access'));
      assert.ok(context.includes('ls -la /tmp'));
    });

    it('should indicate urgency after 1 attempt', () => {
      const history = [{
        code: 'test1',
        output: 'error1',
        improved: 'improved1'
      }];

      const prompt = buildPromptWithContext('error2', 'test2', history);
      assert.ok(prompt.includes('is STILL failing after 1 attempts'));
    });

    it('should suggest trying different approach after 1 attempt', () => {
      const history = [{
        code: 'test',
        output: 'error',
        improved: 'improved'
      }];

      const prompt = buildPromptWithContext('error', 'test', history);
      assert.ok(prompt.includes('COMPLETELY DIFFERENT solution'));
      assert.ok(prompt.includes('Different tools or commands'));
    });

    it('should end context with learning message', () => {
      const history = [{
        code: 'test',
        output: 'error',
        improved: 'improved'
      }];

      const context = buildConversationContext(history);
      assert.ok(context.includes('Learn from previous attempts and try a DIFFERENT approach'));
    });
  });

  describe('Context Building - Multiple Attempts', () => {
    it('should include all attempts in order', () => {
      const history = [
        { code: 'attempt1', output: 'error1', improved: 'fix1' },
        { code: 'attempt2', output: 'error2', improved: 'fix2' },
        { code: 'attempt3', output: 'error3', improved: 'fix3' }
      ];

      const context = buildConversationContext(history);
      assert.ok(context.includes('Attempt 1:'));
      assert.ok(context.includes('Attempt 2:'));
      assert.ok(context.includes('Attempt 3:'));
      assert.ok(context.includes('attempt1'));
      assert.ok(context.includes('attempt2'));
      assert.ok(context.includes('attempt3'));
    });

    it('should show increasing urgency with more attempts', () => {
      const history = [
        { code: 't1', output: 'e1', improved: 'i1' },
        { code: 't2', output: 'e2', improved: 'i2' },
        { code: 't3', output: 'e3', improved: 'i3' }
      ];

      const prompt = buildPromptWithContext('error4', 'test4', history);
      assert.ok(prompt.includes('is STILL failing after 3 attempts'));
    });

    it('should maintain attempt numbering correctly', () => {
      const history = [
        { code: 't1', output: 'e1', improved: 'i1' },
        { code: 't2', output: 'e2', improved: 'i2' },
        { code: 't3', output: 'e3', improved: 'i3' },
        { code: 't4', output: 'e4', improved: 'i4' },
        { code: 't5', output: 'e5', improved: 'i5' }
      ];

      const context = buildConversationContext(history);
      // Note: "Attempt" appears in attempt numbers + in "Learn from previous attempts" message
      assert.ok(countOccurrences(context, 'Attempt') >= 5);
      assert.ok(context.includes('Attempt 1:'));
      assert.ok(context.includes('Attempt 5:'));
    });

    it('should separate attempts with dividers', () => {
      const history = [
        { code: 't1', output: 'e1', improved: 'i1' },
        { code: 't2', output: 'e2', improved: 'i2' }
      ];

      const context = buildConversationContext(history);
      // Should have dividers between attempts
      assert.strictEqual(countOccurrences(context, '---'), 2);
    });
  });

  describe('Prompt Structure Validation', () => {
    it('should include all required sections with no history', () => {
      const prompt = buildPromptWithContext('error message', 'echo test', []);
      assert.ok(prompt.includes('## Current Attempt:'));
      assert.ok(prompt.includes('Current Script:'));
      assert.ok(prompt.includes('Latest Output/Error:'));
      assert.ok(prompt.includes('Provide ONLY the improved code'));
    });

    it('should include all required sections with history', () => {
      const history = [{ code: 't', output: 'e', improved: 'i' }];
      const prompt = buildPromptWithContext('error', 'code', history);
      assert.ok(prompt.includes('## Previous Attempts'));
      assert.ok(prompt.includes('## Current Attempt:'));
      assert.ok(prompt.includes('IMPORTANT: The previous approaches did NOT work'));
    });

    it('should include current code in prompt', () => {
      const code = 'ls -la /home/user/documents';
      const prompt = buildPromptWithContext('error', code, []);
      assert.ok(prompt.includes(code));
    });

    it('should include current error/output in prompt', () => {
      const output = 'bash: command not found: nonexistent-command';
      const prompt = buildPromptWithContext(output, 'code', []);
      assert.ok(prompt.includes(output));
    });

    it('should handle codes with special characters', () => {
      const code = 'grep "pattern" file.txt | awk \'{print $1}\'';
      const prompt = buildPromptWithContext('error', code, []);
      assert.ok(prompt.includes(code));
    });

    it('should handle multiline codes', () => {
      const code = 'for file in *.txt\ndo\n  cat "$file"\ndone';
      const prompt = buildPromptWithContext('error', code, []);
      assert.ok(prompt.includes(code));
    });
  });

  describe('Learning Instructions', () => {
    it('should not include "DIFFERENT approach" for first attempt', () => {
      const prompt = buildPromptWithContext('error', 'code', []);
      assert.ok(!prompt.includes('Using a DIFFERENT approach than previous attempts'));
    });

    it('should emphasize DIFFERENT approach after failures', () => {
      const history = [
        { code: 'approach1', output: 'failed', improved: 'fix1' },
        { code: 'approach2', output: 'failed', improved: 'fix2' }
      ];

      const prompt = buildPromptWithContext('still failing', 'approach3', history);
      assert.ok(prompt.includes('Using a DIFFERENT approach than previous attempts'));
      assert.ok(prompt.includes('Different tools or commands'));
      assert.ok(prompt.includes('Alternative logic or approach'));
    });

    it('should provide specific guidance after multiple failures', () => {
      const history = [
        { code: 't1', output: 'e1', improved: 'i1' },
        { code: 't2', output: 'e2', improved: 'i2' }
      ];

      const prompt = buildPromptWithContext('e3', 't3', history);
      assert.ok(prompt.includes('Different tools or commands'));
      assert.ok(prompt.includes('Alternative logic or approach'));
      assert.ok(prompt.includes('Checking different error conditions'));
      assert.ok(prompt.includes('Using different syntax or methods'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty code', () => {
      const prompt = buildPromptWithContext('error', '', []);
      assert.ok(prompt.includes('Latest Output/Error:'));
      assert.ok(!prompt.includes('Current Script:\n\n'));
    });

    it('should handle null code', () => {
      const prompt = buildPromptWithContext('error', null, []);
      assert.ok(prompt.includes('Latest Output/Error:'));
    });

    it('should handle undefined code', () => {
      const prompt = buildPromptWithContext('error', undefined, []);
      assert.ok(prompt.includes('Latest Output/Error:'));
    });

    it('should handle very long history (10+ attempts)', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        code: `attempt${i + 1}`,
        output: `error${i + 1}`,
        improved: `fix${i + 1}`
      }));

      const context = buildConversationContext(history);
      assert.ok(context.includes('Attempt 1:'));
      assert.ok(context.includes('Attempt 15:'));
      // "Attempt" appears in attempt numbers + in "Learn from previous attempts" message
      assert.ok(countOccurrences(context, 'Attempt') >= 15);
    });

    it('should handle history entries with missing fields gracefully', () => {
      const history = [
        { code: 'test', output: '', improved: 'fix' },
        { code: '', output: 'error', improved: '' }
      ];

      const context = buildConversationContext(history);
      assert.ok(context.includes('Attempt 1:'));
      assert.ok(context.includes('Attempt 2:'));
    });

    it('should handle special characters in history', () => {
      const history = [{
        code: 'grep "pattern with $special & chars"',
        output: 'error: "quotes" and \'apostrophes\'',
        improved: 'grep -F "pattern with $special & chars"'
      }];

      const context = buildConversationContext(history);
      assert.ok(context.includes('$special'));
      assert.ok(context.includes('&'));
      assert.ok(context.includes('"quotes"'));
    });
  });

  describe('Context Consistency', () => {
    it('should produce same output for same input', () => {
      const history = [
        { code: 't1', output: 'e1', improved: 'i1' }
      ];

      const context1 = buildConversationContext(history);
      const context2 = buildConversationContext(history);
      assert.strictEqual(context1, context2);
    });

    it('should maintain order of attempts', () => {
      const history = [
        { code: 'first', output: 'e1', improved: 'i1' },
        { code: 'second', output: 'e2', improved: 'i2' },
        { code: 'third', output: 'e3', improved: 'i3' }
      ];

      const context = buildConversationContext(history);
      const firstIndex = context.indexOf('first');
      const secondIndex = context.indexOf('second');
      const thirdIndex = context.indexOf('third');

      assert.ok(firstIndex < secondIndex);
      assert.ok(secondIndex < thirdIndex);
    });

    it('should include all history details for each attempt', () => {
      const history = [{
        code: 'my-code-command',
        output: 'specific-error-output',
        improved: 'improved-code-version'
      }];

      const context = buildConversationContext(history);
      assert.ok(context.includes('my-code-command'));
      assert.ok(context.includes('specific-error-output'));
      assert.ok(context.includes('improved-code-version'));
    });
  });

  describe('Regression Tests - Real World Scenarios', () => {
    it('should handle bash permission denied scenario', () => {
      const history = [
        {
          code: 'rm /etc/important-file',
          output: 'rm: cannot remove: Permission denied',
          improved: 'sudo rm /etc/important-file'
        },
        {
          code: 'sudo rm /etc/important-file',
          output: 'rm: cannot remove: Read-only file system',
          improved: 'sudo mount -o remount,rw / && sudo rm /etc/important-file'
        }
      ];

      const prompt = buildPromptWithContext(
        'mount: /: permission denied',
        'sudo mount -o remount,rw / && sudo rm /etc/important-file',
        history
      );

      assert.ok(prompt.includes('is STILL failing after 2 attempts'));
      assert.ok(prompt.includes('Permission denied'));
      assert.ok(prompt.includes('Read-only file system'));
      assert.ok(prompt.includes('COMPLETELY DIFFERENT solution'));
    });

    it('should handle Python import error scenario', () => {
      const history = [{
        code: 'python code.py',
        output: 'ModuleNotFoundError: No module named \'requests\'',
        improved: 'pip install requests && python code.py'
      }];

      const context = buildConversationContext(history);
      assert.ok(context.includes('ModuleNotFoundError'));
      assert.ok(context.includes('pip install requests'));
    });

    it('should handle Docker network issue scenario', () => {
      const history = [
        {
          code: 'docker run myapp',
          output: 'Error: Cannot connect to Docker daemon',
          improved: 'sudo systemctl start docker && docker run myapp'
        },
        {
          code: 'sudo systemctl start docker && docker run myapp',
          output: 'Error: port 8080 already in use',
          improved: 'docker run -p 8081:8080 myapp'
        }
      ];

      const prompt = buildPromptWithContext(
        'Error: Failed to pull image',
        'docker run -p 8081:8080 myapp',
        history
      );

      assert.ok(prompt.includes('Attempt 1:'));
      assert.ok(prompt.includes('Attempt 2:'));
      assert.ok(prompt.includes('Docker daemon'));
      assert.ok(prompt.includes('port 8080 already in use'));
    });
  });
});
} // End of describe block conditional

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Conversation Context Tests...\n');

  const tests = [
    // No history tests
    () => {
      console.log('✓ No history: returns empty context');
      assert.strictEqual(buildConversationContext([]), '');
    },
    () => {
      console.log('✓ No history: uses gentle first-attempt language');
      const prompt = buildPromptWithContext('error', 'code', []);
      assert.ok(!prompt.includes('STILL failing'));
    },

    // Single attempt tests
    () => {
      console.log('✓ Single attempt: includes previous details');
      const history = [{ code: 'test', output: 'error', improved: 'fix' }];
      const context = buildConversationContext(history);
      assert.ok(context.includes('Attempt 1:'));
      assert.ok(context.includes('test'));
    },
    () => {
      console.log('✓ Single attempt: shows urgency');
      const history = [{ code: 't', output: 'e', improved: 'i' }];
      const prompt = buildPromptWithContext('e2', 't2', history);
      assert.ok(prompt.includes('STILL failing after 1 attempts'));
    },

    // Multiple attempts tests
    () => {
      console.log('✓ Multiple attempts: maintains order');
      const history = [
        { code: 'first', output: 'e1', improved: 'i1' },
        { code: 'second', output: 'e2', improved: 'i2' }
      ];
      const context = buildConversationContext(history);
      assert.ok(context.indexOf('first') < context.indexOf('second'));
    },
    () => {
      console.log('✓ Multiple attempts: includes all attempts');
      const history = [
        { code: 't1', output: 'e1', improved: 'i1' },
        { code: 't2', output: 'e2', improved: 'i2' },
        { code: 't3', output: 'e3', improved: 'i3' }
      ];
      const context = buildConversationContext(history);
      // "Attempt" appears in attempt numbers + "previous attempts" message
      assert.ok(countOccurrences(context, 'Attempt') >= 3);
    },

    // Learning instructions
    () => {
      console.log('✓ Learning: emphasizes different approach after failures');
      const history = [{ code: 't', output: 'e', improved: 'i' }];
      const prompt = buildPromptWithContext('e', 't', history);
      assert.ok(prompt.includes('COMPLETELY DIFFERENT solution'));
    },

    // Edge cases
    () => {
      console.log('✓ Edge case: handles empty code');
      const prompt = buildPromptWithContext('error', '', []);
      assert.ok(prompt.includes('Latest Output/Error:'));
    },
    () => {
      console.log('✓ Edge case: handles very long history');
      const history = Array.from({ length: 10 }, (_, i) => ({
        code: `t${i}`, output: `e${i}`, improved: `i${i}`
      }));
      const context = buildConversationContext(history);
      assert.ok(countOccurrences(context, 'Attempt') >= 10);
    },

    // Real world scenario
    () => {
      console.log('✓ Real world: handles permission denied scenario');
      const history = [{
        code: 'rm file',
        output: 'Permission denied',
        improved: 'sudo rm file'
      }];
      const context = buildConversationContext(history);
      assert.ok(context.includes('Permission denied'));
      assert.ok(context.includes('sudo rm file'));
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

module.exports = { buildConversationContext, buildPromptWithContext, countOccurrences };
