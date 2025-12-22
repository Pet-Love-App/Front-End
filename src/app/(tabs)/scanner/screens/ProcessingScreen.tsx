/**
 * OCR 处理中状态页面
 */
import React from 'react';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ProcessingScreenProps {
  insets: EdgeInsets;
}

export function ProcessingScreen({ insets }: ProcessingScreenProps) {
  const colors = useThemeColors();

  return (
    <YStack flex={1} backgroundColor={colors.background as any}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        gap="$5"
        padding="$6"
        paddingTop={insets.top + 60}
        paddingBottom={insets.bottom + 20}
      >
        {/* 加载动画 */}
        <YStack
          width={280}
          height={280}
          backgroundColor={colors.cardBackground as any}
          borderRadius="$12"
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor={colors.borderMuted as any}
        >
          <LottieAnimation
            source={require('@/assets/animations/rolling_cat_animation.json')}
            width={180}
            height={180}
          />
        </YStack>

        {/* 加载文本 */}
        <YStack alignItems="center" gap="$2.5" maxWidth={320}>
          <Text fontSize={24} fontWeight="900" color={colors.text as any} letterSpacing={0.5}>
            正在识别文字...
          </Text>
          <Text
            fontSize={15}
            color={colors.textSecondary as any}
            fontWeight="600"
            textAlign="center"
            lineHeight={22}
          >
            AI 正在分析图片中的成分信息
          </Text>
        </YStack>

        {/* 进度提示 */}
        <YStack
          marginTop="$4"
          paddingHorizontal="$5"
          paddingVertical="$3"
          backgroundColor={colors.cardBackground as any}
          borderRadius="$10"
          borderWidth={1.5}
          borderColor={colors.borderMuted as any}
        >
          <XStack alignItems="center" gap="$2.5">
            <YStack
              width={8}
              height={8}
              borderRadius="$10"
              backgroundColor={colors.primary as any}
            />
            <Text fontSize={14} color={colors.textSecondary as any} fontWeight="600">
              这可能需要几秒钟
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
