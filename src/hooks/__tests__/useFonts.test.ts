/**
 * useFonts Hook 测试
 */

import { renderHook } from '@testing-library/react-native';

import * as ExpoFont from 'expo-font';

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

describe('useFonts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('font loading', () => {
    it('should return loaded state', () => {
      (ExpoFont.useFonts as jest.Mock).mockReturnValue([true, null]);

      const result = ExpoFont.useFonts({});

      expect(result[0]).toBe(true);
      expect(result[1]).toBeNull();
    });

    it('should handle loading state', () => {
      (ExpoFont.useFonts as jest.Mock).mockReturnValue([false, null]);

      const result = ExpoFont.useFonts({});

      expect(result[0]).toBe(false);
    });

    it('should handle error state', () => {
      const error = new Error('Font load failed');
      (ExpoFont.useFonts as jest.Mock).mockReturnValue([false, error]);

      const result = ExpoFont.useFonts({});

      expect(result[1]).toEqual(error);
    });
  });

  describe('hook behavior', () => {
    it('should not throw on call', () => {
      expect(() => {
        ExpoFont.useFonts({});
      }).not.toThrow();
    });
  });
});
