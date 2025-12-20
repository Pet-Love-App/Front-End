import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import ReportScreen from '../index';

// Mock the DetailScreen component since we only want to test that the route renders it
jest.mock('../screens', () => {
  const { View } = require('react-native');
  return {
    DetailScreen: () => <View testID="detail-screen" />,
  };
});

describe('ReportScreen (src/app/detail/index.tsx)', () => {
  it('renders the DetailScreen component', () => {
    render(<ReportScreen />);
    expect(screen.getByTestId('detail-screen')).toBeTruthy();
  });
});
