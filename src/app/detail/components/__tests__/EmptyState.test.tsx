import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('EmptyState', () => {
  it('should render correctly', () => {
    const { getByText } = render(<EmptyState />);
    expect(getByText('数据加载失败')).toBeTruthy();
  });
});
