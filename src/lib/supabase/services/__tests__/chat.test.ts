
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
});
