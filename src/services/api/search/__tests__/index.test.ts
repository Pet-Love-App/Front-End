/**
 * Search Service Tests
 * 测试搜索服务
 */

import { searchService } from '../index';
import { API_BASE_URL } from '@/src/config/env';

// Mock global fetch
global.fetch = jest.fn();

// Mock env
jest.mock('@/src/config/env', () => ({
  API_BASE_URL: 'http://test-api.com',
}));

describe('Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchBaike', () => {
    it('should return data when search is successful', async () => {
      // Arrange
      const mockData = {
        ok: true,
        data: {
          title: 'Ingredient',
          extract: 'Description',
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockData),
      });

      // Act
      const result = await searchService.searchBaike({ ingredient: 'test' });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/search/ingredient/info',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ingredient: 'test' }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should return failure message when not found', async () => {
      // Arrange
      const mockData = {
        ok: false,
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockData),
      });

      // Act
      const result = await searchService.searchBaike({ ingredient: 'unknown' });

      // Assert
      expect(result.ok).toBe(false);
      expect(result.message).toBe('未找到相关信息');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

      // Act
      const result = await searchService.searchBaike({ ingredient: 'test' });

      // Assert
      expect(result.ok).toBe(false);
      expect(result.message).toBe('搜索服务不可用');
    });
  });
});
