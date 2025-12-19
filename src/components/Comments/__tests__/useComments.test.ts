/**
 * useComments Hook 测试
 *
 * 测试评论管理 Hook 的功能
 * - 测试 Hook 的完整生命周期
 * - 测试异步操作
 * - 测试错误处理
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useComments } from '../useComments';
import { supabaseCommentService } from '@/src/lib/supabase';

// Mock dialog
jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn(),
}));

// Mock comment service
jest.mock('@/src/lib/supabase', () => ({
  supabaseCommentService: {
    getComments: jest.fn(),
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    toggleCommentLike: jest.fn(),
  },
}));

describe('useComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should load comments on mount', async () => {
      // Arrange
      const mockComments = [
        {
          id: 1,
          content: 'Test comment',
          authorId: 'user-1',
          likes: 5,
          createdAt: '2024-01-01',
        },
      ];

      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: mockComments,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      // Assert - initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.comments).toHaveLength(1);
      });
    });

    it('should handle empty comment list', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.comments).toEqual([]);
      });
    });

    it('should set hasMore based on result length', async () => {
      // Arrange - return exactly pageSize items
      const mockComments = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        content: `Comment ${i + 1}`,
      }));

      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: mockComments,
        error: null,
      });

      // Act
      const { result } = renderHook(() =>
        useComments({ targetType: 'catfood', targetId: 123, pageSize: 20 })
      );

      // Assert
      await waitFor(() => {
        expect(result.current.hasMore).toBe(true);
      });
    });
  });

  describe('loadComments', () => {
    it('should load first page of comments', async () => {
      // Arrange
      const mockComments = [{ id: 1, content: 'Comment 1' }];
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: mockComments,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(supabaseCommentService.getComments).toHaveBeenCalledWith({
        targetType: 'catfood',
        targetId: 123,
        parentId: null,
        orderBy: 'created_at',
        limit: 20,
        offset: 0,
      });
    });

    it('should append comments when loading more pages', async () => {
      // Arrange
      const firstPageComments = [{ id: 1, content: 'Comment 1' }];
      const secondPageComments = [{ id: 2, content: 'Comment 2' }];

      (supabaseCommentService.getComments as jest.Mock)
        .mockResolvedValueOnce({ data: firstPageComments, error: null })
        .mockResolvedValueOnce({ data: secondPageComments, error: null });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Load page 2
      await act(async () => {
        await result.current.loadComments(2, false);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.comments).toHaveLength(2);
        expect(result.current.page).toBe(2);
      });
    });

    it('should replace comments when refreshing', async () => {
      // Arrange
      const oldComments = [{ id: 1, content: 'Old' }];
      const newComments = [{ id: 2, content: 'New' }];

      (supabaseCommentService.getComments as jest.Mock)
        .mockResolvedValueOnce({ data: oldComments, error: null })
        .mockResolvedValueOnce({ data: newComments, error: null });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.comments).toHaveLength(1);
      });

      // Refresh
      await act(async () => {
        await result.current.loadComments(1, true);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.comments).toHaveLength(1);
        expect(result.current.comments[0].id).toBe(2);
      });
    });

    it('should handle loading errors gracefully', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.comments).toEqual([]);
      });
    });
  });

  describe('createComment', () => {
    it('should create comment and refresh list', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });
      (supabaseCommentService.createComment as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.createComment('New comment');
      });

      // Assert
      expect(supabaseCommentService.createComment).toHaveBeenCalledWith({
        content: 'New comment',
        targetId: 123,
        targetType: 'catfood',
      });
    });

    it('should throw error on creation failure', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });
      (supabaseCommentService.createComment as jest.Mock).mockResolvedValue({
        error: { message: 'Creation failed' },
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.createComment('Test');
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and update list', async () => {
      // Arrange
      const mockComments = [
        { id: 1, content: 'Comment 1' },
        { id: 2, content: 'Comment 2' },
      ];

      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: mockComments,
        error: null,
      });
      (supabaseCommentService.deleteComment as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.comments).toHaveLength(2);
      });

      // Act
      await act(async () => {
        await result.current.deleteComment(1);
      });

      // Assert
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].id).toBe(2);
    });

    it('should update totalCount after deletion', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });
      (supabaseCommentService.deleteComment as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.totalCount).toBe(1);
      });

      // Act
      await act(async () => {
        await result.current.deleteComment(1);
      });

      // Assert
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('toggleLike', () => {
    it('should update like status optimistically', async () => {
      // Arrange
      const mockComments = [{ id: 1, content: 'Comment', likes: 5, isLiked: false }];

      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: mockComments,
        error: null,
      });
      (supabaseCommentService.toggleCommentLike as jest.Mock).mockResolvedValue({
        data: { likes: 6, liked: true },
        error: null,
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.comments).toHaveLength(1);
      });

      // Act
      await act(async () => {
        await result.current.toggleLike(1);
      });

      // Assert
      expect(result.current.comments[0].likes).toBe(6);
      expect(result.current.comments[0].isLiked).toBe(true);
    });

    it('should throw error on toggle failure', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });
      (supabaseCommentService.toggleCommentLike as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Toggle failed' },
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.toggleLike(1);
        })
      ).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    it('should reload comments from first page', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      // Act
      await act(async () => {
        await result.current.refresh();
      });

      // Assert
      expect(supabaseCommentService.getComments).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0, // First page
        })
      );
    });
  });

  describe('defensive programming', () => {
    it('should handle null data gracefully', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      // Assert
      await waitFor(() => {
        expect(result.current.comments).toEqual([]);
      });
    });

    it('should handle non-array data gracefully', async () => {
      // Arrange
      (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
        data: { invalid: 'data' },
        error: null,
      });

      // Act
      const { result } = renderHook(() => useComments({ targetType: 'catfood', targetId: 123 }));

      // Assert
      await waitFor(() => {
        expect(result.current.comments).toEqual([]);
      });
    });
  });
});
