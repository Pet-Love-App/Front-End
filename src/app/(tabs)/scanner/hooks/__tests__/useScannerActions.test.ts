/**
 * useScannerActions Hook 测试
 *
 * 测试扫描操作 Hook 的功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useScannerActions } from '../useScannerActions';
import { Alert } from 'react-native';
import { recognizeImage, aiReportService } from '@/src/services/api';
import { supabaseAdditiveService } from '@/src/lib/supabase';

// Mock dependencies
jest.mock('react-native', () => {
  return {
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
  };
});

jest.mock('@/src/services/api', () => ({
  recognizeImage: jest.fn(),
  aiReportService: {
    generateReport: jest.fn(),
  },
}));

jest.mock('@/src/lib/supabase', () => ({
  supabaseAdditiveService: {
    searchAdditive: jest.fn(),
  },
}));

describe('useScannerActions', () => {
  const mockTakePicture = jest.fn();
  const mockTransitionTo = jest.fn();
  const mockResetFlow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    // Arrange & Act
    const { result } = renderHook(() =>
      useScannerActions({
        takePicture: mockTakePicture,
        transitionTo: mockTransitionTo,
        resetFlow: mockResetFlow,
      })
    );

    // Assert
    expect(result.current.photoUri).toBeNull();
    expect(result.current.ocrResult).toBeNull();
    expect(result.current.aiReport).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isGeneratingReport).toBe(false);
  });

  describe('handleTakePhoto', () => {
    it('should take photo and transition to preview', async () => {
      // Arrange
      const mockUri = 'file://test.jpg';
      mockTakePicture.mockResolvedValue({ uri: mockUri });
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Act
      await act(async () => {
        await result.current.handleTakePhoto();
      });

      // Assert
      expect(mockTakePicture).toHaveBeenCalledWith(expect.objectContaining({
        quality: 0.6,
        cropToScanFrame: true,
      }));
      expect(result.current.photoUri).toBe(mockUri);
      expect(mockTransitionTo).toHaveBeenCalledWith('photo-preview');
    });

    it('should handle take photo error', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTakePicture.mockRejectedValue(new Error('Camera error'));
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Act
      await act(async () => {
        await result.current.handleTakePhoto();
      });

      // Assert
      expect(Alert.alert).toHaveBeenCalledWith('拍照失败', '请重试');
      consoleSpy.mockRestore();
    });
  });

  describe('handleRetakePhoto', () => {
    it('should reset state and transition to taking photo', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Act
      act(() => {
        result.current.handleRetakePhoto();
      });

      // Assert
      expect(result.current.photoUri).toBeNull();
      expect(result.current.ocrResult).toBeNull();
      expect(result.current.aiReport).toBeNull();
      expect(mockTransitionTo).toHaveBeenCalledWith('taking-photo');
    });
  });

  describe('handleCancelPreview', () => {
    it('should clear photo and transition to taking photo', () => {
      // Arrange
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Act
      act(() => {
        result.current.handleCancelPreview();
      });

      // Assert
      expect(result.current.photoUri).toBeNull();
      expect(mockTransitionTo).toHaveBeenCalledWith('taking-photo');
    });
  });

  describe('handleConfirmPhoto', () => {
    it('should analyze photo successfully', async () => {
      // Arrange
      const mockOcrResult = { text: 'Test Ingredients', confidence: 0.9 };
      (recognizeImage as jest.Mock).mockResolvedValue(mockOcrResult);
      const mockUri = 'file://test.jpg';
      mockTakePicture.mockResolvedValue({ uri: mockUri });
      
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Set initial photo uri
      await act(async () => {
        await result.current.handleTakePhoto();
      });

      // Act
      await act(async () => {
        await result.current.handleConfirmPhoto();
      });

      // Assert
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.ocrResult).toEqual(mockOcrResult);
      expect(mockTransitionTo).toHaveBeenCalledWith('ocr-result');
    });

    it('should handle analysis error', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (recognizeImage as jest.Mock).mockRejectedValue(new Error('OCR failed'));
      const mockUri = 'file://test.jpg';
      mockTakePicture.mockResolvedValue({ uri: mockUri });
      
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Set initial photo uri
      await act(async () => {
        await result.current.handleTakePhoto();
      });

      // Act
      await act(async () => {
        await result.current.handleConfirmPhoto();
      });

      // Assert
      expect(result.current.isProcessing).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('识别失败', '请重试');
      expect(mockTransitionTo).toHaveBeenCalledWith('photo-preview');
      consoleSpy.mockRestore();
    });
  });

  describe('handleGenerateReport', () => {
    it('should generate report successfully', async () => {
      // Arrange
      const mockReport = { analysis: 'Good food', score: 90 };
      (aiReportService.generateReport as jest.Mock).mockResolvedValue(mockReport);
      const mockOcrResult = { text: 'Test Ingredients', confidence: 0.9 };
      (recognizeImage as jest.Mock).mockResolvedValue(mockOcrResult);
      const mockUri = 'file://test.jpg';
      mockTakePicture.mockResolvedValue({ uri: mockUri });
      
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Set OCR result first by simulating the flow
      await act(async () => {
        await result.current.handleTakePhoto();
      });
      await act(async () => {
        await result.current.handleConfirmPhoto();
      });

      // Act
      await act(async () => {
        await result.current.handleGenerateReport(null);
      });

      // Assert
      expect(result.current.isGeneratingReport).toBe(false);
      expect(result.current.aiReport).toEqual(mockReport);
      // showLoadingGame remains true until manually closed
      expect(result.current.showLoadingGame).toBe(true);
    });

    it('should handle report generation error', async () => {
      // Arrange
      (aiReportService.generateReport as jest.Mock).mockRejectedValue(new Error('AI failed'));
      const mockOcrResult = { text: 'Test Ingredients', confidence: 0.9 };
      (recognizeImage as jest.Mock).mockResolvedValue(mockOcrResult);
      const mockUri = 'file://test.jpg';
      mockTakePicture.mockResolvedValue({ uri: mockUri });
      
      const { result } = renderHook(() =>
        useScannerActions({
          takePicture: mockTakePicture,
          transitionTo: mockTransitionTo,
          resetFlow: mockResetFlow,
        })
      );

      // Set OCR result first by simulating the flow
      await act(async () => {
        await result.current.handleTakePhoto();
      });
      await act(async () => {
        await result.current.handleConfirmPhoto();
      });

      // Act
      await act(async () => {
        await result.current.handleGenerateReport(null);
      });

      // Assert
      expect(result.current.isGeneratingReport).toBe(false);
      expect(result.current.showLoadingGame).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('错误', '生成报告失败');
    });
  });
});
