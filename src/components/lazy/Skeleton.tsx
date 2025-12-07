/**
 * 骨架屏组件
 * 提供多种加载占位样式
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Card, XStack, YStack } from 'tamagui';

// ==================== 基础骨架块 ====================

interface SkeletonProps {
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
  /** 圆角 */
  borderRadius?: number;
  /** 是否圆形 */
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  circle = false,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const actualBorderRadius = circle ? (typeof height === 'number' ? height / 2 : 50) : borderRadius;

  return (
    <YStack
      width={width}
      height={height}
      borderRadius={actualBorderRadius}
      backgroundColor="$gray4"
      overflow="hidden"
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </YStack>
  );
}

// ==================== 文本骨架 ====================

interface SkeletonTextProps {
  /** 行数 */
  lines?: number;
  /** 最后一行宽度比例 */
  lastLineWidth?: number;
  /** 行高 */
  lineHeight?: number;
  /** 行间距 */
  gap?: number;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = 0.6,
  lineHeight = 14,
  gap = 8,
}: SkeletonTextProps) {
  return (
    <YStack gap={gap}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? `${lastLineWidth * 100}%` : '100%'}
          height={lineHeight}
        />
      ))}
    </YStack>
  );
}

// ==================== 卡片骨架 ====================

interface SkeletonCardProps {
  /** 是否显示图片 */
  showImage?: boolean;
  /** 图片高度 */
  imageHeight?: number;
  /** 文本行数 */
  textLines?: number;
}

export function SkeletonCard({
  showImage = true,
  imageHeight = 120,
  textLines = 2,
}: SkeletonCardProps) {
  return (
    <Card
      padding="$3"
      backgroundColor="$background"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
    >
      {showImage && (
        <YStack marginBottom="$3">
          <Skeleton width="100%" height={imageHeight} borderRadius={8} />
        </YStack>
      )}

      <YStack gap="$2">
        <Skeleton width="70%" height={18} />
        <SkeletonText lines={textLines} lineHeight={12} gap={6} />
      </YStack>

      <XStack marginTop="$3" justifyContent="space-between" alignItems="center">
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={40} height={14} />
      </XStack>
    </Card>
  );
}

// ==================== 列表骨架 ====================

interface SkeletonListProps {
  /** 列表项数量 */
  count?: number;
  /** 是否显示图片 */
  showImage?: boolean;
  /** 间距 */
  gap?: number;
}

export function SkeletonList({ count = 5, showImage = true, gap = 12 }: SkeletonListProps) {
  return (
    <YStack gap={gap} padding="$3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage={showImage} textLines={2} />
      ))}
    </YStack>
  );
}

// ==================== 详情页骨架 ====================

export function SkeletonDetail() {
  return (
    <YStack flex={1} padding="$4" gap="$4">
      {/* 头部图片 */}
      <Skeleton width="100%" height={200} borderRadius={12} />

      {/* 标题 */}
      <YStack gap="$2">
        <Skeleton width="80%" height={24} />
        <Skeleton width="50%" height={16} />
      </YStack>

      {/* 标签 */}
      <XStack gap="$2">
        <Skeleton width={60} height={28} borderRadius={14} />
        <Skeleton width={80} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
      </XStack>

      {/* 内容区块 */}
      <Card padding="$4" backgroundColor="$gray2" borderRadius="$4">
        <Skeleton width="40%" height={18} />
        <YStack marginTop="$3">
          <SkeletonText lines={4} lineHeight={14} gap={8} />
        </YStack>
      </Card>

      {/* 另一个区块 */}
      <Card padding="$4" backgroundColor="$gray2" borderRadius="$4">
        <Skeleton width="50%" height={18} />
        <YStack marginTop="$3">
          <SkeletonText lines={3} lineHeight={14} gap={8} />
        </YStack>
      </Card>

      {/* 列表项 */}
      <YStack gap="$2">
        {Array.from({ length: 3 }).map((_, i) => (
          <XStack key={i} gap="$3" alignItems="center">
            <Skeleton width={40} height={40} circle />
            <YStack flex={1} gap="$1">
              <Skeleton width="60%" height={14} />
              <Skeleton width="40%" height={12} />
            </YStack>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}

// ==================== AI报告骨架 ====================

export function SkeletonAIReport() {
  return (
    <Card
      padding="$4"
      backgroundColor="white"
      borderRadius="$6"
      marginHorizontal="$3"
      marginBottom="$3"
    >
      {/* 标题 */}
      <XStack alignItems="center" gap="$3" marginBottom="$4">
        <Skeleton width={50} height={50} borderRadius={12} />
        <YStack flex={1} gap="$2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
        </YStack>
      </XStack>

      {/* 标签 */}
      <XStack gap="$2" marginBottom="$4">
        <Skeleton width={70} height={28} borderRadius={14} />
        <Skeleton width={90} height={28} borderRadius={14} />
        <Skeleton width={60} height={28} borderRadius={14} />
      </XStack>

      {/* 分析区块 */}
      <YStack gap="$4">
        <YStack gap="$2">
          <Skeleton width="30%" height={18} />
          <Card backgroundColor="$gray2" padding="$3" borderRadius="$3">
            <SkeletonText lines={3} lineHeight={14} gap={8} />
          </Card>
        </YStack>

        <YStack gap="$2">
          <Skeleton width="25%" height={18} />
          <Card backgroundColor="$gray2" padding="$3" borderRadius="$3">
            <SkeletonText lines={4} lineHeight={14} gap={8} />
          </Card>
        </YStack>
      </YStack>

      {/* 添加剂列表 */}
      <YStack marginTop="$4" gap="$2">
        <Skeleton width="35%" height={16} />
        <XStack gap="$2" flexWrap="wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={60 + Math.random() * 30} height={26} borderRadius={4} />
          ))}
        </XStack>
      </YStack>
    </Card>
  );
}

// ==================== 样式 ====================

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
    width: 100,
  },
});
