import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Skeleton, SkeletonText, SkeletonCard } from '../Skeleton';
import { Animated } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View testID="skeleton-container" {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View testID="skeleton-xstack" {...props}>{children}</View>,
    Card: ({ children, ...props }: any) => <View testID="skeleton-card" {...props}>{children}</View>,
  };
});

// Mock Animated
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const { View } = require('react-native');
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    loop: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => 0),
      setValue: jest.fn(),
    })),
    View: (props: any) => <View testID="animated-view" {...props} />,
  };
});

describe('Skeleton Component', () => {
  it('renders correctly with default props', () => {
    // Arrange
    // Act
    const { getByTestId } = render(<Skeleton />);

    // Assert
    const container = getByTestId('skeleton-container');
    expect(container).toBeTruthy();
    expect(container.props.width).toBe('100%');
    expect(container.props.height).toBe(16);
  });

  it('renders correctly with custom props', () => {
    // Arrange
    const props = {
      width: 100,
      height: 50,
      borderRadius: 10,
    };

    // Act
    const { getByTestId } = render(<Skeleton {...props} />);

    // Assert
    const container = getByTestId('skeleton-container');
    expect(container.props.width).toBe(100);
    expect(container.props.height).toBe(50);
    expect(container.props.borderRadius).toBe(10);
  });

  it('renders circle skeleton correctly', () => {
    // Arrange
    const props = {
      width: 50,
      height: 50,
      circle: true,
    };

    // Act
    const { getByTestId } = render(<Skeleton {...props} />);

    // Assert
    const container = getByTestId('skeleton-container');
    expect(container.props.borderRadius).toBe(25); // height / 2
  });
});

describe('SkeletonText Component', () => {
  it('renders correct number of lines', () => {
    // Arrange
    const props = {
      lines: 3,
    };

    // Act
    const { getAllByTestId } = render(<SkeletonText {...props} />);

    // Assert
    const skeletons = getAllByTestId('skeleton-container').filter(
      // Filter out the parent container if it has the same testID (it does in our mock)
      // Actually, SkeletonText wraps Skeletons in a YStack.
      // The parent YStack has testID 'skeleton-container', and each Skeleton has 'skeleton-container'.
      // Let's check the structure.
      // SkeletonText -> YStack -> [Skeleton, Skeleton, Skeleton]
      // Each Skeleton -> YStack
      // So we expect 1 parent + 3 children = 4 elements with 'skeleton-container'
      // But wait, the parent YStack is from SkeletonText.
      // Let's just count total.
      (el) => el.props.height === 14 // Default lineHeight
    );
    expect(skeletons.length).toBe(3);
  });
});

describe('SkeletonCard Component', () => {
  it('renders correctly', () => {
    // Arrange
    // Act
    const { getByTestId } = render(<SkeletonCard />);

    // Assert
    const card = getByTestId('skeleton-card');
    expect(card).toBeTruthy();
  });
});
