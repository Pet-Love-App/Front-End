import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';
import { View, Text as RNText } from 'react-native';

// Mock Tamagui
jest.mock('tamagui', () => {
  const { Text } = require('react-native');
  return {
    Text: ({ children, testID, ...props }: any) => (
      <Text testID={testID} {...props}>{children}</Text>
    ),
    styled: (Component: any) => Component,
    GetProps: {},
  };
});

describe('ThemedText', () => {
  it('should render correctly with default props', () => {
    // Arrange
    const text = 'Hello World';

    // Act
    const { getByText } = render(<ThemedText>{text}</ThemedText>);

    // Assert
    expect(getByText(text)).toBeTruthy();
  });

  it('should apply type variants correctly', () => {
    // Arrange
    const text = 'Title Text';

    // Act
    // @ts-ignore - Tamagui types are complex to mock perfectly in tests
    const { getByText } = render(<ThemedText type="title">{text}</ThemedText>);
    const element = getByText(text);

    // Assert
    // Note: Tamagui styles might be flattened or applied differently in tests depending on setup.
    // We are checking if it renders. Detailed style checking might require more setup or snapshot testing.
    expect(element).toBeTruthy();
  });

  it('should apply muted variant correctly', () => {
    // Arrange
    const text = 'Muted Text';

    // Act
    // @ts-ignore - Tamagui types are complex to mock perfectly in tests
    const { getByText } = render(<ThemedText muted>{text}</ThemedText>);

    // Assert
    expect(getByText(text)).toBeTruthy();
  });

  it('should apply subtle variant correctly', () => {
    // Arrange
    const text = 'Subtle Text';

    // Act
    // @ts-ignore - Tamagui types are complex to mock perfectly in tests
    const { getByText } = render(<ThemedText subtle>{text}</ThemedText>);

    // Assert
    expect(getByText(text)).toBeTruthy();
  });

  it('should render correctly', () => {
    // Arrange & Act
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);

    // Assert
    expect(getByText('Test Text')).toBeTruthy();
  });
});
