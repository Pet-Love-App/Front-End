import { SPACING_UNIT, spacing, semanticSpacing, componentSpacing } from '../spacing';

describe('Spacing Tokens', () => {
  describe('SPACING_UNIT', () => {
    it('should be 4', () => {
      expect(SPACING_UNIT).toBe(4);
    });
  });

  describe('spacing', () => {
    it('should have correct values based on 4px unit', () => {
      expect(spacing[0]).toBe(0);
      expect(spacing[1]).toBe(4);
      expect(spacing[4]).toBe(16);
      expect(spacing[8]).toBe(32);
    });
  });

  describe('semanticSpacing', () => {
    it('should map to spacing values', () => {
      expect(semanticSpacing.none).toBe(spacing[0]);
      expect(semanticSpacing.md).toBe(spacing[3]);
      expect(semanticSpacing.gutter).toBe(spacing[4]);
      expect(semanticSpacing.page).toBe(spacing[8]);
    });
  });

  describe('componentSpacing', () => {
    it('should have correct component mappings', () => {
      expect(componentSpacing.buttonPaddingX.md).toBe(spacing[3]);
    });
  });
});
