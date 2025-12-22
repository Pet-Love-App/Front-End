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
      // Mock getCurrentUserId to return null
      const { getCurrentUserId } = require('../../client');
      getCurrentUserId.mockResolvedValueOnce(null);

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

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await supabaseFollowService.isFollowing('target-user');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should return false if not following', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      });

      const result = await supabaseFollowService.isFollowing('target-user');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe('getFollowStats', () => {
    it('should return follow stats', async () => {
      const mockFollowers = { count: 10, error: null };
      const mockFollowing = { count: 5, error: null };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest
        .fn()
        .mockResolvedValueOnce(mockFollowers)
        .mockResolvedValueOnce(mockFollowing);

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      const result = await supabaseFollowService.getFollowStats('user-123');

      expect(result.success).toBe(true);
      expect(result.data?.followersCount).toBe(10);
      expect(result.data?.followingCount).toBe(5);
    });

    it('should handle database errors', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ count: null, error: { message: 'DB Error' } });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      const result = await supabaseFollowService.getFollowStats('user-123');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('DB Error');
    });
  });

  describe('toggleFollow', () => {
    it('should follow if not following', async () => {
      // Mock isFollowing to return false
      jest.spyOn(supabaseFollowService, 'isFollowing').mockResolvedValue({
        data: false,
        error: null,
        success: true,
      });

      // Mock followUser
      jest.spyOn(supabaseFollowService, 'followUser').mockResolvedValue({
        data: true,
        error: null,
        success: true,
      });

      const result = await supabaseFollowService.toggleFollow('target-user');

      expect(result.success).toBe(true);
      expect(result.data?.isFollowing).toBe(true);
      expect(supabaseFollowService.followUser).toHaveBeenCalledWith('target-user');
    });

    it('should unfollow if already following', async () => {
      // Mock isFollowing to return true
      jest.spyOn(supabaseFollowService, 'isFollowing').mockResolvedValue({
        data: true,
        error: null,
        success: true,
      });

      // Mock unfollowUser
      jest.spyOn(supabaseFollowService, 'unfollowUser').mockResolvedValue({
        data: true,
        error: null,
        success: true,
      });

      const result = await supabaseFollowService.toggleFollow('target-user');

      expect(result.success).toBe(true);
      expect(result.data?.isFollowing).toBe(false);
      expect(supabaseFollowService.unfollowUser).toHaveBeenCalledWith('target-user');
    });
  });
});
