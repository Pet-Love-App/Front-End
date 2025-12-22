// Mocks must be declared before importing the module that uses them
import React from 'react';
import { render } from '@testing-library/react-native';
import TabLayout from '../_layout';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  const RN = require('react-native');
  const Tabs = ({ children }: any) => React.createElement(React.Fragment, null, children);
  Tabs.Screen = (props: any) => {
    if (props.options?.tabBarIcon) {
      return props.options.tabBarIcon({ color: 'red', focused: true });
    }
    return React.createElement(RN.View, props);
  };
  return { Tabs };
});

jest.mock('@/src/components/HapticTab', () => ({
  HapticTab: ({ children }: any) => children,
}));
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));
jest.mock('@/src/hooks/useThemeAwareColorScheme', () => ({
  useThemeAwareColorScheme: () => 'light',
}));
jest.mock('@/src/constants/theme', () => ({
  Colors: {
    light: {
      tint: '#000',
      scanButtonBackground: '#fff',
      scanButtonBorder: '#000',
      scanButtonIcon: '#000',
    },
    dark: {
      tint: '#fff',
      scanButtonBackground: '#000',
      scanButtonBorder: '#fff',
      scanButtonIcon: '#fff',
    },
  },
}));

test('TabLayout renders without crashing', () => {
  const rendered = render(<TabLayout />);
  expect(rendered).toBeTruthy();
});
