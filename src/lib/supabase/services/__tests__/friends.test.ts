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

  describe('getMyFriends', () => {
    it('should return list of friends', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockFriends = [
        {
          id: 1,
          user_id: 'user-123',
          friend_id: 'friend-1',
          friend_username: 'Friend 1',
          friend_avatar: 'avatar1.jpg',
          friend_bio: 'Bio 1',
          created_at: '2023-01-01',
        },
      ];

      setupFromMock('friends_with_profile', mockSuccessResponse(mockFriends));

      const result = await supabaseFriendsService.getMyFriends();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].friendUsername).toBe('Friend 1');
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.getMyFriends();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle database errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('friends_with_profile', {
        data: null,
        error: { message: 'DB Error' },
      });

      const result = await supabaseFriendsService.getMyFriends();

      expect(result.success).toBe(false);
    });
  });

  describe('getReceivedRequests', () => {
    it('should return list of received requests', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockRequests = [
        {
          id: 1,
          sender_id: 'sender-1',
          receiver_id: 'user-123',
          status: 'pending',
          message: 'Hello',
          sender_username: 'Sender 1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      ];

      setupFromMock('friend_requests_with_profile', mockSuccessResponse(mockRequests));

      const result = await supabaseFriendsService.getReceivedRequests();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].senderUsername).toBe('Sender 1');
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.getReceivedRequests();

      expect(result.success).toBe(false);
    });
  });

  describe('sendFriendRequest', () => {
    it('should send request successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock existing friend check (not friends)
      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: null, error: null });

      // Mock existing request check (no request)
      const mockMaybeSingleRequest = jest.fn().mockResolvedValue({ data: null, error: null });

      // Mock insert
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 1,
          sender_id: 'user-123',
          receiver_id: 'target-user',
          status: 'pending',
          message: 'Hello',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        error: null,
      });

      // Setup mocks in sequence
      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({ // friends check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleFriend,
        })
        .mockReturnValueOnce({ // requests check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleRequest,
        })
        .mockReturnValueOnce({ // insert
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle,
        });

      const result = await supabaseFriendsService.sendFriendRequest('target-user', 'Hello');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('pending');
    });

    it('should fail if already friends', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock existing friend check (already friends)
      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingleFriend,
      });

      const result = await supabaseFriendsService.sendFriendRequest('target-user');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ALREADY_FRIENDS');
    });

    it('should fail if request already exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock existing friend check (not friends)
      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: null, error: null });

      // Mock existing request check (request exists)
      const mockMaybeSingleRequest = jest.fn().mockResolvedValue({
        data: { id: 1, status: 'pending' },
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleFriend,
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleRequest,
        });

      const result = await supabaseFriendsService.sendFriendRequest('target-user');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('REQUEST_EXISTS');
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
    it('should accept request successfully', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: 1, status: 'accepted' }, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabaseFriendsService.acceptFriendRequest(1);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should handle error when accepting request', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Update Error' } });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabaseFriendsService.acceptFriendRequest(1);

      expect(result.success).toBe(false);
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject request successfully', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: 1, status: 'rejected' }, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabaseFriendsService.rejectFriendRequest(1);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe('acceptFriendRequestBySenderId', () => {
    it('should accept request by sender id successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock find request
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      // Mock update request
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEqUpdate = jest.fn().mockReturnThis();

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({ // find
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingle,
        })
        .mockReturnValueOnce({ // update
          update: mockUpdate,
          eq: mockEqUpdate,
        });

      const result = await supabaseFriendsService.acceptFriendRequestBySenderId('sender-1');

      expect(result.success).toBe(true);
    });

    it('should fail if request not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock find request (not found)
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      });

      const result = await supabaseFriendsService.acceptFriendRequestBySenderId('sender-1');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.acceptFriendRequestBySenderId('sender-1');

      expect(result.success).toBe(false);
    });
  });

  describe('removeFriend', () => {
    it('should remove friend successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await supabaseFriendsService.removeFriend('friend-1');

      expect(result.success).toBe(true);
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.removeFriend('friend-1');

      expect(result.success).toBe(false);
    });
  });

  describe('isFriend', () => {
    it('should return true if friends', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      });

      const result = await supabaseFriendsService.isFriend('friend-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should return false if not friends', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      });

      const result = await supabaseFriendsService.isFriend('friend-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it('should return false if not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabaseFriendsService.isFriend('friend-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe('getFriendRequestStatus', () => {
    it('should return "friends" if already friends', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingleFriend,
      });

      const result = await supabaseFriendsService.getFriendRequestStatus('target-user');

      expect(result.data).toBe('friends');
    });

    it('should return "sent" if request sent', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockMaybeSingleSent = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({ // friends check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleFriend,
        })
        .mockReturnValueOnce({ // sent check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleSent,
        });

      const result = await supabaseFriendsService.getFriendRequestStatus('target-user');

      expect(result.data).toBe('sent');
    });

    it('should return "received" if request received', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockMaybeSingleSent = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockMaybeSingleReceived = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null });

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({ // friends check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleFriend,
        })
        .mockReturnValueOnce({ // sent check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleSent,
        })
        .mockReturnValueOnce({ // received check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleReceived,
        });

      const result = await supabaseFriendsService.getFriendRequestStatus('target-user');

      expect(result.data).toBe('received');
    });

    it('should return "none" if no relationship', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockMaybeSingleFriend = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockMaybeSingleSent = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockMaybeSingleReceived = jest.fn().mockResolvedValue({ data: null, error: null });

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({ // friends check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleFriend,
        })
        .mockReturnValueOnce({ // sent check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleSent,
        })
        .mockReturnValueOnce({ // received check
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingleReceived,
        });

      const result = await supabaseFriendsService.getFriendRequestStatus('target-user');

      expect(result.data).toBe('none');
    });
  });
});
