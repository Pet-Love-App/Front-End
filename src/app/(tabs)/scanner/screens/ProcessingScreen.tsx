/**
 * OCR 处理中状态页面
 */
import React from 'react';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

interface ProcessingScreenProps {
  insets: EdgeInsets;
}

export function ProcessingScreen({ insets }: ProcessingScreenProps) {
  return (
    <YStack flex={1} backgroundColor={neutralScale.neutral1}>
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
          backgroundColor="white"
          borderRadius="$12"
          padding="$6"
          alignItems="center"
          borderWidth={2}
          borderColor={neutralScale.neutral2}
        >
          <LottieAnimation
            source={require('@/assets/animations/cat_loader.json')}
            width={220}
            height={220}
          />
        </YStack>

        {/* 加载文本 */}
        <YStack alignItems="center" gap="$2.5" maxWidth={320}>
          <Text fontSize={24} fontWeight="900" color="$foreground" letterSpacing={0.5}>
            正在识别文字...
          </Text>
          <Text
            fontSize={15}
            color={neutralScale.neutral8}
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
          backgroundColor="white"
          borderRadius="$10"
          borderWidth={1.5}
          borderColor={neutralScale.neutral3}
        >
          <XStack alignItems="center" gap="$2.5">
            <YStack
              width={8}
              height={8}
              borderRadius="$10"
              backgroundColor={primaryScale.primary7}
            />
            <Text fontSize={14} color={neutralScale.neutral8} fontWeight="600">
              这可能需要几秒钟
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
