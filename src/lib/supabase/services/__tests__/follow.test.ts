/**
 * Follow Service 测试
 */

import { supabaseFollowService } from '../follow';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
} from '../../__tests__/setup';

describe('SupabaseFollowService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Service API', () => {
    it('should have followUser method', () => {
      expect(typeof supabaseFollowService.followUser).toBe('function');
    });

    it('should have unfollowUser method', () => {
      expect(typeof supabaseFollowService.unfollowUser).toBe('function');
    });

    it('should have getFollowers method', () => {
      expect(typeof supabaseFollowService.getFollowers).toBe('function');
    });

    it('should have getFollowing method', () => {
      expect(typeof supabaseFollowService.getFollowing).toBe('function');
    });

    it('should have isFollowing method', () => {
      expect(typeof supabaseFollowService.isFollowing).toBe('function');
    });
  });

  describe('followUser', () => {
    it('should return response structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('follows', mockSuccessResponse([]));

      const result = await supabaseFollowService.followUser('target-user');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFollowService.followUser('target-user');

      expect(result.success).toBe(false);
    });
  });

  describe('unfollowUser', () => {
    it('should return response structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('follows', mockSuccessResponse(null));

      const result = await supabaseFollowService.unfollowUser('target-user');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('getFollowers', () => {
    it('should return response structure', async () => {
      setupFromMock('follows', mockSuccessResponse([]));

      const result = await supabaseFollowService.getFollowers('user-123');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('getFollowing', () => {
    it('should return response structure', async () => {
      setupFromMock('follows', mockSuccessResponse([]));

      const result = await supabaseFollowService.getFollowing('user-123');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('isFollowing', () => {
    it('should return response structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
      }));

      const result = await supabaseFollowService.isFollowing('target-user');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });
});
