/**
 * Theme Store 集成测试
 *
 * 测试主题状态管理的各项功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { act } from '@testing-library/react-native';
import { useThemeStore } from '../themeStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('ThemeStore', () => {
  // 每个测试前重置 store 状态
  beforeEach(() => {
    const { getState } = useThemeStore;
    act(() => {
      getState().setThemeMode('system');
      getState().setHasHydrated(false);
    });
  });

  describe('initial state', () => {
    it('should have default theme mode as system', () => {
      // Arrange & Act
      const state = useThemeStore.getState();

      // Assert
      expect(state.themeMode).toBe('system');
    });

    it('should have _hasHydrated as false initially', () => {
      // Arrange & Act
      const state = useThemeStore.getState();

      // Assert
      expect(state._hasHydrated).toBe(false);
    });
  });

  describe('setThemeMode', () => {
    it('should change theme mode to light', () => {
      // Arrange
      const { getState } = useThemeStore;

      // Act
      act(() => {
        getState().setThemeMode('light');
      });

      // Assert
      expect(getState().themeMode).toBe('light');
    });

    it('should change theme mode to dark', () => {
      // Arrange
      const { getState } = useThemeStore;

      // Act
      act(() => {
        getState().setThemeMode('dark');
      });

      // Assert
      expect(getState().themeMode).toBe('dark');
    });

    it('should change theme mode back to system', () => {
      // Arrange
      const { getState } = useThemeStore;
      act(() => {
        getState().setThemeMode('dark');
      });

      // Act
      act(() => {
        getState().setThemeMode('system');
      });

      // Assert
      expect(getState().themeMode).toBe('system');
    });
  });

  describe('setHasHydrated', () => {
    it('should set hydration status to true', () => {
      // Arrange
      const { getState } = useThemeStore;

      // Act
      act(() => {
        getState().setHasHydrated(true);
      });

      // Assert
      expect(getState()._hasHydrated).toBe(true);
    });

    it('should set hydration status to false', () => {
      // Arrange
      const { getState } = useThemeStore;
      act(() => {
        getState().setHasHydrated(true);
      });

      // Act
      act(() => {
        getState().setHasHydrated(false);
      });

      // Assert
      expect(getState()._hasHydrated).toBe(false);
    });
  });

  describe('store selectors', () => {
    it('should allow subscribing to state changes', () => {
      // Arrange
      const callback = jest.fn();
      const unsubscribe = useThemeStore.subscribe(callback);

      // Act
      act(() => {
        useThemeStore.getState().setThemeMode('dark');
      });

      // Assert
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe('type safety', () => {
    it('should only accept valid theme modes', () => {
      // Arrange
      const validModes = ['light', 'dark', 'system'] as const;
      const { getState } = useThemeStore;

      // Act & Assert
      validModes.forEach((mode) => {
        act(() => {
          getState().setThemeMode(mode);
        });
        expect(getState().themeMode).toBe(mode);
      });
    });
  });
});
