import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../IconSymbol';

// Mock Ionicons (Android/Web)
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="ionicons-mock" {...props} />,
  };
});

// Mock expo-symbols (iOS)
jest.mock('expo-symbols', () => ({
  SymbolView: (props: any) => {
    const { View } = require('react-native');
    return <View testID="symbol-view-mock" {...props} />;
  },
}));

describe('IconSymbol Component', () => {
  it('renders correctly with valid mapping', () => {
    // Arrange
    const props = {
      name: 'heart.fill' as const,
      size: 24,
      color: 'red',
    };

    // Act
    const { queryByTestId } = render(<IconSymbol {...props} />);

    // Assert
    const iosIcon = queryByTestId('symbol-view-mock');
    const androidIcon = queryByTestId('ionicons-mock');

    if (iosIcon) {
      // iOS Logic (uses SF Symbol name directly)
      expect(iosIcon.props.name).toBe('heart.fill');
      expect(iosIcon.props.tintColor).toBe('red');
    } else if (androidIcon) {
      // Android Logic (uses Mapped Ionicons name)
      expect(androidIcon.props.name).toBe('heart');
      expect(androidIcon.props.color).toBe('red');
      expect(androidIcon.props.size).toBe(24);
    } else {
      throw new Error('No icon rendered. Ensure the correct platform file is loaded.');
    }
  });

  it('renders correctly with another mapping', () => {
    // Arrange
    const props = {
      name: 'camera.fill' as const,
      size: 30,
      color: 'blue',
    };

    // Act
    const { queryByTestId } = render(<IconSymbol {...props} />);

    // Assert
    const iosIcon = queryByTestId('symbol-view-mock');
    const androidIcon = queryByTestId('ionicons-mock');

    if (iosIcon) {
      expect(iosIcon.props.name).toBe('camera.fill');
      expect(iosIcon.props.tintColor).toBe('blue');
    } else if (androidIcon) {
      expect(androidIcon.props.name).toBe('camera');
      expect(androidIcon.props.color).toBe('blue');
      expect(androidIcon.props.size).toBe(30);
    } else {
      throw new Error('No icon rendered');
    }
  });
});
