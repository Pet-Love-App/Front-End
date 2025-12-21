import { fontFamily, fontWeight, fontSize, lineHeight } from '../typography';

describe('Typography Tokens', () => {
  describe('fontFamily', () => {
    it('should have correct font families', () => {
      expect(fontFamily.sans).toBe('System');
      expect(fontFamily.brand).toBe('MaoKen');
    });
  });

  describe('fontWeight', () => {
    it('should have correct font weights', () => {
      expect(fontWeight.normal).toBe('400');
      expect(fontWeight.bold).toBe('700');
    });
  });

  describe('fontSize', () => {
    it('should have correct font sizes', () => {
      expect(fontSize[1]).toBe(10);
      expect(fontSize[7]).toBe(16);
      expect(fontSize[12]).toBe(32);
    });
  });

  describe('lineHeight', () => {
    it('should have correct line heights', () => {
      expect(lineHeight.none).toBe(1);
      expect(lineHeight.normal).toBe(1.5);
      expect(lineHeight.loose).toBe(2);
    });
  });
});
