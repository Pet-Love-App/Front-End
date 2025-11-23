import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';
import { memo, useCallback, useState } from 'react';
import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

/**
 * 宠物信息面板组件的 Props 接口
 */
interface PetInfoPanelProps {
  /** 宠物数据 */
  pet: Pet;
}

/**
 * Tab 配置常量
 * 使用 as const 确保类型安全
 */
const TABS = [
  { key: 'info', label: '基本信息', icon: 'info.circle.fill' },
  { key: 'health', label: '健康档案', icon: 'heart.fill' },
  { key: 'activity', label: '活动记录', icon: 'chart.bar.fill' },
] as const;

/** Tab 键类型 */
type TabKey = (typeof TABS)[number]['key'];

/**
 * 信息行组件 - 用于显示键值对信息
 */
interface InfoRowProps {
  label: string;
  value: string;
  colors: typeof Colors.light;
}

const InfoRow = memo(function InfoRow({ label, value, colors }: InfoRowProps) {
  return (
    <XStack justifyContent="space-between" paddingVertical="$2.5" paddingHorizontal="$1">
      <Text fontSize={14} color={colors.icon}>
        {label}
      </Text>
      <Text fontSize={14} fontWeight="600" color={colors.text}>
        {value}
      </Text>
    </XStack>
  );
});

/**
 * 空状态组件 - 用于显示功能即将上线的提示
 */
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  colors: typeof Colors.light;
}

const EmptyState = memo(function EmptyState({ icon, title, description, colors }: EmptyStateProps) {
  return (
    <YStack gap="$3" alignItems="center" justifyContent="center" minHeight={180} padding="$4">
      <YStack
        width={80}
        height={80}
        borderRadius="$12"
        backgroundColor="$gray2"
        alignItems="center"
        justifyContent="center"
      >
        <IconSymbol name={icon as any} size={40} color={colors.icon + '60'} />
      </YStack>
      <YStack gap="$2" alignItems="center">
        <Text fontSize={16} fontWeight="600" color={colors.text} textAlign="center">
          {title}
        </Text>
        <Text fontSize={14} color={colors.icon} textAlign="center" maxWidth={250}>
          {description}
        </Text>
      </YStack>
    </YStack>
  );
});

/**
 * 宠物信息面板组件
 *
 * 功能：
 * - 展示宠物的头像和基本信息
 * - 提供多个 Tab 切换查看不同类型的信息
 * - 支持主题切换
 *
 * @component
 * @example
 * ```tsx
 * <PetInfoPanel pet={selectedPet} />
 * ```
 */
export const PetInfoPanel = memo(function PetInfoPanel({ pet }: PetInfoPanelProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  /**
   * 处理 Tab 切换
   * 使用 useCallback 避免不必要的重渲染
   */
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  return (
    <YStack width="90%" marginTop="$4" gap="$3">
      {/* Pet Header Card */}
      <Card
        padding="$4"
        backgroundColor={colors.background}
        borderWidth={1}
        borderColor={colors.icon + '15'}
        borderRadius="$4"
      >
        <XStack gap="$4" alignItems="center">
          {/* Pet Photo */}
          {pet.photo ? (
            <YStack width={80} height={80} borderRadius="$4" overflow="hidden" borderWidth={0}>
              <Image
                source={{ uri: pet.photo }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </YStack>
          ) : (
            <YStack
              width={80}
              height={80}
              borderRadius="$4"
              backgroundColor="$orange3"
              alignItems="center"
              justifyContent="center"
              borderWidth={0}
            >
              <Text fontSize={48}>🐱</Text>
            </YStack>
          )}

          {/* Pet Basic Info */}
          <YStack flex={1} gap="$1.5">
            <Text fontSize={20} fontWeight="700" color={colors.text}>
              {pet.name}
            </Text>
            <XStack gap="$2" alignItems="center" flexWrap="wrap">
              <XStack
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                backgroundColor="#FEF3E8"
                borderRadius="$2"
              >
                <Text fontSize={13} fontWeight="600" color="#D97706">
                  {pet.species_display ?? pet.species}
                </Text>
              </XStack>
              {pet.breed && (
                <Text fontSize={14} color={colors.icon}>
                  {pet.breed}
                </Text>
              )}
              {pet.age != null && (
                <>
                  <Text fontSize={14} color={colors.icon + '60'}>
                    •
                  </Text>
                  <Text fontSize={14} color={colors.icon}>
                    {pet.age}岁
                  </Text>
                </>
              )}
            </XStack>
          </YStack>
        </XStack>
      </Card>

      {/* Divider */}
      <YStack width="100%" alignItems="center" paddingVertical="$2">
        <YStack width="90%" height={1} backgroundColor={colors.icon + '15'} />
      </YStack>

      {/* Tab Navigation */}
      <XStack gap="$2" paddingHorizontal="$1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <YStack
              key={tab.key}
              flex={1}
              paddingVertical="$3"
              borderRadius="$3"
              backgroundColor={isActive ? '#FEBE98' : '$gray3'}
              alignItems="center"
              justifyContent="center"
              pressStyle={{ scale: 0.97, opacity: 0.8 }}
              onPress={() => handleTabChange(tab.key)}
              cursor="pointer"
              gap="$1"
              animation="quick"
            >
              <IconSymbol
                name={tab.icon as any}
                size={20}
                color={isActive ? 'white' : colors.icon}
              />
              <Text fontSize={13} fontWeight="600" color={isActive ? 'white' : colors.text}>
                {tab.label}
              </Text>
            </YStack>
          );
        })}
      </XStack>

      {/* Tab Content */}
      <Card
        padding="$4"
        backgroundColor={colors.background}
        borderWidth={1}
        borderColor={colors.icon + '20'}
        borderRadius="$4"
        minHeight={200}
      >
        {activeTab === 'info' && (
          <YStack gap="$4">
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="info.circle.fill" size={20} color="#FEBE98" />
              <Text fontSize={16} fontWeight="700" color={colors.text}>
                基本信息
              </Text>
            </XStack>

            {pet.description && (
              <>
                <YStack gap="$2.5">
                  <Text fontSize={14} fontWeight="600" color={colors.icon}>
                    📝 描述
                  </Text>
                  <YStack
                    padding="$3"
                    backgroundColor="$gray2"
                    borderRadius="$3"
                    borderLeftWidth={3}
                    borderLeftColor={colors.icon + '30'}
                  >
                    <Text fontSize={14} color={colors.text} lineHeight={22}>
                      {pet.description}
                    </Text>
                  </YStack>
                </YStack>
                <YStack height={1} backgroundColor={colors.icon + '20'} marginVertical="$2" />
              </>
            )}

            <YStack gap="$1">
              <InfoRow
                label="宠物类型"
                value={pet.species_display ?? pet.species}
                colors={colors}
              />
              <YStack height={1} backgroundColor={colors.icon + '15'} />

              {pet.breed && (
                <>
                  <InfoRow label="品种" value={pet.breed} colors={colors} />
                  <YStack height={1} backgroundColor={colors.icon + '15'} />
                </>
              )}

              {pet.age != null && <InfoRow label="年龄" value={`${pet.age}岁`} colors={colors} />}
            </YStack>
          </YStack>
        )}

        {activeTab === 'health' && (
          <EmptyState
            icon="heart.fill"
            title="健康档案功能即将上线"
            description="记录疫苗接种、体检报告、用药记录等健康信息"
            colors={colors}
          />
        )}

        {activeTab === 'activity' && (
          <EmptyState
            icon="chart.bar.fill"
            title="活动记录功能即将上线"
            description="追踪运动量、饮食习惯、体重变化等活动数据"
            colors={colors}
          />
        )}
      </Card>
    </YStack>
  );
});
