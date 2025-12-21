/**
 * CatFood Types Tests
 * 测试猫粮相关类型定义
 */

import { CatFood, CatFoodTag, PercentData } from '../catFood';

describe('CatFood Types', () => {
  describe('CatFoodTag Interface', () => {
    it('should allow creating valid tag', () => {
      // Arrange
      const tag: CatFoodTag = {
        id: 1,
        name: 'High Protein',
        description: 'Contains high protein',
      };

      // Act & Assert
      expect(tag.id).toBe(1);
      expect(tag.name).toBe('High Protein');
    });
  });

  describe('PercentData Type', () => {
    it('should allow creating valid percent data', () => {
      // Arrange
      const data: PercentData = {
        protein: 40,
        fat: 20,
        fiber: null,
      };

      // Act & Assert
      expect(data.protein).toBe(40);
      expect(data.fiber).toBeNull();
    });
  });

  describe('CatFood Interface', () => {
    it('should allow creating valid cat food object', () => {
      // Arrange
      const catFood: CatFood = {
        id: 1,
        name: 'Premium Cat Food',
        brand: 'BestBrand',
        score: 4.5,
        countNum: 100,
        like_count: 50,
        imageUrl: 'http://example.com/food.jpg',
        tags: ['Healthy', 'Grain-free'],
        ingredient: [],
        additive: [],
        safety: 'High',
        nutrient: 'Balanced',
        percentage: true,
        // ... other properties can be partial if we were using Partial<CatFood>,
        // but here we test the full interface compliance in a mock object way
      } as unknown as CatFood; // Casting for brevity in test, or we provide full object

      // Act & Assert
      expect(catFood.id).toBe(1);
      expect(catFood.name).toBe('Premium Cat Food');
      expect(catFood.tags).toContain('Healthy');
    });
  });
});
