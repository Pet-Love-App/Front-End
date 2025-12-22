/**
 * 信誉分卡片组件
 *
 * 显示用户的信誉分数、等级和详细分布
 */
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BADGE_CONFIGS } from '@/src/constants/badges';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
import type { ReputationSummary } from '@/src/lib/supabase/services/reputation';

interface ReputationCardProps {
  reputation: ReputationSummary;
}

export const ReputationCard = memo(function ReputationCard({ reputation }: ReputationCardProps) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const badgeConfig = useMemo(() => {
    return BADGE_CONFIGS[reputation.level];
  }, [reputation.level]);

  const scoreBreakdown = useMemo(
    () => [
      {
        label: '资料完整度',
        value: reputation.profileCompleteness,
        max: 100,
        weight: 0.2, // 权重20%
        color: '#10B981',
        icon: 'person.crop.circle.fill',
      },
      {
        label: '评论质量',
        value: reputation.reviewQuality,
        max: 100,
        weight: 0.4, // 权重40%
        color: '#3B82F6',
        icon: 'message.fill',
      },
      {
        label: '社区贡献',
        value: reputation.communityContribution,
        max: 100,
        weight: 0.4, // 权重40%
        color: '#8B5CF6',
        icon: 'heart.fill',
      },
    ],
    [reputation]
  );

  if (!badgeConfig) return null;

  return (
    <View testID="reputation-card">
      <Card
        backgroundColor={colors.cardBackground as any}
        borderRadius={20}
        padding="$4"
        bordered
        borderColor={colors.borderMuted as any}
      >
        <YStack gap="$4">
          {/* 头部：等级徽章和分数 */}
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$3">
              {/* 等级徽章 */}
              <View testID="reputation-level-badge">
                <YStack
                  width={56}
                  height={56}
                  borderRadius={28}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    backgroundColor: badgeConfig.gradient
                      ? 'transparent'
                      : badgeConfig.color + '20',
                  }}
                >
                  {badgeConfig.gradient ? (
                    <LinearGradient
                      colors={badgeConfig.gradient}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconSymbol name={badgeConfig.icon as any} size={28} color="white" />
                    </LinearGradient>
                  ) : (
                    <IconSymbol
                      name={badgeConfig.icon as any}
                      size={28}
                      color={badgeConfig.color}
                    />
                  )}
                </YStack>
              </View>

              {/* 等级信息 */}
              <YStack>
                <View testID="reputation-level">
                  <Text fontSize={18} fontWeight="700" color={colors.text as any}>
                    {badgeConfig.name}
                  </Text>
                </View>
                <Text fontSize={13} color={colors.textSecondary as any}>
                  {badgeConfig.description}
                </Text>
              </YStack>
            </XStack>

            {/* 总分 */}
            <YStack alignItems="flex-end">
              <View testID="reputation-score">
                <Text fontSize={32} fontWeight="800" color={badgeConfig.color as any}>
                  {reputation.score}
                </Text>
              </View>
              <Text fontSize={12} color={colors.textSecondary as any} fontWeight="600">
                信誉分
              </Text>
            </YStack>
          </XStack>

          {/* 分数分布 */}
          <YStack gap="$2.5">
            {scoreBreakdown.map((item) => (
              <YStack key={item.label} gap="$1">
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name={item.icon as any} size={14} color={item.color} />
                    <Text fontSize={13} color={colors.text as any} fontWeight="500">
                      {item.label}
                    </Text>
                    <Text fontSize={11} color={colors.textTertiary as any}>
                      (权重 {Math.round(item.weight * 100)}%)
                    </Text>
                  </XStack>
                  <Text fontSize={13} color={colors.textSecondary as any} fontWeight="600">
                    {item.value}分
                  </Text>
                </XStack>
                {/* 进度条 */}
                <View testID="progress-bar">
                  <YStack
                    height={6}
                    backgroundColor={colors.backgroundMuted as any}
                    borderRadius={3}
                    overflow="hidden"
                  >
                    <YStack
                      height="100%"
                      width={`${Math.min((item.value / item.max) * 100, 100)}%`}
                      backgroundColor={item.color as any}
                      borderRadius={3}
                    />
                  </YStack>
                </View>
              </YStack>
            ))}
          </YStack>
        </YStack>
      </Card>
    </View>
  );
});
