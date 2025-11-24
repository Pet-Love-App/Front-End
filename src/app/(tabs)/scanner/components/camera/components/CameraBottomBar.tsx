/**
 * CameraBottomBar - 相机底部操作栏
 *
 * 企业最佳实践：
 * - 单一职责：底部操作按钮
 * - Props类型化：清晰的接口定义
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { ScanType } from '@/src/types/camera';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack } from 'tamagui';

interface CameraBottomBarProps {
  scanType: ScanType;
  onToggleScanType: () => void;
  onTakePhoto: () => void;
}

export function CameraBottomBar({ scanType, onToggleScanType, onTakePhoto }: CameraBottomBarProps) {
  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      paddingHorizontal={30}
      paddingBottom={50}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      zIndex={10}
    >
      {/* 切换模式按钮 */}
      <TouchableOpacity onPress={onToggleScanType} style={styles.modeButton}>
        <IconSymbol
          name={scanType === ScanType.BARCODE ? 'doc.text.viewfinder' : 'barcode.viewfinder'}
          size={20}
          color="white"
        />
        <Text color="white" fontSize={13} marginLeft={6} fontWeight="600">
          {scanType === ScanType.BARCODE ? '去拍照' : '去扫码'}
        </Text>
      </TouchableOpacity>

      {/* 拍照按钮 (仅 OCR 模式显示) */}
      {scanType === ScanType.OCR && (
        <TouchableOpacity
          onPress={onTakePhoto}
          style={styles.captureButton}
          testID="capture-button"
        >
          <YStack width={64} height={64} borderRadius={32} backgroundColor="white" />
        </TouchableOpacity>
      )}

      {/* 占位，保持布局平衡 */}
      {scanType === ScanType.BARCODE && <YStack width={40} />}
    </YStack>
  );
}

const styles = StyleSheet.create({
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  captureButton: {
    padding: 4,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
