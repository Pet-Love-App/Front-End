/**
 * useFavorite Hook 测试
 *
 * 测试收藏功能 Hook
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFavorite } from '../useFavorite';

import { aiReportService } from '@/src/services/api';
import { Alert } from 'react-native';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock AI report service
jest.mock('@/src/services/api', () => ({
  aiReportService: {
    toggleFavoriteReport: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('useFavorite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided initialFavorited state', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
          initialFavorited: true,
        })
      );

      // Assert
      expect(result.current.isFavorited).toBe(true);
    });

    it('should default isFavorited to false when not provided', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
        })
      );

      // Assert
      expect(result.current.isFavorited).toBe(false);
    });

    it('should initialize isToggling as false', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
        })
      );

      // Assert
      expect(result.current.isToggling).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle favorite status successfully', async () => {
      // Arrange
      (aiReportService.toggleFavoriteReport as jest.Mock).mockResolvedValue({
        favorited: true,
      });

      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
          initialFavorited: false,
        })
      );

      // Act
      await act(async () => {
        await result.current.toggle();
      });

      // Assert
      expect(result.current.isFavorited).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith('✅ 成功', '已收藏此报告');
    });

    it('should show unfavorite message when unfavoriting', async () => {
      // Arrange
      (aiReportService.toggleFavoriteReport as jest.Mock).mockResolvedValue({
        favorited: false,
      });

      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
          initialFavorited: true,
        })
      );

      // Act
      await act(async () => {
        await result.current.toggle();
      });

      // Assert
      expect(result.current.isFavorited).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('✅ 成功', '已取消收藏');
    });

    it('should not toggle when catfoodId is not provided', async () => {
      // Arrange
      const { result } = renderHook(() =>
        useFavorite({
          initialFavorited: false,
        })
      );

      // Act
      await act(async () => {
        await result.current.toggle();
      });

      // Assert
      expect(aiReportService.toggleFavoriteReport).not.toHaveBeenCalled();
    });

    it('should not toggle when already toggling', async () => {
      // Arrange
      let resolveToggle: (value: any) => void;
      (aiReportService.toggleFavoriteReport as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveToggle = resolve;
          })
      );

      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
          initialFavorited: false,
        })
      );

      // Act - start first toggle
      act(() => {
        result.current.toggle();
      });

      // Verify isToggling is true
      expect(result.current.isToggling).toBe(true);

      // Try to toggle again while loading
      await act(async () => {
        await result.current.toggle();
      });

      // Assert - should only call once
      expect(aiReportService.toggleFavoriteReport).toHaveBeenCalledTimes(1);

      // Cleanup
      await act(async () => {
        resolveToggle!({ favorited: true });
      });
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      (aiReportService.toggleFavoriteReport as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
          initialFavorited: false,
        })
      );

      // Act
      await act(async () => {
        await result.current.toggle();
      });

      // Assert
      expect(Alert.alert).toHaveBeenCalledWith('❌ 失败', '操作失败，请重试');
      expect(result.current.isToggling).toBe(false);
    });
  });

  describe('setFavorited', () => {
    it('should allow manually setting favorited state', () => {
      // Arrange
      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
          initialFavorited: false,
        })
      );

      // Act
      act(() => {
        result.current.setFavorited(true);
      });

      // Assert
      expect(result.current.isFavorited).toBe(true);
    });
  });

  describe('returned values', () => {
    it('should return all expected properties', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useFavorite({
          catfoodId: 123,
        })
      );

      // Assert
      expect(result.current).toHaveProperty('isFavorited');
      expect(result.current).toHaveProperty('isToggling');
      expect(result.current).toHaveProperty('toggle');
      expect(result.current).toHaveProperty('setFavorited');
      expect(typeof result.current.toggle).toBe('function');
      expect(typeof result.current.setFavorited).toBe('function');
    });
  });
});
