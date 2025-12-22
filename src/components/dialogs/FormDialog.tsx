/**
 * FormDialog - 表单弹窗组件
 * 用于收集用户输入（添加、编辑等操作）
 */

import React, { useState } from 'react';
import { Keyboard, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Dialog, YStack } from 'tamagui';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { DIALOG_COLORS, DIALOG_SIZES, BORDER_RADIUS, SPACING } from './constants';
import type { FormDialogProps } from './types';

export function FormDialog({
  open,
  onOpenChange,
  title = '表单',
  description,
  type = 'default',
  size = 'medium',
  children,
  submitText = '提交',
  cancelText = '取消',
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitDisabled = false,
  showCloseButton = true,
  closeOnOverlayClick = false,
}: FormDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      await onSubmit();
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isProcessing && !isSubmitting) {
      onOpenChange(false);
    }
  };

  const sizeConfig = DIALOG_SIZES[size];
  const loading = isSubmitting || isProcessing;

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
          style={{ pointerEvents: 'auto' }}
          onPress={closeOnOverlayClick ? handleClose : Keyboard.dismiss}
        />

        {/* 对话框内容 */}
        <Dialog.Content
          testID="dialog-root"
          bordered
          key="content"
          animateOnly={['transform', 'opacity']}
          animation="quick"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor={DIALOG_COLORS.background}
          width={sizeConfig.width}
          maxWidth={sizeConfig.maxWidth}
          maxHeight="85%"
          padding="$0"
          pointerEvents="auto"
          borderRadius={BORDER_RADIUS.large}
          overflow="hidden"
        >
          {/* 头部 */}
          <DialogHeader
            title={title}
            description={description}
            type={type}
            layout="left"
            gradient={true}
            onClose={showCloseButton ? handleClose : undefined}
          />

          {/* 表单内容区域 */}
          <ScrollView
            style={{ maxHeight: 450 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            contentContainerStyle={{ pointerEvents: 'auto' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <YStack padding={SPACING.lg} gap={SPACING.md}>
                {children}
              </YStack>
            </TouchableWithoutFeedback>
          </ScrollView>

          {/* 底部操作按钮 */}
          <DialogFooter
            cancelText={cancelText}
            confirmText={submitText}
            onCancel={handleCancel}
            onConfirm={handleSubmit}
            confirmDisabled={submitDisabled}
            confirmLoading={loading}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
