import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { ToastManager, useToastStore, toast } from '../ToastManager';
import { View, Text } from 'react-native';

// Mock Toast component
jest.mock('../Toast', () => {
  const { View, Text } = require('react-native');
  return {
    Toast: ({ message, onDismiss }: any) => (
      <View testID="toast-mock" onTouchEnd={onDismiss}>
        <Text>{message}</Text>
      </View>
    ),
  };
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View testID="toast-container" {...props}>{children}</View>,
  };
});

describe('ToastManager', () => {
  beforeEach(() => {
    act(() => {
      useToastStore.getState().clearAll();
    });
  });

  it('renders nothing initially', () => {
    // Arrange
    // Act
    const { queryByTestId } = render(<ToastManager />);

    // Assert
    expect(queryByTestId('toast-mock')).toBeNull();
  });

  it('renders toast when added via store', () => {
    // Arrange
    const { getByTestId, getByText } = render(<ToastManager />);

    // Act
    act(() => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Success Toast',
      });
    });

    // Assert
    expect(getByTestId('toast-mock')).toBeTruthy();
    expect(getByText('Success Toast')).toBeTruthy();
  });

  it('removes toast when dismissed', () => {
    // Arrange
    const { getByTestId, queryByTestId } = render(<ToastManager />);
    act(() => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Dismiss Me',
      });
    });

    // Act
    const toastEl = getByTestId('toast-mock');
    fireEvent(toastEl, 'touchEnd');

    // Assert
    expect(queryByTestId('toast-mock')).toBeNull();
  });
});

describe('toast helper', () => {
  beforeEach(() => {
    useToastStore.getState().clearAll();
  });

  it('adds success toast', () => {
    // Act
    toast.success('Success Message');

    // Assert
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Success Message');
  });

  it('adds error toast', () => {
    // Act
    toast.error('Error Message');

    // Assert
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Error Message');
  });
});
