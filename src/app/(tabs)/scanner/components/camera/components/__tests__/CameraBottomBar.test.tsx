import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CameraBottomBar } from '../CameraBottomBar';
import { ScanType } from '@/src/types/camera';
import { View } from 'react-native';

// Mock dependencies
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: ({ name }: { name: string }) => <View testID={`icon-${name}`} />,
  };
});

describe('CameraBottomBar', () => {
  const mockProps = {
    scanType: ScanType.BARCODE,
    onToggleScanType: jest.fn(),
    onTakePhoto: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly in BARCODE mode', () => {
    const { getByText, getByTestId, queryByTestId } = render(<CameraBottomBar {...mockProps} />);

    // In BARCODE mode, the button text is "拍照识别" (to switch to OCR)
    expect(getByText('拍照识别')).toBeTruthy();
    expect(getByText('自动识别中...')).toBeTruthy();
    // The icon shown is for switching to OCR (doc.text.viewfinder)
    expect(getByTestId('icon-doc.text.viewfinder')).toBeTruthy();
    expect(queryByTestId('capture-button')).toBeNull();
  });

  it('should render correctly in OCR mode', () => {
    const { getByText, getByTestId, queryByText } = render(
      <CameraBottomBar {...mockProps} scanType={ScanType.OCR} />
    );

    // In OCR mode, the button text is "扫描条码" (to switch to BARCODE)
    expect(getByText('扫描条码')).toBeTruthy();
    expect(queryByText('自动识别中...')).toBeNull();
    // The icon shown is for switching to BARCODE (barcode.viewfinder)
    expect(getByTestId('icon-barcode.viewfinder')).toBeTruthy();
    expect(getByTestId('capture-button')).toBeTruthy();
  });

  it('should handle toggle scan type', () => {
    const { getByText } = render(<CameraBottomBar {...mockProps} />);
    // In BARCODE mode, the button says "拍照识别"
    fireEvent.press(getByText('拍照识别'));
    expect(mockProps.onToggleScanType).toHaveBeenCalledTimes(1);
  });

  it('should handle take photo in OCR mode', () => {
    const { getByTestId } = render(<CameraBottomBar {...mockProps} scanType={ScanType.OCR} />);
    const captureButton = getByTestId('capture-button');
    fireEvent.press(captureButton);
    expect(mockProps.onTakePhoto).toHaveBeenCalledTimes(1);
  });
});
