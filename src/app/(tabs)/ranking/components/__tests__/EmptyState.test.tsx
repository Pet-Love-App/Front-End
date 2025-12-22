import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

// Mock tamagui
jest.mock('tamagui', () => ({
  YStack: 'YStack',
  XStack: 'XStack',
  Text: 'Text',
}));

// Mock IconSymbol
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('EmptyState', () => {
  const mockOnReset = jest.fn();
  const mockOnRefresh = jest.fn();

  it('renders search empty state correctly', () => {
    const { getByText } = render(<EmptyState type="search" onReset={mockOnReset} />);
    expect(getByText('未找到相关猫粮')).toBeTruthy();
    expect(getByText('重置筛选')).toBeTruthy();
  });

  it('calls onReset when reset button is pressed', () => {
    const { getByText } = render(<EmptyState type="search" onReset={mockOnReset} />);
    fireEvent.press(getByText('重置筛选'));
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('renders complete empty state correctly', () => {
    const { getByText } = render(<EmptyState type="complete" onRefresh={mockOnRefresh} />);
    expect(getByText('已显示全部猫粮')).toBeTruthy();
  });

  it('renders default empty state correctly', () => {
    const { getByText } = render(<EmptyState type="default" onRefresh={mockOnRefresh} />);
    expect(getByText('暂无猫粮数据')).toBeTruthy();
    expect(getByText('刷新页面')).toBeTruthy();
  });

  it('calls onRefresh when refresh button is pressed in default state', () => {
    const { getByText } = render(<EmptyState type="default" onRefresh={mockOnRefresh} />);
    fireEvent.press(getByText('刷新页面'));
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
