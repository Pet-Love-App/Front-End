import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ConfirmDialog } from '../ConfirmDialog';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Dialog: Object.assign(
      ({ children, open }: any) => (open ? <View testID="dialog-wrapper">{children}</View> : null),
      {
        Portal: ({ children }: any) => <View testID="dialog-portal">{children}</View>,
        Overlay: ({ onPress, testID }: any) => (
          <TouchableOpacity testID={testID || 'dialog-overlay'} onPress={onPress} />
        ),
        Content: ({ children, testID }: any) => (
          <View testID={testID || 'dialog-content'}>{children}</View>
        ),
        Title: ({ children }: any) => <Text testID="dialog-title">{children}</Text>,
        Description: ({ children }: any) => <Text testID="dialog-description">{children}</Text>,
        Close: ({ children }: any) => <View testID="dialog-close">{children}</View>,
      }
    ),
    Text: ({ children, ...props }: any) => (
      <Text testID="text-mock" {...props}>
        {children}
      </Text>
    ),
    YStack: ({ children, ...props }: any) => (
      <View testID="ystack-mock" {...props}>
        {children}
      </View>
    ),
    XStack: ({ children, ...props }: any) => (
      <View testID="xstack-mock" {...props}>
        {children}
      </View>
    ),
  };
});

// Mock DialogHeader and DialogFooter
jest.mock('../DialogHeader', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    DialogHeader: ({ title, onClose }: any) => (
      <View testID="dialog-header">
        <Text testID="header-title">{title}</Text>
        {onClose && <TouchableOpacity testID="header-close" onPress={onClose} />}
      </View>
    ),
  };
});

jest.mock('../DialogFooter', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    DialogFooter: ({ onConfirm, onCancel }: any) => (
      <View testID="dialog-footer">
        {onCancel && <TouchableOpacity testID="footer-cancel" onPress={onCancel} />}
        {onConfirm && <TouchableOpacity testID="footer-confirm" onPress={onConfirm} />}
      </View>
    ),
  };
});

describe('ConfirmDialog Component', () => {
  it('renders correctly when open', () => {
    // Arrange
    const props = {
      open: true,
      onOpenChange: jest.fn(),
      title: 'Test Title',
      message: 'Test Message',
      onConfirm: jest.fn(),
    };

    // Act
    const { getByTestId, getByText } = render(<ConfirmDialog {...props} />);

    // Assert
    expect(getByTestId('dialog-root')).toBeTruthy();
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();
  });

  it('does not render when closed', () => {
    // Arrange
    const props = {
      open: false,
      onOpenChange: jest.fn(),
      message: 'Test Message',
      onConfirm: jest.fn(),
    };

    // Act
    const { queryByTestId } = render(<ConfirmDialog {...props} />);

    // Assert
    expect(queryByTestId('dialog-root')).toBeNull();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    // Arrange
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    const props = {
      open: true,
      onOpenChange,
      onConfirm,
      message: 'Test Message',
    };

    // Act
    const { getByTestId } = render(<ConfirmDialog {...props} />);
    fireEvent(getByTestId('footer-confirm'), 'click');

    // Assert
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    // Arrange
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    const props = {
      open: true,
      onOpenChange,
      onCancel,
      onConfirm: jest.fn(),
      message: 'Test Message',
    };

    // Act
    const { getByTestId } = render(<ConfirmDialog {...props} />);
    fireEvent(getByTestId('footer-cancel'), 'click');

    // Assert
    expect(onCancel).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on overlay click if enabled', () => {
    // Arrange
    const onOpenChange = jest.fn();
    const props = {
      open: true,
      onOpenChange,
      closeOnOverlayClick: true,
      onConfirm: jest.fn(),
      message: 'Test Message',
    };

    // Act
    const { getByTestId } = render(<ConfirmDialog {...props} />);
    fireEvent(getByTestId('dialog-overlay'), 'click');

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
