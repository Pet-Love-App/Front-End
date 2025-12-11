/**
 * StreamingText 组件
 *
 * 用于显示流式输出的文本内容
 * 支持打字机效果、自动滚动、进度显示
 */

import React, { memo, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Spinner, Text, XStack, YStack } from 'tamagui';

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, neutralScale, successScale } from '@/src/design-system/tokens/colors';

// ==================== 类型定义 ====================

interface StreamingTextProps {
  /** 文本内容 */
  content: string;
  /** 是否正在流式传输 */
  isStreaming: boolean;
  /** 是否已完成 */
  isComplete: boolean;
  /** 进度 (0-100) */
  progress: number;
  /** 错误信息 */
  error?: string | null;
}

// ==================== 子组件 ====================

/** 进度条 */
const ProgressBar = memo(function ProgressBar({ progress }: { progress: number }) {
  return (
    <XStack
      alignItems="center"
      paddingHorizontal="$4"
      paddingVertical="$3"
      backgroundColor={primaryScale.primary2}
      gap="$2"
      borderBottomWidth={1}
      borderBottomColor={primaryScale.primary4}
      minHeight={48}
    >
      <Spinner size="small" color={primaryScale.primary9} />
      <Text
        fontSize={13}
        color={primaryScale.primary11}
        fontWeight="500"
        flex={1}
        numberOfLines={1}
      >
        AI 正在分析中...
      </Text>
      <Text
        fontSize={12}
        color={primaryScale.primary9}
        fontWeight="600"
        minWidth={40}
        textAlign="right"
      >
        {Math.round(progress)}%
      </Text>
    </XStack>
  );
});

/** 完成提示 */
const CompleteBanner = memo(function CompleteBanner() {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      paddingVertical="$3"
      backgroundColor={successScale.success2}
      gap="$2"
      borderBottomWidth={1}
      borderBottomColor={successScale.success4}
      minHeight={48}
    >
      <IconSymbol name="checkmark.circle.fill" size={16} color={successScale.success9} />
      <Text fontSize={13} color={successScale.success11} fontWeight="600" numberOfLines={1}>
        分析完成，报告已保存
      </Text>
    </XStack>
  );
});

/** 错误提示 */
const ErrorBanner = memo(function ErrorBanner({ message }: { message: string }) {
  return (
    <XStack
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor="#FEE2E2"
      gap="$2"
      minHeight={48}
    >
      <IconSymbol name="exclamationmark.circle.fill" size={16} color="#EF4444" />
      <Text fontSize={13} color="#B91C1C" fontWeight="500" flex={1} numberOfLines={2}>
        {message}
      </Text>
    </XStack>
  );
});

/** 流式光标 */
const StreamingCursor = memo(function StreamingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.cursor, cursorStyle]} />;
});

/** 空状态（等待开始） */
const EmptyState = memo(function EmptyState() {
  return (
    <YStack alignItems="center" justifyContent="center" padding="$6" flex={1}>
      <Spinner size="large" color={primaryScale.primary9} />
      <Text marginTop="$3" fontSize={14} color={neutralScale.neutral10} textAlign="center">
        正在连接 AI 服务...
      </Text>
    </YStack>
  );
});

// ==================== 主组件 ====================

function StreamingTextComponent({
  content,
  isStreaming,
  isComplete,
  progress,
  error,
}: StreamingTextProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (isStreaming && scrollViewRef.current) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [content, isStreaming]);

  return (
    <YStack flex={1}>
      {/* 顶部状态栏 */}
      {isStreaming && <ProgressBar progress={progress} />}
      {isComplete && !error && <CompleteBanner />}
      {error && <ErrorBanner message={error} />}

      {/* 内容区域 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {content ? (
          <YStack flex={1}>
            {/* 流式文本内容 */}
            <Text
              fontSize={14}
              lineHeight={22}
              color={neutralScale.neutral12}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {content}
            </Text>

            {/* 流式光标 */}
            {isStreaming && <StreamingCursor />}
          </YStack>
        ) : isStreaming ? (
          <EmptyState />
        ) : null}
      </ScrollView>
    </YStack>
  );
}

// ==================== 样式 ====================

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: primaryScale.primary9,
    marginLeft: 2,
    marginTop: 4,
    borderRadius: 1,
  },
});

export const StreamingText = memo(StreamingTextComponent);
