import { supabase } from '../client';
import * as client from '../client';
import { logger } from '@/src/utils/logger';

// Mock dependencies
jest.mock('@/src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      setSession: jest.fn(),
    },
  })),
}));

// Mock the client module itself to allow spying on exported functions
jest.mock('../client', () => {
  const originalModule = jest.requireActual('../client');
  return {
    __esModule: true,
    ...originalModule,
    getSession: jest.fn(originalModule.getSession),
    isAuthenticated: jest.fn(originalModule.isAuthenticated),
    getCurrentUserId: jest.fn(originalModule.getCurrentUserId),
    isSupabaseConfigured: jest.fn(originalModule.isSupabaseConfigured),
  };
});

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSupabaseConfigured', () => {
    it('should return boolean', () => {
      const result = client.isSupabaseConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getSession', () => {
    it('should return session when successful', async () => {
      const mockSession = { user: { id: '123' } };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Directly call the function from the module
      const session = await client.getSession();
      expect(session).toEqual(mockSession);
    });

    it('should return null and log error on failure', async () => {
      const mockError = { message: 'Error' };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const session = await client.getSession();
      expect(session).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('获取 Session 失败', mockError);
    });

    it('should return null and log error on exception', async () => {
      const mockError = new Error('Network error');
      (supabase.auth.getSession as jest.Mock).mockRejectedValue(mockError);

      const session = await client.getSession();
      expect(session).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('获取 Session 异常', mockError);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
      const result = await client.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false if no session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      const result = await client.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user id if session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      });
      const userId = await client.getCurrentUserId();
      expect(userId).toBe('user-123');
    });

    it('should return null if no session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      const userId = await client.getCurrentUserId();
      expect(userId).toBeNull();
    });
  });
});
