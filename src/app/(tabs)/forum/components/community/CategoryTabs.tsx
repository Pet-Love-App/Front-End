/**
 * CategoryTabs - 分类标签组件
 *
 * 水平滚动的分类选择器
 */

import React, { memo, useCallback, useRef } from 'react';
import { ScrollView, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { styled, XStack, Text } from 'tamagui';

export interface CategoryItem {
  id: string;
  label: string;
  icon?: string;
}

export interface CategoryTabsProps {
  categories: CategoryItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const TabButton = styled(XStack, {
  name: 'CategoryTab',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  borderRadius: 9999,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,

  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
      },
      false: {
        backgroundColor: 'transparent',
        borderColor: '$borderColor',
      },
    },
  } as const,

  defaultVariants: {
    active: false,
  },
});

const TabText = styled(Text, {
  name: 'CategoryTabText',
  fontSize: '$2',
  fontWeight: '500',

  variants: {
    active: {
      true: {
        color: '$primaryContrast',
      },
      false: {
        color: '$colorMuted',
      },
    },
  } as const,
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabItemProps {
  item: CategoryItem;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ item, isActive, onPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={animatedStyle}
    >
      <TabButton active={isActive}>
        {item.icon && <Text marginRight="$1">{item.icon}</Text>}
        <TabText active={isActive}>{item.label}</TabText>
      </TabButton>
    </AnimatedPressable>
  );
}

function CategoryTabsComponent({ categories, activeId, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<ScrollView>(null);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      {categories.map((item) => (
        <TabItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onPress={() => handleSelect(item.id)}
        />
      ))}
    </ScrollView>
  );
}

export const CategoryTabs = memo(CategoryTabsComponent);

// 默认分类
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'recommend', label: '推荐', icon: '✨' },
  { id: 'cats', label: '猫咪', icon: '🐱' },
  { id: 'dogs', label: '狗狗', icon: '🐕' },
  { id: 'nutrition', label: '营养', icon: '🥗' },
  { id: 'health', label: '健康', icon: '💊' },
  { id: 'funny', label: '搞笑', icon: '😂' },
];
