import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CameraViewComponent } from '../camera-view';
import { View, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: React.forwardRef((props: any, ref: any) => {
      return <View testID="camera-view" {...props} ref={ref} />;
    }),
  };
});

jest.mock('@/src/components/LottieAnimation', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LottieAnimation: () => <View testID="lottie-animation" />,
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    IconSymbol: ({ name }: { name: string }) => <View testID={`icon-${name}`} />,
  };
});

describe('CameraViewComponent', () => {
  const mockCameraRef = { current: null };
  const defaultProps = {
    cameraRef: mockCameraRef,
    facing: 'back' as const,
    onCapture: jest.fn(),
    onToggleFacing: jest.fn(),
    onClose: jest.fn(),
    onCameraReady: jest.fn(),
    onPickFromLibrary: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    // Arrange & Act
    const { getByTestId } = render(<CameraViewComponent {...defaultProps} />);

    // Assert
    expect(getByTestId('camera-view')).toBeTruthy();
    expect(getByTestId('lottie-animation')).toBeTruthy();
    expect(getByTestId('icon-xmark')).toBeTruthy();
    expect(getByTestId('icon-photo.fill.on.rectangle.fill')).toBeTruthy();
    expect(getByTestId('icon-arrow.triangle.2.circlepath.camera')).toBeTruthy();
  });

  it('should handle capture button press', () => {
    // Arrange
    const { getByTestId } = render(<CameraViewComponent {...defaultProps} />);
    const captureButton = getByTestId('capture-button');

    // Act
    fireEvent.press(captureButton);

    // Assert
    expect(defaultProps.onCapture).toHaveBeenCalled();
  });

  it('should call onClose when close button is pressed', () => {
    // Arrange
    const { getByTestId } = render(<CameraViewComponent {...defaultProps} />);
    const closeIcon = getByTestId('icon-xmark');
    const closeButton = closeIcon.parent;

    // Act
    fireEvent.press(closeButton);

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onPickFromLibrary when library button is pressed', () => {
    // Arrange
    const { getByTestId } = render(<CameraViewComponent {...defaultProps} />);
    const libraryIcon = getByTestId('icon-photo.fill.on.rectangle.fill');
    const libraryButton = libraryIcon.parent;

    // Act
    fireEvent.press(libraryButton);

    // Assert
    expect(defaultProps.onPickFromLibrary).toHaveBeenCalled();
  });

  it('should call onToggleFacing when flip button is pressed', () => {
    // Arrange
    const { getByTestId } = render(<CameraViewComponent {...defaultProps} />);
    const flipIcon = getByTestId('icon-arrow.triangle.2.circlepath.camera');
    const flipButton = flipIcon.parent;

    // Act
    fireEvent.press(flipButton);

    // Assert
    expect(defaultProps.onToggleFacing).toHaveBeenCalled();
  });

  it('should fallback to onToggleFacing if onPickFromLibrary is not provided', () => {
    // Arrange
    const props = { ...defaultProps, onPickFromLibrary: undefined };
    const { getByTestId } = render(<CameraViewComponent {...props} />);
    const libraryIcon = getByTestId('icon-photo.fill.on.rectangle.fill');
    const libraryButton = libraryIcon.parent;

    // Act
    fireEvent.press(libraryButton);

    // Assert
    expect(defaultProps.onToggleFacing).toHaveBeenCalled();
  });
});
