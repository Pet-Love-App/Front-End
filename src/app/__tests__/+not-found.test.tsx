import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NotFoundScreen from '../+not-found';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
  };
});

jest.mock('@/src/design-system/components', () => {
  const { View, Text } = require('react-native');
  return {
    Button: ({ onPress, children }: any) => (
      <View testID="go-home-button" onTouchEnd={onPress}>
        <Text>{children}</Text>
      </View>
    ),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: () => <View testID="icon-symbol" />,
  };
});

describe('NotFoundScreen (src/app/+not-found.tsx)', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders correctly', () => {
    render(<NotFoundScreen />);
    
    expect(screen.getByText('页面走丢了')).toBeTruthy();
    expect(screen.getByText('找不到这个页面')).toBeTruthy();
    expect(screen.getByTestId('icon-symbol')).toBeTruthy();
    expect(screen.getByTestId('go-home-button')).toBeTruthy();
  });

  it('navigates to home when button is pressed', () => {
    render(<NotFoundScreen />);
    
    fireEvent(screen.getByTestId('go-home-button'), 'touchEnd');
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/collect');
  });
});
