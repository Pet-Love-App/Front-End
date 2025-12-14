/**
 * Toast - 轻量级通知组件
 * 用于显示成功、错误、警告等非阻塞式通知
 */

import React, { useEffect } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol, type SymbolName } from '@/src/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DIALOG_COLORS,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZE,
  SHADOWS,
  SF_SYMBOLS,
  TYPE_COLORS,
  TOAST_DURATION,
} from './constants';
import type { ToastConfig } from './types';

interface ToastProps extends ToastConfig {
  onDismiss: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function Toast({
  type,
  message,
  description,
  duration = TOAST_DURATION.medium,
  icon,
  action,
  onDismiss,
  position = 'bottom-right',
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const colors = TYPE_COLORS[type];
  const defaultSfSymbol = SF_SYMBOLS[type];

  // 动画值
  const [translateY] = React.useState(new Animated.Value(100));
  const [opacity] = React.useState(new Animated.Value(0));

  useEffect(() => {
    // 进入动画
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 自动关闭
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 100,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const positionStyles = {
    position: 'absolute' as const,
    ...(position.includes('bottom')
      ? { bottom: Math.max(insets.bottom, SPACING.md) + SPACING.md }
      : { top: Math.max(insets.top, SPACING.md) + SPACING.md }),
    ...(position.includes('right') ? { right: SPACING.md } : { left: SPACING.md }),
    zIndex: 9999,
  };

  return (
    <Animated.View
      style={[
        positionStyles,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <XStack
        backgroundColor={DIALOG_COLORS.background}
        borderRadius={BORDER_RADIUS.medium}
        padding={SPACING.md}
        gap={SPACING.md}
        alignItems="flex-start"
        minWidth={320}
        maxWidth={400}
        borderLeftWidth={4}
        borderLeftColor={colors.border}
        {...SHADOWS.lg}
      >
        {/* 图标 */}
        <YStack
          width={40}
          height={40}
          borderRadius={BORDER_RADIUS.medium}
          backgroundColor={colors.bg}
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {icon ? (
            <Text fontSize={20}>{icon}</Text>
          ) : (
            <IconSymbol name={defaultSfSymbol} size={20} color={colors.icon} />
          )}
        </YStack>

        {/* 内容 */}
        <YStack flex={1} gap={SPACING.xs}>
          <Text
            fontSize={FONT_SIZE.base}
            fontWeight="700"
            color={DIALOG_COLORS.text}
            lineHeight={20}
          >
            {message}
          </Text>
          {description && (
            <Text fontSize={FONT_SIZE.sm} color={DIALOG_COLORS.textLight} lineHeight={18}>
              {description}
            </Text>
          )}
          {action && (
            <TouchableOpacity
              onPress={() => {
                action.onPress();
                handleDismiss();
              }}
              activeOpacity={0.7}
              style={{ marginTop: SPACING.xs }}
            >
              <Text fontSize={FONT_SIZE.sm} fontWeight="700" color={colors.icon}>
                {action.label}
              </Text>
            </TouchableOpacity>
          )}
        </YStack>

        {/* 关闭按钮 */}
        <TouchableOpacity onPress={handleDismiss} activeOpacity={0.7}>
          <YStack
            width={24}
            height={24}
            borderRadius={BORDER_RADIUS.full}
            backgroundColor={DIALOG_COLORS.neutral[100]}
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="xmark" size={12} color={DIALOG_COLORS.neutral[600]} />
          </YStack>
        </TouchableOpacity>
      </XStack>
    </Animated.View>
  );
}
