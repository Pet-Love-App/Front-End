import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Toast } from '../Toast';
import { Animated } from 'react-native';
import { View } from 'react-native';

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: (props: any) => <View testID="icon-symbol" {...props} />,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 20, left: 0, right: 0 }),
}));

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: (props: any) => <Text {...props} />,
    XStack: (props: any) => <View {...props} />,
    YStack: (props: any) => <View {...props} />,
  };
});

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with required props', () => {
    // Arrange
    const props = {
      type: 'success' as const,
      message: 'Success Message',
      onDismiss: jest.fn(),
      id: 'test-id',
    };

    // Act
    const { getByText } = render(<Toast {...props} />);

    // Assert
    expect(getByText('Success Message')).toBeTruthy();
  });

  it('renders description when provided', () => {
    // Arrange
    const props = {
      type: 'info' as const,
      message: 'Info Message',
      description: 'This is a description',
      onDismiss: jest.fn(),
      id: 'test-id',
    };

    // Act
    const { getByText } = render(<Toast {...props} />);

    // Assert
    expect(getByText('This is a description')).toBeTruthy();
  });

  it('calls onDismiss after duration', () => {
    // Arrange
    const onDismiss = jest.fn();
    const duration = 3000;
    const props = {
      type: 'success' as const,
      message: 'Auto Dismiss',
      duration,
      onDismiss,
      id: 'test-id',
    };

    render(<Toast {...props} />);

    // Act
    act(() => {
      jest.advanceTimersByTime(duration);
    });
    
    // Wait for exit animation
    act(() => {
      jest.advanceTimersByTime(200); // Animation duration
    });

    // Assert
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders action button when action prop is provided', () => {
    // Arrange
    const onActionPress = jest.fn();
    const props = {
      type: 'warning' as const,
      message: 'Warning',
      action: {
        label: 'Retry',
        onPress: onActionPress,
      },
      onDismiss: jest.fn(),
      id: 'test-id',
    };

    // Act
    const { getByText } = render(<Toast {...props} />);
    const actionButton = getByText('Retry');
    fireEvent.press(actionButton);

    // Assert
    expect(onActionPress).toHaveBeenCalled();
  });

  it('renders custom icon when provided', () => {
    // Arrange
    const props = {
      type: 'error' as const,
      message: 'Error',
      icon: 'custom-icon',
      onDismiss: jest.fn(),
      id: 'test-id',
    };

    // Act
    const { getByTestId } = render(<Toast {...props} />);
    
    // Assert
    expect(getByTestId('icon-symbol')).toBeTruthy();
  });
});
