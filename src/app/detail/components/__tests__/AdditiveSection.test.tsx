import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AdditiveSection } from '../AdditiveSection';
import { View, Text } from 'react-native';

// Mock dependencies
jest.mock('../AdditiveBubble', () => {
  const { View, Text } = require('react-native');
  return {
    AdditiveBubble: jest.fn(({ additive, onPress }) => (
      <View testID={`additive-${additive.id}`}>
        <Text onPress={() => onPress(additive)}>{additive.name}</Text>
      </View>
    )),
  };
});

const mockAdditives = [
  { id: 1, name: 'Additive 1' },
  { id: 2, name: 'Additive 2' },
];

describe('AdditiveSection', () => {
  const mockOnAdditivePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if additives is empty', () => {
    const { toJSON } = render(
      <AdditiveSection additives={[]} onAdditivePress={mockOnAdditivePress} />
    );
    expect(toJSON()).toBeNull();
  });

  it('should render correctly with additives', () => {
    const { getByText, getByTestId } = render(
      <AdditiveSection additives={mockAdditives as any} onAdditivePress={mockOnAdditivePress} />
    );

    expect(getByText('添加剂成分')).toBeTruthy();
    expect(getByText('点击气泡查看详情')).toBeTruthy();
    
    expect(getByText('Additive 1')).toBeTruthy();
    expect(getByText('Additive 2')).toBeTruthy();

    fireEvent.press(getByText('Additive 1'));
    expect(mockOnAdditivePress).toHaveBeenCalledWith(mockAdditives[0]);
  });
});
