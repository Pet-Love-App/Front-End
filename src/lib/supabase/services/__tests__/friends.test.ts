/**
 * Friends Service 测试
 */

import { supabaseFriendsService } from '../friends';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
} from '../../__tests__/setup';

describe('SupabaseFriendsService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Service API', () => {
    it('should have sendFriendRequest method', () => {
      expect(typeof supabaseFriendsService.sendFriendRequest).toBe('function');
    });

    it('should have acceptFriendRequest method', () => {
      expect(typeof supabaseFriendsService.acceptFriendRequest).toBe('function');
    });

    it('should have rejectFriendRequest method', () => {
      expect(typeof supabaseFriendsService.rejectFriendRequest).toBe('function');
    });

    it('should have getMyFriends method', () => {
      expect(typeof supabaseFriendsService.getMyFriends).toBe('function');
    });

    it('should have friend request methods', () => {
      expect(typeof supabaseFriendsService.sendFriendRequest).toBe('function');
      expect(typeof supabaseFriendsService.acceptFriendRequest).toBe('function');
      expect(typeof supabaseFriendsService.rejectFriendRequest).toBe('function');
    });

    it('should have removeFriend method', () => {
      expect(typeof supabaseFriendsService.removeFriend).toBe('function');
    });
  });

  describe('sendFriendRequest', () => {
    it('should return response structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('friend_requests', mockSuccessResponse([{ id: 1 }]));

      const result = await supabaseFriendsService.sendFriendRequest('target-user', 'Hello');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.sendFriendRequest('target-user');

      expect(result.success).toBe(false);
    });
  });

  describe('acceptFriendRequest', () => {
    it('should return response structure', async () => {
      setupFromMock('friend_requests', mockSuccessResponse([{ id: 1 }]));

      const result = await supabaseFriendsService.acceptFriendRequest(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('rejectFriendRequest', () => {
    it('should return response structure', async () => {
      setupFromMock('friend_requests', mockSuccessResponse([{ id: 1 }]));

      const result = await supabaseFriendsService.rejectFriendRequest(1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('getMyFriends', () => {
    it('should return response structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('friends', mockSuccessResponse([]));

      const result = await supabaseFriendsService.getMyFriends();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.getMyFriends();

      expect(result.success).toBe(false);
    });
  });

  describe('getMyFriends', () => {
    it('should return friends list', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('friends', mockSuccessResponse([]));

      const result = await supabaseFriendsService.getMyFriends();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('removeFriend', () => {
    it('should return response structure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('friends', mockSuccessResponse(null));

      const result = await supabaseFriendsService.removeFriend('friend-id');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });
});
