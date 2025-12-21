import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FormDialog } from '../FormDialog';
import { Text, View, TouchableOpacity } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    Dialog: Object.assign(
      ({ children, open }: any) => (open ? <View testID="dialog-wrapper">{children}</View> : null),
      {
        Portal: ({ children }: any) => <View testID="dialog-portal">{children}</View>,
        Overlay: ({ onPress, testID }: any) => <TouchableOpacity testID={testID || "dialog-overlay"} onPress={onPress} />,
        Content: ({ children, testID }: any) => <View testID={testID || "dialog-content"}>{children}</View>,
      }
    ),
    YStack: ({ children, ...props }: any) => <View testID="ystack-mock" {...props}>{children}</View>,
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

describe('FormDialog Component', () => {
  it('renders correctly when open', () => {
    // Arrange
    const props = {
      open: true,
      onOpenChange: jest.fn(),
      title: 'Form Title',
      children: <Text>Form Content</Text>,
      onSubmit: jest.fn(),
    };

    // Act
    const { getByTestId, getByText } = render(<FormDialog {...props} />);

    // Assert
    expect(getByTestId('dialog-root')).toBeTruthy();
    expect(getByText('Form Title')).toBeTruthy();
    expect(getByText('Form Content')).toBeTruthy();
  });

  it('calls onSubmit when submit button is clicked', async () => {
    // Arrange
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    const props = {
      open: true,
      onOpenChange,
      onSubmit,
      children: <Text>Form Content</Text>,
    };

    // Act
    const { getByTestId } = render(<FormDialog {...props} />);
    fireEvent(getByTestId('footer-confirm'), 'click');

    // Assert
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
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
      children: <Text>Form Content</Text>,
      onSubmit: jest.fn(),
    };

    // Act
    const { getByTestId } = render(<FormDialog {...props} />);
    fireEvent(getByTestId('footer-cancel'), 'click');

    // Assert
    expect(onCancel).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
