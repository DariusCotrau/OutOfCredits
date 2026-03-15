import {
  saveBlockRules,
  loadBlockRules,
  addBlockRule,
  removeBlockRule,
  updateBlockRule,
  clearAllRules,
} from '../src/services/StorageService';
import { createBlockRule } from '../src/models/BlockRule';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
      return Promise.resolve(store[key] || null);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
    __getStore: () => store,
    __resetStore: () => { store = {}; },
  };
});

const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('StorageService', () => {
  beforeEach(() => {
    AsyncStorage.__resetStore();
    jest.clearAllMocks();
  });

  describe('loadBlockRules', () => {
    it('returnează array gol când nu există date', async () => {
      const rules = await loadBlockRules();
      expect(rules).toEqual([]);
    });

    it('returnează regulile salvate', async () => {
      const mockRules = [createBlockRule('com.test', 'Test', 60)];
      await saveBlockRules(mockRules);
      const rules = await loadBlockRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].packageName).toBe('com.test');
    });
  });

  describe('addBlockRule', () => {
    it('adaugă o regulă nouă', async () => {
      const rule = createBlockRule('com.test', 'Test', 60);
      const rules = await addBlockRule(rule);
      expect(rules).toHaveLength(1);
      expect(rules[0].packageName).toBe('com.test');
    });

    it('adaugă la regulile existente', async () => {
      const rule1 = createBlockRule('com.test1', 'Test1', 60);
      const rule2 = createBlockRule('com.test2', 'Test2', 30);
      await addBlockRule(rule1);
      const rules = await addBlockRule(rule2);
      expect(rules).toHaveLength(2);
    });
  });

  describe('removeBlockRule', () => {
    it('șterge o regulă după ID', async () => {
      const rule = createBlockRule('com.test', 'Test', 60);
      await addBlockRule(rule);
      const rules = await removeBlockRule(rule.id);
      expect(rules).toHaveLength(0);
    });

    it('nu afectează alte reguli', async () => {
      const rule1 = createBlockRule('com.test1', 'Test1', 60);
      const rule2 = createBlockRule('com.test2', 'Test2', 30);
      await addBlockRule(rule1);
      await addBlockRule(rule2);
      const rules = await removeBlockRule(rule1.id);
      expect(rules).toHaveLength(1);
      expect(rules[0].packageName).toBe('com.test2');
    });
  });

  describe('updateBlockRule', () => {
    it('actualizează câmpurile specificate', async () => {
      const rule = createBlockRule('com.test', 'Test', 60);
      await addBlockRule(rule);
      const rules = await updateBlockRule(rule.id, { timeLimitMinutes: 120 });
      expect(rules[0].timeLimitMinutes).toBe(120);
      expect(rules[0].packageName).toBe('com.test');
    });

    it('aruncă eroare dacă regula nu există', async () => {
      await expect(
        updateBlockRule('nonexistent_id', { timeLimitMinutes: 120 })
      ).rejects.toThrow('not found');
    });
  });

  describe('clearAllRules', () => {
    it('șterge toate regulile', async () => {
      await addBlockRule(createBlockRule('com.test', 'Test', 60));
      await clearAllRules();
      const rules = await loadBlockRules();
      expect(rules).toEqual([]);
    });
  });
});
