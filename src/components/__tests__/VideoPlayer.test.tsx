import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VideoPlayer } from '../VideoPlayer';
import { View } from 'react-native';

// Mock dependencies
jest.mock('expo-av', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Video: React.forwardRef((props: any, ref: any) => {
      if (ref && typeof ref === 'object') {
        ref.current = {
          pauseAsync: jest.fn(),
        };
      }
      return <View testID="video-component" {...props} />;
    }),
    ResizeMode: {
      CONTAIN: 'contain',
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@tamagui/lucide-icons', () => {
  const { View } = require('react-native');
  return {
    X: () => <View testID="close-icon" />,
  };
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Stack: (props: any) => <View {...props} />,
    YStack: (props: any) => <View {...props} />,
    Text: (props: any) => <Text {...props} />,
  };
});

describe('VideoPlayer', () => {
  const defaultProps = {
    visible: true,
    videoUrl: 'http://example.com/video.mp4',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible is true', () => {
    // Arrange & Act
    const { getByTestId } = render(<VideoPlayer {...defaultProps} />);

    // Assert
    expect(getByTestId('video-component')).toBeTruthy();
    expect(getByTestId('close-icon')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    // Arrange & Act
    const { queryByTestId } = render(<VideoPlayer {...defaultProps} visible={false} />);

    // Assert
    expect(queryByTestId('video-component')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    // Arrange
    const { getByTestId } = render(<VideoPlayer {...defaultProps} />);
    const closeButton = getByTestId('close-button');

    // Act
    fireEvent.press(closeButton);

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
