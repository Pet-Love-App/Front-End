import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';
import { Text } from 'tamagui';

describe('Card Component', () => {
  it('renders correctly with default props', () => {
    render(
      <Card testID="card">
        <CardContent>
          <Text>Card Content</Text>
        </CardContent>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeTruthy();
    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('renders header, content, and footer', () => {
    render(
      <Card>
        <CardHeader>
          <Text>Header</Text>
        </CardHeader>
        <CardContent>
          <Text>Content</Text>
        </CardContent>
        <CardFooter>
          <Text>Footer</Text>
        </CardFooter>
      </Card>
    );
    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
    expect(screen.getByText('Footer')).toBeTruthy();
  });

  it('applies elevated variant', () => {
    render(<Card testID="card-elevated" variant="elevated" />);
    const card = screen.getByTestId('card-elevated');
    expect(card).toBeTruthy();
    // Note: Style assertions might be limited depending on Tamagui mock
  });

  it('applies filled variant', () => {
    render(<Card testID="card-filled" variant="filled" />);
    const card = screen.getByTestId('card-filled');
    expect(card).toBeTruthy();
  });

  it('applies size variants', () => {
    render(<Card testID="card-sm" size="sm" />);
    expect(screen.getByTestId('card-sm')).toBeTruthy();
  });

  it('handles pressable prop', () => {
    const onPress = jest.fn();
    render(
      <Card testID="card-pressable" pressable onPress={onPress}>
        <Text>Press me</Text>
      </Card>
    );
    fireEvent.press(screen.getByTestId('card-pressable'));
    expect(onPress).toHaveBeenCalled();
  });
});
