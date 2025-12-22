import React from 'react';
import { render } from '@testing-library/react-native';
import { ProcessingScreen } from '../ProcessingScreen';
import { View, Text as RNText } from 'react-native';

// Mock dependencies
jest.mock('@/src/components/LottieAnimation', () => {
  const { Text } = require('react-native');
  return {
    LottieAnimation: () => <Text>LottieAnimation</Text>,
  };
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: ({ children }: any) => <Text>{children}</Text>,
    XStack: ({ children, onPress, ...props }: any) => (
      <View {...props}>
        {children}
      </View>
    ),
    YStack: ({ children, onPress, ...props }: any) => (
      <View {...props}>
        {children}
      </View>
    ),
  };
});

describe('ProcessingScreen', () => {
  const mockInsets = { top: 20, bottom: 20, left: 0, right: 0 };

  it('renders correctly', () => {
    const { getByText } = render(
      <ProcessingScreen insets={mockInsets} />
    );

    expect(getByText('正在识别文字...')).toBeTruthy();
    expect(getByText('AI 正在分析图片中的成分信息')).toBeTruthy();
    expect(getByText('这可能需要几秒钟')).toBeTruthy();
    expect(getByText('LottieAnimation')).toBeTruthy();
  });
});
