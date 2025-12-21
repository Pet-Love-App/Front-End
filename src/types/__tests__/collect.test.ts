/**
 * Collect Types Tests
 * 测试收藏相关类型定义
 */

import { CatfoodFavorite, ReportFavorite } from '../collect';

describe('Collect Types', () => {
  describe('CatfoodFavorite Interface', () => {
    it('should allow creating valid catfood favorite', () => {
      // Arrange
      const favorite: CatfoodFavorite = {
        id: 'fav-1',
        catfoodId: 'food-1',
        catfood: {
          id: 'food-1',
          name: 'Tasty Food',
          brand: 'Brand A',
          score: 5,
        },
        createdAt: '2023-01-01',
      };

      // Act & Assert
      expect(favorite.id).toBe('fav-1');
      expect(favorite.catfood.name).toBe('Tasty Food');
    });
  });

  describe('ReportFavorite Interface', () => {
    it('should allow creating valid report favorite', () => {
      // Arrange
      const favorite: ReportFavorite = {
        id: 1,
        reportId: 101,
        report: {
          id: 101,
          catfoodName: 'Analyzed Food',
          createdAt: '2023-01-01',
        },
      };

      // Act & Assert
      expect(favorite.id).toBe(1);
      expect(favorite.report.catfoodName).toBe('Analyzed Food');
    });
  });
});
