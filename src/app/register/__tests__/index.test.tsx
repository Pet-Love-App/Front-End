import React from 'react';
import { render } from '@testing-library/react-native';
import RegisterIndex from '../index';

// Mock RegisterScreen
jest.mock('../screens', () => ({
  RegisterScreen: () => <></>,
}));

describe('RegisterIndex', () => {
  it('should render RegisterScreen', () => {
    const { toJSON } = render(<RegisterIndex />);
    expect(toJSON()).toMatchSnapshot();
  });
});
