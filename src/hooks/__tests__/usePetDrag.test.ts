/**
 * usePetDrag Hook 测试
 */

import { renderHook } from '@testing-library/react-native';
import { usePetDrag } from '../usePetDrag';

jest.mock('react-native', () => ({
  Animated: {
    ValueXY: jest.fn(() => ({
      x: { _value: 0 },
      y: { _value: 0 },
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
    })),
    event: jest.fn(),
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 44, bottom: 34, left: 0, right: 0 })),
}));

describe('usePetDrag', () => {
  const mockOnDragStart = jest.fn();
  const mockOnDragEnd = jest.fn();
  const mockOnPositionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with all callbacks', () => {
      const { result } = renderHook(() =>
        usePetDrag(50, 50, 100, 100, mockOnDragStart, mockOnDragEnd)
      );

      expect(result.current).toBeDefined();
    });

    it('should initialize with minimal params', () => {
      const { result } = renderHook(() => usePetDrag(0, 0, 100, 100));

      expect(result.current).toBeDefined();
    });
  });

  describe('returned values', () => {
    it('should return pan and panResponder', () => {
      const { result } = renderHook(() => usePetDrag(50, 50, 100, 100));

      expect(result.current).toHaveProperty('pan');
      expect(result.current).toHaveProperty('panResponder');
    });

    it('should have pan object', () => {
      const { result } = renderHook(() => usePetDrag(50, 50, 100, 100));

      expect(result.current.pan).toBeDefined();
    });

    it('should have panResponder object', () => {
      const { result } = renderHook(() => usePetDrag(50, 50, 100, 100));

      expect(result.current.panResponder).toBeDefined();
      expect(result.current.panResponder).toHaveProperty('panHandlers');
    });
  });

  describe('hook behavior', () => {
    it('should not throw on render', () => {
      expect(() => {
        renderHook(() => usePetDrag(50, 50, 100, 100));
      }).not.toThrow();
    });

    it('should be reusable', () => {
      const { result: result1 } = renderHook(() => usePetDrag(50, 50, 100, 100));
      const { result: result2 } = renderHook(() => usePetDrag(100, 100, 100, 100));

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
    });
  });
});
