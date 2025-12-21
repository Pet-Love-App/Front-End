/**
 * Camera Types Tests
 * 测试相机相关类型定义和枚举
 */

import { ScanType, CameraOptions, CameraPhoto, CameraState } from '../camera';

describe('Camera Types', () => {
  describe('ScanType Enum', () => {
    it('should have correct values for scan types', () => {
      // Arrange & Act & Assert
      expect(ScanType.BARCODE).toBe('barcode');
      expect(ScanType.OCR).toBe('ocr');
    });
  });

  describe('CameraOptions Interface', () => {
    it('should allow creating valid camera options', () => {
      // Arrange
      const options: CameraOptions = {
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      };

      // Act & Assert
      expect(options.quality).toBe(0.8);
      expect(options.base64).toBe(true);
    });

    it('should allow optional properties', () => {
      // Arrange
      const options: CameraOptions = {};

      // Act & Assert
      expect(options).toBeDefined();
    });
  });

  describe('CameraPhoto Interface', () => {
    it('should allow creating valid camera photo object', () => {
      // Arrange
      const photo: CameraPhoto = {
        uri: 'file://test.jpg',
        width: 100,
        height: 100,
        base64: 'base64string',
      };

      // Act & Assert
      expect(photo.uri).toBe('file://test.jpg');
      expect(photo.width).toBe(100);
    });
  });

  describe('CameraState Interface', () => {
    it('should allow creating valid camera state', () => {
      // Arrange
      const state: CameraState = {
        hasPermission: true,
        isReady: true,
        facing: 'back',
        scanType: ScanType.OCR,
        scannedBarcode: null,
      };

      // Act & Assert
      expect(state.hasPermission).toBe(true);
      expect(state.facing).toBe('back');
      expect(state.scanType).toBe(ScanType.OCR);
    });
  });
});
