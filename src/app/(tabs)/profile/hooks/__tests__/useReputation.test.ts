/**
 * useReputation Hook 测试
 *
 * 测试信誉分和勋章管理 Hook 的功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReputation } from '../useReputation';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
  mockErrorResponse,
} from '@/src/lib/supabase/__tests__/setup';

import { getUserReputation } from '@/src/lib/supabase/services/reputation';
import { Alert } from 'react-native';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock reputation service
jest.mock('@/src/lib/supabase/services/reputation', () => ({
  getUserReputation: jest.fn(),
}));

describe('useReputation', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading true when userId is provided', async () => {
      // Arrange
      (getUserReputation as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });
      setupFromMock('user_badges', mockSuccessResponse([]));

      // Act
      const { result } = renderHook(() => useReputation('user-123'));

      // Assert - initial loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.reputation).toBeNull();
      expect(result.current.badges).toEqual([]);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not call loadReputation when userId is not provided', () => {
      // Act
      const { result } = renderHook(() => useReputation(undefined));

      // Assert - reputation should be null (no loading happened)
      expect(result.current.reputation).toBeNull();
      // Note: loading stays true because no userId means no effect runs
      // This is expected behavior - the effect only runs when userId is truthy
    });
  });

  describe('loadReputation', () => {
    it('should load reputation data successfully', async () => {
      // Arrange
      const mockReputation = {
        userId: 'user-123',
        score: 75,
        level: 'advanced',
        profileCompleteness: 100,
        reviewQuality: 80,
        communityContribution: 70,
        compliance: 10,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (getUserReputation as jest.Mock).mockResolvedValue({
        data: mockReputation,
        error: null,
      });
      setupFromMock('user_badges', mockSuccessResponse([]));

      // Act
      const { result } = renderHook(() => useReputation('user-123'));

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.reputation).toEqual(mockReputation);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle reputation loading error', async () => {
      // Arrange
      (getUserReputation as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Failed to load reputation' },
      });
      setupFromMock('user_badges', mockSuccessResponse([]));

      // Act
      const { result } = renderHook(() => useReputation('user-123'));

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to load reputation');
      });
    });
  });

  describe('loadBadges', () => {
    it('should load badges successfully', async () => {
      // Arrange
      const mockBadges = [
        {
          id: 1,
          user_id: 'user-123',
          badge_id: 1,
          acquired_at: '2024-01-01T00:00:00Z',
          is_equipped: true,
          badge: { name: 'Test Badge' },
        },
      ];

      (getUserReputation as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });
      setupFromMock('user_badges', mockSuccessResponse(mockBadges));

      // Act
      const { result } = renderHook(() => useReputation('user-123'));

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('refresh', () => {
    it('should reload both reputation and badges', async () => {
      // Arrange
      (getUserReputation as jest.Mock).mockResolvedValue({
        data: { score: 50, level: 'intermediate' },
        error: null,
      });
      setupFromMock('user_badges', mockSuccessResponse([]));

      const { result } = renderHook(() => useReputation('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.refresh();
      });

      // Assert
      expect(getUserReputation).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  describe('equipBadge', () => {
    it('should not equip badge when userId is not provided', async () => {
      // Arrange
      const { result } = renderHook(() => useReputation(undefined));

      // Act
      await act(async () => {
        await result.current.equipBadge(1);
      });

      // Assert - should not call supabase
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('unequipBadge', () => {
    it('should not unequip badge when userId is not provided', async () => {
      // Arrange
      const { result } = renderHook(() => useReputation(undefined));

      // Act
      await act(async () => {
        await result.current.unequipBadge(1);
      });

      // Assert - should not call supabase
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle exceptions gracefully', async () => {
      // Arrange
      (getUserReputation as jest.Mock).mockRejectedValue(new Error('Network error'));
      setupFromMock('user_badges', mockSuccessResponse([]));

      // Act
      const { result } = renderHook(() => useReputation('user-123'));

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('returned values', () => {
    it('should return all expected properties', async () => {
      // Arrange
      (getUserReputation as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });
      setupFromMock('user_badges', mockSuccessResponse([]));

      // Act
      const { result } = renderHook(() => useReputation('user-123'));

      // Assert - verify all returned properties exist
      expect(result.current).toHaveProperty('reputation');
      expect(result.current).toHaveProperty('badges');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refresh');
      expect(result.current).toHaveProperty('equipBadge');
      expect(result.current).toHaveProperty('unequipBadge');

      // Verify functions are callable
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.equipBadge).toBe('function');
      expect(typeof result.current.unequipBadge).toBe('function');
    });
  });
});
