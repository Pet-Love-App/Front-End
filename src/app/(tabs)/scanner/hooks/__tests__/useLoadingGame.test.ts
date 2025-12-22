/**
 * useLoadingGame Hook 测试
 *
 * 测试加载游戏 Hook 的功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLoadingGame } from '../useLoadingGame';
import { Animated } from 'react-native';

// Mock Animated
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    Value: jest.fn((val) => ({
      setValue: jest.fn(),
      addListener: jest.fn(() => 'listener-id'),
      removeListener: jest.fn(),
      interpolate: jest.fn(),
    })),
  };
});

describe('useLoadingGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    // Arrange
    const onGameOver = jest.fn();

    // Act
    const { result } = renderHook(() => useLoadingGame(false, onGameOver));

    // Assert
    expect(result.current.score).toBe(0);
    expect(result.current.isGameOver).toBe(false);
    expect(typeof result.current.jump).toBe('function');
    expect(typeof result.current.resetGame).toBe('function');
  });

  it('should start game loop when isPlaying is true', () => {
    // Arrange
    const onGameOver = jest.fn();
    const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame');

    // Act
    renderHook(() => useLoadingGame(true, onGameOver));

    // Assert
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should stop game loop when isPlaying is false', () => {
    // Arrange
    const onGameOver = jest.fn();
    const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');

    // Act
    const { rerender } = renderHook(
      (props: { isPlaying: boolean }) => useLoadingGame(props.isPlaying, onGameOver),
      { initialProps: { isPlaying: true } }
    );

    rerender({ isPlaying: false });

    // Assert
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should handle jump action', () => {
    // Arrange
    const onGameOver = jest.fn();
    const { result } = renderHook(() => useLoadingGame(true, onGameOver));

    // Act
    act(() => {
      result.current.jump();
    });

    // Assert
    // Since we can't easily check internal refs, we verify the function executes without error
    expect(result.current.isGameOver).toBe(false);
  });

  it('should reset game state', () => {
    // Arrange
    const onGameOver = jest.fn();
    const { result } = renderHook(() => useLoadingGame(true, onGameOver));

    // Act
    act(() => {
      result.current.resetGame();
    });

    // Assert
    expect(result.current.score).toBe(0);
    expect(result.current.isGameOver).toBe(false);
  });
});
