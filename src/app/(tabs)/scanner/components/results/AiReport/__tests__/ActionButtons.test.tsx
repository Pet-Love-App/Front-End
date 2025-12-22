import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActionButtons } from '../ActionButtons';
import { View, Text as RNText, TouchableOpacity } from 'react-native';

// Mock Tamagui
jest.mock('tamagui', () => {
  const { Text: RNText, View } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => <RNText {...props}>{children}</RNText>,
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

// Mock Button and IconSymbol
jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    Button: ({ onPress, children, ...props }: any) => (
      <TouchableOpacity onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { Text: RNText } = require('react-native');
  return {
    IconSymbol: () => <RNText>IconSymbol</RNText>,
  };
});

describe('ActionButtons', () => {
  const mockOnRetake = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both buttons when callbacks are provided', () => {
    const { getByText } = render(<ActionButtons onRetake={mockOnRetake} onClose={mockOnClose} />);

    expect(getByText('重新拍照')).toBeTruthy();
    expect(getByText('返回首页')).toBeTruthy();
  });

  it('renders only retake button', () => {
    const { getByText, queryByText } = render(<ActionButtons onRetake={mockOnRetake} />);

    expect(getByText('重新拍照')).toBeTruthy();
    expect(queryByText('返回首页')).toBeNull();
  });

  it('renders only close button', () => {
    const { getByText, queryByText } = render(<ActionButtons onClose={mockOnClose} />);

    expect(getByText('返回首页')).toBeTruthy();
    expect(queryByText('重新拍照')).toBeNull();
  });

  it('calls onRetake when retake button is pressed', () => {
    const { getByText } = render(<ActionButtons onRetake={mockOnRetake} />);

    fireEvent.press(getByText('重新拍照'));
    expect(mockOnRetake).toHaveBeenCalled();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(<ActionButtons onClose={mockOnClose} />);

    fireEvent.press(getByText('返回首页'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
