import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContentDialog } from '../ContentDialog';
import { Text, View } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Dialog: Object.assign(
      ({ children, open }: any) => (open ? <View testID="dialog-root">{children}</View> : null),
      {
        Portal: ({ children }: any) => <View testID="dialog-portal">{children}</View>,
        Overlay: ({ onPress }: any) => <View testID="dialog-overlay" onTouchEnd={onPress} />,
        Content: ({ children, ...props }: any) => <View testID="dialog-content" {...props}>{children}</View>,
        Title: ({ children }: any) => <Text>{children}</Text>,
        Description: ({ children }: any) => <Text>{children}</Text>,
        Close: ({ children }: any) => <View>{children}</View>,
      }
    ),
    YStack: ({ children, ...props }: any) => <View testID="ystack-mock" {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children }: any) => <Text>{children}</Text>,
    ScrollView: ({ children }: any) => <View>{children}</View>,
  };
});

// Mock DialogHeader
jest.mock('../DialogHeader', () => {
  const { View, Text } = require('react-native');
  return {
    DialogHeader: ({ title, onClose }: any) => (
      <View testID="dialog-header">
        <Text testID="header-title">{title}</Text>
        {onClose && <View testID="header-close" onTouchEnd={onClose} />}
      </View>
    ),
  };
});

// Mock SafeArea
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 20, left: 0, right: 0 }),
}));

describe('ContentDialog Component', () => {
  it('renders correctly when open', () => {
    // Arrange
    const props = {
      open: true,
      onOpenChange: jest.fn(),
      title: 'Content Title',
      children: <Text>Content Body</Text>,
    };

    // Act
    const { getByTestId, getByText } = render(<ContentDialog {...props} />);

    // Assert
    expect(getByTestId('dialog-root')).toBeTruthy();
    expect(getByText('Content Title')).toBeTruthy();
    expect(getByText('Content Body')).toBeTruthy();
  });

  it('renders fullscreen mode correctly', () => {
    // Arrange
    const props = {
      open: true,
      onOpenChange: jest.fn(),
      title: 'Fullscreen Title',
      children: <Text>Fullscreen Content</Text>,
      size: 'fullscreen' as const,
    };

    // Act
    const { getByTestId, getByText } = render(<ContentDialog {...props} />);

    // Assert
    expect(getByTestId('dialog-root')).toBeTruthy();
    expect(getByText('Fullscreen Title')).toBeTruthy();
    // Check if content has full width/height (mocked in Dialog.Content props, but we can check if it rendered)
    // In our mock, we don't pass styles to div, but we can check if it rendered.
  });

  it('renders footer actions if provided', () => {
    // Arrange
    const props = {
      open: true,
      onOpenChange: jest.fn(),
      title: 'Title',
      children: <Text>Content</Text>,
      footerActions: <Text>Footer Actions</Text>,
    };

    // Act
    const { getByText } = render(<ContentDialog {...props} />);

    // Assert
    expect(getByText('Footer Actions')).toBeTruthy();
  });

  it('closes on overlay click', () => {
    // Arrange
    const onOpenChange = jest.fn();
    const props = {
      open: true,
      onOpenChange,
      title: 'Title',
      children: <Text>Content</Text>,
      closeOnOverlayClick: true,
    };

    // Act
    const { getByTestId } = render(<ContentDialog {...props} />);
    fireEvent(getByTestId('dialog-overlay'), 'touchEnd');

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
