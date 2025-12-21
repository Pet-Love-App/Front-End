import React from 'react';
import { render } from '@testing-library/react-native';
import RegisterLayout from '../_layout';

// Mock Stack
jest.mock('expo-router', () => ({
  Stack: Object.assign(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    {
      Screen: () => <></>,
    }
  ),
}));

describe('RegisterLayout', () => {
  it('should render correctly', () => {
    const { toJSON } = render(<RegisterLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
