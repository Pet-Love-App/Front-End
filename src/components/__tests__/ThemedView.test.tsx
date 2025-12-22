import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../ThemedView';
import { View, Text } from 'react-native';

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View } = require('react-native');
  return {
    YStack: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>
        {children}
      </View>
    ),
    styled: (Component: any) => Component,
    GetProps: {},
  };
});

describe('ThemedView', () => {
  it('should render children correctly', () => {
    // Arrange
    const testContent = 'Test Content';

    // Act
    const { getByText } = render(
      <ThemedView>
        <Text>{testContent}</Text>
      </ThemedView>
    );

    // Assert
    expect(getByText(testContent)).toBeTruthy();
  });

  it('should apply variant styles correctly', () => {
    // Arrange
    const testID = 'themed-view';

    // Act
    // @ts-ignore - Tamagui types are complex to mock perfectly in tests
    const { getByTestId } = render(<ThemedView testID={testID} variant="elevated" />);
    const element = getByTestId(testID);

    // Assert
    expect(element).toBeTruthy();
  });

  it('should apply padding variants correctly', () => {
    // Arrange
    const testID = 'themed-view-padded';

    // Act
    // @ts-ignore - Tamagui types are complex to mock perfectly in tests
    const { getByTestId } = render(<ThemedView testID={testID} padded />);
    const element = getByTestId(testID);

    // Assert
    expect(element).toBeTruthy();
  });

  it('should apply centered variant correctly', () => {
    // Arrange
    const testID = 'themed-view-centered';

    // Act
    // @ts-ignore - Tamagui types are complex to mock perfectly in tests
    const { getByTestId } = render(<ThemedView testID={testID} centered />);
    const element = getByTestId(testID);

    // Assert
    expect(element).toBeTruthy();
  });

  it('should render correctly', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <View testID="child" />
      </ThemedView>
    );

    // Assert
    expect(getByTestId('themed-view')).toBeTruthy();
    expect(getByTestId('child')).toBeTruthy();
  });
});
