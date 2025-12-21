import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('should render correctly', () => {
    const { getByText } = render(<LoadingState />);
    expect(getByText('加载中...')).toBeTruthy();
  });
});
