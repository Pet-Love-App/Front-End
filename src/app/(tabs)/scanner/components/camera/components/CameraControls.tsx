/**
 * CameraControls - 相机控制按钮组
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { ScanType } from '@/src/types/camera';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack } from 'tamagui';

interface CameraControlsProps {
  scanType: ScanType;
  zoom: number;
  onClose: () => void;
  onToggleCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  setZoom: (zoom: number) => void;
}

export function CameraControls({
  scanType,
  zoom,
  onClose,
  onToggleCamera,
  onZoomIn,
  onZoomOut,
  setZoom,
}: CameraControlsProps) {
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      paddingHorizontal={16}
      paddingTop={50}
      paddingBottom={12}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      zIndex={10}
    >
      {/* 关闭按钮 */}
      <TouchableOpacity onPress={onClose} style={styles.iconButton}>
        <IconSymbol name="xmark" size={24} color="white" />
      </TouchableOpacity>

      {/* 标题和缩放信息 */}
      <YStack alignItems="center" gap={2}>
        <Text
          fontSize={16}
          fontWeight="600"
          color="white"
          style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}
        >
          {scanType === ScanType.BARCODE ? '扫描条形码' : '拍照识别成分'}
        </Text>
        <Text
          fontSize={11}
          color="white"
          style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 2 }}
        >
          缩放: {(zoom * 100).toFixed(0)}%
        </Text>
      </YStack>

      {/* 右侧控制按钮组 */}
      <YStack flexDirection="row" gap={8}>
        {/* 缩小按钮 */}
        <TouchableOpacity
          onPress={onZoomOut}
          style={[styles.iconButton, { opacity: zoom > 0 ? 1 : 0.5 }]}
          disabled={zoom <= 0}
        >
          <Text fontSize={20} color="white" fontWeight="bold">
            -
          </Text>
        </TouchableOpacity>

        {/* 放大按钮 */}
        <TouchableOpacity
          onPress={onZoomIn}
          style={[styles.iconButton, { opacity: zoom < 1 ? 1 : 0.5 }]}
          disabled={zoom >= 1}
        >
          <Text fontSize={20} color="white" fontWeight="bold">
            +
          </Text>
        </TouchableOpacity>

        {/* 翻转相机按钮 */}
        <TouchableOpacity onPress={onToggleCamera} style={styles.iconButton}>
          <IconSymbol name="camera.rotate" size={24} color="white" />
        </TouchableOpacity>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
