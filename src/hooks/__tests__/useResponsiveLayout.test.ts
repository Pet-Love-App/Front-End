/**
 * useResponsiveLayout Hook 测试
 */

import { renderHook } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { useResponsiveLayout } from '../useResponsiveLayout';

jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Platform: {
    OS: 'ios',
  },
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
}));

describe('useResponsiveLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dimensions', () => {
    it('should return screen width', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(375);
    });

    it('should return screen height', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.height).toBe(812);
    });
  });

  describe('device size detection', () => {
    it('should detect device size', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.deviceSize).toBeDefined();
      expect(['xs', 'sm', 'md', 'lg', 'xl']).toContain(result.current.deviceSize);
    });

    it('should have isSmallScreen flag', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(typeof result.current.isSmallScreen).toBe('boolean');
    });

    it('should have isExtraSmallScreen flag', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(typeof result.current.isExtraSmallScreen).toBe('boolean');
    });

    it('should have isTabletOrLarger flag', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(typeof result.current.isTabletOrLarger).toBe('boolean');
    });
  });

  describe('responsive helpers', () => {
    it('should have getResponsiveSize method', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(typeof result.current.getResponsiveSize).toBe('function');
    });

    it('should have getHorizontalPadding method', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(typeof result.current.getHorizontalPadding).toBe('function');
    });

    it('should have getMaxContentWidth method', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(typeof result.current.getMaxContentWidth).toBe('function');
    });

    it('should calculate responsive size', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      const size = result.current.getResponsiveSize(16);

      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('returned values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
      expect(result.current).toHaveProperty('deviceSize');
      expect(result.current).toHaveProperty('isSmallScreen');
      expect(result.current).toHaveProperty('isExtraSmallScreen');
      expect(result.current).toHaveProperty('isTabletOrLarger');
    });
  });
});
