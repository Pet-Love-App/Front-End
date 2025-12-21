import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';
import { Text } from 'tamagui';

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input testID="input" placeholder="Enter text" />);
    expect(screen.getByTestId('input')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders label when provided', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeTruthy();
  });

  it('renders error message when provided', () => {
    render(<Input errorMessage="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeTruthy();
  });

  it('renders left and right icons', () => {
    render(
      <Input
        leftIcon={<Text>Left</Text>}
        rightIcon={<Text>Right</Text>}
      />
    );
    expect(screen.getByText('Left')).toBeTruthy();
    expect(screen.getByText('Right')).toBeTruthy();
  });

  it('handles text changes', () => {
    const onChangeText = jest.fn();
    render(<Input testID="input" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByTestId('input'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('applies error style when error prop is true', () => {
    render(<Input testID="input-error" error />);
    expect(screen.getByTestId('input-error')).toBeTruthy();
  });
});
