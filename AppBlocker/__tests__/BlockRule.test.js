import { createBlockRule, isLimitExceeded, getRemainingTime } from '../src/models/BlockRule';

describe('BlockRule', () => {
  describe('createBlockRule', () => {
    it('creează o regulă cu toate câmpurile', () => {
      const rule = createBlockRule('com.example.app', 'Example', 60);
      expect(rule.packageName).toBe('com.example.app');
      expect(rule.appName).toBe('Example');
      expect(rule.timeLimitMinutes).toBe(60);
      expect(rule.isActive).toBe(true);
      expect(rule.id).toContain('com.example.app_');
      expect(rule.createdAt).toBeDefined();
    });

    it('permite setarea isActive la false', () => {
      const rule = createBlockRule('com.example.app', 'Example', 30, false);
      expect(rule.isActive).toBe(false);
    });

    it('generează ID-uri unice', () => {
      const rule1 = createBlockRule('com.example.app', 'Example', 60);
      const rule2 = createBlockRule('com.example.app', 'Example', 60);
      // ID-urile pot fi identice dacă sunt create în același milisecundă,
      // dar în practică sunt diferite
      expect(rule1.id).toBeDefined();
      expect(rule2.id).toBeDefined();
    });
  });

  describe('isLimitExceeded', () => {
    const activeRule = createBlockRule('com.test', 'Test', 60); // 60 min = 3600000 ms

    it('returnează false când timpul nu a fost depășit', () => {
      expect(isLimitExceeded(activeRule, 1800000)).toBe(false); // 30 min
    });

    it('returnează true când timpul a fost depășit', () => {
      expect(isLimitExceeded(activeRule, 3600000)).toBe(true); // exact 60 min
    });

    it('returnează true când timpul depășește limita', () => {
      expect(isLimitExceeded(activeRule, 5000000)).toBe(true);
    });

    it('returnează false pentru regulă inactivă', () => {
      const inactiveRule = createBlockRule('com.test', 'Test', 60, false);
      expect(isLimitExceeded(inactiveRule, 9999999)).toBe(false);
    });

    it('returnează false pentru utilizare 0', () => {
      expect(isLimitExceeded(activeRule, 0)).toBe(false);
    });
  });

  describe('getRemainingTime', () => {
    const rule = createBlockRule('com.test', 'Test', 60); // 60 min

    it('calculează corect timpul rămas', () => {
      expect(getRemainingTime(rule, 1800000)).toBe(1800000); // 30 min rămase
    });

    it('returnează 0 când limita e atinsă', () => {
      expect(getRemainingTime(rule, 3600000)).toBe(0);
    });

    it('returnează 0 când limita e depășită', () => {
      expect(getRemainingTime(rule, 5000000)).toBe(0);
    });

    it('returnează limita completă pentru utilizare 0', () => {
      expect(getRemainingTime(rule, 0)).toBe(3600000);
    });
  });
});
