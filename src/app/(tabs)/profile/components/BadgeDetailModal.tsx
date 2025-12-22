/**
 * 勋章详情弹窗
 *
 * 显示勋章的详细信息、获取条件等
 */
import { memo } from 'react';
import { Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack, Separator } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BADGE_CONFIGS, RARITY_CONFIGS } from '@/src/constants/badges';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
import type { DbUserBadge } from '@/src/lib/supabase/types/database';

interface BadgeDetailModalProps {
  visible: boolean;
  badge: DbUserBadge | null;
  onClose: () => void;
  onEquip?: (badgeId: number) => void;
  onUnequip?: (badgeId: number) => void;
}

export const BadgeDetailModal = memo(function BadgeDetailModal({
  visible,
  badge,
  onClose,
  onEquip,
  onUnequip,
}: BadgeDetailModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  if (!badge || !badge.badge?.code) return null;

  const badgeConfig = BADGE_CONFIGS[badge.badge.code];
  if (!badgeConfig) return null;

  const rarityConfig = RARITY_CONFIGS[badgeConfig.rarity];
  const acquiredDate = new Date(badge.acquired_at).toLocaleDateString('zh-CN');

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.contentContainer}>
          <Card
            backgroundColor={colors.cardBackground as any}
            borderRadius={24}
            padding="$5"
            width="90%"
            maxWidth={400}
            maxHeight="85%"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4">
                {/* 关闭按钮 */}
                <XStack justifyContent="flex-end">
                  <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                    <YStack
                      width={32}
                      height={32}
                      borderRadius={16}
                      backgroundColor={colors.backgroundMuted as any}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
                    </YStack>
                  </TouchableOpacity>
                </XStack>

                {/* 勋章展示 */}
                <YStack alignItems="center" gap="$3">
                  {/* 勋章图标 */}
                  <YStack
                    position="relative"
                    width={120}
                    height={120}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {/* 光晕效果 */}
                    <YStack
                      position="absolute"
                      width={120}
                      height={120}
                      borderRadius={60}
                      style={{
                        backgroundColor: rarityConfig.glow,
                      }}
                    />

                    {/* 勋章主体 */}
                    <YStack
                      width={100}
                      height={100}
                      borderRadius={50}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={4}
                      borderColor={colors.cardBackground as any}
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
                            width: 92,
                            height: 92,
                            borderRadius: 46,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconSymbol name={badgeConfig.icon as any} size={50} color="white" />
                        </LinearGradient>
                      ) : (
                        <IconSymbol
                          name={badgeConfig.icon as any}
                          size={50}
                          color={badgeConfig.color}
                        />
                      )}
                    </YStack>

                    {/* 已装备标记 */}
                    {badge.is_equipped && (
                      <YStack
                        position="absolute"
                        top={8}
                        right={8}
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius={12}
                        backgroundColor={badgeConfig.color as any}
                        borderWidth={2}
                        borderColor={colors.cardBackground as any}
                      >
                        <Text fontSize={10} fontWeight="700" color="white">
                          已装备
                        </Text>
                      </YStack>
                    )}
                  </YStack>

                  {/* 勋章名称 */}
                  <YStack alignItems="center" gap="$1">
                    <Text fontSize={24} fontWeight="800" color={colors.text as any}>
                      {badgeConfig.name}
                    </Text>
                    <XStack
                      alignItems="center"
                      gap="$1.5"
                      paddingHorizontal="$2.5"
                      paddingVertical="$1"
                      backgroundColor={(rarityConfig.color + '20') as any}
                      borderRadius={8}
                    >
                      <IconSymbol name="sparkles" size={12} color={rarityConfig.color} />
                      <Text fontSize={12} fontWeight="700" color={rarityConfig.color as any}>
                        {rarityConfig.name}
                      </Text>
                    </XStack>
                  </YStack>
                </YStack>

                <Separator borderColor={colors.borderMuted as any} />

                {/* 勋章描述 */}
                <YStack gap="$2">
                  <Text fontSize={14} fontWeight="600" color={colors.text as any}>
                    描述
                  </Text>
                  <Text fontSize={14} color={colors.textSecondary as any} lineHeight={20}>
                    {badgeConfig.description}
                  </Text>
                </YStack>

                {/* 获取条件 */}
                {badgeConfig.requirement && (
                  <YStack gap="$2">
                    <Text fontSize={14} fontWeight="600" color={colors.text as any}>
                      获取条件
                    </Text>
                    <YStack
                      backgroundColor={(badgeConfig.color + '10') as any}
                      padding="$3"
                      borderRadius={12}
                      borderWidth={1}
                      borderColor={(badgeConfig.color + '30') as any}
                    >
                      <XStack alignItems="center" gap="$2">
                        <IconSymbol name="info.circle.fill" size={16} color={badgeConfig.color} />
                        <Text
                          fontSize={13}
                          color={colors.textSecondary as any}
                          lineHeight={18}
                          flex={1}
                        >
                          {badgeConfig.requirement}
                        </Text>
                      </XStack>
                    </YStack>
                  </YStack>
                )}

                {/* 获取时间 */}
                <YStack gap="$2">
                  <Text fontSize={14} fontWeight="600" color={colors.text as any}>
                    获得时间
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="calendar" size={16} color={colors.textTertiary} />
                    <Text fontSize={14} color={colors.textSecondary as any}>
                      {acquiredDate}
                    </Text>
                  </XStack>
                </YStack>

                {/* 操作按钮 */}
                <YStack gap="$2" marginTop="$2">
                  {badge.is_equipped ? (
                    <Button
                      size="lg"
                      variant="outline"
                      onPress={() => onUnequip?.(badge.badge_id)}
                      leftIcon={
                        <IconSymbol name="minus.circle" size={20} color={badgeConfig.color} />
                      }
                    >
                      <Text fontSize={15} fontWeight="600" color={badgeConfig.color as any}>
                        取消装备
                      </Text>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="primary"
                      backgroundColor={badgeConfig.color as any}
                      onPress={() => onEquip?.(badge.badge_id)}
                      leftIcon={<IconSymbol name="checkmark.circle" size={20} color="white" />}
                    >
                      <Text fontSize={15} fontWeight="600" color="white">
                        装备勋章
                      </Text>
                    </Button>
                  )}

                  <Button
                    size="md"
                    variant="ghost"
                    color={colors.textSecondary as any}
                    onPress={onClose}
                  >
                    关闭
                  </Button>
                </YStack>
              </YStack>
            </ScrollView>
          </Card>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
