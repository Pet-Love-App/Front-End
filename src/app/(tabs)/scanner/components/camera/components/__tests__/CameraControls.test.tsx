import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CameraControls } from '../CameraControls';
import { ScanType } from '@/src/types/camera';
import { View, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: ({ name }: { name: string }) => <View testID={`icon-${name}`} />,
  };
});

describe('CameraControls', () => {
  const mockProps = {
    scanType: ScanType.BARCODE,
    zoom: 0,
    onClose: jest.fn(),
    onToggleCamera: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    setZoom: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly in BARCODE mode', () => {
    const { getByText, getByTestId } = render(<CameraControls {...mockProps} />);

    expect(getByText('扫描条形码')).toBeTruthy();
    expect(getByTestId('icon-xmark')).toBeTruthy();
    expect(getByTestId('icon-camera.rotate')).toBeTruthy();
    expect(getByTestId('icon-minus')).toBeTruthy();
    expect(getByTestId('icon-plus')).toBeTruthy();
    expect(getByText('1.0x')).toBeTruthy();
  });

  it('should render correctly in OCR mode', () => {
    const { getByText } = render(<CameraControls {...mockProps} scanType={ScanType.OCR} />);
    expect(getByText('拍照识别成分')).toBeTruthy();
  });

  it('should handle close action', () => {
    const { getByTestId } = render(<CameraControls {...mockProps} />);
    // The icon is inside a View which is inside TouchableOpacity.
    // fireEvent.press on the icon should bubble up to TouchableOpacity.
    fireEvent.press(getByTestId('icon-xmark'));
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle toggle camera action', () => {
    const { getByTestId } = render(<CameraControls {...mockProps} />);
    fireEvent.press(getByTestId('icon-camera.rotate'));
    expect(mockProps.onToggleCamera).toHaveBeenCalledTimes(1);
  });

  it('should handle zoom in action', () => {
    const { getByTestId } = render(<CameraControls {...mockProps} />);
    fireEvent.press(getByTestId('icon-plus'));
    expect(mockProps.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('should handle zoom out action', () => {
    const { getByTestId } = render(<CameraControls {...mockProps} zoom={0.5} />);
    fireEvent.press(getByTestId('icon-minus'));
    expect(mockProps.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('should disable zoom out when zoom is 0', () => {
    const { getByTestId } = render(<CameraControls {...mockProps} zoom={0} />);
    fireEvent.press(getByTestId('icon-minus'));
    expect(mockProps.onZoomOut).not.toHaveBeenCalled();
  });

  it('should disable zoom in when zoom is 1', () => {
    const { getByTestId } = render(<CameraControls {...mockProps} zoom={1} />);
    fireEvent.press(getByTestId('icon-plus'));
    expect(mockProps.onZoomIn).not.toHaveBeenCalled();
  });
});
