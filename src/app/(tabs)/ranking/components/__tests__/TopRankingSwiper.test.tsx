// Mock navigator for Tamagui
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopRankingSwiper } from '../TopRankingSwiper';

Object.defineProperty(global, 'navigator', {
  value: {
    product: 'ReactNative',
  },
  writable: true,
});

// Mock window for Tamagui
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

// Mock tamagui
jest.mock('tamagui', () => ({
  YStack: 'YStack',
  XStack: 'XStack',
  Text: 'Text',
  Card: 'Card',
  View: 'View',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock IconSymbol
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

// Mock useResponsiveLayout
jest.mock('@/src/hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: () => ({
    width: 375,
    isSmallDevice: false,
    itemWidth: 300,
    spacerWidth: 37.5,
  }),
}));

// Mock Animated to avoid layout issues in tests
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    event: jest.fn(),
    timing: () => ({
      start: jest.fn(),
    }),
    spring: () => ({
      start: jest.fn(),
    }),
    // Mock View to avoid native view props issues
    View: 'View',
    createAnimatedComponent: (Component: any) => Component,
  };
});

describe('TopRankingSwiper', () => {
  const mockData = [
    { id: '1', name: 'Food 1', brand: 'Brand A', score: 5.0, image: 'img1.jpg' },
    { id: '2', name: 'Food 2', brand: 'Brand B', score: 4.5, image: 'img2.jpg' },
    { id: '3', name: 'Food 3', brand: 'Brand C', score: 4.0, image: 'img3.jpg' },
  ] as any;

  const mockOnPress = jest.fn();

  it('renders correctly', () => {
    const { getByLabelText, getAllByText } = render(
      <TopRankingSwiper data={mockData} onPress={mockOnPress} />
    );
    // Verify key elements are rendered instead of using snapshot
    expect(getByLabelText('热门猫粮排行榜')).toBeTruthy();
    expect(getAllByText(/Food/)).toHaveLength(3);
  });

  it('renders correct number of items', () => {
    const { getAllByText } = render(<TopRankingSwiper data={mockData} onPress={mockOnPress} />);
    // Should render names
    expect(getAllByText(/Food/)).toHaveLength(3);
  });

  it('handles press events', () => {
    const { getAllByText } = render(<TopRankingSwiper data={mockData} onPress={mockOnPress} />);

    fireEvent.press(getAllByText('Food 1')[0]);
    expect(mockOnPress).toHaveBeenCalledWith(mockData[0]);
  });
});
