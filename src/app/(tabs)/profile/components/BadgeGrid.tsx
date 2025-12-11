/**
 * 勋章网格展示组件
 *
 * 显示用户已获得的勋章
 */
import { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BADGE_CONFIGS, RARITY_CONFIGS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';
import type { DbUserBadge } from '@/src/lib/supabase/types/database';

interface BadgeGridProps {
  badges: DbUserBadge[];
  onBadgePress?: (badge: DbUserBadge) => void;
  maxDisplay?: number;
}

export const BadgeGrid = memo(function BadgeGrid({
  badges,
  onBadgePress,
  maxDisplay,
}: BadgeGridProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  if (badges.length === 0) {
    return (
      <YStack
        padding="$6"
        alignItems="center"
        justifyContent="center"
        backgroundColor={neutralScale.neutral1}
        borderRadius={16}
        borderWidth={2}
        borderStyle="dashed"
        borderColor={neutralScale.neutral3}
      >
        <IconSymbol name="trophy" size={48} color={neutralScale.neutral5} />
        <Text fontSize={15} color={neutralScale.neutral9} marginTop="$3" textAlign="center">
          还没有获得任何勋章
        </Text>
        <Text fontSize={13} color={neutralScale.neutral7} marginTop="$1" textAlign="center">
          完善资料、发表评论即可获得
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <XStack flexWrap="wrap" gap="$3">
        {displayBadges.map((userBadge) => {
          const badgeConfig = userBadge.badge?.code ? BADGE_CONFIGS[userBadge.badge.code] : null;

          if (!badgeConfig) return null;

          const rarityConfig = RARITY_CONFIGS[badgeConfig.rarity];

          return (
            <TouchableOpacity
              key={userBadge.id}
              activeOpacity={0.7}
              onPress={() => onBadgePress?.(userBadge)}
              style={styles.badgeContainer}
            >
              <YStack alignItems="center" gap="$2">
                {/* 勋章图标 */}
                <YStack
                  position="relative"
                  width={72}
                  height={72}
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* 光晕效果 */}
                  <YStack
                    position="absolute"
                    width={72}
                    height={72}
                    borderRadius={36}
                    style={{
                      backgroundColor: rarityConfig.glow,
                    }}
                  />

                  {/* 勋章主体 */}
                  <YStack
                    width={64}
                    height={64}
                    borderRadius={32}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={3}
                    borderColor="white"
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
                          width: 58,
                          height: 58,
                          borderRadius: 29,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconSymbol name={badgeConfig.icon as any} size={32} color="white" />
                      </LinearGradient>
                    ) : (
                      <IconSymbol
                        name={badgeConfig.icon as any}
                        size={32}
                        color={badgeConfig.color}
                      />
                    )}
                  </YStack>

                  {/* 已装备标记 */}
                  {userBadge.is_equipped && (
                    <YStack
                      position="absolute"
                      top={-2}
                      right={-2}
                      width={20}
                      height={20}
                      borderRadius={10}
                      backgroundColor={badgeConfig.color}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={2}
                      borderColor="white"
                    >
                      <IconSymbol name="checkmark" size={10} color="white" />
                    </YStack>
                  )}
                </YStack>

                {/* 勋章名称 */}
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color={neutralScale.neutral11}
                  textAlign="center"
                  numberOfLines={1}
                  style={{ maxWidth: 72 }}
                >
                  {badgeConfig.name}
                </Text>
              </YStack>
            </TouchableOpacity>
          );
        })}

        {/* 更多徽章提示 */}
        {remainingCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onBadgePress?.(badges[0])}
            style={styles.badgeContainer}
          >
            <YStack alignItems="center" gap="$2">
              <YStack
                width={64}
                height={64}
                borderRadius={32}
                alignItems="center"
                justifyContent="center"
                backgroundColor={neutralScale.neutral2}
                borderWidth={2}
                borderStyle="dashed"
                borderColor={neutralScale.neutral4}
              >
                <Text fontSize={20} fontWeight="700" color={neutralScale.neutral8}>
                  +{remainingCount}
                </Text>
              </YStack>
              <Text fontSize={12} fontWeight="600" color={neutralScale.neutral9} textAlign="center">
                更多
              </Text>
            </YStack>
          </TouchableOpacity>
        )}
      </XStack>
    </YStack>
  );
});

const styles = StyleSheet.create({
  badgeContainer: {
    width: 72,
  },
});
