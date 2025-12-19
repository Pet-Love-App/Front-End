/**
 * Colors Constants 测试
 */

import {
  Colors,
  PRIMARY_PALETTE,
  NEUTRAL_PALETTE,
  SEMANTIC_COLORS,
  TAG_COLORS,
  withAlpha,
  getContrastTextColor,
  getTagColor,
} from '../colors';

describe('Colors Constants', () => {
  describe('Colors object', () => {
    it('should have light theme', () => {
      expect(Colors.light).toBeDefined();
      expect(Colors.light.text).toBeDefined();
      expect(Colors.light.background).toBeDefined();
    });

    it('should have dark theme', () => {
      expect(Colors.dark).toBeDefined();
      expect(Colors.dark.text).toBeDefined();
      expect(Colors.dark.background).toBeDefined();
    });

    it('should have consistent keys between themes', () => {
      const lightKeys = Object.keys(Colors.light);
      const darkKeys = Object.keys(Colors.dark);

      expect(lightKeys.sort()).toEqual(darkKeys.sort());
    });
  });

  describe('color palettes', () => {
    it('should have primary palette', () => {
      expect(PRIMARY_PALETTE.main).toBe('#FEBE98');
      expect(PRIMARY_PALETTE.light).toBeDefined();
      expect(PRIMARY_PALETTE.dark).toBeDefined();
    });

    it('should have neutral palette', () => {
      expect(NEUTRAL_PALETTE.sand).toBeDefined();
      expect(NEUTRAL_PALETTE.warmGray).toBeDefined();
    });

    it('should have semantic colors', () => {
      expect(SEMANTIC_COLORS.success).toBeDefined();
      expect(SEMANTIC_COLORS.warning).toBeDefined();
      expect(SEMANTIC_COLORS.error).toBeDefined();
    });

    it('should have tag colors array', () => {
      expect(Array.isArray(TAG_COLORS)).toBe(true);
      expect(TAG_COLORS.length).toBeGreaterThan(0);
    });
  });

  describe('withAlpha', () => {
    it('should convert hex to rgba', () => {
      const result = withAlpha('#FFFFFF', 0.5);

      expect(result).toBe('rgba(255, 255, 255, 0.5)');
    });

    it('should handle short hex format', () => {
      const result = withAlpha('#FFF', 0.8);

      expect(result).toBe('rgba(255, 255, 255, 0.8)');
    });

    it('should handle full opacity', () => {
      const result = withAlpha('#000000', 1);

      expect(result).toBe('rgba(0, 0, 0, 1)');
    });

    it('should handle zero opacity', () => {
      const result = withAlpha('#FF0000', 0);

      expect(result).toBe('rgba(255, 0, 0, 0)');
    });

    it('should return original for invalid hex', () => {
      expect(withAlpha('invalid', 0.5)).toBe('invalid');
      expect(withAlpha('', 0.5)).toBe('');
    });

    it('should return original for non-hex strings', () => {
      expect(withAlpha('rgb(255,0,0)', 0.5)).toBe('rgb(255,0,0)');
    });
  });

  describe('getContrastTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(getContrastTextColor('#FFFFFF')).toBe('black');
      expect(getContrastTextColor('#FEBE98')).toBe('black');
    });

    it('should return white for dark backgrounds', () => {
      expect(getContrastTextColor('#000000')).toBe('white');
      expect(getContrastTextColor('#333333')).toBe('white');
    });

    it('should handle hex without hash', () => {
      const result = getContrastTextColor('FFFFFF');

      expect(result).toBe('black');
    });

    it('should handle empty string', () => {
      const result = getContrastTextColor('');

      expect(result).toBe('black'); // Default
    });

    it('should handle edge case colors', () => {
      expect(getContrastTextColor('#808080')).toBeDefined();
      expect(getContrastTextColor('#7F7F7F')).toBeDefined();
    });
  });

  describe('getTagColor', () => {
    it('should return color for index 0', () => {
      const result = getTagColor(0);

      expect(result).toBe(TAG_COLORS[0]);
    });

    it('should cycle through colors', () => {
      const length = TAG_COLORS.length;
      const result = getTagColor(length);

      expect(result).toBe(TAG_COLORS[0]); // Should cycle back
    });

    it('should handle large indices', () => {
      const result = getTagColor(999);

      expect(TAG_COLORS).toContain(result);
    });

    it('should handle zero index', () => {
      const result = getTagColor(0);

      expect(result).toBe(TAG_COLORS[0]);
      expect(typeof result).toBe('string');
    });
  });

  describe('color format validation', () => {
    it('should have valid hex colors in PRIMARY_PALETTE', () => {
      Object.values(PRIMARY_PALETTE).forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have valid hex colors in NEUTRAL_PALETTE', () => {
      Object.values(NEUTRAL_PALETTE).forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have valid hex colors in TAG_COLORS', () => {
      TAG_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});
