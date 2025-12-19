/**
 * Nutrition Constants 测试
 *
 * 测试营养数据常量和工具函数
 */

import {
  CHART_COLORS,
  NUTRITION_NAME_MAP,
  NUTRITION_COLOR_MAP,
  preparePieChartData,
  hasValidNutritionData,
  getNutritionLabel,
  getNutritionColor,
} from '../nutrition';

describe('Nutrition Constants', () => {
  describe('CHART_COLORS', () => {
    it('should have color array', () => {
      expect(CHART_COLORS).toBeDefined();
      expect(Array.isArray(CHART_COLORS)).toBe(true);
      expect(CHART_COLORS.length).toBeGreaterThan(0);
    });

    it('should have valid hex colors', () => {
      CHART_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('NUTRITION_NAME_MAP', () => {
    it('should map common nutrition keys', () => {
      expect(NUTRITION_NAME_MAP.protein).toBe('粗蛋白');
      expect(NUTRITION_NAME_MAP.fat).toBe('粗脂肪');
      expect(NUTRITION_NAME_MAP.carbohydrates).toBe('碳水化合物');
      expect(NUTRITION_NAME_MAP.fiber).toBe('粗纤维');
      expect(NUTRITION_NAME_MAP.ash).toBe('粗灰分');
    });

    it('should have aliases for snake_case keys', () => {
      expect(NUTRITION_NAME_MAP.crude_protein).toBe('粗蛋白');
      expect(NUTRITION_NAME_MAP.crude_fat).toBe('粗脂肪');
      expect(NUTRITION_NAME_MAP.crude_fiber).toBe('粗纤维');
      expect(NUTRITION_NAME_MAP.crude_ash).toBe('粗灰分');
    });
  });

  describe('NUTRITION_COLOR_MAP', () => {
    it('should map nutrition keys to colors', () => {
      expect(NUTRITION_COLOR_MAP.protein).toBeDefined();
      expect(NUTRITION_COLOR_MAP.fat).toBeDefined();
      expect(NUTRITION_COLOR_MAP.carbohydrates).toBeDefined();
    });

    it('should use Tamagui color tokens', () => {
      Object.values(NUTRITION_COLOR_MAP).forEach((color) => {
        expect(color).toMatch(/^\$/); // Starts with $
      });
    });
  });

  describe('preparePieChartData', () => {
    it('should convert percentData to pie chart format', () => {
      // Arrange
      const percentData = {
        protein: 30,
        fat: 15,
        carbohydrates: 40,
      };

      // Act
      const result = preparePieChartData(percentData);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('粗蛋白');
      expect(result[0].population).toBe(30);
      expect(result[0].color).toBeDefined();
    });

    it('should filter out null values', () => {
      // Arrange
      const percentData = {
        protein: 30,
        fat: null,
        carbohydrates: 40,
      };

      // Act
      const result = preparePieChartData(percentData);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.find((item) => item.name === '粗脂肪')).toBeUndefined();
    });

    it('should filter out zero values', () => {
      // Arrange
      const percentData = {
        protein: 30,
        fat: 0,
      };

      // Act
      const result = preparePieChartData(percentData);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should return empty array for undefined', () => {
      // Act
      const result = preparePieChartData(undefined);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for null', () => {
      // Act
      const result = preparePieChartData(null as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for empty object', () => {
      // Act
      const result = preparePieChartData({});

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle values with decimals', () => {
      // Arrange
      const percentData = {
        protein: 30.567,
        fat: 15.234,
      };

      // Act
      const result = preparePieChartData(percentData);

      // Assert
      expect(result[0].population).toBe(30.6); // Rounded to 1 decimal
      expect(result[1].population).toBe(15.2);
    });

    it('should assign colors cyclically', () => {
      // Arrange - more items than colors
      const percentData: Record<string, number> = {};
      for (let i = 0; i < 15; i++) {
        percentData[`item${i}`] = 10;
      }

      // Act
      const result = preparePieChartData(percentData);

      // Assert
      expect(result.length).toBe(15);
      // Colors should cycle
      expect(result[10].color).toBe(result[0].color);
    });
  });

  describe('hasValidNutritionData', () => {
    it('should return true for valid nutrition data', () => {
      // Arrange
      const percentage = true;
      const percentData = { protein: 30 };

      // Act
      const result = hasValidNutritionData(percentage, percentData);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when percentage is false', () => {
      // Arrange
      const percentage = false;
      const percentData = { protein: 30 };

      // Act
      const result = hasValidNutritionData(percentage, percentData);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when percentData is empty', () => {
      // Arrange
      const percentage = true;
      const percentData = {};

      // Act
      const result = hasValidNutritionData(percentage, percentData);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when percentData is undefined', () => {
      // Act
      const result = hasValidNutritionData(true, undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when percentage is null', () => {
      // Act
      const result = hasValidNutritionData(null, { protein: 30 });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getNutritionLabel', () => {
    it('should return Chinese label for known keys', () => {
      expect(getNutritionLabel('protein')).toBe('粗蛋白');
      expect(getNutritionLabel('fat')).toBe('粗脂肪');
      expect(getNutritionLabel('carbohydrates')).toBe('碳水化合物');
    });

    it('should return original key for unknown keys', () => {
      expect(getNutritionLabel('unknown')).toBe('unknown');
      expect(getNutritionLabel('custom_field')).toBe('custom_field');
    });

    it('should handle empty string', () => {
      expect(getNutritionLabel('')).toBe('');
    });
  });

  describe('getNutritionColor', () => {
    it('should return color for known keys', () => {
      expect(getNutritionColor('protein')).toBe('$red9');
      expect(getNutritionColor('fat')).toBe('$orange9');
      expect(getNutritionColor('carbohydrates')).toBe('$yellow9');
    });

    it('should return default color for unknown keys', () => {
      expect(getNutritionColor('unknown')).toBe('$blue9');
    });
  });
});
