import type { CameraState, ExpoBarcodeResult } from '@/src/types/camera';
import { ScanType } from '@/src/types/camera';
import { Camera, CameraView, PermissionStatus } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

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
    async (options?: {
      quality?: number;
      cropToScanFrame?: boolean;
      zoom?: number;
      frameLayout?: { x: number; y: number; width: number; height: number };
    }) => {
      if (!cameraRef.current || !cameraState.isReady) {
        console.warn('相机未准备好');
        return null;
      }

      try {
        // 先拍摄完整照片
        const photo = await cameraRef.current.takePictureAsync({
          quality: options?.quality || 0.8,
          base64: false,
          skipProcessing: false,
        });

        // 如果需要裁剪到扫描框
        if (options?.cropToScanFrame && photo && options?.frameLayout) {
          console.log('\n========== 开始裁剪计算（企业级方案 v2）==========');
          console.log('📸 原始照片:', photo.width, 'x', photo.height);

          const frameLayout = options.frameLayout;
          console.log('🎯 扫描框位置（相对于相机视图）:', {
            x: frameLayout.x.toFixed(0),
            y: frameLayout.y.toFixed(0),
            w: frameLayout.width.toFixed(0),
            h: frameLayout.height.toFixed(0),
          });

          const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
          console.log('📱 屏幕尺寸:', screenWidth, 'x', screenHeight);

          // 计算照片和屏幕的宽高比
          const photoAspectRatio = photo.width / photo.height;
          const screenAspectRatio = screenWidth / screenHeight;

          console.log('📐 宽高比:', {
            photo: photoAspectRatio.toFixed(3),
            screen: screenAspectRatio.toFixed(3),
          });

          // 相机使用 'cover' 模式，计算实际显示的照片区域
          let visiblePhotoWidth: number, visiblePhotoHeight: number;
          let photoOffsetX = 0,
            photoOffsetY = 0;

          if (photoAspectRatio > screenAspectRatio) {
            // 照片更宽，上下会被裁掉
            visiblePhotoHeight = photo.height;
            visiblePhotoWidth = photo.height * screenAspectRatio;
            photoOffsetX = (photo.width - visiblePhotoWidth) / 2;
          } else {
            // 照片更高，左右会被裁掉
            visiblePhotoWidth = photo.width;
            visiblePhotoHeight = photo.width / screenAspectRatio;
            photoOffsetY = (photo.height - visiblePhotoHeight) / 2;
          }

          console.log('👁️ 可见照片区域:', {
            width: visiblePhotoWidth.toFixed(0),
            height: visiblePhotoHeight.toFixed(0),
            offsetX: photoOffsetX.toFixed(0),
            offsetY: photoOffsetY.toFixed(0),
          });

          // **关键：扫描框位置已经是相对于相机视图的**
          // 现在我们需要将相机视图的坐标系映射到照片坐标系
          // 相机视图显示的就是 visiblePhoto 区域
          const scaleX = visiblePhotoWidth / screenWidth;
          const scaleY = visiblePhotoHeight / screenHeight;

          console.log('🔄 缩放比例:', {
            scaleX: scaleX.toFixed(3),
            scaleY: scaleY.toFixed(3),
          });

          // 将屏幕框坐标转换为照片坐标
          let photoFrameX = frameLayout.x * scaleX;
          let photoFrameY = frameLayout.y * scaleY;
          const photoFrameWidth = frameLayout.width * scaleX;
          const photoFrameHeight = frameLayout.height * scaleY;

          // 加上偏移量，得到完整照片中的坐标
          photoFrameX += photoOffsetX;
          photoFrameY += photoOffsetY;

          console.log('📷 照片框（照片坐标）:', {
            x: photoFrameX.toFixed(0),
            y: photoFrameY.toFixed(0),
            w: photoFrameWidth.toFixed(0),
            h: photoFrameHeight.toFixed(0),
          });

          // 确保在照片范围内
          const cropX = Math.max(0, photoFrameX);
          const cropY = Math.max(0, photoFrameY);
          let cropWidth = photoFrameWidth;
          let cropHeight = photoFrameHeight;

          // 如果超出边界，调整宽高
          if (cropX + cropWidth > photo.width) {
            cropWidth = photo.width - cropX;
          }
          if (cropY + cropHeight > photo.height) {
            cropHeight = photo.height - cropY;
          }

          console.log('✂️ 最终裁剪区域:', {
            x: cropX.toFixed(0),
            y: cropY.toFixed(0),
            w: cropWidth.toFixed(0),
            h: cropHeight.toFixed(0),
          });

          const cropConfig: ImageManipulator.Action = {
            crop: {
              originX: Math.round(cropX),
              originY: Math.round(cropY),
              width: Math.round(cropWidth),
              height: Math.round(cropHeight),
            },
          };

          // 执行裁剪
          const croppedImage = await ImageManipulator.manipulateAsync(photo.uri, [cropConfig], {
            compress: options?.quality || 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          });

          console.log('✅ 裁剪完成:', croppedImage.width, 'x', croppedImage.height);
          console.log('========== 裁剪计算结束 ==========\n');

          return { ...photo, uri: croppedImage.uri };
        }

        return photo;
      } catch (error) {
        console.error('拍照失败:', error);
        return null;
      }
    },
    [cameraState.isReady, cameraState.scanType]
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
