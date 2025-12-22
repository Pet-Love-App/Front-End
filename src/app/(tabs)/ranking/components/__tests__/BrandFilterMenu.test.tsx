import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BrandFilterMenu } from '../BrandFilterMenu';

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

describe('BrandFilterMenu', () => {
  const mockProps = {
    visible: true,
    brandList: ['All', 'Brand A', 'Brand B'],
    brandCounts: { All: 10, 'Brand A': 5, 'Brand B': 5 },
    selectedBrand: 'All',
    onSelectBrand: jest.fn(),
    onClose: jest.fn(),
  };

  it('renders nothing when not visible', () => {
    const { toJSON } = render(<BrandFilterMenu {...mockProps} visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(<BrandFilterMenu {...mockProps} />);
    expect(getByText('选择品牌')).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Brand A')).toBeTruthy();
  });

  it('calls onSelectBrand when a brand is pressed', () => {
    const { getByText } = render(<BrandFilterMenu {...mockProps} />);
    fireEvent.press(getByText('Brand A'));
    expect(mockProps.onSelectBrand).toHaveBeenCalledWith('Brand A');
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(<BrandFilterMenu {...mockProps} />);
    fireEvent.press(getByText('收起'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
