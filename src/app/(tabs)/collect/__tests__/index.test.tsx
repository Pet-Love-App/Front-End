import React from 'react';
import { render } from '@testing-library/react-native';

import CollectIndex from '../index';

// Mock the screens module to provide a simple CollectScreen component
jest.mock('../screens', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    CollectScreen: () =>
      React.createElement(
        View,
        { testID: 'collect-screen' },
        React.createElement(Text, null, 'collect')
      ),
  };
});

test('CollectIndex renders CollectScreen', () => {
  const { getByTestId } = render(<CollectIndex />);
  expect(getByTestId('collect-screen')).toBeTruthy();
});
