// Unit tests for popup-multi.js legacy model migration
// Tests ensure users stay with their provider when models are updated

const assert = require('assert');

// Mock AI_PROVIDERS configuration
const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Free - Fast)', default: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Free - Best)' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)' },
      { id: 'gemini-pro', name: 'Gemini Pro (Legacy)' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision (Legacy)' }
    ]
  },
  openai: {
    name: 'OpenAI (GPT-4/GPT-3.5)',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cheap)', default: true },
      { id: 'gpt-4o', name: 'GPT-4o (Best - Multimodal)' },
      { id: 'gpt-4', name: 'GPT-4' }
    ]
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet v2 (Best)', default: true },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast & Affordable)' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Most Capable)' }
    ]
  }
};

// Simulate the model validation logic from popup-multi.js
function validateAndMigrateModel(providerType, savedModelPreference) {
  let modelPreference = savedModelPreference;
  const provider = AI_PROVIDERS[providerType];

  if (!provider) {
    throw new Error(`Unknown provider: ${providerType}`);
  }

  if (modelPreference && provider.models && provider.models.length > 0) {
    // Check if saved model exists in current provider's models
    const modelExists = provider.models.some(m => m.id === modelPreference);

    if (!modelExists) {
      // Saved model no longer exists, use default model instead
      console.warn(`Saved model "${modelPreference}" not found in ${providerType} models. Using default.`);
      const defaultModel = provider.models.find(m => m.default);
      modelPreference = defaultModel ? defaultModel.id : provider.models[0].id;
    }
  }

  return {
    provider: providerType,
    originalModel: savedModelPreference,
    migratedModel: modelPreference,
    wasMigrated: savedModelPreference !== modelPreference
  };
}

// Only define describe blocks if a test framework is available
if (typeof describe === 'function') {
describe('Legacy Model Migration Tests', () => {

  describe('Gemini Provider', () => {
    it('should keep valid Gemini models unchanged', () => {
      const result = validateAndMigrateModel('gemini', 'gemini-1.5-flash');
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.migratedModel, 'gemini-1.5-flash');
      assert.strictEqual(result.wasMigrated, false);
    });

    it('should migrate Gemini legacy models to default (gemini-1.5-flash)', () => {
      // Test with a hypothetical old model ID that was removed
      const result = validateAndMigrateModel('gemini', 'gemini-old-model');
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.originalModel, 'gemini-old-model');
      assert.strictEqual(result.migratedModel, 'gemini-1.5-flash');
      assert.strictEqual(result.wasMigrated, true);
    });

    it('should keep user on Gemini provider after migration', () => {
      const result = validateAndMigrateModel('gemini', 'some-removed-model');
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(AI_PROVIDERS[result.provider].name, 'Google Gemini');
    });

    it('should use provider-specific default (not another provider\'s default)', () => {
      const result = validateAndMigrateModel('gemini', 'invalid-model');
      const geminiDefault = AI_PROVIDERS.gemini.models.find(m => m.default);
      assert.strictEqual(result.migratedModel, geminiDefault.id);
      assert.strictEqual(result.migratedModel, 'gemini-1.5-flash');
    });
  });

  describe('OpenAI Provider', () => {
    it('should keep valid OpenAI models unchanged', () => {
      const result = validateAndMigrateModel('openai', 'gpt-4o');
      assert.strictEqual(result.provider, 'openai');
      assert.strictEqual(result.migratedModel, 'gpt-4o');
      assert.strictEqual(result.wasMigrated, false);
    });

    it('should migrate OpenAI legacy models to default (gpt-4o-mini)', () => {
      // Simulate gpt-3.5-turbo being removed
      const result = validateAndMigrateModel('openai', 'gpt-3.5-turbo-removed');
      assert.strictEqual(result.provider, 'openai');
      assert.strictEqual(result.migratedModel, 'gpt-4o-mini');
      assert.strictEqual(result.wasMigrated, true);
    });

    it('should keep user on OpenAI provider after migration', () => {
      const result = validateAndMigrateModel('openai', 'old-gpt-model');
      assert.strictEqual(result.provider, 'openai');
      assert.strictEqual(AI_PROVIDERS[result.provider].name, 'OpenAI (GPT-4/GPT-3.5)');
    });
  });

  describe('Claude Provider', () => {
    it('should keep valid Claude models unchanged', () => {
      const result = validateAndMigrateModel('claude', 'claude-3-opus-20240229');
      assert.strictEqual(result.provider, 'claude');
      assert.strictEqual(result.migratedModel, 'claude-3-opus-20240229');
      assert.strictEqual(result.wasMigrated, false);
    });

    it('should migrate Claude legacy models to default (claude-3-5-sonnet-20241022)', () => {
      const result = validateAndMigrateModel('claude', 'claude-2.1');
      assert.strictEqual(result.provider, 'claude');
      assert.strictEqual(result.migratedModel, 'claude-3-5-sonnet-20241022');
      assert.strictEqual(result.wasMigrated, true);
    });

    it('should keep user on Claude provider after migration', () => {
      const result = validateAndMigrateModel('claude', 'old-claude-model');
      assert.strictEqual(result.provider, 'claude');
      assert.strictEqual(AI_PROVIDERS[result.provider].name, 'Claude (Anthropic)');
    });
  });

  describe('Provider Isolation', () => {
    it('should not mix defaults between providers', () => {
      const geminiResult = validateAndMigrateModel('gemini', 'invalid-model');
      const openaiResult = validateAndMigrateModel('openai', 'invalid-model');
      const claudeResult = validateAndMigrateModel('claude', 'invalid-model');

      // Each should get their own provider's default, not each other's
      assert.strictEqual(geminiResult.migratedModel, 'gemini-1.5-flash');
      assert.strictEqual(openaiResult.migratedModel, 'gpt-4o-mini');
      assert.strictEqual(claudeResult.migratedModel, 'claude-3-5-sonnet-20241022');

      // Verify no cross-contamination
      assert.notStrictEqual(geminiResult.migratedModel, openaiResult.migratedModel);
      assert.notStrictEqual(openaiResult.migratedModel, claudeResult.migratedModel);
      assert.notStrictEqual(claudeResult.migratedModel, geminiResult.migratedModel);
    });

    it('should maintain provider identity through migration', () => {
      const providers = ['gemini', 'openai', 'claude'];
      const invalidModel = 'totally-fake-model-123';

      providers.forEach(providerType => {
        const result = validateAndMigrateModel(providerType, invalidModel);
        assert.strictEqual(result.provider, providerType,
          `Provider should remain ${providerType}`);
        assert.strictEqual(result.wasMigrated, true,
          `Model should be migrated for ${providerType}`);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null model preference', () => {
      const result = validateAndMigrateModel('gemini', null);
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.migratedModel, null);
      assert.strictEqual(result.wasMigrated, false);
    });

    it('should handle undefined model preference', () => {
      const result = validateAndMigrateModel('gemini', undefined);
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.migratedModel, undefined);
      assert.strictEqual(result.wasMigrated, false);
    });

    it('should handle empty string model preference', () => {
      const result = validateAndMigrateModel('gemini', '');
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.migratedModel, '');
      assert.strictEqual(result.wasMigrated, false);
    });

    it('should throw error for invalid provider', () => {
      assert.throws(
        () => validateAndMigrateModel('invalid-provider', 'some-model'),
        /Unknown provider/
      );
    });
  });

  describe('Regression Tests - Specific Gemini Case', () => {
    it('should migrate old gemini-pro to gemini-1.5-flash if gemini-pro was removed', () => {
      // Note: gemini-pro is currently still in the list as Legacy
      // This test simulates if it were removed in a future update

      // Remove gemini-pro temporarily for this test
      const originalModels = [...AI_PROVIDERS.gemini.models];
      AI_PROVIDERS.gemini.models = AI_PROVIDERS.gemini.models.filter(
        m => m.id !== 'gemini-pro' && m.id !== 'gemini-pro-vision'
      );

      const result = validateAndMigrateModel('gemini', 'gemini-pro');
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.migratedModel, 'gemini-1.5-flash');
      assert.strictEqual(result.wasMigrated, true);

      // Restore original models
      AI_PROVIDERS.gemini.models = originalModels;
    });

    it('should keep gemini-pro if it still exists (current state)', () => {
      // Current state: gemini-pro is still in the list
      const result = validateAndMigrateModel('gemini', 'gemini-pro');
      assert.strictEqual(result.provider, 'gemini');
      assert.strictEqual(result.migratedModel, 'gemini-pro');
      assert.strictEqual(result.wasMigrated, false);
    });
  });
});
} // End of describe block conditional

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Legacy Model Migration Tests...\n');

  const tests = [
    // Gemini tests
    () => {
      console.log('✓ Gemini: keeps valid models unchanged');
      const result = validateAndMigrateModel('gemini', 'gemini-1.5-flash');
      assert.strictEqual(result.wasMigrated, false);
    },
    () => {
      console.log('✓ Gemini: migrates invalid models to default');
      const result = validateAndMigrateModel('gemini', 'invalid-model');
      assert.strictEqual(result.migratedModel, 'gemini-1.5-flash');
    },
    () => {
      console.log('✓ OpenAI: keeps valid models unchanged');
      const result = validateAndMigrateModel('openai', 'gpt-4o');
      assert.strictEqual(result.wasMigrated, false);
    },
    () => {
      console.log('✓ OpenAI: migrates invalid models to default');
      const result = validateAndMigrateModel('openai', 'invalid-model');
      assert.strictEqual(result.migratedModel, 'gpt-4o-mini');
    },
    () => {
      console.log('✓ Claude: keeps valid models unchanged');
      const result = validateAndMigrateModel('claude', 'claude-3-opus-20240229');
      assert.strictEqual(result.wasMigrated, false);
    },
    () => {
      console.log('✓ Claude: migrates invalid models to default');
      const result = validateAndMigrateModel('claude', 'invalid-model');
      assert.strictEqual(result.migratedModel, 'claude-3-5-sonnet-20241022');
    },
    () => {
      console.log('✓ Provider isolation: no mixing of defaults');
      const geminiResult = validateAndMigrateModel('gemini', 'invalid');
      const openaiResult = validateAndMigrateModel('openai', 'invalid');
      const claudeResult = validateAndMigrateModel('claude', 'invalid');
      assert.notStrictEqual(geminiResult.migratedModel, openaiResult.migratedModel);
      assert.notStrictEqual(openaiResult.migratedModel, claudeResult.migratedModel);
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

module.exports = { validateAndMigrateModel };
