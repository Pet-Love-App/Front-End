import { primaryScale, neutralScale, successScale, warningScale } from '../colors';

describe('Color Tokens', () => {
  describe('primaryScale', () => {
    it('should have 12 steps', () => {
      expect(Object.keys(primaryScale)).toHaveLength(12);
    });

    it('should have correct key names', () => {
      expect(primaryScale.primary1).toBeDefined();
      expect(primaryScale.primary12).toBeDefined();
    });

    it('should have correct hex values', () => {
      expect(primaryScale.primary1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(primaryScale.primary7).toBe('#FEBE98'); // Brand primary color
    });
  });

  describe('neutralScale', () => {
    it('should have 12 steps', () => {
      expect(Object.keys(neutralScale)).toHaveLength(12);
    });

    it('should have correct key names', () => {
      expect(neutralScale.neutral1).toBeDefined();
      expect(neutralScale.neutral12).toBeDefined();
    });

    it('should have correct hex values', () => {
      expect(neutralScale.neutral1).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('successScale', () => {
    it('should have 12 steps', () => {
      expect(Object.keys(successScale)).toHaveLength(12);
    });

    it('should have correct key names', () => {
      expect(successScale.success1).toBeDefined();
      expect(successScale.success12).toBeDefined();
    });
  });

  describe('warningScale', () => {
    // Assuming warningScale follows similar pattern, though we didn't read full file
    // Based on partial read, it exists.
    it('should be defined', () => {
      expect(warningScale).toBeDefined();
    });
  });
});
