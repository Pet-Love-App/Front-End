import { sageScale, coralScale } from '../brand-colors';

describe('Brand Color Tokens', () => {
  describe('sageScale', () => {
    it('should have 12 steps', () => {
      expect(Object.keys(sageScale)).toHaveLength(12);
    });

    it('should have correct key names', () => {
      expect(sageScale.sage1).toBeDefined();
      expect(sageScale.sage12).toBeDefined();
    });

    it('should have correct hex values', () => {
      expect(sageScale.sage1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(sageScale.sage7).toBe('#7FB093'); // Primary brand color
    });
  });

  describe('coralScale', () => {
    it('should have 12 steps', () => {
      expect(Object.keys(coralScale)).toHaveLength(12);
    });

    it('should have correct key names', () => {
      expect(coralScale.coral1).toBeDefined();
      expect(coralScale.coral12).toBeDefined();
    });

    it('should have correct hex values', () => {
      expect(coralScale.coral1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(coralScale.coral7).toBe('#FF8F78'); // Secondary brand color
    });
  });
});
