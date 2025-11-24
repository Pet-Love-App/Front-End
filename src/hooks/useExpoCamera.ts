import type { CameraState, ExpoBarcodeResult } from '@/src/types/camera';
import { ScanType } from '@/src/types/camera';
import { Camera, CameraView, PermissionStatus } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Expo 相机功能的自定义 Hook
 */
export function useExpoCamera(initialScanType: ScanType = ScanType.BARCODE) {
  const cameraRef = useRef<CameraView>(null);

  const [cameraState, setCameraState] = useState<CameraState>({
    hasPermission: null,
    isReady: false,
    facing: 'back',
    scanType: initialScanType,
    scannedBarcode: null,
  });

  // 组件挂载时检查现有权限
  useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setCameraState((prev) => ({
        ...prev,
        hasPermission: status === PermissionStatus.GRANTED,
      }));
    })();
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraState((prev) => ({
        ...prev,
        hasPermission: status === PermissionStatus.GRANTED,
      }));
    } catch (error) {
      console.error('请求相机权限失败:', error);
      setCameraState((prev) => ({
        ...prev,
        hasPermission: false,
      }));
    }
  }, []);

  const toggleFacing = useCallback(() => {
    setCameraState((prev) => ({
      ...prev,
      facing: prev.facing === 'back' ? 'front' : 'back',
    }));
  }, []);

  // 新增：切换扫描模式 (OCR <-> Barcode)
  const toggleScanType = useCallback(() => {
    setCameraState((prev) => ({
      ...prev,
      scanType: prev.scanType === ScanType.BARCODE ? ScanType.OCR : ScanType.BARCODE,
      scannedBarcode: null, // 切换模式时重置扫描结果
    }));
  }, []);

  // 设置具体的扫描模式
  const setScanType = useCallback((type: ScanType) => {
    setCameraState((prev) => ({
      ...prev,
      scanType: type,
      scannedBarcode: null,
    }));
  }, []);

  const handleBarCodeScanned = useCallback((result: ExpoBarcodeResult) => {
    // 如果已经在处理中，或者是OCR模式，忽略
    setCameraState((prev) => {
      if (prev.scannedBarcode || prev.scanType !== ScanType.BARCODE) return prev;
      return {
        ...prev,
        scannedBarcode: result.data,
      };
    });
    console.log('扫描结果:', result.data);
  }, []);

  const onCameraReady = useCallback(() => {
    setCameraState((prev) => ({
      ...prev,
      isReady: true,
    }));
  }, []);

  const resetBarcodeScan = useCallback(() => {
    setCameraState((prev) => ({
      ...prev,
      scannedBarcode: null,
    }));
  }, []);

  const takePicture = useCallback(
    async (options?: { quality?: number }) => {
      if (!cameraRef.current || !cameraState.isReady) {
        console.warn('相机未准备好');
        return null;
      }

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: options?.quality || 0.8,
          base64: false,
          skipProcessing: false,
        });
        return photo;
      } catch (error) {
        console.error('拍照失败:', error);
        return null;
      }
    },
    [cameraState.isReady]
  );

  return {
    state: cameraState,
    cameraRef,
    takePicture,
    toggleFacing,
    toggleScanType, // 导出切换方法
    setScanType, // 导出设置方法
    onCameraReady,
    handleBarCodeScanned,
    requestPermission,
    resetBarcodeScan,
  };
}
