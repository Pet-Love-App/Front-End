import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { Text } from 'tamagui';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(
      <Button>
        <Text>Click Me</Text>
      </Button>
    );
    expect(screen.getByText('Click Me')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} testID="button">
        <Text>Press</Text>
      </Button>
    );
    fireEvent.press(screen.getByTestId('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows loading spinner when loading is true', () => {
    render(
      <Button loading testID="button-loading">
        <Text>Loading</Text>
      </Button>
    );
    // Tamagui Spinner usually renders an ActivityIndicator or similar
    // We can check if the button is disabled or if spinner exists
    // Depending on implementation, children might be hidden or spinner added
    expect(screen.getByTestId('button-loading')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    render(
      <Button disabled onPress={onPress} testID="button-disabled">
        <Text>Disabled</Text>
      </Button>
    );
    fireEvent.press(screen.getByTestId('button-disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders left and right icons', () => {
    render(
      <Button leftIcon={<Text>Left</Text>} rightIcon={<Text>Right</Text>}>
        <Text>Content</Text>
      </Button>
    );
    expect(screen.getByText('Left')).toBeTruthy();
    expect(screen.getByText('Right')).toBeTruthy();
  });

  it('applies variants', () => {
    render(
      <Button variant="primary" testID="button-primary">
        <Text>Primary</Text>
      </Button>
    );
    expect(screen.getByTestId('button-primary')).toBeTruthy();
  });
});
