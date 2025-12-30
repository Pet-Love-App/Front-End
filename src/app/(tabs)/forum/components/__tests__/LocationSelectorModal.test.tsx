import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LocationSelectorModal } from '../LocationSelectorModal';

// Mock dependencies
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 0, longitude: 0 },
  }),
  Accuracy: {
    High: 4,
    Balanced: 3,
    Low: 2,
    Lowest: 1,
    BestForNavigation: 6,
    Highest: 5,
  },
}));

jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: jest.fn().mockReturnValue({
    cardBackground: '#ffffff',
    text: '#000000',
  }),
  useIsDarkMode: jest.fn().mockReturnValue(false),
}));

jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Input: (props: any) => <TextInput {...props} />,
    Button: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Sheet: ({ children }: any) => <View>{children}</View>,
    usePropsAndStyle: jest.fn().mockReturnValue([{}, {}]),
  };
});

jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Search: () => <View testID="search-icon" />,
    X: () => <View testID="close-icon" />,
    MapPin: () => <View testID="map-pin-icon" />,
    Navigation: () => <View testID="navigation-icon" />,
  };
});

describe('LocationSelectorModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  it('should render correctly when visible', () => {
    const { getByPlaceholderText } = render(
      <LocationSelectorModal visible={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    expect(getByPlaceholderText('搜索地址、街道、城市...')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByPlaceholderText } = render(
      <LocationSelectorModal visible={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    expect(queryByPlaceholderText('搜索地址、街道、城市...')).toBeNull();
  });
});
