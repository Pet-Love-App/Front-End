import React from 'react';
import { render } from '@testing-library/react-native';
import { StatisticsBar } from '../StatisticsBar';

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

describe('StatisticsBar', () => {
  it('renders correctly with filters', () => {
    const { getByText } = render(
      <StatisticsBar
        searchQuery="test"
        selectedBrand="all"
        filteredCount={5}
        totalCount={10}
        sortBy="score"
      />
    );
    // It should show the count
    expect(getByText('5')).toBeTruthy();
  });

  it('renders correctly without filters', () => {
    const { getByText } = render(
      <StatisticsBar
        searchQuery=""
        selectedBrand="all"
        filteredCount={10}
        totalCount={10}
        sortBy="score"
      />
    );
    expect(getByText('10')).toBeTruthy();
  });
});
