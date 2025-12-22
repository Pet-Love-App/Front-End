import React from 'react';
import { render } from '@testing-library/react-native';
import LoginLayout from '../_layout';

// Mock Stack
jest.mock('expo-router', () => ({
  Stack: Object.assign(({ children }: { children: React.ReactNode }) => <>{children}</>, {
    Screen: () => <></>,
  }),
}));

describe('LoginLayout', () => {
  it('should render correctly', () => {
    const { toJSON } = render(<LoginLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
