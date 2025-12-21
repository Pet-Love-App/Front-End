import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { LazyComponent } from '../LazyComponent';
import { Text } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Spinner: () => <View testID="spinner-mock" />,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    YStack: ({ children, ...props }: any) => <View testID="ystack-mock" {...props}>{children}</View>,
  };
});

// Mock logger
jest.mock('@/src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const MockComponent = () => <Text testID="loaded-component">Loaded Component</Text>;

describe('LazyComponent', () => {
  it('renders loading state initially', async () => {
    // Arrange
    const factory = jest.fn(() => new Promise<{ default: React.ComponentType<any> }>(() => {})); // Never resolves

    // Act
    const { getByTestId } = render(<LazyComponent factory={factory} />);

    // Assert
    expect(getByTestId('spinner-mock')).toBeTruthy();
  });

  it('renders loaded component after factory resolves', async () => {
    // Arrange
    const factory = jest.fn().mockResolvedValue({ default: MockComponent });

    // Act
    const { getByTestId } = render(<LazyComponent factory={factory} minLoadTime={0} />);

    // Assert
    await waitFor(() => {
      expect(getByTestId('loaded-component')).toBeTruthy();
    });
  });

  it('renders error state on failure', async () => {
    // Arrange
    const error = new Error('Load failed');
    const factory = jest.fn().mockRejectedValue(error);

    // Act
    const { getByText } = render(<LazyComponent factory={factory} minLoadTime={0} />);

    // Assert
    await waitFor(() => {
      expect(getByText('⚠️ 加载失败')).toBeTruthy();
      expect(getByText('Load failed')).toBeTruthy();
    });
  });

  it('retries on error when retry button is clicked', async () => {
    // Arrange
    const error = new Error('Load failed');
    const factory = jest.fn()
      .mockRejectedValueOnce(error) // First fail
      .mockResolvedValueOnce({ default: MockComponent }); // Then succeed

    // Act
    const { getByText, getAllByTestId, getByTestId } = render(<LazyComponent factory={factory} minLoadTime={0} />);

    // Wait for error
    await waitFor(() => {
      expect(getByText('⚠️ 加载失败')).toBeTruthy();
    });

    // Find retry button (YStack with onPress)
    const stacks = getAllByTestId('ystack-mock');
    const retryButton = stacks.find((stack) => stack.props.onPress);

    if (!retryButton) throw new Error('Retry button not found');

    // Act - Retry
    fireEvent(retryButton, 'onPress');

    // Assert
    await waitFor(() => {
      expect(getByTestId('loaded-component')).toBeTruthy();
    });
  });
});
