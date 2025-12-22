import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IdentifiedItemsSection } from '../IdentifiedItemsSection';
import { View, Text as RNText, TouchableOpacity } from 'react-native';

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Card: ({ children }: any) => <View>{children}</View>,
    Spinner: () => <Text>Spinner</Text>,
    Text: ({ children }: any) => <Text>{children}</Text>,
    XStack: ({ children, onPress, ...props }: any) => <View {...props}>{children}</View>,
    YStack: ({ children, onPress, ...props }: any) => <View {...props}>{children}</View>,
  };
});

// Mock Button
jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity, View } = require('react-native');
  return {
    Button: ({ onPress, children, icon, ...props }: any) => (
      <TouchableOpacity onPress={onPress} {...props} testID={props.testID}>
        {icon && <View>{icon}</View>}
        {children}
      </TouchableOpacity>
    ),
  };
});

describe('IdentifiedItemsSection', () => {
  const mockItems = ['Item 1', 'Item 2'];
  const mockOnItemClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with items', () => {
    const { getByText } = render(
      <IdentifiedItemsSection
        title="Test Title"
        items={mockItems}
        type="additive"
        buttonColor="#ff0000"
        loadingItem={null}
        onItemClick={mockOnItemClick}
      />
    );

    expect(getByText('Test Title (2)')).toBeTruthy();
    expect(getByText('点击查看详情')).toBeTruthy();
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('does not render when items are empty', () => {
    const { toJSON } = render(
      <IdentifiedItemsSection
        title="Test Title"
        items={[]}
        type="additive"
        buttonColor="#ff0000"
        loadingItem={null}
        onItemClick={mockOnItemClick}
      />
    );

    expect(toJSON()).toBeNull();
  });

  it('handles item click', () => {
    const { getByText } = render(
      <IdentifiedItemsSection
        title="Test Title"
        items={mockItems}
        type="additive"
        buttonColor="#ff0000"
        loadingItem={null}
        onItemClick={mockOnItemClick}
      />
    );

    fireEvent.press(getByText('Item 1'));
    expect(mockOnItemClick).toHaveBeenCalledWith('Item 1');
  });

  it('shows loading spinner for loading item', () => {
    const { getByText } = render(
      <IdentifiedItemsSection
        title="Test Title"
        items={mockItems}
        type="additive"
        buttonColor="#ff0000"
        loadingItem="Item 1"
        onItemClick={mockOnItemClick}
      />
    );

    expect(getByText('Spinner')).toBeTruthy();
  });
});
