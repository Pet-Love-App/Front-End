import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ExpoCameraView, SUPPORTED_BARCODE_TYPES } from '../ExpoCameraView';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { ScanType } from '@/src/types/camera';
import { Animated, View, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: React.forwardRef((props: any, ref: any) => {
      return <View {...props} ref={ref} testID="camera-view" />;
    }),
    CameraType: {
      front: 'front',
      back: 'back',
    },
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
    Light: 'light',
  },
}));

jest.mock('../components/CameraBottomBar', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    CameraBottomBar: ({ onTakePhoto, onToggleScanType }: any) => (
      <View testID="bottom-bar">
        <TouchableOpacity onPress={onTakePhoto} testID="take-photo-btn" />
        <TouchableOpacity onPress={onToggleScanType} testID="toggle-scan-btn" />
      </View>
    ),
  };
});

jest.mock('../components/CameraControls', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    CameraControls: ({ onClose, onToggleCamera, onZoomIn, onZoomOut }: any) => (
      <View testID="camera-controls">
        <TouchableOpacity onPress={onClose} testID="close-btn" />
        <TouchableOpacity onPress={onToggleCamera} testID="toggle-camera-btn" />
        <TouchableOpacity onPress={onZoomIn} testID="zoom-in-btn" />
        <TouchableOpacity onPress={onZoomOut} testID="zoom-out-btn" />
      </View>
    ),
  };
});

jest.mock('../components/ScanFrame', () => {
  const { View } = require('react-native');
  return {
    ScanFrame: ({ onLayout }: any) => (
      <View testID="scan-frame" onLayout={(e: any) => onLayout && onLayout(e)} />
    ),
  };
});

jest.mock('../hooks/useZoomGesture', () => ({
  useZoomGesture: () => ({
    panResponder: { panHandlers: {} },
  }),
}));

describe('ExpoCameraView', () => {
  const mockProps = {
    cameraRef: { current: null },
    facing: 'back' as const,
    scanType: ScanType.BARCODE,
    onClose: jest.fn(),
    onToggleCamera: jest.fn(),
    onToggleScanType: jest.fn(),
    onCameraReady: jest.fn(),
    onBarCodeScanned: jest.fn(),
    onTakePhoto: jest.fn(),
    takePicture: jest.fn(),
    debounceTime: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);
    expect(getByTestId('bottom-bar')).toBeTruthy();
    expect(getByTestId('camera-controls')).toBeTruthy();
    expect(getByTestId('scan-frame')).toBeTruthy();
  });

  it('should handle camera ready', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);
    const camera = getByTestId('camera-view');
    fireEvent(camera, 'onCameraReady');
    expect(mockProps.onCameraReady).toHaveBeenCalled();
  });

  it('should handle barcode scanned', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);
    const camera = getByTestId('camera-view');

    // First set camera ready
    fireEvent(camera, 'onCameraReady');

    const mockResult = { type: 'ean13', data: '1234567890123' };
    fireEvent(camera, 'onBarcodeScanned', mockResult);

    expect(mockProps.onBarCodeScanned).toHaveBeenCalledWith(mockResult);
  });

  it('should debounce barcode scanning', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);
    const camera = getByTestId('camera-view');
    fireEvent(camera, 'onCameraReady');

    const mockResult = { type: 'ean13', data: '1234567890123' };

    // First scan
    fireEvent(camera, 'onBarcodeScanned', mockResult);
    expect(mockProps.onBarCodeScanned).toHaveBeenCalledTimes(1);

    // Second scan immediately
    fireEvent(camera, 'onBarcodeScanned', mockResult);
    expect(mockProps.onBarCodeScanned).toHaveBeenCalledTimes(1);

    // Advance time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Third scan after debounce
    fireEvent(camera, 'onBarcodeScanned', mockResult);
    expect(mockProps.onBarCodeScanned).toHaveBeenCalledTimes(2);
  });

  it('should validate barcode data', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);
    const camera = getByTestId('camera-view');
    fireEvent(camera, 'onCameraReady');

    // Invalid type
    fireEvent(camera, 'onBarcodeScanned', { type: 'invalid', data: '123' });
    expect(mockProps.onBarCodeScanned).not.toHaveBeenCalled();

    // Invalid EAN13
    fireEvent(camera, 'onBarcodeScanned', { type: 'ean13', data: '123' });
    expect(mockProps.onBarCodeScanned).not.toHaveBeenCalled();
  });

  it('should handle take photo', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);

    // Trigger layout on ScanFrame to set scanFrameLayout
    const scanFrame = getByTestId('scan-frame');
    fireEvent(scanFrame, 'layout', {
      nativeEvent: { layout: { x: 10, y: 20, width: 300, height: 300 } },
    });

    const takePhotoBtn = getByTestId('take-photo-btn');
    fireEvent.press(takePhotoBtn);

    act(() => {
      jest.advanceTimersByTime(100); // Wait for animation/timeout
    });

    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(mockProps.onTakePhoto).toHaveBeenCalled();
  });

  it('should handle zoom controls', () => {
    const { getByTestId } = render(<ExpoCameraView {...mockProps} />);

    const zoomInBtn = getByTestId('zoom-in-btn');
    fireEvent.press(zoomInBtn);
    // Check if zoom state changed? We can't check internal state directly.
    // But we can check if Haptics was called, which happens on zoom change.
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });
});
