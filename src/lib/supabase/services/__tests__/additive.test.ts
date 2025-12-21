import { supabase } from '../../client';
import { supabaseAdditiveService } from '../additive';
import { logger } from '@/src/utils/logger';

// Mock dependencies
jest.mock('../../client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      ilike: jest.fn(),
      or: jest.fn(),
      single: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
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

describe('Supabase Additive Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchAdditive', () => {
    it('should return exact match if found', async () => {
      const mockData = {
        id: 1,
        name: 'Taurine',
        en_name: 'Taurine',
        type: 'Amino Acid',
        applicable_range: 'Cats',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        limit: mockLimit,
        single: mockSingle,
      });

      const result = await supabaseAdditiveService.searchAdditive('Taurine');

      expect(result.data).toEqual({
        matchType: 'exact',
        additive: expect.objectContaining({ name: 'Taurine' }),
        query: 'Taurine',
        notFound: false,
      });
    });

    it('should return fuzzy match if exact match fails', async () => {
      // Mock exact match failure
      const mockSelectExact = jest.fn().mockReturnThis();
      const mockIlikeExact = jest.fn().mockReturnThis();
      const mockLimitExact = jest.fn().mockReturnThis();
      const mockSingleExact = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      // Mock fuzzy match success
      const mockDataFuzzy = [{
        id: 1,
        name: 'Taurine',
        en_name: 'Taurine',
        type: 'Amino Acid',
        applicable_range: 'Cats',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      }];

      const mockSelectFuzzy = jest.fn().mockReturnThis();
      const mockIlikeFuzzy = jest.fn().mockReturnThis();
      const mockLimitFuzzy = jest.fn().mockResolvedValue({ data: mockDataFuzzy, error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ // Exact match call
          select: mockSelectExact,
          ilike: mockIlikeExact,
          limit: mockLimitExact,
          single: mockSingleExact,
        })
        .mockReturnValueOnce({ // Fuzzy match call
          select: mockSelectFuzzy,
          ilike: mockIlikeFuzzy,
          limit: mockLimitFuzzy,
        });

      const result = await supabaseAdditiveService.searchAdditive('Taur');

      expect(result.data).toEqual({
        matchType: 'fuzzy_single',
        additive: expect.objectContaining({ name: 'Taurine' }),
        query: 'Taur',
        notFound: false,
      });
    });

    it('should return not found if both fail', async () => {
       // Mock exact match failure
       const mockSelectExact = jest.fn().mockReturnThis();
       const mockIlikeExact = jest.fn().mockReturnThis();
       const mockLimitExact = jest.fn().mockReturnThis();
       const mockSingleExact = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

       // Mock fuzzy match failure
       const mockSelectFuzzy = jest.fn().mockReturnThis();
       const mockIlikeFuzzy = jest.fn().mockReturnThis();
       const mockLimitFuzzy = jest.fn().mockResolvedValue({ data: [], error: null });

       (supabase.from as jest.Mock)
         .mockReturnValueOnce({ // Exact match call
           select: mockSelectExact,
           ilike: mockIlikeExact,
           limit: mockLimitExact,
           single: mockSingleExact,
         })
         .mockReturnValueOnce({ // Fuzzy match call
           select: mockSelectFuzzy,
           ilike: mockIlikeFuzzy,
           limit: mockLimitFuzzy,
         });

      const result = await supabaseAdditiveService.searchAdditive('Unknown');

      expect(result.data).toEqual({
        matchType: 'not_found',
        query: 'Unknown',
        notFound: true,
      });
    });
  });

  describe('addAdditive', () => {
    it('should add a new additive', async () => {
      const newAdditive = { name: 'New Additive' };
      const mockData = {
        id: 2,
        name: 'New Additive',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabaseAdditiveService.addAdditive(newAdditive);
      expect(result.data).toEqual(expect.objectContaining({ id: 2, name: 'New Additive' }));
    });
  });
});
