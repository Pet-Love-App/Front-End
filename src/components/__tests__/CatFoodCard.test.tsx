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

jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: ({ children, testID, ...props }: any) => (
      <Text testID={testID} {...props}>{children}</Text>
    ),
    XStack: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
    YStack: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

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

    it('should render cat food details correctly', () => {
      // Arrange
      const catfood = createMockCatFood({
        name: 'Test Food',
        brand: 'Test Brand',
      });

      // Act
      const { getByTestId } = render(<CatFoodCard catfood={catfood} />);

      // Assert
      expect(getByTestId('cat-food-name').props.children).toBe('Test Food');
      expect(getByTestId('cat-food-brand').props.children).toBe('Test Brand');
    });

    it('should render rank correctly', () => {
      // Arrange
      const catfood = createMockCatFood();

      // Act
      const { getByTestId } = render(<CatFoodCard catfood={catfood} index={0} />);

      // Assert
      expect(getByTestId('cat-food-rank').props.children).toBe('冠军');
    });

    it('should render image when imageUrl is provided', () => {
      // Arrange
      const catfood = createMockCatFood({ imageUrl: 'https://example.com/image.jpg' });

      // Act
      const { getByTestId } = render(<CatFoodCard catfood={catfood} />);

      // Assert
      const image = getByTestId('cat-food-image');
      expect(image.props.source).toEqual({ uri: 'https://example.com/image.jpg' });
    });
  });

  describe('interactions', () => {
    it('should call onPress when card is pressed', () => {
      // Arrange
      const catfood = createMockCatFood();
      const onPress = jest.fn();
      const { getByTestId } = render(<CatFoodCard catfood={catfood} onPress={onPress} />);

      // Act
      fireEvent.press(getByTestId('cat-food-card'));

      // Assert
      expect(onPress).toHaveBeenCalledWith(catfood);
    });

    it('should call onImagePress when image is pressed', () => {
      // Arrange
      const catfood = createMockCatFood({ imageUrl: 'https://example.com/image.jpg' });
      const onImagePress = jest.fn();
      const { getByTestId } = render(
        <CatFoodCard catfood={catfood} onImagePress={onImagePress} />
      );

      // Act
      fireEvent.press(getByTestId('cat-food-image-pressable'));

      // Assert
      expect(onImagePress).toHaveBeenCalledWith('https://example.com/image.jpg');
    });
  });
});
