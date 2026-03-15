import { getBlockStatus, activateBlocking, deactivateBlocking, isBlockingActive } from '../src/services/BlockerManager';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn((key, value) => { store[key] = value; return Promise.resolve(); }),
    getItem: jest.fn((key) => Promise.resolve(store[key] || null)),
    removeItem: jest.fn((key) => { delete store[key]; return Promise.resolve(); }),
    __resetStore: () => { store = {}; },
  };
});

jest.mock('../src/native/AppUsageBridge', () => ({
  getTodayUsageStats: jest.fn(() => Promise.resolve([
    { packageName: 'com.test.app1', appName: 'App1', totalTimeInForeground: 1800000 }, // 30 min
    { packageName: 'com.test.app2', appName: 'App2', totalTimeInForeground: 7200000 }, // 120 min
  ])),
}));

jest.mock('../src/native/BlockerServiceBridge', () => ({
  startBlocking: jest.fn(() => Promise.resolve(true)),
  stopBlocking: jest.fn(() => Promise.resolve(true)),
  isServiceRunning: jest.fn(() => Promise.resolve(false)),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { startBlocking, stopBlocking, isServiceRunning } = require('../src/native/BlockerServiceBridge');
const { addBlockRule } = require('../src/services/StorageService');
const { createBlockRule } = require('../src/models/BlockRule');

describe('BlockerManager', () => {
  beforeEach(() => {
    AsyncStorage.__resetStore();
    jest.clearAllMocks();
  });

  describe('getBlockStatus', () => {
    it('returnează status gol fără reguli', async () => {
      const status = await getBlockStatus();
      expect(status).toEqual([]);
    });

    it('calculează status corect pentru reguli active', async () => {
      await addBlockRule(createBlockRule('com.test.app1', 'App1', 60)); // limită 60 min, folosit 30 min
      const status = await getBlockStatus();

      expect(status).toHaveLength(1);
      expect(status[0].usedTimeMs).toBe(1800000);
      expect(status[0].isExceeded).toBe(false);
      expect(status[0].remainingMs).toBe(1800000);
    });

    it('detectează reguli depășite', async () => {
      await addBlockRule(createBlockRule('com.test.app2', 'App2', 60)); // limită 60 min, folosit 120 min
      const status = await getBlockStatus();

      expect(status[0].isExceeded).toBe(true);
      expect(status[0].remainingMs).toBe(0);
    });
  });

  describe('activateBlocking', () => {
    it('pornește serviciul nativ', async () => {
      await addBlockRule(createBlockRule('com.test.app1', 'App1', 60));
      await activateBlocking();
      expect(startBlocking).toHaveBeenCalledWith(['com.test.app1'], 60);
    });

    it('aruncă eroare fără reguli active', async () => {
      await expect(activateBlocking()).rejects.toThrow('Nu există reguli active');
    });

    it('folosește limita minimă din regulile active', async () => {
      await addBlockRule(createBlockRule('com.test.app1', 'App1', 60));
      await addBlockRule(createBlockRule('com.test.app2', 'App2', 30));
      await activateBlocking();
      expect(startBlocking).toHaveBeenCalledWith(
        expect.arrayContaining(['com.test.app1', 'com.test.app2']),
        30
      );
    });
  });

  describe('deactivateBlocking', () => {
    it('oprește serviciul nativ', async () => {
      await deactivateBlocking();
      expect(stopBlocking).toHaveBeenCalled();
    });
  });

  describe('isBlockingActive', () => {
    it('returnează starea serviciului', async () => {
      isServiceRunning.mockResolvedValueOnce(true);
      expect(await isBlockingActive()).toBe(true);

      isServiceRunning.mockResolvedValueOnce(false);
      expect(await isBlockingActive()).toBe(false);
    });
  });
});
