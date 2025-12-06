/**
 * 论坛头部组件
 * 包含标题、标签页切换和标签筛选
 * 性能优化：使用 React.memo 避免不必要的重新渲染
 */

import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, XStack, YStack } from 'tamagui';

import { Colors } from '@/src/constants/colors';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';

import { ForumColors } from '../constants';
import { TagFilter } from './TagFilter';

export type ForumTab = 'square' | 'favorites' | 'messages';

interface ForumHeaderProps {
  activeTab: ForumTab;
  onTabChange: (tab: ForumTab) => void;
  onCreatePost: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onHeightChange?: (height: number) => void;
}

export const ForumHeader = React.memo(function ForumHeader({
  activeTab,
  onTabChange,
  onCreatePost,
  selectedTags,
  onTagsChange,
  onHeightChange,
}: ForumHeaderProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <YStack
      onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
      paddingTop={insets.top}
      backgroundColor="#fff"
      borderBottomWidth={1}
      borderColor="#E5E7EB"
      zIndex={100}
    >
      <XStack height={1} backgroundColor="#D8C8BD" />

      <YStack padding="$3" gap="$3">
        {/* 标题和发帖按钮 */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$7" fontWeight="700" color={ForumColors.clay}>
            论坛
          </Text>
          <Button
            size="$3"
            onPress={onCreatePost}
            backgroundColor={ForumColors.clay}
            color={colors.buttonPrimaryText}
            pressStyle={{ opacity: 0.85 }}
          >
            发帖
          </Button>
        </XStack>

        {/* 标签页切换 */}
        <XStack
          gap="$3"
          justifyContent="space-around"
          backgroundColor={ForumColors.peach}
          borderRadius="$4"
          padding="$2"
        >
          <TabButton
            active={activeTab === 'square'}
            onPress={() => onTabChange('square')}
            label="广场"
          />
          <TabButton
            active={activeTab === 'favorites'}
            onPress={() => onTabChange('favorites')}
            label="我的收藏"
          />
          <TabButton
            active={activeTab === 'messages'}
            onPress={() => onTabChange('messages')}
            label="消息"
          />
        </XStack>

        {/* 标签筛选 */}
        {activeTab === 'square' && (
          <TagFilter selectedTags={selectedTags} onTagsChange={onTagsChange} />
        )}
      </YStack>
    </YStack>
  );
});

interface TabButtonProps {
  active: boolean;
  onPress: () => void;
  label: string;
}

const TabButton = React.memo(function TabButton({ active, onPress, label }: TabButtonProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Button
      size="$3"
      onPress={onPress}
      backgroundColor={active ? ForumColors.clay : '#F5F5F5'}
      color={active ? colors.buttonPrimaryText : ForumColors.darkText}
      flex={1}
    >
      {label}
    </Button>
  );
});
