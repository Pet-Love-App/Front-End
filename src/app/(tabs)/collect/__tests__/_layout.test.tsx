import React from 'react';
import { render } from '@testing-library/react-native';

import ScannerLayout from '../_layout';

// Mock expo-router Stack to avoid routing internals
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Stack: ({ children }: any) => React.createElement(React.Fragment, null, children),
    Screen: (props: any) => React.createElement('div', props),
  };
});

test('ScannerLayout renders without crashing', () => {
  const rendered = render(<ScannerLayout />);
  // toJSON may be null for components that render nothing; ensure render succeeded
  expect(rendered).toBeTruthy();
});
