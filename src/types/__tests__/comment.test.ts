/**
 * Comment Types Tests
 * 测试评论相关类型定义
 */

import { Comment, CommentAuthor, CreateCommentParams } from '../comment';

describe('Comment Types', () => {
  describe('CommentAuthor Interface', () => {
    it('should allow creating valid author', () => {
      // Arrange
      const author: CommentAuthor = {
        id: 1,
        username: 'user1',
        avatar: 'http://example.com/avatar.jpg',
      };

      // Act & Assert
      expect(author.id).toBe(1);
      expect(author.username).toBe('user1');
    });
  });

  describe('Comment Interface', () => {
    it('should allow creating valid comment', () => {
      // Arrange
      const comment: Comment = {
        id: 1,
        content: 'Great post!',
        author: {
          id: 1,
          username: 'user1',
        },
        createdAt: '2023-01-01',
        likes: 10,
        isLiked: true,
      };

      // Act & Assert
      expect(comment.content).toBe('Great post!');
      expect(comment.likes).toBe(10);
      expect(comment.isLiked).toBe(true);
    });
  });

  describe('CreateCommentParams Interface', () => {
    it('should allow creating valid create params', () => {
      // Arrange
      const params: CreateCommentParams = {
        content: 'New comment',
        targetId: 100,
        targetType: 'post',
      };

      // Act & Assert
      expect(params.content).toBe('New comment');
      expect(params.targetType).toBe('post');
    });
  });
});
