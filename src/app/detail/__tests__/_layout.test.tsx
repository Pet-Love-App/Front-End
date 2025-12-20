import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import DetailLayout from '../_layout';

// Mock expo-router Stack
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    Stack: jest.fn(({ screenOptions }) => (
      <View testID="stack-navigator" accessibilityLabel={JSON.stringify(screenOptions)} />
    )),
  };
});

describe('DetailLayout (src/app/detail/_layout.tsx)', () => {
  it('renders the Stack navigator with correct options', () => {
    render(<DetailLayout />);
    
    const stack = screen.getByTestId('stack-navigator');
    expect(stack).toBeTruthy();
    
    // Verify screen options are passed
    const options = JSON.parse(stack.props.accessibilityLabel);
    expect(options).toEqual(expect.objectContaining({
      headerShown: true,
      presentation: 'card',
      animation: 'slide_from_right',
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerShadowVisible: false,
      headerTintColor: '#333',
      headerBackTitle: '返回',
    }));
  });
});
