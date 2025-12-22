/**
 * useScannerFlow Hook 测试
 *
 * 测试扫描流程管理 Hook 的功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { renderHook, act } from '@testing-library/react-native';
import { useScannerFlow } from '../useScannerFlow';
import { ScanType } from '@/src/types/camera';

describe('useScannerFlow', () => {
  const mockSetScanType = jest.fn();
  const mockResetBarcodeScan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    // Arrange & Act
    const { result } = renderHook(() =>
      useScannerFlow({
        setScanType: mockSetScanType,
        resetBarcodeScan: mockResetBarcodeScan,
      })
    );

    // Assert
    expect(result.current.flowState).toBe('initial');
    expect(result.current.selectedCatFood).toBeNull();
    expect(result.current.scannedCode).toBeNull();
  });

  it('should start scan', () => {
    // Arrange
    const { result } = renderHook(() =>
      useScannerFlow({
        setScanType: mockSetScanType,
        resetBarcodeScan: mockResetBarcodeScan,
      })
    );

    // Act
    act(() => {
      result.current.startScan();
    });

    // Assert
    expect(mockSetScanType).toHaveBeenCalledWith(ScanType.BARCODE);
    expect(result.current.flowState).toBe('taking-photo');
  });

  it('should select cat food', () => {
    // Arrange
    const mockCatFood = { id: 1, name: 'Test Food' } as any;
    const { result } = renderHook(() =>
      useScannerFlow({
        setScanType: mockSetScanType,
        resetBarcodeScan: mockResetBarcodeScan,
      })
    );

    // Act
    act(() => {
      result.current.selectCatFood(mockCatFood);
    });

    // Assert
    expect(result.current.selectedCatFood).toBe(mockCatFood);
    expect(result.current.flowState).toBe('selected-catfood');
  });

  it('should handle barcode scanned', () => {
    // Arrange
    const mockCode = '123456789';
    const { result } = renderHook(() =>
      useScannerFlow({
        setScanType: mockSetScanType,
        resetBarcodeScan: mockResetBarcodeScan,
      })
    );

    // Act
    act(() => {
      result.current.onBarcodeScanned(mockCode);
    });

    // Assert
    expect(result.current.scannedCode).toBe(mockCode);
    expect(result.current.flowState).toBe('barcode-result');
  });

  describe('goBack', () => {
    it('should go back from searching-catfood to initial', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerFlow({
          setScanType: mockSetScanType,
          resetBarcodeScan: mockResetBarcodeScan,
        })
      );
      act(() => result.current.transitionTo('searching-catfood'));

      // Act
      act(() => result.current.goBack());

      // Assert
      expect(result.current.flowState).toBe('initial');
    });

    it('should go back from taking-photo to initial', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerFlow({
          setScanType: mockSetScanType,
          resetBarcodeScan: mockResetBarcodeScan,
        })
      );
      act(() => result.current.transitionTo('taking-photo'));

      // Act
      act(() => result.current.goBack());

      // Assert
      expect(result.current.flowState).toBe('initial');
    });

    it('should go back from photo-preview to taking-photo', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerFlow({
          setScanType: mockSetScanType,
          resetBarcodeScan: mockResetBarcodeScan,
        })
      );
      act(() => result.current.transitionTo('photo-preview'));

      // Act
      act(() => result.current.goBack());

      // Assert
      expect(result.current.flowState).toBe('taking-photo');
    });

    it('should go back from ocr-result to taking-photo', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerFlow({
          setScanType: mockSetScanType,
          resetBarcodeScan: mockResetBarcodeScan,
        })
      );
      act(() => result.current.transitionTo('ocr-result'));

      // Act
      act(() => result.current.goBack());

      // Assert
      expect(result.current.flowState).toBe('taking-photo');
    });

    it('should go back from barcode-result to taking-photo and reset scan', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerFlow({
          setScanType: mockSetScanType,
          resetBarcodeScan: mockResetBarcodeScan,
        })
      );
      act(() => result.current.transitionTo('barcode-result'));

      // Act
      act(() => result.current.goBack());

      // Assert
      expect(result.current.flowState).toBe('taking-photo');
      expect(mockResetBarcodeScan).toHaveBeenCalled();
    });
  });

  it('should reset flow', () => {
    // Arrange
    const { result } = renderHook(() =>
      useScannerFlow({
        setScanType: mockSetScanType,
        resetBarcodeScan: mockResetBarcodeScan,
      })
    );
    act(() => {
      result.current.selectCatFood({ id: 1 } as any);
      result.current.onBarcodeScanned('123');
    });

    // Act
    act(() => {
      result.current.resetFlow();
    });

    // Assert
    expect(result.current.flowState).toBe('initial');
    expect(result.current.selectedCatFood).toBeNull();
    expect(result.current.scannedCode).toBeNull();
    expect(mockResetBarcodeScan).toHaveBeenCalled();
  });
});
