/**
 * Forum Service 集成测试
 *
 * 测试论坛服务的核心功能
 */

import { supabaseForumService } from '../forum';
import type { CreatePostParams, PostCategory } from '../forum';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../__tests__/setup';

// Mock expo modules
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(),
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn((str) => new ArrayBuffer(8)),
}));

describe('SupabaseForumService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('listPosts', () => {
    it('should return list of posts', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 1,
          author_id: 'user-1',
          content: 'Test post',
          likes_count: 10,
          comments_count: 5,
          favorites_count: 2,
        },
      ];

      setupFromMock('posts', mockSuccessResponse(mockPosts));

      // Act
      const result = await supabaseForumService.listPosts();

      // Assert
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle pagination', async () => {
      // Arrange
      setupFromMock('posts', mockSuccessResponse([]));

      // Act
      await supabaseForumService.listPosts({ page: 2, pageSize: 20 });

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('posts');
    });

    it('should filter by category', async () => {
      // Arrange
      setupFromMock('posts', mockSuccessResponse([]));

      // Act
      await supabaseForumService.listPosts({ category: 'help' });

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('posts');
    });

    it('should handle database errors', async () => {
      // Arrange
      setupFromMock('posts', mockErrorResponse('Database error', 'DB_ERROR'));

      // Act
      const result = await supabaseForumService.listPosts();

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('getPost', () => {
    it('should return post detail by id', async () => {
      // Arrange
      const mockPost = {
        id: 1,
        author_id: 'user-1',
        content: 'Post content',
        author: { username: 'testuser' },
      };

      setupFromMock('posts', mockSuccessResponse(mockPost));

      // Act
      const result = await supabaseForumService.getPost(1);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should return error for non-existent post', async () => {
      // Arrange
      setupFromMock('posts', mockErrorResponse('Not found', 'NOT_FOUND'));

      // Act
      const result = await supabaseForumService.getPost(999);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('createPost', () => {
    it('should create post without media', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockCreatedPost = {
        id: 1,
        content: 'New post',
        author_id: 'user-123',
      };

      setupFromMock('posts', mockSuccessResponse([mockCreatedPost]));

      const params: CreatePostParams = {
        content: 'New post',
        category: 'share',
      };

      // Act
      const result = await supabaseForumService.createPost(params);

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseForumService.createPost({ content: 'Test' });

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('updatePost', () => {
    it('should update post content', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('posts', mockSuccessResponse([{ id: 1, content: 'Updated' }]));

      // Act
      const result = await supabaseForumService.updatePost(1, { content: 'Updated' });

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseForumService.updatePost(1, { content: 'Test' });

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('posts', mockSuccessResponse(null));

      // Act
      const result = await supabaseForumService.deletePost(1);

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseForumService.deletePost(1);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('toggleLike', () => {
    it('should toggle post like', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('post_likes', mockSuccessResponse([]));

      // Act
      const result = await supabaseForumService.toggleLike(1);

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseForumService.toggleLike(1);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle post favorite', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('post_favorites', mockSuccessResponse([]));

      // Act
      const result = await supabaseForumService.toggleFavorite(1);

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseForumService.toggleFavorite(1);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('getMyPosts', () => {
    it('should return current user posts', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockPosts = [{ id: 1, author_id: 'user-123', content: 'My post' }];

      setupFromMock('posts', mockSuccessResponse(mockPosts));

      // Act
      const result = await supabaseForumService.getMyPosts();

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
      const result = await supabaseForumService.getMyPosts();

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('getNotifications', () => {
    it('should return notifications for current user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockNotifications = [
        {
          id: 1,
          recipient_id: 'user-123',
          verb: 'comment_post',
          unread: true,
        },
      ];

      setupFromMock('notifications', mockSuccessResponse(mockNotifications));

      // Act
      const result = await supabaseForumService.getNotifications();

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
      const result = await supabaseForumService.getNotifications();

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      // Arrange
      setupFromMock('notifications', mockSuccessResponse([{ id: 1, unread: false }]));

      // Act
      const result = await supabaseForumService.markNotificationAsRead(1);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notifications');
    });

    it('should handle errors', async () => {
      // Arrange
      setupFromMock('notifications', mockErrorResponse('Update failed', 'UPDATE_ERROR'));

      // Act
      const result = await supabaseForumService.markNotificationAsRead(1);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
