import React from 'react';
import { render } from '@testing-library/react-native';

import PetHealthScreen from '../pet-health';
import { useLocalSearchParams } from 'expo-router';

// Mock navigator before imports
Object.defineProperty(global, 'navigator', {
  value: { product: 'ReactNative' },
  writable: true,
});

// Mock tamagui and icons
jest.mock('@tamagui/lucide-icons', () => ({
  Heart: () => null,
  Activity: () => null,
}));

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../components/PetHealthRecords', () => ({
  PetHealthRecords: () => {
    const { Text } = require('react-native');
    return <Text>PetHealthRecords</Text>;
  },
}));

jest.mock('../components/PetWeightRecords', () => ({
  PetWeightRecords: () => {
    const { Text } = require('react-native');
    return <Text>PetWeightRecords</Text>;
  },
}));

// Mock Tamagui components
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const Tabs = ({ children, ...props }: any) => <View {...props}>{children}</View>;
  Tabs.List = View;
  Tabs.Tab = View;
  Tabs.Content = View;

  return {
    YStack: View,
    XStack: View,
    Text: Text,
    Tabs: Tabs,
  };
});

describe('PetHealthScreen', () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      petId: '1',
      petName: 'Fluffy',
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<PetHealthScreen />);

    expect(getByText('健康档案')).toBeTruthy();
    expect(getByText('体重记录')).toBeTruthy();
    expect(getByText('PetHealthRecords')).toBeTruthy();
    expect(getByText('PetWeightRecords')).toBeTruthy();
  });
});
