import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' };
}
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {} as any;
}
if (typeof (global as any).window.matchMedia === 'undefined') {
  (global as any).window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// Reanimated + tamagui + gradient mocks
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('tamagui', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    styled: () => (p: any) => React.createElement(View, p, p.children),
    Stack: (p: any) => React.createElement(View, p, p.children),
  };
});
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, style }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { style, accessibilityRole: 'image' }, children);
  },
}));
jest.mock('@tamagui/lucide-icons', () => ({ Plus: 'Plus' }));

const { CreatePostFAB } = require('../CreatePostFAB');

describe('CreatePostFAB', () => {
  it('点击触发 onPress，按下与抬起不报错', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<CreatePostFAB onPress={onPress} />);

    const fab = getByTestId('create-post-fab');

    // 模拟按下
    fireEvent(fab, 'pressIn');
    // 模拟抬起
    fireEvent(fab, 'pressOut');
    // 模拟点击
    fireEvent.press(fab);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
