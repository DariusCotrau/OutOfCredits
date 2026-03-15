import { formatTime, minutesToMs, msToMinutes, getUsagePercentage } from '../src/utils/timeUtils';

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('formatează doar minute', () => {
      expect(formatTime(300000)).toBe('5m'); // 5 min
    });

    it('formatează doar ore', () => {
      expect(formatTime(7200000)).toBe('2h'); // 2 ore
    });

    it('formatează ore și minute', () => {
      expect(formatTime(5400000)).toBe('1h 30m'); // 1.5 ore
    });

    it('formatează 0 milisecunde', () => {
      expect(formatTime(0)).toBe('0m');
    });

    it('rotunjește în jos minutele', () => {
      expect(formatTime(90000)).toBe('1m'); // 1.5 min -> 1m
    });
  });

  describe('minutesToMs', () => {
    it('convertește corect', () => {
      expect(minutesToMs(1)).toBe(60000);
      expect(minutesToMs(60)).toBe(3600000);
      expect(minutesToMs(0)).toBe(0);
    });
  });

  describe('msToMinutes', () => {
    it('convertește corect cu rotunjire în jos', () => {
      expect(msToMinutes(60000)).toBe(1);
      expect(msToMinutes(90000)).toBe(1);
      expect(msToMinutes(3600000)).toBe(60);
      expect(msToMinutes(0)).toBe(0);
    });
  });

  describe('getUsagePercentage', () => {
    it('calculează procentul corect', () => {
      expect(getUsagePercentage(1800000, 3600000)).toBe(50);
    });

    it('nu depășește 100%', () => {
      expect(getUsagePercentage(5000000, 3600000)).toBe(100);
    });

    it('returnează 0 pentru utilizare 0', () => {
      expect(getUsagePercentage(0, 3600000)).toBe(0);
    });

    it('returnează 100 când limita e 0', () => {
      expect(getUsagePercentage(1000, 0)).toBe(100);
    });

    it('rotunjește procentul', () => {
      expect(getUsagePercentage(1000000, 3600000)).toBe(28);
    });
  });
});
