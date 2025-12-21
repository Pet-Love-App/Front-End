/**
 * CircularScore - 圆形评分组件
 *
 * 用于显示猫粮营养评分的动画圆环
 * 设计风格: Premium + 科学感
 */

import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { YStack, Text, Stack, styled, GetProps } from 'tamagui';

import { scoreGradients } from '../tokens/brand-colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// 尺寸配置
const sizeConfig = {
  sm: { diameter: 80, strokeWidth: 6, fontSize: 20, labelSize: 10 },
  md: { diameter: 120, strokeWidth: 8, fontSize: 28, labelSize: 12 },
  lg: { diameter: 160, strokeWidth: 10, fontSize: 36, labelSize: 14 },
  xl: { diameter: 200, strokeWidth: 12, fontSize: 48, labelSize: 16 },
} as const;

// 评分等级
type RatingLevel = 'excellent' | 'good' | 'average' | 'poor' | 'bad';

function getScoreRating(score: number): {
  level: RatingLevel;
  label: string;
  emoji: string;
} {
  if (score >= 90) return { level: 'excellent', label: '优秀', emoji: '🌟' };
  if (score >= 70) return { level: 'good', label: '良好', emoji: '👍' };
  if (score >= 50) return { level: 'average', label: '一般', emoji: '😐' };
  if (score >= 30) return { level: 'poor', label: '较差', emoji: '⚠️' };
  return { level: 'bad', label: '不推荐', emoji: '❌' };
}

function getGradientColors(level: RatingLevel): readonly [string, string] {
  return scoreGradients[level];
}

// 样式组件
const ScoreContainer = styled(YStack, {
  name: 'ScoreContainer',
  alignItems: 'center',
  justifyContent: 'center',
});

const ScoreTextContainer = styled(Stack, {
  name: 'ScoreTextContainer',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
});

const ScoreValue = styled(Text, {
  name: 'ScoreValue',
  fontWeight: '700',
  fontFamily: '$heading',
  color: '$color',
});

const ScoreLabel = styled(Text, {
  name: 'ScoreLabel',
  color: '$colorMuted',
  fontWeight: '500',
  marginTop: '$1',
});

const RatingBadge = styled(Stack, {
  name: 'RatingBadge',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
  marginTop: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$1.5',
  borderRadius: 9999,

  variants: {
    level: {
      excellent: { backgroundColor: '$safeLight' },
      good: { backgroundColor: '$safeLight' },
      average: { backgroundColor: '$cautionLight' },
      poor: { backgroundColor: '$cautionLight' },
      bad: { backgroundColor: '$riskLight' },
    },
  } as const,
});

const RatingText = styled(Text, {
  name: 'RatingText',
  fontSize: '$2',
  fontWeight: '600',

  variants: {
    level: {
      excellent: { color: '$safeText' },
      good: { color: '$safeText' },
      average: { color: '$cautionText' },
      poor: { color: '$cautionText' },
      bad: { color: '$riskText' },
    },
  } as const,
});

// 组件 Props 类型
export interface CircularScoreProps {
  score: number;
  size?: keyof typeof sizeConfig;
  testID?: string;
  animated?: boolean;
  animationDelay?: number;
  label?: string;
  showRating?: boolean;
}

// 主组件
export function CircularScore({
  score,
  size = 'md',
  testID,
  animated = true,
  animationDelay = 0,
  label,
  showRating = true,
}: CircularScoreProps) {
  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const rating = getScoreRating(score);
  const gradientColors = getGradientColors(rating.level);

  const progress = useSharedValue(0);

  useEffect(() => {
    const targetProgress = Math.min(Math.max(score, 0), 100) / 100;

    if (animated) {
      const timeout = setTimeout(() => {
        progress.value = withSpring(targetProgress, {
          damping: 15,
          stiffness: 80,
          mass: 1,
        });
      }, animationDelay);
      return () => clearTimeout(timeout);
    }
    progress.value = targetProgress;
    return undefined;
  }, [score, animated, animationDelay, progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const gradientId = `scoreGradient-${size}-${score}`;

  return (
    <ScoreContainer testID={testID}>
      <Stack width={config.diameter} height={config.diameter}>
        <Svg
          width={config.diameter}
          height={config.diameter}
          viewBox={`0 0 ${config.diameter} ${config.diameter}`}
        >
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>

          <Circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            stroke="#E6E5E3"
            strokeWidth={config.strokeWidth}
            fill="transparent"
            opacity={0.3}
          />

          <AnimatedCircle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={config.strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${config.diameter / 2} ${config.diameter / 2})`}
          />
        </Svg>

        <ScoreTextContainer width={config.diameter} height={config.diameter} top={0} left={0}>
          <ScoreValue fontSize={config.fontSize}>{Math.round(score)}</ScoreValue>
          {label && <ScoreLabel fontSize={config.labelSize}>{label}</ScoreLabel>}
        </ScoreTextContainer>
      </Stack>

      {showRating && (
        <RatingBadge level={rating.level}>
          <Text fontSize="$2">{rating.emoji}</Text>
          <RatingText level={rating.level}>{rating.label}</RatingText>
        </RatingBadge>
      )}
    </ScoreContainer>
  );
}

export type CircularScoreComponentProps = GetProps<typeof CircularScore>;
