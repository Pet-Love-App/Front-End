import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScannerScreen from '../index';
import { useExpoCamera } from '@/src/hooks/useExpoCamera';
import { useScannerFlow } from '../hooks/useScannerFlow';
import { useScannerActions } from '../hooks/useScannerActions';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { useUserStore } from '@/src/store/userStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScanType } from '@/src/types/camera';

// Mock dependencies
jest.mock('@/src/hooks/useExpoCamera');
jest.mock('../hooks/useScannerFlow');
jest.mock('../hooks/useScannerActions');
jest.mock('@/src/store/catFoodStore');
jest.mock('@/src/store/userStore');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock child components
jest.mock('../components', () => {
  const { Text } = require('react-native');
  return {
    ExpoCameraView: () => <Text>ExpoCameraView</Text>,
    OcrResultView: () => <Text>OcrResultView</Text>,
    PhotoPreview: () => <Text>PhotoPreview</Text>,
    BarcodeResultScreen: () => <Text>BarcodeResultScreen</Text>,
    InitialScreen: () => <Text>InitialScreen</Text>,
    ProcessingScreen: () => <Text>ProcessingScreen</Text>,
    AiReportDetail: () => <Text>AiReportDetail</Text>,
    CatFoodSearchModal: () => <Text>CatFoodSearchModal</Text>,
    CameraPermissionModal: () => <Text>CameraPermissionModal</Text>,
    LoadingGameModal: () => <Text>LoadingGameModal</Text>,
  };
});

jest.mock('../screens', () => {
  const { Text } = require('react-native');
  return {
    BarcodeResultScreen: () => <Text>BarcodeResultScreen</Text>,
    InitialScreen: () => <Text>InitialScreen</Text>,
    ProcessingScreen: () => <Text>ProcessingScreen</Text>,
  };
});

describe('ScannerScreen', () => {
  const mockRouter = { push: jest.fn(), back: jest.fn() };
  const mockFetchCatFoodById = jest.fn();

  const mockCameraState = {
    facing: 'back',
    scanType: ScanType.BARCODE,
  };

  const mockFlowState = 'taking-photo';

  const mockActions = {
    photoUri: null,
    ocrResult: null,
    aiReport: null,
    isProcessing: false,
    isGeneratingReport: false,
    handleTakePhoto: jest.fn(),
    handleRetakePhoto: jest.fn(),
    handleCancelPreview: jest.fn(),
    handleConfirmPhoto: jest.fn(),
    handleGenerateReport: jest.fn(),
    handleSaveReport: jest.fn(),
    setIsGeneratingReport: jest.fn(),
    showLoadingGame: false,
    handleCloseLoadingGame: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (useCatFoodStore as unknown as jest.Mock).mockReturnValue(mockFetchCatFoodById);
    (useUserStore as unknown as jest.Mock).mockReturnValue({ id: 'user1' });

    (useExpoCamera as jest.Mock).mockReturnValue({
      state: mockCameraState,
      cameraRef: { current: null },
      takePicture: jest.fn(),
      toggleFacing: jest.fn(),
      toggleScanType: jest.fn(),
      setScanType: jest.fn(),
      requestPermission: jest.fn(),
      onCameraReady: jest.fn(),
      resetBarcodeScan: jest.fn(),
    });

    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: mockFlowState,
      selectedCatFood: null,
      scannedCode: null,
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: jest.fn(),
    });

    (useScannerActions as jest.Mock).mockReturnValue(mockActions);
  });

  it('renders ExpoCameraView when flowState is taking-photo', () => {
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('ExpoCameraView')).toBeTruthy();
  });

  it('renders PhotoPreview when flowState is photo-preview', () => {
    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: 'photo-preview',
      selectedCatFood: null,
      scannedCode: null,
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: jest.fn(),
    });
    (useScannerActions as jest.Mock).mockReturnValue({
      ...mockActions,
      photoUri: 'test-uri',
    });
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('PhotoPreview')).toBeTruthy();
  });

  it('renders ProcessingScreen when flowState is processing-ocr', () => {
    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: 'processing-ocr',
      selectedCatFood: null,
      scannedCode: null,
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: jest.fn(),
    });
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('ProcessingScreen')).toBeTruthy();
  });

  it('renders OcrResultView when flowState is ocr-result', () => {
    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: 'ocr-result',
      selectedCatFood: null,
      scannedCode: null,
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: jest.fn(),
    });
    (useScannerActions as jest.Mock).mockReturnValue({
      ...mockActions,
      ocrResult: { text: 'test' },
    });
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('OcrResultView')).toBeTruthy();
  });

  it('renders AiReportDetail when flowState is ai-report-detail', () => {
    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: 'ai-report-detail',
      selectedCatFood: null,
      scannedCode: null,
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: jest.fn(),
    });
    (useScannerActions as jest.Mock).mockReturnValue({
      ...mockActions,
      aiReport: { id: '1' },
    });
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('AiReportDetail')).toBeTruthy();
  });

  it('renders BarcodeResultScreen when flowState is barcode-result', () => {
    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: 'barcode-result',
      selectedCatFood: null,
      scannedCode: '123456',
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: jest.fn(),
    });
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('BarcodeResultScreen')).toBeTruthy();
  });

  it('handles URL params for barcode scan', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      scanType: 'barcode',
      catfoodId: '123',
    });

    const mockSetScanType = jest.fn();
    const mockTransitionTo = jest.fn();

    (useExpoCamera as jest.Mock).mockReturnValue({
      state: { facing: 'back', scanType: ScanType.BARCODE },
      cameraRef: { current: null },
      takePicture: jest.fn(),
      toggleFacing: jest.fn(),
      toggleScanType: jest.fn(),
      setScanType: mockSetScanType,
      requestPermission: jest.fn(),
      onCameraReady: jest.fn(),
      resetBarcodeScan: jest.fn(),
    });

    (useScannerFlow as jest.Mock).mockReturnValue({
      flowState: 'initial',
      selectedCatFood: null,
      scannedCode: null,
      startScan: jest.fn(),
      selectCatFood: jest.fn(),
      onBarcodeScanned: jest.fn(),
      goBack: jest.fn(),
      resetFlow: jest.fn(),
      transitionTo: mockTransitionTo,
    });

    render(<ScannerScreen />);

    await waitFor(() => {
      expect(mockSetScanType).toHaveBeenCalledWith(ScanType.BARCODE);
      expect(mockTransitionTo).toHaveBeenCalledWith('taking-photo');
    });
  });
});
