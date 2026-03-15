import { validateTimeLimit, validatePackageName, validateBlockRuleInput } from '../src/utils/validation';

describe('validation', () => {
  describe('validateTimeLimit', () => {
    it('acceptă valori valide', () => {
      expect(validateTimeLimit(60).valid).toBe(true);
      expect(validateTimeLimit(1).valid).toBe(true);
      expect(validateTimeLimit(1440).valid).toBe(true);
    });

    it('respinge valori non-numerice', () => {
      expect(validateTimeLimit('abc').valid).toBe(false);
      expect(validateTimeLimit(null).valid).toBe(false);
      expect(validateTimeLimit(NaN).valid).toBe(false);
    });

    it('respinge valori non-întregi', () => {
      expect(validateTimeLimit(30.5).valid).toBe(false);
    });

    it('respinge valori sub minim', () => {
      expect(validateTimeLimit(0).valid).toBe(false);
      expect(validateTimeLimit(-10).valid).toBe(false);
    });

    it('respinge valori peste maxim', () => {
      expect(validateTimeLimit(1441).valid).toBe(false);
    });
  });

  describe('validatePackageName', () => {
    it('acceptă pachete valide', () => {
      expect(validatePackageName('com.example.app').valid).toBe(true);
      expect(validatePackageName('com.instagram.android').valid).toBe(true);
    });

    it('respinge pachete invalide', () => {
      expect(validatePackageName('').valid).toBe(false);
      expect(validatePackageName(null).valid).toBe(false);
      expect(validatePackageName('singleword').valid).toBe(false);
      expect(validatePackageName('.starts.with.dot').valid).toBe(false);
    });
  });

  describe('validateBlockRuleInput', () => {
    it('acceptă input valid', () => {
      const result = validateBlockRuleInput('com.test.app', 'Test App', 60);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('colectează toate erorile', () => {
      const result = validateBlockRuleInput('', '', -5);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
