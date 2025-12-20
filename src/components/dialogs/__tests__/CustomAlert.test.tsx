import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { AlertManager, showAlert, Alert, useAlertStore } from '../CustomAlert';
import { View } from 'react-native';

// Mock ConfirmDialog to avoid testing its internal logic and focus on AlertManager
jest.mock('../ConfirmDialog', () => {
  const { View } = require('react-native');
  return {
    ConfirmDialog: jest.fn(({
      open,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText
    }) => {
      if (!open) return null;
      return (
        <View
          testID="confirm-dialog"
          // @ts-ignore - passing props for testing
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );
    }),
  };
});

describe('CustomAlert', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAlertStore.setState({ alerts: [] });
    });
  });

  describe('AlertManager', () => {
    it('renders nothing when no alerts are present', () => {
      // Arrange
      render(<AlertManager />);

      // Assert
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });

    it('renders an alert when showAlert is called', () => {
      // Arrange
      render(<AlertManager />);

      // Act
      act(() => {
        showAlert({
          title: 'Test Alert',
          message: 'This is a test message',
        });
      });

      // Assert
      expect(screen.getByTestId('confirm-dialog')).toBeTruthy();
      expect(screen.getByTestId('confirm-dialog').props.title).toBe('Test Alert');
      expect(screen.getByTestId('confirm-dialog').props.message).toBe('This is a test message');
    });

    it('handles confirm button press', async () => {
      // Arrange
      const onConfirmMock = jest.fn();
      render(<AlertManager />);

      act(() => {
        showAlert({
          title: 'Confirm Test',
          message: 'Confirm Message',
          buttons: [
            { text: 'OK', onPress: onConfirmMock, style: 'default' }
          ]
        });
      });

      // Act
      const dialog = screen.getByTestId('confirm-dialog');
      await act(async () => {
        await dialog.props.onConfirm();
      });

      // Assert
      expect(onConfirmMock).toHaveBeenCalled();
      // Should be closed after confirm
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });

    it('handles cancel button press', () => {
      // Arrange
      const onCancelMock = jest.fn();
      render(<AlertManager />);

      act(() => {
        showAlert({
          title: 'Cancel Test',
          message: 'Cancel Message',
          buttons: [
            { text: 'Cancel', onPress: onCancelMock, style: 'cancel' },
            { text: 'OK', style: 'default' }
          ]
        });
      });

      // Act
      const dialog = screen.getByTestId('confirm-dialog');
      act(() => {
        dialog.props.onCancel();
      });

      // Assert
      expect(onCancelMock).toHaveBeenCalled();
      // Should be closed after cancel
      expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    });
  });

  describe('Alert.alert compatibility', () => {
    it('shows alert using Alert.alert syntax', () => {
      // Arrange
      render(<AlertManager />);

      // Act
      act(() => {
        Alert.alert('Compat Title', 'Compat Message');
      });

      // Assert
      const dialog = screen.getByTestId('confirm-dialog');
      expect(dialog).toBeTruthy();
      expect(dialog.props.title).toBe('Compat Title');
      expect(dialog.props.message).toBe('Compat Message');
      expect(dialog.props.confirmText).toBe('确定'); // Default text
    });

    it('passes custom buttons correctly', async () => {
      // Arrange
      const onPressMock = jest.fn();
      render(<AlertManager />);

      // Act
      act(() => {
        Alert.alert(
          'Button Title',
          'Button Message',
          [
            { text: 'Custom OK', onPress: onPressMock }
          ]
        );
      });

      // Assert
      const dialog = screen.getByTestId('confirm-dialog');
      expect(dialog.props.confirmText).toBe('Custom OK');

      await act(async () => {
        await dialog.props.onConfirm();
      });

      expect(onPressMock).toHaveBeenCalled();
    });
  });
});
