import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ProfileIndex from '../index';

// Mock ProfileScreen
jest.mock('../screens', () => ({
  ProfileScreen: () => {
    const { Text } = require('react-native');
    return <Text>ProfileScreen</Text>;
  },
}));

describe('ProfileIndex', () => {
  it('renders ProfileScreen', () => {
    const { getByText } = render(<ProfileIndex />);
    expect(getByText('ProfileScreen')).toBeTruthy();
  });
});
