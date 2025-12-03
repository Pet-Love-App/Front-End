/**
 * ProcessingScreen - OCR 处理中状态页面
 *
 * 企业最佳实践：
 * - 单一职责：仅负责展示处理中状态
 * - Props类型化：清晰的接口定义
 * - 用户反馈：提供清晰的加载提示
 */

import { LottieAnimation } from '@/src/components/LottieAnimation';
import React from 'react';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

/**
 * 组件 Props 接口
 */
interface ProcessingScreenProps {
  /** 安全区域边距 */
  insets: EdgeInsets;
}

/**
 * OCR 处理中状态页面组件
 */
export function ProcessingScreen({ insets }: ProcessingScreenProps) {
  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        gap="$5"
        padding="$6"
        paddingTop={insets.top + 60}
        paddingBottom={insets.bottom + 20}
      >
        {/* ==================== 加载动画容器 ==================== */}
        <YStack
          backgroundColor="white"
          borderRadius="$12"
          padding="$6"
          alignItems="center"
          borderWidth={2}
          borderColor="#F3F4F6"
        >
          <LottieAnimation
            source={require('@/assets/animations/cat_loader.json')}
            width={220}
            height={220}
          />
        </YStack>

        {/* ==================== 加载文本 ==================== */}
        <YStack alignItems="center" gap="$2.5" maxWidth={320}>
          <Text fontSize={24} fontWeight="900" color="#111827" letterSpacing={0.5}>
            正在识别文字...
          </Text>
          <Text fontSize={15} color="#6B7280" fontWeight="600" textAlign="center" lineHeight={22}>
            AI 正在分析图片中的成分信息
          </Text>
        </YStack>

        {/* ==================== 进度提示 ==================== */}
        <YStack
          marginTop="$4"
          paddingHorizontal="$5"
          paddingVertical="$3"
          backgroundColor="white"
          borderRadius="$10"
          borderWidth={1.5}
          borderColor="#E5E7EB"
        >
          <XStack alignItems="center" gap="$2.5">
            <YStack width={8} height={8} borderRadius="$10" backgroundColor="#FEBE98" />
            <Text fontSize={14} color="#6B7280" fontWeight="600">
              这可能需要几秒钟
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
