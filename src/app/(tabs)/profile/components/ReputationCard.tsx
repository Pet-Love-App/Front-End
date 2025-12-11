/**
 * 信誉分卡片组件
 *
 * 显示用户的信誉分数、等级和详细分布
 */
import { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BADGE_CONFIGS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';
import type { ReputationSummary } from '@/src/lib/supabase/services/reputation';

interface ReputationCardProps {
  reputation: ReputationSummary;
  onPress?: () => void;
}

export const ReputationCard = memo(function ReputationCard({
  reputation,
  onPress,
}: ReputationCardProps) {
  const badgeConfig = useMemo(() => {
    // 调试：打印信誉分数据
    console.log('信誉分数据:', {
      level: reputation.level,
      score: reputation.score,
      profileCompleteness: reputation.profileCompleteness,
      reviewQuality: reputation.reviewQuality,
      communityContribution: reputation.communityContribution,
      compliance: reputation.compliance,
    });
    return BADGE_CONFIGS[reputation.level];
  }, [reputation.level, reputation.score]);

  const scoreBreakdown = useMemo(
    () => [
      {
        label: '资料完整度',
        value: reputation.profileCompleteness,
        max: 20,
        color: '#10B981',
        icon: 'person.crop.circle.fill',
      },
      {
        label: '评论质量',
        value: reputation.reviewQuality,
        max: 40,
        color: '#3B82F6',
        icon: 'message.fill',
      },
      {
        label: '社区贡献',
        value: reputation.communityContribution,
        max: 30,
        color: '#8B5CF6',
        icon: 'heart.fill',
      },
      {
        label: '合规性',
        value: reputation.compliance,
        max: 10,
        color: '#F59E0B',
        icon: 'checkmark.shield.fill',
      },
    ],
    [reputation]
  );

  if (!badgeConfig) return null;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <Card
        backgroundColor="white"
        borderRadius={20}
        padding="$4"
        bordered
        borderColor={neutralScale.neutral3}
      >
        <YStack gap="$4">
          {/* 头部：等级徽章和分数 */}
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$3">
              {/* 等级徽章 */}
              <YStack
                width={56}
                height={56}
                borderRadius={28}
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: badgeConfig.gradient ? 'transparent' : badgeConfig.color + '20',
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
                  <IconSymbol name={badgeConfig.icon as any} size={28} color={badgeConfig.color} />
                )}
              </YStack>

              {/* 等级信息 */}
              <YStack>
                <Text fontSize={18} fontWeight="700" color={neutralScale.neutral12}>
                  {badgeConfig.name}
                </Text>
                <Text fontSize={13} color={neutralScale.neutral9}>
                  {badgeConfig.description}
                </Text>
              </YStack>
            </XStack>

            {/* 总分 */}
            <YStack alignItems="flex-end">
              <Text fontSize={32} fontWeight="800" color={badgeConfig.color}>
                {reputation.score}
              </Text>
              <Text fontSize={12} color={neutralScale.neutral9} fontWeight="600">
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
                    <Text fontSize={13} color={neutralScale.neutral10} fontWeight="500">
                      {item.label}
                    </Text>
                  </XStack>
                  <Text fontSize={13} color={neutralScale.neutral11} fontWeight="600">
                    {item.value}/{item.max}
                  </Text>
                </XStack>
                {/* 进度条 */}
                <YStack
                  height={6}
                  backgroundColor={neutralScale.neutral2}
                  borderRadius={3}
                  overflow="hidden"
                >
                  <YStack
                    height="100%"
                    width={`${(item.value / item.max) * 100}%`}
                    backgroundColor={item.color}
                    borderRadius={3}
                  />
                </YStack>
              </YStack>
            ))}
          </YStack>

          {/* 提示 */}
          {onPress && (
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
              paddingVertical="$2"
              backgroundColor={badgeConfig.color + '10'}
              borderRadius={10}
            >
              <Text fontSize={12} color={badgeConfig.color} fontWeight="600">
                查看详情
              </Text>
              <IconSymbol name="chevron.right" size={12} color={badgeConfig.color} />
            </XStack>
          )}
        </YStack>
      </Card>
    </TouchableOpacity>
  );
});
