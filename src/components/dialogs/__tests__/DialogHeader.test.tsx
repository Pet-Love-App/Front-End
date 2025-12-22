import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DialogHeader } from '../DialogHeader';
import { TouchableOpacity, View, Text } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => (
      <Text testID="header-text" {...props}>
        {children}
      </Text>
    ),
    XStack: ({ children, ...props }: any) => (
      <View testID="header-xstack" {...props}>
        {children}
      </View>
    ),
    YStack: ({ children, ...props }: any) => (
      <View testID="header-ystack" {...props}>
        {children}
      </View>
    ),
  };
});

// Mock IconSymbol
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: (props: any) => <View testID="icon-symbol" {...props} />,
  };
});

// Mock SafeArea
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 0, left: 0, right: 0 }),
}));

describe('DialogHeader Component', () => {
  it('renders title and description correctly', () => {
    // Arrange
    const props = {
      title: 'Test Title',
      description: 'Test Description',
    };

    // Act
    const { getByText } = render(<DialogHeader {...props} />);

    // Assert
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('renders close button when onClose is provided', () => {
    // Arrange
    const onClose = jest.fn();
    const props = {
      title: 'Test Title',
      onClose,
    };

    // Act
    const { getByTestId } = render(<DialogHeader {...props} />);

    // Find the touchable mock
    const closeButton = getByTestId('close-button');

    // Act
    fireEvent(closeButton, 'press');

    // Assert
    expect(onClose).toHaveBeenCalled();
  });
});
