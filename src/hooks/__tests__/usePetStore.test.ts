/**
 * usePetStore Hook 测试
 */

import { renderHook } from '@testing-library/react-native';
import { usePetStore } from '../usePetStore';

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val) => val),
    withTiming: jest.fn((val) => val),
    default: { View },
  };
});

describe('usePetStore', () => {
  describe('hook behavior', () => {
    it('should return pet state', () => {
      const { result } = renderHook(() => usePetStore());

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('object');
    });

    it('should not throw on render', () => {
      expect(() => {
        renderHook(() => usePetStore());
      }).not.toThrow();
    });

    it('should be reusable', () => {
      const { result: result1 } = renderHook(() => usePetStore());
      const { result: result2 } = renderHook(() => usePetStore());

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
    });
  });
});
