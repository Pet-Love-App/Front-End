import React from 'react';
import { render } from '@testing-library/react-native';
import ForumLayout from '../_layout';

// Mock expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Stack: ({ screenOptions }: any) =>
      React.createElement('mock-stack', { screenOptions: JSON.stringify(screenOptions) }),
  };
});

describe('ForumLayout', () => {
  it('应该渲染 Stack 且隐藏头部', () => {
    const { UNSAFE_getByType } = render(<ForumLayout />);
    const stack = UNSAFE_getByType('mock-stack' as any);

    expect(stack.props.screenOptions).toContain('"headerShown":false');
  });
});
