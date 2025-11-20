import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import { Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, XStack, YStack } from 'tamagui';

interface PhotoPreviewProps {
  /** 照片 URI */
  photoUri: string | null;
  /** 是否显示 */
  visible: boolean;
  /** 确认使用照片 */
  onConfirm: () => void;
  /** 重新拍照 */
  onRetake: () => void;
  /** 取消 */
  onCancel: () => void;
}

/**
 * 照片预览组件
 *
 * 功能：
 * - 显示刚拍摄的照片预览
 * - 提供确认使用、重拍、取消三个操作
 * - 全屏显示，提供更好的查看体验
 *
 * 设计原则：
 * - Modal 使用 React Native 原生组件
 * - 布局使用 Tamagui 组件保持一致性
 * - 提供清晰的操作按钮和视觉反馈
 *
 * @example
 * ```tsx
 * <PhotoPreview
 *   photoUri={photoUri}
 *   visible={showPreview}
 *   onConfirm={handleConfirm}
 *   onRetake={handleRetake}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function PhotoPreview({
  photoUri,
  visible,
  onConfirm,
  onRetake,
  onCancel,
}: PhotoPreviewProps) {
  const insets = useSafeAreaInsets();

  if (!photoUri) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <YStack flex={1} backgroundColor="$black">
        {/* 顶部操作栏 */}
        <XStack
          paddingTop={insets.top + 10}
          paddingHorizontal="$4"
          paddingBottom="$3"
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="rgba(0, 0, 0, 0.7)"
        >
          <Button
            circular
            icon={<IconSymbol name="xmark" size={24} color="white" />}
            chromeless
            onPress={onCancel}
          />
          <Text fontSize="$6" fontWeight="600" color="white">
            照片预览
          </Text>
          <YStack width={40} height={40} />
        </XStack>

        {/* 照片预览区域 */}
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </YStack>

        {/* 底部操作按钮 */}
        <YStack
          paddingHorizontal="$4"
          paddingBottom={insets.bottom + 20}
          paddingTop="$4"
          backgroundColor="rgba(0, 0, 0, 0.7)"
          gap="$3"
        >
          {/* 提示文本 */}
          <Text fontSize="$3" color="$gray10" textAlign="center">
            请确认照片清晰可见，配料表信息完整
          </Text>

          {/* 操作按钮组 */}
          <XStack gap="$3">
            {/* 重拍按钮 */}
            <Button
              flex={1}
              size="$5"
              backgroundColor="$gray8"
              color="white"
              onPress={onRetake}
              icon={<IconSymbol name="camera.rotate" size={20} color="white" />}
              pressStyle={{ backgroundColor: '$gray9' }}
            >
              重新拍照
            </Button>

            {/* 确认按钮 */}
            <Button
              flex={1}
              size="$5"
              themeInverse
              onPress={onConfirm}
              icon={<IconSymbol name="checkmark.circle.fill" size={20} color="white" />}
            >
              确认使用
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
