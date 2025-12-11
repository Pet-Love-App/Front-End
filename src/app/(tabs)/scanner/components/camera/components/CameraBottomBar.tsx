/**
 * CameraBottomBar - 相机底部操作栏
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale } from '@/src/design-system/tokens/colors';
import { ScanType } from '@/src/types/camera';

interface CameraBottomBarProps {
  scanType: ScanType;
  onToggleScanType: () => void;
  onTakePhoto: () => void;
}

export function CameraBottomBar({ scanType, onToggleScanType, onTakePhoto }: CameraBottomBarProps) {
  return (
    <YStack position="absolute" bottom={0} left={0} right={0} paddingBottom={50} zIndex={10}>
      {/* 底部操作区域 */}
      <XStack justifyContent="center" alignItems="center" gap="$8">
        {/* 切换模式按钮 */}
        <TouchableOpacity onPress={onToggleScanType} style={styles.modeButtonWrapper}>
          <View style={styles.modeButton}>
            <YStack
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor="rgba(255,255,255,0.15)"
              alignItems="center"
              justifyContent="center"
              marginBottom="$1"
            >
              <IconSymbol
                name={scanType === ScanType.BARCODE ? 'doc.text.viewfinder' : 'barcode.viewfinder'}
                size={24}
                color="white"
              />
            </YStack>
            <Text color="white" fontSize={11} fontWeight="600" opacity={0.9}>
              {scanType === ScanType.BARCODE ? '拍照识别' : '扫描条码'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 拍照按钮 (仅 OCR 模式显示) */}
        {scanType === ScanType.OCR && (
          <TouchableOpacity
            onPress={onTakePhoto}
            style={styles.captureButtonOuter}
            testID="capture-button"
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonRing}>
              <LinearGradient
                colors={[primaryScale.primary6, primaryScale.primary8]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.captureButtonInner}
              >
                <IconSymbol name="camera.fill" size={28} color="white" />
              </LinearGradient>
            </View>
          </TouchableOpacity>
        )}

        {/* 条码模式下的中心提示 */}
        {scanType === ScanType.BARCODE && (
          <YStack
            backgroundColor="rgba(0,0,0,0.5)"
            paddingHorizontal="$5"
            paddingVertical="$3"
            borderRadius="$6"
            alignItems="center"
          >
            <XStack alignItems="center" gap="$2">
              <View style={styles.scanIndicator} />
              <Text color="white" fontSize={14} fontWeight="600">
                自动识别中...
              </Text>
            </XStack>
          </YStack>
        )}

        {/* 占位保持布局平衡 */}
        {scanType === ScanType.OCR && <View style={{ width: 80 }} />}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  modeButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButtonOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
});
