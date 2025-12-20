/**
 * DialogFooter - 弹窗底部操作区组件
 */

import React from 'react';
import { XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { DIALOG_COLORS, SPACING, BORDER_RADIUS } from './constants';

interface DialogFooterProps {
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmDestructive?: boolean;
  layout?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  children?: React.ReactNode;
  testID?: string;
}

export function DialogFooter({
  cancelText = '取消',
  confirmText = '确定',
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  confirmDestructive = false,
  layout = 'horizontal',
  fullWidth = true,
  children,
  testID,
}: DialogFooterProps) {
  // 如果提供了自定义内容，直接渲染
  if (children) {
    return (
      <YStack
        testID={testID}
        paddingHorizontal={SPACING.lg}
        paddingVertical={SPACING.lg}
        borderTopWidth={1}
        borderTopColor={DIALOG_COLORS.neutral[200]}
        backgroundColor={DIALOG_COLORS.background}
      >
        {children}
      </YStack>
    );
  }

  const Container = layout === 'horizontal' ? XStack : YStack;

  return (
    <Container
      testID={testID}
      gap={SPACING.md}
      paddingHorizontal={SPACING.lg}
      paddingVertical={SPACING.lg}
      borderTopWidth={1}
      borderTopColor={DIALOG_COLORS.neutral[200]}
      backgroundColor={DIALOG_COLORS.background}
    >
      {/* 取消按钮 */}
      {onCancel && (
        <Button
          testID="footer-cancel"
          flex={fullWidth ? 1 : undefined}
          size="$4"
          height={48}
          onPress={onCancel}
          backgroundColor={DIALOG_COLORS.neutral[100]}
          color={DIALOG_COLORS.text}
          borderRadius={BORDER_RADIUS.medium}
          fontWeight="600"
          fontSize={16}
          pressStyle={{ scale: 0.97, opacity: 0.8 }}
          disabled={confirmLoading}
        >
          {cancelText}
        </Button>
      )}

      {/* 确认按钮 */}
      {onConfirm && (
        <Button
          testID="footer-confirm"
          flex={fullWidth ? 1 : undefined}
          size="$4"
          height={48}
          backgroundColor={confirmDestructive ? DIALOG_COLORS.error : DIALOG_COLORS.primary}
          color="white"
          borderRadius={BORDER_RADIUS.medium}
          fontWeight="700"
          fontSize={16}
          onPress={onConfirm}
          disabled={confirmDisabled || confirmLoading}
          opacity={confirmDisabled || confirmLoading ? 0.6 : 1}
          pressStyle={{ scale: 0.97, opacity: 0.9 }}
          icon={
            confirmLoading ? undefined : confirmDestructive ? (
              <IconSymbol name="trash.fill" size={18} color="white" />
            ) : (
              <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            )
          }
        >
          {confirmLoading ? 'Loading...' : confirmText}
        </Button>
      )}
    </Container>
  );
}
