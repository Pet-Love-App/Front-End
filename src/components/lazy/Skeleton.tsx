import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Card, XStack, YStack } from 'tamagui';

import { neutralScale, radius as radiusTokens, spacing } from '@/src/design-system/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radiusTokens[2],
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

  const actualRadius = circle ? (typeof height === 'number' ? height / 2 : 50) : borderRadius;

  return (
    <YStack
      width={width as any}
      height={height as any}
      borderRadius={actualRadius}
      backgroundColor={neutralScale.neutral3}
      overflow="hidden"
    >
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]} />
    </YStack>
  );
}

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number;
  lineHeight?: number;
  gap?: number;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = 0.6,
  lineHeight = 14,
  gap = spacing[2],
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

interface SkeletonCardProps {
  showImage?: boolean;
  imageHeight?: number;
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
          <Skeleton width="100%" height={imageHeight} borderRadius={radiusTokens[4]} />
        </YStack>
      )}

      <YStack gap="$2">
        <Skeleton width="70%" height={18} />
        <SkeletonText lines={textLines} lineHeight={12} gap={spacing[1.5]} />
      </YStack>

      <XStack marginTop="$3" justifyContent="space-between" alignItems="center">
        <Skeleton width={60} height={24} borderRadius={radiusTokens.full} />
        <Skeleton width={40} height={14} />
      </XStack>
    </Card>
  );
}

interface SkeletonListProps {
  count?: number;
  showImage?: boolean;
  gap?: number;
}

export function SkeletonList({ count = 5, showImage = true, gap = spacing[3] }: SkeletonListProps) {
  return (
    <YStack gap={gap} padding="$3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage={showImage} textLines={2} />
      ))}
    </YStack>
  );
}

export function SkeletonDetail() {
  return (
    <YStack flex={1} padding="$4" gap="$4">
      <Skeleton width="100%" height={200} borderRadius={radiusTokens[6]} />

      <YStack gap="$2">
        <Skeleton width="80%" height={24} />
        <Skeleton width="50%" height={16} />
      </YStack>

      <XStack gap="$2">
        <Skeleton width={60} height={28} borderRadius={radiusTokens.full} />
        <Skeleton width={80} height={28} borderRadius={radiusTokens.full} />
        <Skeleton width={70} height={28} borderRadius={radiusTokens.full} />
      </XStack>

      <Card padding="$4" backgroundColor="$backgroundMuted" borderRadius="$4">
        <Skeleton width="40%" height={18} />
        <YStack marginTop="$3">
          <SkeletonText lines={4} lineHeight={14} gap={spacing[2]} />
        </YStack>
      </Card>

      <Card padding="$4" backgroundColor="$backgroundMuted" borderRadius="$4">
        <Skeleton width="50%" height={18} />
        <YStack marginTop="$3">
          <SkeletonText lines={3} lineHeight={14} gap={spacing[2]} />
        </YStack>
      </Card>

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

export function SkeletonAIReport() {
  return (
    <Card
      padding="$4"
      backgroundColor="$background"
      borderRadius="$6"
      marginHorizontal="$3"
      marginBottom="$3"
    >
      <XStack alignItems="center" gap="$3" marginBottom="$4">
        <Skeleton width={50} height={50} borderRadius={radiusTokens[6]} />
        <YStack flex={1} gap="$2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
        </YStack>
      </XStack>

      <XStack gap="$2" marginBottom="$4">
        <Skeleton width={70} height={28} borderRadius={radiusTokens.full} />
        <Skeleton width={90} height={28} borderRadius={radiusTokens.full} />
        <Skeleton width={60} height={28} borderRadius={radiusTokens.full} />
      </XStack>

      <YStack gap="$4">
        <YStack gap="$2">
          <Skeleton width="30%" height={18} />
          <Card backgroundColor="$backgroundMuted" padding="$3" borderRadius="$3">
            <SkeletonText lines={3} lineHeight={14} gap={spacing[2]} />
          </Card>
        </YStack>

        <YStack gap="$2">
          <Skeleton width="25%" height={18} />
          <Card backgroundColor="$backgroundMuted" padding="$3" borderRadius="$3">
            <SkeletonText lines={4} lineHeight={14} gap={spacing[2]} />
          </Card>
        </YStack>
      </YStack>

      <YStack marginTop="$4" gap="$2">
        <Skeleton width="35%" height={16} />
        <XStack gap="$2" flexWrap="wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              width={60 + Math.random() * 30}
              height={26}
              borderRadius={radiusTokens[2]}
            />
          ))}
        </XStack>
      </YStack>
    </Card>
  );
}

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
