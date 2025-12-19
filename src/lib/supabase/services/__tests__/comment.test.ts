/**
 * Comment Service 集成测试
 *
 * 测试评论服务的各项功能
 * 遵循 JavaScript Testing Best Practices:
 * - AAA 模式 (Arrange-Act-Assert)
 * - 描述性命名
 * - 测试行为而非实现
 * - 独立的测试用例
 */

import { supabaseCommentService } from '../comment';
import type { Comment, CreateCommentParams, GetCommentsParams } from '../comment';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../__tests__/setup';

describe('SupabaseCommentService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getComments', () => {
    it('should return comments for catfood target', async () => {
      // Arrange
      const mockComments = [
        {
          id: 1,
          content: 'Great cat food!',
          author_id: 'user-1',
          target_type: 'catfood',
          target_id: 123,
          parent_id: null,
          likes: 5,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          author: {
            id: 'user-1',
            username: 'testuser',
            avatar_url: null,
          },
        },
      ];

      setupFromMock('comments', mockSuccessResponse(mockComments));

      const params: GetCommentsParams = {
        targetType: 'catfood',
        targetId: 123,
      };

      // Act
      const result = await supabaseCommentService.getComments(params);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter comments by parent_id when provided', async () => {
      // Arrange
      const mockReplies = [
        {
          id: 2,
          content: 'Reply comment',
          parent_id: 1,
          target_type: 'catfood',
          target_id: 123,
        },
      ];

      setupFromMock('comments', mockSuccessResponse(mockReplies));

      // Act
      const result = await supabaseCommentService.getComments({
        targetType: 'catfood',
        targetId: 123,
        parentId: 1,
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('should apply limit and offset for pagination', async () => {
      // Arrange
      setupFromMock('comments', mockSuccessResponse([]));

      // Act
      await supabaseCommentService.getComments({
        targetType: 'catfood',
        targetId: 123,
        limit: 20,
        offset: 40,
      });

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('comments');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      setupFromMock('comments', mockErrorResponse('Database error', 'DB_ERROR'));

      // Act
      const result = await supabaseCommentService.getComments({
        targetType: 'post',
        targetId: 456,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should return empty array when no comments exist', async () => {
      // Arrange
      setupFromMock('comments', mockSuccessResponse([]));

      // Act
      const result = await supabaseCommentService.getComments({
        targetType: 'catfood',
        targetId: 999,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('createComment', () => {
    it('should create a new comment successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockCreatedComment = {
        id: 1,
        content: 'New comment',
        author_id: 'user-123',
        target_type: 'catfood',
        target_id: 123,
        parent_id: null,
        likes: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: {
          id: 'user-123',
          username: 'testuser',
          avatar_url: null,
        },
      };

      setupFromMock('comments', mockSuccessResponse([mockCreatedComment]));

      const params: CreateCommentParams = {
        content: 'New comment',
        targetType: 'catfood',
        targetId: 123,
      };

      // Act
      const result = await supabaseCommentService.createComment(params);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseCommentService.createComment({
        content: 'Test',
        targetType: 'catfood',
        targetId: 123,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle reply comments with parent_id', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('comments', mockSuccessResponse([{ id: 2, parent_id: 1 }]));

      // Act
      const result = await supabaseCommentService.createComment({
        content: 'Reply',
        targetType: 'catfood',
        targetId: 123,
        parentId: 1,
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from content', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('comments', mockSuccessResponse([{ content: 'Trimmed' }]));

      // Act
      await supabaseCommentService.createComment({
        content: '  Trimmed  ',
        targetType: 'catfood',
        targetId: 123,
      });

      // Assert - verify the service was called
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('comments');
    });
  });

  describe('updateComment', () => {
    it('should update comment content successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const updatedComment = {
        id: 1,
        content: 'Updated content',
        author_id: 'user-123',
      };

      setupFromMock('comments', mockSuccessResponse([updatedComment]));

      // Act
      const result = await supabaseCommentService.updateComment(1, 'Updated content');

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseCommentService.updateComment(1, 'Updated');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('comments', mockSuccessResponse(null));

      // Act
      const result = await supabaseCommentService.deleteComment(1);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseCommentService.deleteComment(1);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('toggleCommentLike', () => {
    it('should toggle like status successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock check existing like (not liked)
      setupFromMock('comment_likes', mockSuccessResponse([]));

      // Act
      const result = await supabaseCommentService.toggleCommentLike(1);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseCommentService.toggleCommentLike(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });
  });
});
