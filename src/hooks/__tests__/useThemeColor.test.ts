/**
 * useThemeColor Hook 测试
 */

import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../useThemeColor';

import { useThemeAwareColorScheme } from '../useThemeAwareColorScheme';

jest.mock('../useThemeAwareColorScheme', () => ({
  useThemeAwareColorScheme: jest.fn(() => 'light'),
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with light theme', () => {
    it('should return light color from props', () => {
      (useThemeAwareColorScheme as jest.Mock).mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
      );

      expect(result.current).toBe('#FFFFFF');
    });

    it('should return theme color when no prop provided', () => {
      (useThemeAwareColorScheme as jest.Mock).mockReturnValue('light');

      const { result } = renderHook(() => useThemeColor({}, 'text'));

      expect(typeof result.current).toBe('string');
    });
  });

  describe('with dark theme', () => {
    it('should return dark color from props', () => {
      (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
      );

      expect(result.current).toBe('#000000');
    });

    it('should return theme color when no prop provided', () => {
      (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() => useThemeColor({}, 'text'));

      expect(typeof result.current).toBe('string');
    });
  });

  describe('color name variations', () => {
    it('should work with text color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));

      expect(result.current).toBeDefined();
    });

    it('should work with background color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'background'));

      expect(result.current).toBeDefined();
    });

    it('should work with tint color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'tint'));

      expect(result.current).toBeDefined();
    });
  });
});
