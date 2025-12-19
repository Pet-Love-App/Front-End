/**
 * useThemeAwareColorScheme Hook 测试
 */

import { renderHook } from '@testing-library/react-native';
import { useThemeAwareColorScheme } from '../useThemeAwareColorScheme';

import { useThemeStore } from '@/src/store/themeStore';
import { useColorScheme } from 'react-native';

jest.mock('@/src/store/themeStore', () => ({
  useThemeStore: jest.fn((selector) => {
    const state = { themeMode: 'system' };
    return selector ? selector(state) : state;
  }),
}));

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('useThemeAwareColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with system theme', () => {
    it('should return system color scheme when theme is system', () => {
      (useThemeStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector ? selector({ themeMode: 'system' }) : { themeMode: 'system' };
      });
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const { result } = renderHook(() => useThemeAwareColorScheme());

      expect(result.current).toBe('light');
    });

    it('should return dark when system is dark', () => {
      (useThemeStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector ? selector({ themeMode: 'system' }) : { themeMode: 'system' };
      });
      (useColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() => useThemeAwareColorScheme());

      expect(result.current).toBe('dark');
    });
  });

  describe('with manual theme', () => {
    it('should return light when theme is light', () => {
      (useThemeStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector ? selector({ themeMode: 'light' }) : { themeMode: 'light' };
      });

      const { result } = renderHook(() => useThemeAwareColorScheme());

      expect(result.current).toBe('light');
    });

    it('should return dark when theme is dark', () => {
      (useThemeStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector ? selector({ themeMode: 'dark' }) : { themeMode: 'dark' };
      });

      const { result } = renderHook(() => useThemeAwareColorScheme());

      expect(result.current).toBe('dark');
    });
  });

  describe('return type', () => {
    it('should return light or dark', () => {
      const { result } = renderHook(() => useThemeAwareColorScheme());

      expect(['light', 'dark']).toContain(result.current);
    });
  });
});
