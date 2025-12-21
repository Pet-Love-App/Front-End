/**
 * usePetStore Hook 测试
 *
 * 测试宠物状态管理 Store
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePetStore } from '../usePetStore';

// Mock react-native-reanimated
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
  beforeEach(() => {
    // 重置 store 状态
    const { result } = renderHook(() => usePetStore());
    act(() => {
      result.current.setTalking(true);
      result.current.setVisible(true);
      // 无法直接重置 currentFactIndex，因为它是内部状态且没有直接的 reset 方法
      // 但我们可以通过 nextFact 循环来测试逻辑，或者假设初始状态是确定的
    });
  });

  it('should initialize with default values', () => {
    // Arrange & Act
    const { result } = renderHook(() => usePetStore());

    // Assert
    expect(result.current.currentFactIndex).toBe(0);
    expect(result.current.currentFact).toBeDefined();
    expect(result.current.isTalking).toBe(true);
    expect(result.current.isVisible).toBe(true);
  });

  it('should update isTalking state', () => {
    // Arrange
    const { result } = renderHook(() => usePetStore());

    // Act
    act(() => {
      result.current.setTalking(false);
    });

    // Assert
    expect(result.current.isTalking).toBe(false);

    // Act
    act(() => {
      result.current.setTalking(true);
    });

    // Assert
    expect(result.current.isTalking).toBe(true);
  });

  it('should update isVisible state', () => {
    // Arrange
    const { result } = renderHook(() => usePetStore());

    // Act
    act(() => {
      result.current.setVisible(false);
    });

    // Assert
    expect(result.current.isVisible).toBe(false);

    // Act
    act(() => {
      result.current.setVisible(true);
    });

    // Assert
    expect(result.current.isVisible).toBe(true);
  });

  it('should cycle through facts when nextFact is called', () => {
    // Arrange
    const { result } = renderHook(() => usePetStore());
    const initialFact = result.current.currentFact;
    const initialIndex = result.current.currentFactIndex;

    // Act
    act(() => {
      result.current.nextFact();
    });

    // Assert
    expect(result.current.currentFactIndex).not.toBe(initialIndex);
    expect(result.current.currentFact).not.toBe(initialFact);
  });
});
