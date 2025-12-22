/**
 * DialogHeader - 弹窗头部组件
 * 支持两种布局：居中式和左对齐式
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol, type SymbolName } from '@/src/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DIALOG_COLORS,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZE,
  SF_SYMBOLS,
  TYPE_COLORS,
} from './constants';
import type { DialogType } from './types';

interface DialogHeaderProps {
  title: string;
  description?: string;
  type?: DialogType;
  icon?: string;
  sfSymbol?: SymbolName;
  layout?: 'center' | 'left';
  gradient?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
  includeSafeArea?: boolean;
}

export function DialogHeader({
  title,
  description,
  type = 'default',
  icon,
  sfSymbol,
  layout = 'center',
  gradient = false,
  onClose,
  actions,
  includeSafeArea = false,
}: DialogHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = TYPE_COLORS[type];
  const defaultSfSymbol = SF_SYMBOLS[type];

  if (layout === 'left' && gradient) {
    // 左对齐渐变头部（类似 AddPetModal）
    return (
      <YStack
        paddingHorizontal={SPACING.lg}
        paddingTop={includeSafeArea ? Math.max(insets.top, SPACING.lg) : SPACING.lg}
        paddingBottom={SPACING.xl}
        backgroundColor={DIALOG_COLORS.primary}
        position="relative"
      >
        <XStack alignItems="center" gap={SPACING.md} marginBottom={SPACING.xs}>
          {/* 图标容器 */}
          <YStack
            width={56}
            height={56}
            borderRadius={BORDER_RADIUS.medium}
            backgroundColor="rgba(255, 255, 255, 0.25)"
            alignItems="center"
            justifyContent="center"
          >
            {icon ? (
              <Text fontSize={32}>{icon}</Text>
            ) : (
              <IconSymbol name={sfSymbol || defaultSfSymbol} size={28} color="white" />
            )}
          </YStack>

          {/* 标题和描述 */}
          <YStack flex={1}>
            <Text fontSize={FONT_SIZE['3xl']} fontWeight="bold" color="white" letterSpacing={0.5}>
              {title}
            </Text>
            {description && (
              <Text
                fontSize={FONT_SIZE.sm}
                color="rgba(255, 255, 255, 0.95)"
                marginTop={SPACING.xs}
              >
                {description}
              </Text>
            )}
          </YStack>

          {/* 关闭按钮 */}
          {onClose && (
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} testID="close-button">
              <YStack
                width={36}
                height={36}
                borderRadius={BORDER_RADIUS.medium}
                backgroundColor="rgba(255, 255, 255, 0.2)"
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="xmark" size={18} color="white" />
              </YStack>
            </TouchableOpacity>
          )}

          {/* 自定义操作 */}
          {actions}
        </XStack>
      </YStack>
    );
  }

  // 居中布局（默认）
  return (
    <YStack
      alignItems="center"
      gap={SPACING.md}
      paddingHorizontal={SPACING.lg}
      paddingTop={SPACING.lg}
      paddingBottom={SPACING.md}
      position="relative"
    >
      {/* 关闭按钮（右上角） */}
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          testID="close-button"
          style={{
            position: 'absolute',
            top: SPACING.md,
            right: SPACING.md,
            zIndex: 10,
          }}
        >
          <YStack
            width={32}
            height={32}
            borderRadius={BORDER_RADIUS.full}
            backgroundColor={DIALOG_COLORS.neutral[100]}
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="xmark" size={16} color={DIALOG_COLORS.neutral[600]} />
          </YStack>
        </TouchableOpacity>
      )}

      {/* 图标 */}
      <YStack
        width={64}
        height={64}
        borderRadius={BORDER_RADIUS.full}
        backgroundColor={colors.bg as any}
        alignItems="center"
        justifyContent="center"
        borderWidth={3}
        borderColor={colors.border as any}
      >
        {icon ? (
          <Text fontSize={32}>{icon}</Text>
        ) : (
          <IconSymbol name={sfSymbol || defaultSfSymbol} size={32} color={colors.icon} />
        )}
      </YStack>

      {/* 标题 */}
      <Text
        fontSize={FONT_SIZE['2xl']}
        fontWeight="700"
        color={DIALOG_COLORS.text}
        textAlign="center"
        letterSpacing={0.3}
      >
        {title}
      </Text>

      {/* 描述 */}
      {description && (
        <Text
          fontSize={FONT_SIZE.sm}
          color={DIALOG_COLORS.textLight}
          textAlign="center"
          lineHeight={20}
          paddingHorizontal={SPACING.md}
        >
          {description}
        </Text>
      )}

      {/* 自定义操作 */}
      {actions && (
        <XStack gap={SPACING.sm} marginTop={SPACING.xs}>
          {actions}
        </XStack>
      )}
    </YStack>
  );
}
