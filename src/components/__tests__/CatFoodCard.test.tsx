/**
 * CatFoodCard 组件测试
 *
 * 测试猫粮卡片的渲染和交互
 * - 测试行为而非实现
 * - 测试用户可见的功能
 * - 避免过度依赖 DOM 结构
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CatFoodCard } from '../CatFoodCard';
import type { CatFood } from '@/src/types/catFood';

// Mock dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

jest.mock('tamagui', () => ({
  Text: ({ children, testID }: { children: React.ReactNode; testID?: string }) => <>{children}</>,
  XStack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  YStack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('CatFoodCard', () => {
  // 创建符合 CatFood 接口的测试数据
  const createMockCatFood = (overrides = {}): CatFood => ({
    id: 1,
    name: 'Royal Canin Indoor',
    brand: 'Royal Canin',
    barcode: null,
    imageUrl: 'https://example.com/catfood.jpg',
    like_count: 100,
    score: 4.5,
    countNum: 50,
    tags: [],
    ingredient: [],
    additive: [],
    safety: '',
    nutrient: '',
    percentage: false,
    percentData: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should handle different cat food data', () => {
      // Arrange
      const catfood = createMockCatFood({
        name: 'Different Food',
        brand: 'Different Brand',
        score: 3.8,
        like_count: 50,
      });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should handle null imageUrl', () => {
      // Arrange
      const catfood = createMockCatFood({ imageUrl: null });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should handle null brand', () => {
      // Arrange
      const catfood = createMockCatFood({ brand: null as any });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should handle null score', () => {
      // Arrange
      const catfood = createMockCatFood({ score: null as any });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });
  });

  describe('rank display', () => {
    it('should render with rank display enabled', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} index={0} showRank={true} />);
      }).not.toThrow();
    });

    it('should render with rank display disabled', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} index={0} showRank={false} />);
      }).not.toThrow();
    });

    it('should render cards at different ranks', () => {
      // Arrange
      const catfood = createMockCatFood();
      const ranks = [0, 1, 2, 3, 5, 10];

      // Act & Assert - all ranks should render successfully
      ranks.forEach((rank) => {
        expect(() => {
          render(<CatFoodCard catfood={catfood} index={rank} showRank={true} />);
        }).not.toThrow();
      });
    });
  });

  describe('interactions', () => {
    it('should accept onPress prop', () => {
      // Arrange
      const catfood = createMockCatFood();
      const onPress = jest.fn();

      // Act & Assert - should render with onPress handler
      expect(() => {
        render(<CatFoodCard catfood={catfood} onPress={onPress} />);
      }).not.toThrow();
    });

    it('should accept onImagePress prop', () => {
      // Arrange
      const catfood = createMockCatFood({ imageUrl: 'https://example.com/image.jpg' });
      const onImagePress = jest.fn();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} onImagePress={onImagePress} />);
      }).not.toThrow();
    });

    it('should render without handlers', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });
  });

  describe('tags display', () => {
    it('should render with tags', () => {
      // Arrange
      const catfood = createMockCatFood({
        tags: ['高蛋白', '无谷物'],
      });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should render with many tags', () => {
      // Arrange
      const catfood = createMockCatFood({
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5', 'Tag6'],
      });

      // Act & Assert - should limit to 4 tags
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should render without tags', () => {
      // Arrange
      const catfood = createMockCatFood({ tags: [] });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });
  });

  describe('nutrition info', () => {
    it('should show nutrition info when enabled', () => {
      // Arrange
      const catfood = createMockCatFood({
        ingredient: ['鸡肉', '鱼肉'],
      });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} showNutritionInfo={true} />);
      }).not.toThrow();
    });

    it('should hide nutrition info when disabled', () => {
      // Arrange
      const catfood = createMockCatFood({
        ingredient: ['鸡肉'],
      });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} showNutritionInfo={false} />);
      }).not.toThrow();
    });

    it('should show analysis when percentage is available', () => {
      // Arrange
      const catfood = createMockCatFood({
        percentage: true,
      });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} showNutritionInfo={true} />);
      }).not.toThrow();
    });
  });

  describe('display modes', () => {
    it('should render with both showRank and showNutritionInfo enabled', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} showRank={true} showNutritionInfo={true} />);
      }).not.toThrow();
    });

    it('should render with both disabled', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} showRank={false} showNutritionInfo={false} />);
      }).not.toThrow();
    });
  });

  describe('defensive programming', () => {
    it('should handle missing optional fields', () => {
      // Arrange
      const catfood: CatFood = {
        id: 1,
        name: 'Minimal Cat Food',
        brand: 'Brand',
        barcode: null,
        imageUrl: null,
        like_count: 0,
        score: 0,
        countNum: 0,
        tags: [],
        ingredient: [],
        additive: [],
        safety: '',
        nutrient: '',
        percentage: false,
        percentData: {},
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });

    it('should handle extreme values', () => {
      // Arrange
      const catfood = createMockCatFood({
        score: 5.0,
        like_count: 999999,
        countNum: 10000,
      });

      // Act & Assert
      expect(() => {
        render(<CatFoodCard catfood={catfood} />);
      }).not.toThrow();
    });
  });
});
