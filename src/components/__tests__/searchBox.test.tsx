import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBox from '../searchBox';
import { View, TextInput } from 'react-native';

// Mock IconSymbol
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: () => <View testID="search-icon" />,
  };
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, TextInput } = require('react-native');
  return {
    Input: (props: any) => <TextInput {...props} />,
    XStack: (props: any) => <View {...props} />,
    YStack: (props: any) => <View {...props} />,
    Stack: (props: any) => <View {...props} />,
    Text: (props: any) => <View {...props} />,
    SizeTokens: {},
  };
});

describe('SearchBox', () => {
  it('should render correctly with default props', () => {
    // Arrange & Act
    const { getByPlaceholderText, getAllByTestId } = render(<SearchBox />);

    // Assert
    expect(getByPlaceholderText('搜索...')).toBeTruthy();
    expect(getAllByTestId('search-icon').length).toBeGreaterThan(0);
  });

  it('should handle text input changes', () => {
    // Arrange
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(<SearchBox onChangeText={onChangeText} />);
    const input = getByPlaceholderText('搜索...');

    // Act
    fireEvent.changeText(input, 'cat food');

    // Assert
    expect(onChangeText).toHaveBeenCalledWith('cat food');
  });

  it('should handle search submission', () => {
    // Arrange
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(<SearchBox onSearch={onSearch} />);
    const input = getByPlaceholderText('搜索...');

    // Act
    fireEvent.changeText(input, 'test query');
    fireEvent(input, 'submitEditing', { nativeEvent: { text: 'test query' } });

    // Assert
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should clear input when clear button is pressed', () => {
    // Arrange
    const onClear = jest.fn();
    const onChangeText = jest.fn();
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <SearchBox
        value="initial value"
        onClear={onClear}
        onChangeText={onChangeText}
        onSearch={onSearch}
      />
    );

    const clearButton = getByTestId('clear-button');

    // Act
    fireEvent.press(clearButton);

    // Assert
    expect(onClear).toHaveBeenCalled();
    expect(onChangeText).toHaveBeenCalledWith('');
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
