/**
 * Forum Service 集成测试
 */

import { supabaseForumService } from '../forum';
import { resetAllMocks } from '../../__tests__/setup';

// Mock expo modules
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
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

  describe('Service API', () => {
    it('should have getPosts method', () => {
      expect(typeof supabaseForumService.getPosts).toBe('function');
    });

    it('should have getPostDetail method', () => {
      expect(typeof supabaseForumService.getPostDetail).toBe('function');
    });

    it('should have createPost method', () => {
      expect(typeof supabaseForumService.createPost).toBe('function');
    });

    it('should have updatePost method', () => {
      expect(typeof supabaseForumService.updatePost).toBe('function');
    });

    it('should have deletePost method', () => {
      expect(typeof supabaseForumService.deletePost).toBe('function');
    });

    it('should have toggleLike method', () => {
      expect(typeof supabaseForumService.toggleLike).toBe('function');
    });

    it('should have toggleFavorite method', () => {
      expect(typeof supabaseForumService.toggleFavorite).toBe('function');
    });
  });

  describe('getPosts', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.getPosts();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept pagination parameters', async () => {
      await expect(supabaseForumService.getPosts({ page: 1, pageSize: 20 })).resolves.toBeDefined();
    });

    it('should accept category filter', async () => {
      await expect(supabaseForumService.getPosts({ category: 'help' })).resolves.toBeDefined();
    });
  });

  describe('getPostDetail', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.getPostDetail(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept post id', async () => {
      await expect(supabaseForumService.getPostDetail(1)).resolves.toBeDefined();
    });
  });

  describe('createPost', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.createPost({ content: 'Test' });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept content parameter', async () => {
      await expect(
        supabaseForumService.createPost({ content: 'Test post' })
      ).resolves.toBeDefined();
    });

    it('should accept category parameter', async () => {
      await expect(
        supabaseForumService.createPost({ content: 'Test', category: 'share' })
      ).resolves.toBeDefined();
    });
  });

  describe('updatePost', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.updatePost(1, { content: 'Updated' });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept post id and updates', async () => {
      await expect(
        supabaseForumService.updatePost(1, { content: 'Updated content' })
      ).resolves.toBeDefined();
    });
  });

  describe('deletePost', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.deletePost(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept post id', async () => {
      await expect(supabaseForumService.deletePost(1)).resolves.toBeDefined();
    });
  });

  describe('toggleLike', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.toggleLike(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept post id', async () => {
      await expect(supabaseForumService.toggleLike(1)).resolves.toBeDefined();
    });
  });

  describe('toggleFavorite', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.toggleFavorite(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept post id', async () => {
      await expect(supabaseForumService.toggleFavorite(1)).resolves.toBeDefined();
    });
  });

  describe('getNotifications', () => {
    it('should return response structure', async () => {
      const result = await supabaseForumService.getNotifications();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept unread only parameter', async () => {
      await expect(supabaseForumService.getNotifications(true)).resolves.toBeDefined();
    });
  });

  describe('service methods', () => {
    it('should have all core methods', () => {
      expect(typeof supabaseForumService.getPosts).toBe('function');
      expect(typeof supabaseForumService.getPostDetail).toBe('function');
      expect(typeof supabaseForumService.createPost).toBe('function');
      expect(typeof supabaseForumService.updatePost).toBe('function');
      expect(typeof supabaseForumService.deletePost).toBe('function');
      expect(typeof supabaseForumService.toggleLike).toBe('function');
      expect(typeof supabaseForumService.toggleFavorite).toBe('function');
      expect(typeof supabaseForumService.getNotifications).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle invalid post id', async () => {
      await expect(supabaseForumService.getPostDetail(999)).resolves.toBeDefined();
    });

    it('should handle missing parameters', async () => {
      await expect(supabaseForumService.getPosts({})).resolves.toBeDefined();
    });
  });
});
