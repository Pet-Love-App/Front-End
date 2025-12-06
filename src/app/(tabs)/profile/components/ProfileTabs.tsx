import { memo, useCallback, useState } from 'react';
import { Dimensions } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';

import { CommentsTab } from './tabs/CommentsTab';
import { LikesTab } from './tabs/LikesTab';
import { PetsTab } from './tabs/PetsTab';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Tab 配置
 */
const TABS = [
  { key: 'pets', label: '宠物', icon: 'pawprint.fill' },
  { key: 'comments', label: '评论', icon: 'bubble.left.and.bubble.right.fill' },
  { key: 'likes', label: '点赞', icon: 'heart.fill' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Profile Tabs 组件的 Props
 */
interface ProfileTabsProps {
  /** 宠物列表 */
  pets?: Pet[];
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 添加宠物回调 */
  onAddPet: () => void;
}

/**
 * Profile Tabs 组件
 *
 * 功能：
 * - 三个主要 Tab：宠物、评论、点赞
 * - 每个 Tab 有独立的内容区域
 * - 支持切换动画和状态管理
 *
 * @component
 * @example
 * ```tsx
 * <ProfileTabs
 *   pets={user?.pets}
 *   isLoading={isLoading}
 *   onAddPet={handleAddPet}
 * />
 * ```
 */
export const ProfileTabs = memo(function ProfileTabs({
  pets = [],
  isLoading = false,
  onAddPet,
}: ProfileTabsProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabKey>('pets');

  /**
   * 切换 Tab
   */
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  return (
    <YStack width="100%" flex={1}>
      {/* Tab 导航栏 */}
      <XStack
        width="100%"
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom="$2"
        backgroundColor={colors.background}
        borderBottomWidth={1}
        borderBottomColor={colors.icon + '10'}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <YStack
              key={tab.key}
              flex={1}
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={3}
              borderBottomColor={isActive ? '#FEBE98' : 'transparent'}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => handleTabChange(tab.key)}
              cursor="pointer"
            >
              <XStack gap="$2" alignItems="center">
                <IconSymbol
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? '#FEBE98' : colors.icon}
                />
                <Text
                  fontSize={15}
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? '#FEBE98' : colors.text}
                >
                  {tab.label}
                </Text>
              </XStack>
            </YStack>
          );
        })}
      </XStack>

      {/* Tab 内容区域 */}
      <YStack flex={1} width="100%">
        {activeTab === 'pets' && <PetsTab pets={pets} isLoading={isLoading} onAddPet={onAddPet} />}
        {activeTab === 'comments' && <CommentsTab />}
        {activeTab === 'likes' && <LikesTab />}
      </YStack>
    </YStack>
  );
});
