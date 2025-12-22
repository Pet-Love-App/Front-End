import React from 'react';
import { render } from '@testing-library/react-native';
import ScannerLayout from '../_layout';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: jest.fn(({ screenOptions }) => {
    return null;
  }),
}));

describe('ScannerLayout', () => {
  it('renders Stack with correct options', () => {
    const { Stack } = require('expo-router');
    render(<ScannerLayout />);

    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: {
          headerShown: false,
        },
      }),
      undefined
    );
  });
});
