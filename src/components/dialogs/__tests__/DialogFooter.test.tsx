import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DialogFooter } from '../DialogFooter';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View } = require('react-native');
  return {
    XStack: ({ children, ...props }: any) => (
      <View testID="footer-xstack" {...props}>
        {children}
      </View>
    ),
    YStack: ({ children, ...props }: any) => (
      <View testID="footer-ystack" {...props}>
        {children}
      </View>
    ),
  };
});

// Mock Button
jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ children, onPress, testID, ...props }: any) => (
      <TouchableOpacity testID={testID || 'button-mock'} onPress={onPress} {...props}>
        <Text>{children}</Text>
      </TouchableOpacity>
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

describe('DialogFooter Component', () => {
  it('renders cancel and confirm buttons', () => {
    // Arrange
    const props = {
      onCancel: jest.fn(),
      onConfirm: jest.fn(),
      cancelText: 'Cancel',
      confirmText: 'Confirm',
    };

    // Act
    const { getByTestId } = render(<DialogFooter {...props} />);

    // Assert
    expect(getByTestId('footer-cancel')).toBeTruthy();
    expect(getByTestId('footer-confirm')).toBeTruthy();
  });

  it('calls onCancel when cancel button is clicked', () => {
    // Arrange
    const onCancel = jest.fn();
    const props = {
      onCancel,
      cancelText: 'Cancel',
    };

    // Act
    const { getByTestId } = render(<DialogFooter {...props} />);
    fireEvent(getByTestId('footer-cancel'), 'click');

    // Assert
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    // Arrange
    const onConfirm = jest.fn();
    const props = {
      onConfirm,
      confirmText: 'Confirm',
    };

    // Act
    const { getByTestId } = render(<DialogFooter {...props} />);
    fireEvent(getByTestId('footer-confirm'), 'click');

    // Assert
    expect(onConfirm).toHaveBeenCalled();
  });

  it('disables confirm button when loading or disabled', () => {
    // Arrange
    const props = {
      onConfirm: jest.fn(),
      confirmText: 'Confirm',
      confirmDisabled: true,
    };

    // Act
    const { getByTestId } = render(<DialogFooter {...props} />);
    const button = getByTestId('footer-confirm');

    // Assert
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
