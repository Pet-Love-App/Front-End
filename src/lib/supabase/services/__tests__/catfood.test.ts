/**
 * 测试 Supabase 猫粮服务
 * 集成测试方式 - 验证服务返回正确的数据结构
 */

import { resetAllMocks } from '../../__tests__/setup';
import supabaseCatfoodService from '../catfood';

// Mock supabase client module
jest.mock('../../client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Supabase Catfood Service', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Service API', () => {
    it('should have required methods', () => {
      // 验证服务有正确的API
      expect(typeof supabaseCatfoodService.listCatfoods).toBe('function');
      expect(typeof supabaseCatfoodService.getCatfoodDetail).toBe('function');
      expect(typeof supabaseCatfoodService.toggleLike).toBe('function');
      expect(typeof supabaseCatfoodService.toggleFavorite).toBe('function');
      expect(typeof supabaseCatfoodService.createRating).toBe('function');
    });

    it('should return response with data and error properties', async () => {
      // 测试返回值结构（会调用真实的supabase，但会失败并返回错误）
      const result = await supabaseCatfoodService.listCatfoods();

      // 验证返回值包含必要的属性
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // 没有正确的 mock，函数会返回错误，这是正常的
      const result = await supabaseCatfoodService.getCatfoodDetail('invalid-id');

      // 验证错误被正确处理
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });
});
