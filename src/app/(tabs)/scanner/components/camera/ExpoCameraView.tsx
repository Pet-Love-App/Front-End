/**
 * ExpoCameraView - 相机视图主组件
 *
 * 企业最佳实践：
 * - 组件化拆分：将UI和逻辑拆分到子组件和Hook
 * - 单一职责：主组件仅负责组织布局和状态协调
 * - 可维护性：清晰的组件层次结构
 * - 类型安全：完整的 TypeScript 类型定义
 */

import type { ExpoBarcodeResult } from '@/src/types/camera';
import { ScanType } from '@/src/types/camera';
import { CameraType, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';

import { CameraBottomBar } from './components/CameraBottomBar';
import { CameraControls } from './components/CameraControls';
import { ScanFrame } from './components/ScanFrame';
import { useZoomGesture } from './hooks/useZoomGesture';

// 支持的条码类型（与组件配置一致）
export const SUPPORTED_BARCODE_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'code128',
  'code39',
  'upc_e',
  'upc_a',
] as const;

// 防抖间隔（毫秒）
const SCAN_DEBOUNCE_TIME = 1000;

// EAN13格式校验（13位纯数字）
const isValidEAN13 = (data: string): boolean => {
  return /^\d{13}$/.test(data);
};

// 通用条码数据校验
const isValidBarcodeData = (data: string | null | undefined, type: string): boolean => {
  if (!data || data.trim() === '') return false;

  if (!SUPPORTED_BARCODE_TYPES.includes(type as (typeof SUPPORTED_BARCODE_TYPES)[number])) {
    return false;
  }

  if (type === 'ean13' && !isValidEAN13(data)) {
    return false;
  }

  return true;
};

interface ExpoCameraViewProps {
  cameraRef: React.RefObject<CameraView | null>;
  facing: 'front' | 'back';
  scanType: ScanType;
  onClose: () => void;
  onToggleCamera: () => void;
  onToggleScanType: () => void;
  onCameraReady: () => void;
  onBarCodeScanned: (result: ExpoBarcodeResult) => void;
  onTakePhoto: (
    zoom?: number,
    frameLayout?: { x: number; y: number; width: number; height: number } | null
  ) => void;
  takePicture: (options?: {
    quality?: number;
    cropToScanFrame?: boolean;
    zoom?: number;
    frameLayout?: { x: number; y: number; width: number; height: number };
  }) => Promise<{ uri: string } | null>;
  debounceTime?: number;
}

export function ExpoCameraView({
  cameraRef,
  facing,
  scanType,
  onClose,
  onToggleCamera,
  onToggleScanType,
  onCameraReady,
  onBarCodeScanned,
  onTakePhoto,
  takePicture,
  debounceTime = SCAN_DEBOUNCE_TIME,
}: ExpoCameraViewProps) {
  // ============ 状态管理 ============
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [scanFrameLayout, setScanFrameLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [cameraViewLayout, setCameraViewLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const cameraViewRef = useRef<View>(null);

  // 防抖相关
  const lastScannedData = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  // 动画相关
  const frameScale = useRef(new Animated.Value(1)).current;
  const frameBorderWidth = useRef(new Animated.Value(2)).current;

  // ============ Hooks ============
  const { panResponder } = useZoomGesture({ zoom, setZoom });

  // ============ 动画效果 ============
  const playShutterAnimation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 扫描框收缩动画
    Animated.parallel([
      Animated.sequence([
        Animated.timing(frameScale, {
          toValue: 0.85,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(frameScale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(frameBorderWidth, {
          toValue: 6,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(frameBorderWidth, {
          toValue: 2,
          duration: 150,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [frameScale, frameBorderWidth]);

  // ============ 事件处理 ============
  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
    onCameraReady();
  }, [onCameraReady]);

  const handleTakePhotoWithAnimation = useCallback(() => {
    playShutterAnimation();
    setTimeout(() => {
      // 计算扫描框相对于相机视图的位置
      if (scanFrameLayout && cameraViewLayout) {
        console.log('\n🎬 拍照参数计算:');
        console.log('  扫描框（屏幕坐标）:', {
          x: scanFrameLayout.x.toFixed(1),
          y: scanFrameLayout.y.toFixed(1),
          w: scanFrameLayout.width.toFixed(1),
          h: scanFrameLayout.height.toFixed(1),
        });
        console.log('  相机视图（屏幕坐标）:', {
          x: cameraViewLayout.x.toFixed(1),
          y: cameraViewLayout.y.toFixed(1),
          w: cameraViewLayout.width.toFixed(1),
          h: cameraViewLayout.height.toFixed(1),
        });

        const relativeLayout = {
          x: scanFrameLayout.x - cameraViewLayout.x,
          y: scanFrameLayout.y - cameraViewLayout.y,
          width: scanFrameLayout.width,
          height: scanFrameLayout.height,
        };
        console.log('  📐 扫描框（相对相机）:', {
          x: relativeLayout.x.toFixed(1),
          y: relativeLayout.y.toFixed(1),
          w: relativeLayout.width.toFixed(1),
          h: relativeLayout.height.toFixed(1),
        });

        onTakePhoto(zoom, relativeLayout);
      } else {
        console.warn('⚠️ 缺少布局信息:', { scanFrameLayout, cameraViewLayout });
        onTakePhoto(zoom, scanFrameLayout);
      }
    }, 50);
  }, [onTakePhoto, playShutterAnimation, zoom, scanFrameLayout, cameraViewLayout]);

  const handleBarCodeScanned = useCallback(
    (result: ExpoBarcodeResult) => {
      if (scanType !== ScanType.BARCODE || !isCameraReady) return;

      const { data, type } = result;
      const currentTime = Date.now();

      if (!isValidBarcodeData(data, type)) return;

      if (lastScannedData.current === data && currentTime - lastScanTime.current < debounceTime) {
        return;
      }

      lastScannedData.current = data;
      lastScanTime.current = currentTime;
      onBarCodeScanned(result);
    },
    [scanType, isCameraReady, onBarCodeScanned, debounceTime]
  );

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(1, zoom + 0.2);
    setZoom(newZoom);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0, zoom - 0.2);
    setZoom(newZoom);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [zoom]);

  // ============ 动画插值 ============
  const frameBorderWidthInterpolated = frameBorderWidth.interpolate({
    inputRange: [2, 6],
    outputRange: [2, 6],
  });

  // 测量相机视图的位置
  const handleCameraViewLayout = useCallback((event: LayoutChangeEvent) => {
    if (cameraViewRef.current) {
      cameraViewRef.current.measureInWindow((x, y, width, height) => {
        console.log('📹 相机视图位置:', { x, y, width, height });
        setCameraViewLayout({ x, y, width, height });
      });
    }
  }, []);

  // ============ 渲染 ============
  return (
    <YStack flex={1} backgroundColor="black">
      <YStack
        ref={cameraViewRef}
        flex={1}
        position="relative"
        {...panResponder.panHandlers}
        onLayout={handleCameraViewLayout}
      >
        {/* 相机视图 */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing as CameraType}
          zoom={zoom}
          onCameraReady={handleCameraReady}
          barcodeScannerSettings={{
            barcodeTypes: [...SUPPORTED_BARCODE_TYPES],
          }}
          onBarcodeScanned={scanType === ScanType.BARCODE ? handleBarCodeScanned : undefined}
        />

        {/* 顶部控制栏 */}
        <CameraControls
          scanType={scanType}
          zoom={zoom}
          onClose={onClose}
          onToggleCamera={onToggleCamera}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          setZoom={setZoom}
        />

        {/* 扫描框 */}
        <ScanFrame
          scanType={scanType}
          frameScale={frameScale}
          frameBorderWidth={frameBorderWidthInterpolated}
          onLayout={setScanFrameLayout}
        />

        {/* 底部操作栏 */}
        <CameraBottomBar
          scanType={scanType}
          onToggleScanType={onToggleScanType}
          onTakePhoto={handleTakePhotoWithAnimation}
        />
      </YStack>
    </YStack>
  );
}
