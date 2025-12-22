import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InitialScreen } from '../InitialScreen';
import { View, Text as RNText, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('tamagui', () => {
  const { View, Text: RNText } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => <RNText {...props}>{children}</RNText>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@/src/components/AppHeader', () => {
  const { Text: RNText } = require('react-native');
  return {
    AppHeader: ({ title }: any) => <RNText>{title}</RNText>,
  };
});

jest.mock('@/src/components/LottieAnimation', () => {
  const { Text: RNText } = require('react-native');
  return {
    LottieAnimation: () => <RNText>LottieAnimation</RNText>,
  };
});

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

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

describe('InitialScreen', () => {
  const mockInsets = { top: 20, bottom: 20, left: 0, right: 0 };
  const mockOnStartScan = jest.fn();

  it('renders correctly', () => {
    const { getByText } = render(
      <InitialScreen insets={mockInsets} onStartScan={mockOnStartScan} />
    );

    expect(getByText('智能扫描')).toBeTruthy();
    expect(getByText('猫粮成分智能分析')).toBeTruthy();
    expect(getByText('拍摄成分表')).toBeTruthy();
    expect(getByText('智能识别')).toBeTruthy();
    expect(getByText('生成报告')).toBeTruthy();
  });

  it('calls onStartScan when start button is pressed', () => {
    const { getByText } = render(
      <InitialScreen insets={mockInsets} onStartScan={mockOnStartScan} />
    );

    fireEvent.press(getByText('开始扫描'));
    expect(mockOnStartScan).toHaveBeenCalled();
  });
});
