// src/app/(tabs)/profile/screens/AllBadgesScreen.tsx
import { useState } from 'react';
import { ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { YStack, Text, Card, XStack, CardProps } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { neutralScale } from '@/src/design-system/tokens';
import { useProfileData } from '../hooks';

// 定义徽章相关类型
interface BadgeConfig {
  code: string;
  name: string;
  icon: string;
  color: string;
  rarity: string;
  description: string;
}

interface UserBadge {
  badge: {
    code: string;
    id: number;
    name: string;
  };
  earned: boolean;
  earned_at?: string;
  is_equipped: boolean;
  progress: number;
}

interface RarityConfig {
  glow: string;
  name: string;
}

// 模拟 useReputation hook 返回类型（根据实际项目调整）
interface UseReputationReturn {
  badges: UserBadge[];
  loading: boolean;
  equipBadge: (badgeCode: string) => Promise<boolean>;
  unequipBadge: (badgeCode: string) => Promise<boolean>;
}

// 模拟导入的常量（根据实际项目路径调整）
declare const BADGE_CONFIGS: Record<string, BadgeConfig>;
declare const RARITY_CONFIGS: Record<string, RarityConfig>;

// 模拟 useReputation hook
const useReputation = (userId?: string | number): UseReputationReturn => {
  // 实际项目中替换为真实的 hook 调用
  return {
    badges: [],
    loading: false,
    equipBadge: async (badgeCode: string) => true,
    unequipBadge: async (badgeCode: string) => true,
  };
};

// 模拟 BadgeDetailModal 组件属性
interface BadgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeConfig | null;
  isEquipped: boolean;
  progress: number;
  earnedAt?: string;
  onEquip: (code: string) => Promise<boolean>;
  onUnequip: () => Promise<boolean>;
  loading: boolean;
}

// 模拟 BadgeDetailModal 组件
const BadgeDetailModal = ({
  isOpen,
  onClose,
  badge,
  isEquipped,
  progress,
  earnedAt,
  onEquip,
  onUnequip,
  loading,
}: BadgeDetailModalProps) => {
  return null; // 实际项目中替换为真实组件
};

export function AllBadgesScreen() {
  const router = useRouter();
  const { user } = useProfileData();
  const { badges, loading, equipBadge, unequipBadge } = useReputation(user?.id);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 处理徽章点击
  const handleBadgePress = (badge: UserBadge) => {
    setSelectedBadge(badge);
    setModalOpen(true);
  };

  // 获取徽章配置
  const getBadgeConfig = (badgeCode: string): BadgeConfig | undefined => {
    return BADGE_CONFIGS[badgeCode];
  };

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>加载徽章中...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={neutralScale.neutral1}>
      {/* 头部导航 */}
      <YStack padding="$4" borderBottomWidth={1} borderBottomColor={neutralScale.neutral2}>
        <XStack justifyContent="space-between" alignItems="center">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={neutralScale.neutral11} />
          </TouchableOpacity>
          <Text fontSize={18} fontWeight="700" color={neutralScale.neutral12}>
            我的徽章
          </Text>
          <YStack width={24} /> {/* 占位元素保持居中 */}
        </XStack>
      </YStack>

      {/* 徽章网格 - 修复 ScrollView flex 属性问题 */}
      <YStack flex={1}>
        <ScrollView style={{ flex: 1 } as ViewStyle} contentContainerStyle={{ padding: 16 }}>
          {badges.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" flex={1} padding="$8">
              <IconSymbol name="medal" size={48} color={neutralScale.neutral4} />
              <Text fontSize={16} color={neutralScale.neutral6} marginTop="$3">
                暂无徽章，快去获取吧！
              </Text>
            </YStack>
          ) : (
            <YStack gap="$4">
              {/* 已获得徽章 */}
              <Text fontSize={16} fontWeight="600" color={neutralScale.neutral11}>
                已获得 ({badges.filter((b) => b.earned).length})
              </Text>
              <YStack flexDirection="row" flexWrap="wrap" gap="$3">
                {badges
                  .filter((b) => b.earned)
                  .map((badge: UserBadge, index: number) => {
                    const config = getBadgeConfig(badge.badge.code);
                    if (!config) return null;
                    const rarityConfig = RARITY_CONFIGS[config.rarity];

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleBadgePress(badge)}
                        style={{ width: '30%' }}
                      >
                        <Card
                          backgroundColor="white"
                          borderRadius={12}
                          padding="$3"
                          alignItems="center"
                          gap="$2"
                          elevation={2}
                        >
                          <YStack
                            width={60}
                            height={60}
                            borderRadius={30}
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor={
                              badge.is_equipped ? `${config.color}30` : `${config.color}10`
                            }
                            borderWidth={badge.is_equipped ? 2 : 1}
                            borderColor={config.color}
                            shadowColor={rarityConfig?.glow || 'transparent'}
                            shadowOffset={{ width: 0, height: 0 }}
                            shadowOpacity={badge.is_equipped ? 0.5 : 0.2}
                            shadowRadius={8}
                          >
                            <IconSymbol name={config.icon as any} size={28} color={config.color} />
                          </YStack>
                          <Text
                            fontSize={12}
                            color={neutralScale.neutral10}
                            textAlign="center"
                            numberOfLines={1}
                          >
                            {config.name}
                          </Text>
                          {badge.is_equipped && (
                            <XStack
                              paddingHorizontal="$1.5"
                              paddingVertical="$0.5"
                              backgroundColor={config.color}
                              borderRadius={4}
                            >
                              <Text fontSize={10} color="white" fontWeight="600">
                                已装备
                              </Text>
                            </XStack>
                          )}
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
              </YStack>

              {/* 未获得徽章 */}
              <Text fontSize={16} fontWeight="600" color={neutralScale.neutral11} marginTop="$6">
                未获得
              </Text>
              <YStack flexDirection="row" flexWrap="wrap" gap="$3">
                {badges
                  .filter((b) => !b.earned)
                  .map((badge: UserBadge, index: number) => {
                    const config = getBadgeConfig(badge.badge.code);
                    if (!config) return null;

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleBadgePress(badge)}
                        style={{ width: '30%' }}
                      >
                        <Card
                          backgroundColor="white"
                          borderRadius={12}
                          padding="$3"
                          alignItems="center"
                          gap="$2"
                          elevation={1}
                          opacity={0.6}
                        >
                          <YStack
                            width={60}
                            height={60}
                            borderRadius={30}
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor={neutralScale.neutral2}
                            borderWidth={1}
                            borderColor={neutralScale.neutral4}
                          >
                            <IconSymbol
                              name={config.icon as any}
                              size={28}
                              color={neutralScale.neutral4}
                            />
                          </YStack>
                          <Text
                            fontSize={12}
                            color={neutralScale.neutral6}
                            textAlign="center"
                            numberOfLines={1}
                          >
                            {config.name}
                          </Text>
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
              </YStack>
            </YStack>
          )}
        </ScrollView>
      </YStack>

      {/* 徽章详情模态框 */}
      <BadgeDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        badge={selectedBadge ? getBadgeConfig(selectedBadge.badge.code) : null}
        isEquipped={selectedBadge?.is_equipped || false}
        progress={selectedBadge?.progress || 0}
        earnedAt={selectedBadge?.earned_at}
        onEquip={(code) => equipBadge(code)}
        onUnequip={() =>
          selectedBadge?.badge.code
            ? unequipBadge(selectedBadge.badge.code)
            : Promise.resolve(false)
        }
        loading={loading}
      />
    </YStack>
  );
}
