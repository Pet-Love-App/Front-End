/**
 * Catfood Service 集成测试
 *
 * 测试猫粮服务的各项功能
 */

import supabaseCatfoodService from '../catfood';
import { resetAllMocks, mockSupabaseClient } from '../../__tests__/setup';

describe('Supabase Catfood Service', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Service API', () => {
    it('should have listCatfoods method', () => {
      expect(typeof supabaseCatfoodService.listCatfoods).toBe('function');
    });

    it('should have getCatfoodDetail method', () => {
      expect(typeof supabaseCatfoodService.getCatfoodDetail).toBe('function');
    });

    it('should have toggleLike method', () => {
      expect(typeof supabaseCatfoodService.toggleLike).toBe('function');
    });

    it('should have toggleFavorite method', () => {
      expect(typeof supabaseCatfoodService.toggleFavorite).toBe('function');
    });

    it('should have createRating method', () => {
      expect(typeof supabaseCatfoodService.createRating).toBe('function');
    });

    it('should have deleteRating method', () => {
      expect(typeof supabaseCatfoodService.deleteRating).toBe('function');
    });
  });

  describe('listCatfoods', () => {
    it('should return response with data and error properties', async () => {
      // Arrange
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      // Act
      const result = await supabaseCatfoodService.listCatfoods();

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should accept pagination parameters', async () => {
      // Act & Assert - should not throw
      await expect(
        supabaseCatfoodService.listCatfoods({ page: 1, pageSize: 20 })
      ).resolves.toBeDefined();
    });

    it('should accept search parameter', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.listCatfoods({ search: 'test' })).resolves.toBeDefined();
    });
  });

  describe('getCatfoodDetail', () => {
    it('should accept catfood id', async () => {
      // Arrange
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: '1',
            ingredients: [],
            additives: [],
            tags: [],
          },
          error: null,
        }),
      } as any);

      // Act & Assert
      await expect(supabaseCatfoodService.getCatfoodDetail('1')).resolves.toBeDefined();
    });

    it('should return response structure', async () => {
      // Arrange
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: '1',
            ingredients: [],
            additives: [],
            tags: [],
          },
          error: null,
        }),
      } as any);

      // Act
      const result = await supabaseCatfoodService.getCatfoodDetail('1');

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('toggleLike', () => {
    it('should accept catfood id', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.toggleLike('1')).resolves.toBeDefined();
    });

    it('should return response structure', async () => {
      // Act
      const result = await supabaseCatfoodService.toggleLike('1');

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('toggleFavorite', () => {
    it('should accept catfood id', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.toggleFavorite('1')).resolves.toBeDefined();
    });

    it('should return response structure', async () => {
      // Act
      const result = await supabaseCatfoodService.toggleFavorite('1');

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('createRating', () => {
    it('should accept rating parameters', async () => {
      // Act & Assert
      await expect(
        supabaseCatfoodService.createRating('1', 5, 'Great food')
      ).resolves.toBeDefined();
    });

    it('should accept rating without comment', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.createRating('1', 5)).resolves.toBeDefined();
    });

    it('should return response structure', async () => {
      // Act
      const result = await supabaseCatfoodService.createRating('1', 5);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('deleteRating', () => {
    it('should accept catfood id', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.deleteRating('1')).resolves.toBeDefined();
    });

    it('should return response structure', async () => {
      // Act
      const result = await supabaseCatfoodService.deleteRating('1');

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('error handling', () => {
    it('should handle invalid id gracefully', async () => {
      // Arrange
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'invalid',
            ingredients: [],
            additives: [],
            tags: [],
          },
          error: null,
        }),
      } as any);

      // Act & Assert - should not throw
      await expect(supabaseCatfoodService.getCatfoodDetail('invalid')).resolves.toBeDefined();
    });

    it('should handle missing required parameters', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.listCatfoods({})).resolves.toBeDefined();
    });
  });

  describe('defensive programming', () => {
    it('should handle null values', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.createRating('1', 5, null as any)).resolves.toBeDefined();
    });

    it('should handle empty strings', async () => {
      // Act & Assert
      await expect(supabaseCatfoodService.createRating('1', 5, '')).resolves.toBeDefined();
    });
  });

  describe('listCatfoods error handling', () => {
    it('should handle database error during list', async () => {
      // Arrange
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: '500' },
        }),
      } as any);

      // Act
      const result = await supabaseCatfoodService.listCatfoods();

      // Assert
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Database error');
    });
  });
});
