/**
 * ContentDialog - 大内容展示弹窗
 * 用于展示详细信息、报告、条款等大量内容
 */

import React from 'react';
import { Keyboard, ScrollView } from 'react-native';
import { Dialog, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DialogHeader } from './DialogHeader';
import { DIALOG_COLORS, DIALOG_SIZES, BORDER_RADIUS, SPACING } from './constants';
import type { ContentDialogProps } from './types';

export function ContentDialog({
  open,
  onOpenChange,
  title = '详情',
  description,
  type = 'default',
  size = 'large',
  children,
  headerActions,
  footerActions,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ContentDialogProps) {
  const insets = useSafeAreaInsets();
  const sizeConfig = DIALOG_SIZES[size];

  const handleClose = () => {
    onOpenChange(false);
  };

  // 全屏模式使用 Modal 样式
  if (size === 'fullscreen') {
    return (
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Content
            key="content"
            animation="quick"
            enterStyle={{ y: '100%', opacity: 0 }}
            exitStyle={{ y: '100%', opacity: 0 }}
            backgroundColor={DIALOG_COLORS.background}
            width="100%"
            height="100%"
            padding="$0"
            pointerEvents="auto"
            borderRadius={0}
          >
            <YStack flex={1}>
              {/* 头部 */}
              <DialogHeader
                title={title}
                description={description}
                type={type}
                layout="left"
                gradient={true}
                onClose={showCloseButton ? handleClose : undefined}
                actions={headerActions}
                includeSafeArea={true}
              />

              {/* 内容区域 */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  padding: SPACING.lg,
                  paddingBottom: Math.max(insets.bottom + SPACING.lg, SPACING.xl),
                }}
              >
                {children}
              </ScrollView>

              {/* 底部操作区（可选） */}
              {footerActions && (
                <YStack
                  paddingHorizontal={SPACING.lg}
                  paddingVertical={SPACING.md}
                  paddingBottom={Math.max(insets.bottom, SPACING.md)}
                  borderTopWidth={1}
                  borderTopColor={DIALOG_COLORS.neutral[200]}
                  backgroundColor={DIALOG_COLORS.background}
                >
                  {footerActions}
                </YStack>
              )}
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  }

  // 标准大尺寸弹窗
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* 遮罩层 */}
        <Dialog.Overlay
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
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={['quick', { opacity: { overshootClamping: true } }]}
          enterStyle={{ y: -20, opacity: 0, scale: 0.95 }}
          exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor={DIALOG_COLORS.background}
          width={sizeConfig.width}
          maxWidth={sizeConfig.maxWidth}
          maxHeight="90%"
          padding="$0"
          pointerEvents="auto"
          borderRadius={BORDER_RADIUS.large}
          overflow="hidden"
        >
          <YStack flex={1}>
            {/* 头部 */}
            <DialogHeader
              title={title}
              description={description}
              type={type}
              layout="left"
              gradient={true}
              onClose={showCloseButton ? handleClose : undefined}
              actions={headerActions}
            />

            {/* 内容区域 */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: SPACING.lg,
              }}
            >
              {children}
            </ScrollView>

            {/* 底部操作区（可选） */}
            {footerActions && (
              <YStack
                paddingHorizontal={SPACING.lg}
                paddingVertical={SPACING.md}
                borderTopWidth={1}
                borderTopColor={DIALOG_COLORS.neutral[200]}
                backgroundColor={DIALOG_COLORS.background}
              >
                {footerActions}
              </YStack>
            )}
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
