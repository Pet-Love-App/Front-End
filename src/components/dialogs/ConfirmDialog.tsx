/**
 * ConfirmDialog - 确认对话框组件
 * 用于需要用户确认的操作（删除、退出等）
 */

import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { Dialog, Text, YStack } from 'tamagui';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { DIALOG_COLORS, DIALOG_SIZES, BORDER_RADIUS, SPACING, FONT_SIZE } from './constants';
import type { ConfirmDialogProps } from './types';

export function ConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  description,
  message,
  type = 'default',
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  destructive = false,
  icon,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isConfirming) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* 遮罩层 */}
        <Dialog.Overlay
          testID="dialog-overlay"
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="black"
          onPress={closeOnOverlayClick ? handleClose : Keyboard.dismiss}
        />

        {/* 对话框内容 */}
        <Dialog.Content
          testID="dialog-root"
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={['quick', { opacity: { overshootClamping: true } }]}
          enterStyle={{ y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor={DIALOG_COLORS.background}
          borderRadius={BORDER_RADIUS.large}
          padding="$0"
          width={DIALOG_SIZES.small.width}
          maxWidth={DIALOG_SIZES.small.maxWidth}
          pointerEvents="auto"
          overflow="hidden"
        >
          {/* 头部 */}
          <DialogHeader
            title={title}
            description={description}
            type={destructive ? 'error' : type}
            icon={icon}
            layout="center"
            onClose={showCloseButton ? handleClose : undefined}
          />

          {/* 消息内容 */}
          <YStack paddingHorizontal={SPACING.lg} paddingVertical={SPACING.md} alignItems="center">
            <Text
              fontSize={FONT_SIZE.base}
              color={DIALOG_COLORS.textLight}
              textAlign="center"
              lineHeight={22}
            >
              {message}
            </Text>
          </YStack>

          {/* 底部操作按钮 */}
          <DialogFooter
            cancelText={cancelText}
            confirmText={confirmText}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            confirmLoading={isConfirming}
            confirmDestructive={destructive}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
