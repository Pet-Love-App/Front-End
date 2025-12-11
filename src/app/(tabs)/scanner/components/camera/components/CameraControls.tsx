/**
 * CameraControls - 相机控制按钮组
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale } from '@/src/design-system/tokens/colors';
import { ScanType } from '@/src/types/camera';

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
      paddingBottom={16}
      zIndex={10}
    >
      {/* 顶部操作栏 */}
      <XStack justifyContent="space-between" alignItems="center">
        {/* 关闭按钮 */}
        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
          <View style={styles.blurButton}>
            <IconSymbol name="xmark" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* 标题区域 */}
        <YStack
          backgroundColor="rgba(0,0,0,0.5)"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderRadius="$6"
          alignItems="center"
        >
          <Text fontSize={15} fontWeight="700" color="white" letterSpacing={0.5}>
            {scanType === ScanType.BARCODE ? '扫描条形码' : '拍照识别成分'}
          </Text>
        </YStack>

        {/* 翻转相机按钮 */}
        <TouchableOpacity onPress={onToggleCamera} style={styles.iconButton}>
          <View style={styles.blurButton}>
            <IconSymbol name="camera.rotate" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </XStack>

      {/* 缩放控制条 */}
      <XStack
        alignSelf="center"
        marginTop="$3"
        backgroundColor="rgba(0,0,0,0.5)"
        borderRadius="$6"
        paddingHorizontal="$3"
        paddingVertical="$1.5"
        alignItems="center"
        gap="$3"
      >
        <TouchableOpacity
          onPress={onZoomOut}
          disabled={zoom <= 0}
          style={{ opacity: zoom > 0 ? 1 : 0.4 }}
        >
          <IconSymbol name="minus" size={18} color="white" />
        </TouchableOpacity>

        <XStack alignItems="center" gap="$2" minWidth={80} justifyContent="center">
          <IconSymbol name="magnifyingglass" size={14} color={primaryScale.primary6} />
          <Text fontSize={13} color="white" fontWeight="600">
            {((1 + zoom) * 1).toFixed(1)}x
          </Text>
        </XStack>

        <TouchableOpacity
          onPress={onZoomIn}
          disabled={zoom >= 1}
          style={{ opacity: zoom < 1 ? 1 : 0.4 }}
        >
          <IconSymbol name="plus" size={18} color="white" />
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    overflow: 'hidden',
  },
});
