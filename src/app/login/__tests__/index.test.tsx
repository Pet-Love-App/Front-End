import React from 'react';
import { render } from '@testing-library/react-native';
import LoginIndex from '../index';

// Mock LoginScreen
jest.mock('../screens', () => ({
  LoginScreen: () => <></>,
}));

describe('LoginIndex', () => {
  it('should render LoginScreen', () => {
    const { toJSON } = render(<LoginIndex />);
    expect(toJSON()).toMatchSnapshot();
  });
});
