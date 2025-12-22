import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterChips } from '../FilterChips';

// Mock tamagui
jest.mock('tamagui', () => ({
  YStack: 'YStack',
  XStack: 'XStack',
  Text: 'Text',
  ScrollView: 'ScrollView',
}));

// Mock IconSymbol
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('FilterChips', () => {
  const mockProps = {
    sortBy: 'score' as const,
    selectedBrand: 'all',
    onSortChange: jest.fn(),
    onResetFilters: jest.fn(),
    onToggleBrandMenu: jest.fn(),
    brandMenuExpanded: false,
  };

  it('renders correctly', () => {
    const { toJSON } = render(<FilterChips {...mockProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onResetFilters when "综合推荐" is pressed', () => {
    const { getByText } = render(<FilterChips {...mockProps} />);
    fireEvent.press(getByText('综合推荐'));
    expect(mockProps.onResetFilters).toHaveBeenCalled();
  });

  it('calls onSortChange with "score" when "高评分" is pressed', () => {
    const { getByText } = render(<FilterChips {...mockProps} />);
    fireEvent.press(getByText('高评分'));
    expect(mockProps.onSortChange).toHaveBeenCalledWith('score');
  });

  it('calls onSortChange with "likes" when "最受欢迎" is pressed', () => {
    const { getByText } = render(<FilterChips {...mockProps} />);
    fireEvent.press(getByText('最受欢迎'));
    expect(mockProps.onSortChange).toHaveBeenCalledWith('likes');
  });

  it('calls onToggleBrandMenu when "品牌" is pressed', () => {
    const { getByText } = render(<FilterChips {...mockProps} />);
    fireEvent.press(getByText('品牌'));
    expect(mockProps.onToggleBrandMenu).toHaveBeenCalled();
  });

  it('displays selected brand name', () => {
    const { getByText } = render(<FilterChips {...mockProps} selectedBrand="Brand A" />);
    expect(getByText('Brand A')).toBeTruthy();
  });
});
