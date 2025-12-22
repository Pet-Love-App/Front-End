import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useExpoCamera } from '../useExpoCamera';
import { Camera, PermissionStatus } from 'expo-camera';
import { ScanType } from '@/src/types/camera';

// Mock dependencies
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
  CameraView: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
}));

jest.mock('expo-image-manipulator', () => ({
  // Mock methods if needed
}));

describe('useExpoCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.UNDETERMINED,
    });

    // Act
    const { result } = renderHook(() => useExpoCamera());

    // Assert
    expect(result.current.state).toEqual({
      hasPermission: null,
      isReady: false,
      facing: 'back',
      scanType: ScanType.BARCODE,
      scannedBarcode: null,
    });

    // Wait for permission check
    await waitFor(() => expect(result.current.state.hasPermission).toBe(false));
  });

  it('should check permissions on mount', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });

    // Act
    const { result } = renderHook(() => useExpoCamera());

    // Assert
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));
  });

  it('should request permissions successfully', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.UNDETERMINED,
    });
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });

    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(false)); // Initial check

    // Act
    await act(async () => {
      await result.current.requestPermission();
    });

    // Assert
    expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    expect(result.current.state.hasPermission).toBe(true);
  });

  it('should handle permission denial', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.UNDETERMINED,
    });
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.DENIED,
    });

    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(false));

    // Act
    await act(async () => {
      await result.current.requestPermission();
    });

    // Assert
    expect(result.current.state.hasPermission).toBe(false);
  });

  it('should toggle camera facing', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    // Act
    act(() => {
      result.current.toggleFacing();
    });

    // Assert
    expect(result.current.state.facing).toBe('front');

    // Act again
    act(() => {
      result.current.toggleFacing();
    });

    // Assert
    expect(result.current.state.facing).toBe('back');
  });

  it('should toggle scan type', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    // Act
    act(() => {
      result.current.toggleScanType();
    });

    // Assert
    expect(result.current.state.scanType).toBe(ScanType.OCR);

    // Act again
    act(() => {
      result.current.toggleScanType();
    });

    // Assert
    expect(result.current.state.scanType).toBe(ScanType.BARCODE);
  });

  it('should set specific scan type', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    // Act
    act(() => {
      result.current.setScanType(ScanType.OCR);
    });

    // Assert
    expect(result.current.state.scanType).toBe(ScanType.OCR);
  });

  it('should handle barcode scanned', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    const mockBarcodeResult = { data: '123456789' };

    // Act
    act(() => {
      result.current.handleBarCodeScanned(mockBarcodeResult as any);
    });

    // Assert
    expect(result.current.state.scannedBarcode).toBe('123456789');
  });

  it('should ignore barcode scan if already scanned', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    // First scan
    act(() => {
      result.current.handleBarCodeScanned({ data: '123' } as any);
    });

    // Act - Second scan
    act(() => {
      result.current.handleBarCodeScanned({ data: '456' } as any);
    });

    // Assert
    expect(result.current.state.scannedBarcode).toBe('123');
  });

  it('should ignore barcode scan if not in BARCODE mode', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera(ScanType.OCR));
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    // Act
    act(() => {
      result.current.handleBarCodeScanned({ data: '123' } as any);
    });

    // Assert
    expect(result.current.state.scannedBarcode).toBeNull();
  });

  it('should reset barcode scan', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    act(() => {
      result.current.handleBarCodeScanned({ data: '123' } as any);
    });

    // Act
    act(() => {
      result.current.resetBarcodeScan();
    });

    // Assert
    expect(result.current.state.scannedBarcode).toBeNull();
  });

  it('should set camera ready', async () => {
    // Arrange
    (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: PermissionStatus.GRANTED,
    });
    const { result } = renderHook(() => useExpoCamera());
    await waitFor(() => expect(result.current.state.hasPermission).toBe(true));

    // Act
    act(() => {
      result.current.onCameraReady();
    });

    // Assert
    expect(result.current.state.isReady).toBe(true);
  });
});
