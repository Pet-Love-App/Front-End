// src/app/(tabs)/profile/components/BadgeDetailModal.tsx
import { memo } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack, ScrollView, Button, Progress } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { BadgeConfig } from '@/src/constants/badges';
import { RARITY_CONFIGS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';

// Props类型
interface BadgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeConfig | null;
  isEquipped: boolean;
  progress: number;
  earnedAt?: string;
  onEquip: (badgeCode: string) => Promise<boolean>;
  onUnequip: () => Promise<boolean>;
  loading: boolean;
}

// 自定义图标按钮组件
const IconButton = ({
  icon,
  onPress,
  size = 36,
  borderRadius = 18,
  backgroundColor,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  borderRadius?: number;
  backgroundColor?: string;
}) => (
  <TouchableOpacity onPress={onPress}>
    <YStack
      width={size}
      height={size}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      alignItems="center"
      justifyContent="center"
    >
      {icon}
    </YStack>
  </TouchableOpacity>
);

export const BadgeDetailModal = memo(
  ({
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
    if (!badge) return null;

    const rarityConfig = RARITY_CONFIGS[badge.rarity];

    // 格式化时间
    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    return (
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Card
          backgroundColor="white"
          borderRadius={24}
          padding="$0"
          bordered={false}
          flex={1}
          elevation={8}
        >
          {/* 头部 */}
          <YStack
            paddingHorizontal="$5"
            paddingTop="$5"
            paddingBottom="$4"
            borderBottomWidth={1}
            borderBottomColor={neutralScale.neutral2}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={20} fontWeight="800" color={neutralScale.neutral12}>
                徽章详情
              </Text>
              <IconButton
                icon={<IconSymbol name="xmark" size={20} color={neutralScale.neutral10} />}
                onPress={onClose}
                size={36}
                borderRadius={18}
                backgroundColor={neutralScale.neutral1}
              />
            </XStack>

            {/* 徽章主展示 */}
            <YStack alignItems="center" justifyContent="center" paddingVertical="$6" gap="$3">
              <YStack
                width={80}
                height={80}
                borderRadius={40}
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: badge.gradient ? 'transparent' : `${badge.color}20`,
                  shadowColor: rarityConfig.glow,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                {badge.gradient ? (
                  <LinearGradient
                    colors={badge.gradient as [string, string]}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name={badge.icon as any} size={40} color="white" />
                  </LinearGradient>
                ) : (
                  <IconSymbol name={badge.icon as any} size={40} color={badge.color} />
                )}
              </YStack>

              <YStack alignItems="center" gap="$1">
                <Text fontSize={22} fontWeight="800" color={badge.color}>
                  {badge.name}
                </Text>
                <XStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={rarityConfig.bg}
                  borderRadius={8}
                >
                  <Text fontSize={11} fontWeight="600" color={rarityConfig.text}>
                    {rarityConfig.label}
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          </YStack>

          {/* 主体内容 */}
          <ScrollView
            flex={1}
            paddingHorizontal="$5"
            paddingVertical="$4"
            showsVerticalScrollIndicator={false}
          >
            <YStack gap="$5">
              {/* 徽章说明 */}
              <YStack gap="$2">
                <Text fontSize={15} fontWeight="700" color={neutralScale.neutral11}>
                  徽章说明
                </Text>
                <Text fontSize={14} color={neutralScale.neutral9} lineHeight={20}>
                  {badge.description || '暂无描述'}
                </Text>
              </YStack>

              {/* 获取条件 */}
              <YStack gap="$2">
                <Text fontSize={15} fontWeight="700" color={neutralScale.neutral11}>
                  获取条件
                </Text>
                <Card backgroundColor={neutralScale.neutral1} borderRadius={12} padding="$3">
                  <Text fontSize={14} color={neutralScale.neutral10} lineHeight={20}>
                    {badge.requirement || '暂无获取条件'}
                  </Text>
                </Card>
              </YStack>

              {/* 进度/获取时间 */}
              {earnedAt ? (
                <YStack gap="$2">
                  <Text fontSize={15} fontWeight="700" color={neutralScale.neutral11}>
                    获取时间
                  </Text>
                  <XStack
                    alignItems="center"
                    gap="$2"
                    padding="$3"
                    backgroundColor={neutralScale.neutral1}
                    borderRadius={12}
                  >
                    <IconSymbol name="calendar" size={16} color="#10B981" />
                    <Text fontSize={14} color={neutralScale.neutral10}>
                      {formatDate(earnedAt)}
                    </Text>
                  </XStack>
                </YStack>
              ) : (
                <YStack gap="$2">
                  <Text fontSize={15} fontWeight="700" color={neutralScale.neutral11}>
                    完成进度
                  </Text>
                  <YStack gap="$1.5">
                    <XStack justifyContent="space-between">
                      <Text fontSize={13} color={neutralScale.neutral9}>
                        当前进度
                      </Text>
                      <Text fontSize={13} fontWeight="600" color={badge.color}>
                        {Math.round(progress)}%
                      </Text>
                    </XStack>
                    <Progress value={progress} max={100}>
                      <Progress.Indicator animation="bouncy" backgroundColor={badge.color} />
                    </Progress>
                  </YStack>
                </YStack>
              )}

              {/* 徽章权益 */}
              {badge.benefits && badge.benefits.length > 0 && (
                <YStack gap="$2">
                  <Text fontSize={15} fontWeight="700" color={neutralScale.neutral11}>
                    徽章权益
                  </Text>
                  <Card backgroundColor={neutralScale.neutral1} borderRadius={12} padding="$3">
                    <YStack gap="$2">
                      {badge.benefits.map((benefit, idx) => (
                        <XStack key={idx} gap="$2" alignItems="flex-start">
                          <IconSymbol
                            name="star.fill"
                            size={14}
                            color="#F59E0B"
                            style={{ marginTop: 2 }}
                          />
                          <Text fontSize={14} color={neutralScale.neutral10} flex={1}>
                            {benefit}
                          </Text>
                        </XStack>
                      ))}
                    </YStack>
                  </Card>
                </YStack>
              )}
            </YStack>
          </ScrollView>

          {/* 底部操作按钮 */}
          <YStack
            paddingHorizontal="$5"
            paddingVertical="$4"
            borderTopWidth={1}
            borderTopColor={neutralScale.neutral2}
          >
            {earnedAt ? (
              isEquipped ? (
                <Button
                  backgroundColor={neutralScale.neutral2}
                  color={neutralScale.neutral11}
                  onPress={onUnequip}
                  borderRadius={12}
                  height={48}
                  fontSize={16}
                  fontWeight="600"
                  disabled={loading}
                >
                  卸下徽章
                </Button>
              ) : (
                <Button
                  backgroundColor={badge.color}
                  color="white"
                  onPress={() => onEquip(badge.code)}
                  borderRadius={12}
                  height={48}
                  fontSize={16}
                  fontWeight="600"
                  disabled={loading}
                  pressStyle={{
                    opacity: 0.8,
                  }}
                >
                  装备徽章
                </Button>
              )
            ) : (
              <Button
                backgroundColor={neutralScale.neutral2}
                color={neutralScale.neutral8}
                disabled
                borderRadius={12}
                height={48}
                fontSize={16}
                fontWeight="600"
              >
                完成条件后可装备
              </Button>
            )}
          </YStack>
        </Card>
      </Modal>
    );
  }
);

export default BadgeDetailModal;
