import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CommentInput } from '../CommentInput';
import { View, Text } from 'react-native';

// Mock dependencies
jest.mock('@/src/design-system/components', () => {
  const { View } = require('react-native');
  return {
    Button: ({ children, onPress, disabled, icon }: any) => (
      <View testID="submit-button" onTouchEnd={onPress} accessibilityState={{ disabled }}>
        {icon}
        {children}
      </View>
    ),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: () => <View testID="icon-symbol" />,
  };
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    XStack: (props: any) => <View {...props} />,
    YStack: (props: any) => <View {...props} />,
    Text: (props: any) => <Text {...props} />,
  };
});

describe('CommentInput', () => {
  const defaultProps = {
    isAuthenticated: true,
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    // Arrange & Act
    const { getByPlaceholderText, getByTestId } = render(<CommentInput {...defaultProps} />);

    // Assert
    expect(getByPlaceholderText('说点什么...')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('should handle text input', () => {
    // Arrange
    const { getByPlaceholderText } = render(<CommentInput {...defaultProps} />);
    const input = getByPlaceholderText('说点什么...');

    // Act
    fireEvent.changeText(input, 'Test comment');

    // Assert
    expect(input.props.value).toBe('Test comment');
  });

  it('should submit comment when button is pressed', async () => {
    // Arrange
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByTestId } = render(
      <CommentInput {...defaultProps} onSubmit={onSubmit} />
    );
    const input = getByPlaceholderText('说点什么...');
    const button = getByTestId('submit-button');

    // Act
    fireEvent.changeText(input, 'Test comment');
    // Simulate press on the mocked button view
    fireEvent(button, 'touchEnd');

    // Assert
    expect(onSubmit).toHaveBeenCalledWith('Test comment');
    await waitFor(() => expect(input.props.value).toBe(''));
  });

  it('should disable input and button when not authenticated', () => {
    // Arrange
    const { getByPlaceholderText, getByTestId } = render(
      <CommentInput {...defaultProps} isAuthenticated={false} />
    );
    const input = getByPlaceholderText('登录后可以发表评论');
    const button = getByTestId('submit-button');

    // Assert
    expect(input.props.editable).toBe(false);
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('should show character count when typing', () => {
    // Arrange
    const { getByPlaceholderText, getByText } = render(<CommentInput {...defaultProps} />);
    const input = getByPlaceholderText('说点什么...');

    // Act
    fireEvent.changeText(input, 'Test');

    // Assert
    expect(getByText('4/500')).toBeTruthy();
  });
});
