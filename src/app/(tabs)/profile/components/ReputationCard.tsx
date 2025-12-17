/**
 * 信誉分卡片组件
 *
 * 显示用户的信誉分数、等级徽章、详细分数分布及交互入口
 */
import { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BADGE_CONFIGS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';
import type { ReputationSummary } from '@/src/lib/supabase/services/reputation';

// 组件属性定义
interface ReputationCardProps {
  reputation: ReputationSummary; // 信誉分数据
  onPress?: () => void; // 卡片点击事件（查看详情）
  badgeConfig?: {
    icon: string;
    color: string;
    gradient?: string[];
    name?: string;
    description?: string;
  }; // 额外徽章配置（可选）
  onBadgePress?: () => void; // 徽章点击事件（可选）
}

export const ReputationCard = memo(function ReputationCard({
  reputation,
  onPress,
  badgeConfig,
  onBadgePress,
}: ReputationCardProps) {
  // 根据信誉等级获取徽章配置
  const levelBadgeConfig = useMemo(() => {
    return BADGE_CONFIGS[reputation.level] || null;
  }, [reputation.level]);

  // 合并默认徽章配置和外部传入的徽章配置
  const displayBadgeConfig = badgeConfig || levelBadgeConfig;

  // 分数分布数据
  const scoreBreakdown = useMemo(
    () => [
      {
        label: '资料完整度',
        value: reputation.profile_completeness,
        max: 15, // 对应数据库定义的 0-15 分
        color: '#10B981',
        icon: 'person.crop.circle.fill',
      },
      {
        label: '评价可信度',
        value: reputation.review_credibility,
        max: 40, // 对应数据库定义的 0-40 分
        color: '#3B82F6',
        icon: 'checkmark.seal.fill',
      },
      {
        label: '社区贡献',
        value: reputation.community_contribution,
        max: 25, // 对应数据库定义的 0-25 分
        color: '#8B5CF6',
        icon: 'heart.fill',
      },
      {
        label: '合规性',
        value: reputation.compliance,
        max: 20, // 对应数据库定义的 0-20 分
        color: '#F59E0B',
        icon: 'shield.fill',
      },
    ],
    [reputation]
  );

  if (!displayBadgeConfig) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={{ width: '100%' }}
    >
      <Card
        backgroundColor="white"
        borderRadius={20}
        padding="$4"
        bordered
        borderColor={neutralScale.neutral3}
        elevation={2}
      >
        <YStack gap="$4">
          {/* 头部：等级徽章、等级信息和分数 */}
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
                  backgroundColor: displayBadgeConfig.gradient
                    ? 'transparent'
                    : `${displayBadgeConfig.color}20`, // 半透明背景
                }}
              >
                {displayBadgeConfig.gradient ? (
                  <LinearGradient
                    colors={displayBadgeConfig.gradient as [string, string]}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name={displayBadgeConfig.icon as any} size={28} color="white" />
                  </LinearGradient>
                ) : (
                  <IconSymbol
                    name={displayBadgeConfig.icon as any}
                    size={28}
                    color={displayBadgeConfig.color}
                  />
                )}
              </YStack>

              {/* 等级信息 */}
              <YStack>
                <Text fontSize={18} fontWeight="700" color={neutralScale.neutral12}>
                  {displayBadgeConfig.name}
                </Text>
                <Text fontSize={13} color={neutralScale.neutral9}>
                  {displayBadgeConfig.description}
                </Text>
              </YStack>
            </XStack>

            {/* 右侧：总分 + 可点击徽章（如果有） */}
            <XStack alignItems="center" gap="$2">
              <YStack alignItems="flex-end">
                <Text fontSize={32} fontWeight="800" color={displayBadgeConfig.color}>
                  {reputation.score}
                </Text>
                <Text fontSize={12} color={neutralScale.neutral9} fontWeight="600">
                  信誉分
                </Text>
              </YStack>

              {/* 额外可点击徽章（如已装备的特殊徽章） */}
              {onBadgePress && badgeConfig && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡到卡片
                    onBadgePress();
                  }}
                  activeOpacity={0.8}
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius={20}
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      backgroundColor: badgeConfig.gradient
                        ? 'transparent'
                        : `${badgeConfig.color}20`,
                    }}
                  >
                    {badgeConfig.gradient ? (
                      <LinearGradient
                        colors={displayBadgeConfig.gradient as [string, string]}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconSymbol name={badgeConfig.icon as any} size={20} color="white" />
                      </LinearGradient>
                    ) : (
                      <IconSymbol
                        name={badgeConfig.icon as any}
                        size={20}
                        color={badgeConfig.color}
                      />
                    )}
                  </YStack>
                </TouchableOpacity>
              )}
            </XStack>
          </XStack>

          {/* 分数分布详情 */}
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

          {/* 查看详情按钮（如果有点击事件） */}
          {onPress && (
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
              paddingVertical="$2"
              backgroundColor={`${displayBadgeConfig.color}10`}
              borderRadius={10}
            >
              <Text fontSize={12} color={displayBadgeConfig.color} fontWeight="600">
                查看详情
              </Text>
              <IconSymbol name="chevron.right" size={12} color={displayBadgeConfig.color} />
            </XStack>
          )}
        </YStack>
      </Card>
    </TouchableOpacity>
  );
});
