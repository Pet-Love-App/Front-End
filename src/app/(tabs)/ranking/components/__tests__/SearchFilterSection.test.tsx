import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchFilterSection } from '../SearchFilterSection';

// Mock tamagui
jest.mock('tamagui', () => ({
  YStack: 'YStack',
  XStack: 'XStack',
  Text: 'Text',
  ScrollView: 'ScrollView',
}));

// Mock sub-components
jest.mock('../BrandFilterMenu', () => ({
  BrandFilterMenu: jest.fn(({ visible }) => {
    const { Text } = require('tamagui');
    return visible ? <Text>BrandFilterMenu</Text> : null;
  }),
}));
jest.mock('../FilterChips', () => ({
  FilterChips: jest.fn(() => {
    const { Text } = require('tamagui');
    return <Text>FilterChips</Text>;
  }),
}));
jest.mock('../StatisticsBar', () => ({
  StatisticsBar: jest.fn(() => {
    const { Text } = require('tamagui');
    return <Text>StatisticsBar</Text>;
  }),
}));

// Mock SearchBox
jest.mock('@/src/components/searchBox', () => {
  const React = require('react');
  const { View, TextInput, Button } = require('react-native');
  return function SearchBox({ value, onChangeText, onSearch, onClear }) {
    return (
      <View>
        <TextInput testID="search-input" value={value} onChangeText={onChangeText} />
        <Button title="Search" onPress={() => onSearch(value)} />
        <Button title="Clear" onPress={onClear} />
      </View>
    );
  };
});

describe('SearchFilterSection', () => {
  const mockProps = {
    searchQuery: '',
    onSearch: jest.fn(),
    onClearSearch: jest.fn(),
    sortBy: 'score' as const,
    onSortChange: jest.fn(),
    selectedBrand: 'all',
    brandList: ['all', 'Brand A'],
    brandCounts: { all: 2, 'Brand A': 2 },
    brandMenuExpanded: false,
    onSelectBrand: jest.fn(),
    onToggleBrandMenu: jest.fn(),
    onResetFilters: jest.fn(),
    filteredCount: 10,
    totalCount: 10,
  };

  it('renders correctly', () => {
    const { getByText } = render(<SearchFilterSection {...mockProps} />);
    expect(getByText('FilterChips')).toBeTruthy();
    expect(getByText('StatisticsBar')).toBeTruthy();
  });

  it('renders BrandFilterMenu when expanded', () => {
    const { getByText } = render(<SearchFilterSection {...mockProps} brandMenuExpanded={true} />);
    expect(getByText('BrandFilterMenu')).toBeTruthy();
  });

  it('handles search input', () => {
    const { getByTestId } = render(<SearchFilterSection {...mockProps} />);
    fireEvent.changeText(getByTestId('search-input'), 'new query');
  });

  it('calls onSearch when search button is pressed', () => {
    const { getByText, getByTestId } = render(<SearchFilterSection {...mockProps} />);
    fireEvent.changeText(getByTestId('search-input'), 'test');
    fireEvent.press(getByText('Search'));
    expect(mockProps.onSearch).toHaveBeenCalledWith('test');
  });

  it('calls onClearSearch when clear button is pressed', () => {
    const { getByText } = render(<SearchFilterSection {...mockProps} />);
    fireEvent.press(getByText('Clear'));
    expect(mockProps.onClearSearch).toHaveBeenCalled();
  });
});
