/**
 * Screen Helper 测试
 */

import { ScreenHelper } from '../screenHelper';

// Mock react-native
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Platform: {
    OS: 'ios',
  },
  StatusBar: {
    currentHeight: 0,
  },
}));

describe('ScreenHelper', () => {
  describe('dimensions', () => {
    it('should have width property', () => {
      expect(ScreenHelper.width).toBeDefined();
      expect(typeof ScreenHelper.width).toBe('number');
    });

    it('should have height property', () => {
      expect(ScreenHelper.height).toBeDefined();
      expect(typeof ScreenHelper.height).toBe('number');
    });
  });

  describe('getSafeAreaLayout', () => {
    it('should calculate safe area layout', () => {
      const insets = { top: 44, bottom: 34, left: 0, right: 0 };

      const result = ScreenHelper.getSafeAreaLayout(insets);

      expect(result).toHaveProperty('top', 44);
      expect(result).toHaveProperty('bottom', 34);
      expect(result).toHaveProperty('usableHeight');
      expect(result).toHaveProperty('usableWidth');
    });

    it('should calculate usable dimensions', () => {
      const insets = { top: 44, bottom: 34, left: 0, right: 0 };

      const result = ScreenHelper.getSafeAreaLayout(insets);

      expect(result.usableHeight).toBe(ScreenHelper.height - 44 - 34);
      expect(result.usableWidth).toBe(ScreenHelper.width);
    });

    it('should handle zero insets', () => {
      const insets = { top: 0, bottom: 0, left: 0, right: 0 };

      const result = ScreenHelper.getSafeAreaLayout(insets);

      expect(result.usableHeight).toBe(ScreenHelper.height);
      expect(result.usableWidth).toBe(ScreenHelper.width);
    });
  });

  describe('clampPosition', () => {
    it('should clamp position within bounds', () => {
      const insets = { top: 0, bottom: 0, left: 0, right: 0 };

      const result = ScreenHelper.clampPosition(100, 100, 50, 50, insets);

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should clamp x to minimum', () => {
      const insets = { top: 0, bottom: 0, left: 20, right: 0 };

      const result = ScreenHelper.clampPosition(-10, 100, 50, 50, insets);

      expect(result.x).toBe(20); // Clamped to left inset
    });

    it('should clamp x to maximum', () => {
      const insets = { top: 0, bottom: 0, left: 0, right: 20 };
      const maxX = ScreenHelper.width - 50 - 20;

      const result = ScreenHelper.clampPosition(9999, 100, 50, 50, insets);

      expect(result.x).toBe(maxX);
    });

    it('should clamp y to minimum', () => {
      const insets = { top: 44, bottom: 0, left: 0, right: 0 };

      const result = ScreenHelper.clampPosition(100, -10, 50, 50, insets);

      expect(result.y).toBe(44); // Clamped to top inset
    });

    it('should clamp y to maximum', () => {
      const insets = { top: 0, bottom: 34, left: 0, right: 0 };
      const maxY = ScreenHelper.height - 50 - 34;

      const result = ScreenHelper.clampPosition(100, 9999, 50, 50, insets);

      expect(result.y).toBe(maxY);
    });
  });
});
