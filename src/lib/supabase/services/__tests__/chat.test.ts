import { supabase } from '../../client';
import { supabaseChatService } from '../chat';
import { logger } from '@/src/utils/logger';

// Mock dependencies
jest.mock('../../client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      or: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
      range: jest.fn(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
  },
}));

jest.mock('@/src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Supabase Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateConversation', () => {
    it('should return existing conversation if found', async () => {
      const mockUser = { id: 'user1' };
      const otherUserId = 'user2';
      const mockConversation = {
        id: 1,
        participant1_id: 'user1',
        participant2_id: 'user2',
        last_message_at: '2023-01-01',
        created_at: '2023-01-01',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockConversation, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        maybeSingle: mockMaybeSingle,
      });

      const result = await supabaseChatService.getOrCreateConversation(otherUserId);

      expect(result.data).toEqual({
        id: 1,
        participant1Id: 'user1',
        participant2Id: 'user2',
        lastMessageAt: '2023-01-01',
        createdAt: '2023-01-01',
      });
    });

    it('should create new conversation if not found', async () => {
      const mockUser = { id: 'user1' };
      const otherUserId = 'user2';
      const newConversation = {
        id: 2,
        participant1_id: 'user1',
        participant2_id: 'user2',
        last_message_at: '2023-01-01',
        created_at: '2023-01-01',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockInsert = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: newConversation, error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ // Check existing
          select: mockSelect,
          or: mockOr,
          maybeSingle: mockMaybeSingle,
        })
        .mockReturnValueOnce({ // Create new
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle,
        });

      const result = await supabaseChatService.getOrCreateConversation(otherUserId);

      expect(result.data).toEqual({
        id: 2,
        participant1Id: 'user1',
        participant2Id: 'user2',
        lastMessageAt: '2023-01-01',
        createdAt: '2023-01-01',
      });
    });

    it('should return error if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const result = await supabaseChatService.getOrCreateConversation('user2');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });
  });

  describe('getMyConversations', () => {
    it('should return conversations with unread counts', async () => {
      const mockUser = { id: 'user1' };
      const mockConversations = [
        {
          id: 1,
          participant1_id: 'user1',
          participant2_id: 'user2',
          last_message_at: '2023-01-01',
          created_at: '2023-01-01',
          participant1_username: 'User 1',
          participant1_avatar: 'avatar1.png',
          participant2_username: 'User 2',
          participant2_avatar: 'avatar2.png',
          last_message: 'Hello',
          last_sender_id: 'user2',
        },
      ];
      const mockUnreadCounts = [{ conversation_id: 1, count: 5 }];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: mockConversations, error: null });
      const mockEq = jest.fn().mockResolvedValue({ data: mockUnreadCounts, error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ // conversations_with_participants
          select: mockSelect,
          or: mockOr,
          order: mockOrder,
        })
        .mockReturnValueOnce({ // unread_counts
          select: mockSelect,
          eq: mockEq,
        });

      const result = await supabaseChatService.getMyConversations();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].unreadCount).toBe(5);
      expect(result.data![0].participant2Username).toBe('User 2');
    });

    it('should return error if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const result = await supabaseChatService.getMyConversations();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle database error', async () => {
      const mockUser = { id: 'user1' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        order: mockOrder,
      });

      const result = await supabaseChatService.getMyConversations();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('DB Error');
    });
  });

  describe('getMessages', () => {
    it('should return messages', async () => {
      const mockMessages = [
        {
          id: 1,
          conversation_id: 1,
          sender_id: 'user2',
          content: 'Hello',
          message_type: 'text',
          is_read: false,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          sender_username: 'User 2',
          sender_avatar: 'avatar2.png',
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: mockMessages, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      });

      const result = await supabaseChatService.getMessages(1);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].content).toBe('Hello');
    });

    it('should handle database error', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      });

      const result = await supabaseChatService.getMessages(1);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('DB Error');
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockUser = { id: 'user1' };
      const mockMessage = {
        id: 1,
        conversation_id: 1,
        sender_id: 'user1',
        content: 'Hi',
        message_type: 'text',
        is_read: false,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockMessage, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabaseChatService.sendMessage(1, 'Hi');

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe('Hi');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        conversation_id: 1,
        sender_id: 'user1',
        content: 'Hi',
      }));
    });

    it('should return error if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const result = await supabaseChatService.sendMessage(1, 'Hi');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle database error', async () => {
      const mockUser = { id: 'user1' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabaseChatService.sendMessage(1, 'Hi');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('DB Error');
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read', async () => {
      const mockUser = { id: 'user1' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockNeq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        neq: mockNeq,
      });

      const result = await supabaseChatService.markMessagesAsRead(1);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
    });

    it('should return error if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const result = await supabaseChatService.markMessagesAsRead(1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle database error', async () => {
      const mockUser = { id: 'user1' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockNeq = jest.fn().mockResolvedValue({ error: { message: 'DB Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        neq: mockNeq,
      });

      const result = await supabaseChatService.markMessagesAsRead(1);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('DB Error');
    });
  });

  describe('getTotalUnreadCount', () => {
    it('should return total unread count', async () => {
      const mockUser = { id: 'user1' };
      const mockCounts = [{ count: 2 }, { count: 3 }];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: mockCounts, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      const result = await supabaseChatService.getTotalUnreadCount();

      expect(result.success).toBe(true);
      expect(result.data).toBe(5);
    });

    it('should return 0 if not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const result = await supabaseChatService.getTotalUnreadCount();

      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });

    it('should handle database error', async () => {
      const mockUser = { id: 'user1' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      const result = await supabaseChatService.getTotalUnreadCount();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('DB Error');
    });
  });
});
