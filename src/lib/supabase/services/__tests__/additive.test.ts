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
      const mockSingleExact = jest
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      // Mock fuzzy match success
      const mockDataFuzzy = [
        {
          id: 1,
          name: 'Taurine',
          en_name: 'Taurine',
          type: 'Amino Acid',
          applicable_range: 'Cats',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      ];

      const mockSelectFuzzy = jest.fn().mockReturnThis();
      const mockIlikeFuzzy = jest.fn().mockReturnThis();
      const mockLimitFuzzy = jest.fn().mockResolvedValue({ data: mockDataFuzzy, error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          // Exact match call
          select: mockSelectExact,
          ilike: mockIlikeExact,
          limit: mockLimitExact,
          single: mockSingleExact,
        })
        .mockReturnValueOnce({
          // Fuzzy match call
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

    it('should return not found if both exact and fuzzy match fail', async () => {
      // Mock exact match failure
      const mockSelectExact = jest.fn().mockReturnThis();
      const mockIlikeExact = jest.fn().mockReturnThis();
      const mockLimitExact = jest.fn().mockReturnThis();
      const mockSingleExact = jest
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      // Mock fuzzy match failure
      const mockSelectFuzzy = jest.fn().mockReturnThis();
      const mockIlikeFuzzy = jest.fn().mockReturnThis();
      const mockLimitFuzzy = jest.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          // Exact match call
          select: mockSelectExact,
          ilike: mockIlikeExact,
          limit: mockLimitExact,
          single: mockSingleExact,
        })
        .mockReturnValueOnce({
          // Fuzzy match call
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

    it('should handle errors gracefully', async () => {
      // Mock exact match error
      const mockSelectExact = jest.fn().mockReturnThis();
      const mockIlikeExact = jest.fn().mockReturnThis();
      const mockLimitExact = jest.fn().mockReturnThis();
      const mockSingleExact = jest
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      // Mock fuzzy match error
      const mockSelectFuzzy = jest.fn().mockReturnThis();
      const mockIlikeFuzzy = jest.fn().mockReturnThis();
      const mockLimitFuzzy = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelectExact,
          ilike: mockIlikeExact,
          limit: mockLimitExact,
          single: mockSingleExact,
        })
        .mockReturnValueOnce({
          select: mockSelectFuzzy,
          ilike: mockIlikeFuzzy,
          limit: mockLimitFuzzy,
        });

      const result = await supabaseAdditiveService.searchAdditive('Error');

      expect(result.error).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('searchIngredient', () => {
    it('should return ingredient if found', async () => {
      const mockData = {
        id: 1,
        name: 'Chicken',
        type: 'Meat',
        label: 'High Protein',
        desc: 'Good source of protein',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        or: mockOr,
        limit: mockLimit,
        single: mockSingle,
      });

      const result = await supabaseAdditiveService.searchIngredient('Chicken');

      expect(result.data).toEqual({
        ingredient: expect.objectContaining({ name: 'Chicken' }),
        query: 'Chicken',
        notFound: false,
      });
    });

    it('should return not found if ingredient does not exist', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        or: mockOr,
        limit: mockLimit,
        single: mockSingle,
      });

      const result = await supabaseAdditiveService.searchIngredient('Unknown');

      expect(result.data).toEqual({
        query: 'Unknown',
        notFound: true,
      });
    });

    it('should handle unexpected errors', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockRejectedValue(new Error('Unexpected Error'));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        or: mockOr,
        limit: mockLimit,
        single: mockSingle,
      });

      const result = await supabaseAdditiveService.searchIngredient('Error');

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('addAdditive', () => {
    it('should add additive successfully', async () => {
      const mockData = {
        id: 1,
        name: 'New Additive',
        en_name: 'New Additive',
        type: 'Type',
        applicable_range: 'All',
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

      const params = {
        name: 'New Additive',
        enName: 'New Additive',
        type: 'Type',
        applicableRange: 'All',
      };
      const result = await supabaseAdditiveService.addAdditive(params);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({ name: 'New Additive' }));
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'New Additive',
        en_name: 'New Additive',
        type: 'Type',
        applicable_range: 'All',
      });
    });

    it('should handle error when adding additive', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Insert Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const params = { name: 'New Additive' };
      const result = await supabaseAdditiveService.addAdditive(params);

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('addIngredient', () => {
    it('should add ingredient successfully', async () => {
      const mockData = {
        id: 1,
        name: 'New Ingredient',
        type: 'Type',
        label: 'Label',
        desc: 'Desc',
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

      const params = { name: 'New Ingredient', type: 'Type', label: 'Label', desc: 'Desc' };
      const result = await supabaseAdditiveService.addIngredient(params);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({ name: 'New Ingredient' }));
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'New Ingredient',
        type: 'Type',
        label: 'Label',
        desc: 'Desc',
      });
    });

    it('should handle error when adding ingredient', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Insert Error' } });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const params = { name: 'New Ingredient' };
      const result = await supabaseAdditiveService.addIngredient(params);

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
