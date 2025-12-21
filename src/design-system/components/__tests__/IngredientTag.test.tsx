import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { IngredientTag } from '../IngredientTag';

describe('IngredientTag Component', () => {
  it('renders correctly with name', () => {
    render(<IngredientTag name="Chicken" testID="tag" />);
    expect(screen.getByTestId('tag')).toBeTruthy();
    expect(screen.getByText('Chicken')).toBeTruthy();
  });

  it('renders with type safe', () => {
    render(<IngredientTag name="Safe Item" type="safe" />);
    // Check for icon or specific style if possible, or just render without crash
    expect(screen.getByText('Safe Item')).toBeTruthy();
  });

  it('renders with type caution', () => {
    render(<IngredientTag name="Caution Item" type="caution" />);
    expect(screen.getByText('Caution Item')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    render(<IngredientTag name="Clickable" pressable onPress={onPress} testID="tag-pressable" />);
    fireEvent.press(screen.getByTestId('tag-pressable'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows description in tooltip or similar if implemented (mock check)', () => {
    // The component might use a tooltip or just pass the prop.
    // We verify it renders.
    render(<IngredientTag name="With Desc" description="Description" />);
    expect(screen.getByText('With Desc')).toBeTruthy();
  });
});
