/**
 * CategoryTabs - 分类标签组件
 *
 * 水平滚动的分类选择器
 * 设计风格：胶囊形状，带有平滑动画和微交互
 */

import React, { memo, useCallback, useRef } from 'react';
import { ScrollView, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { styled, XStack, Text, Stack, useTheme } from 'tamagui';

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

const TabButton = styled(Stack, {
  name: 'CategoryTab',
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

const TabContent = styled(XStack, {
  name: 'TabContent',
  alignItems: 'center',
  gap: 6,
});

const TabText = styled(Text, {
  name: 'CategoryTabText',
  fontSize: 14,
  fontWeight: '600',
  letterSpacing: -0.2,
});

const TabIcon = styled(Text, {
  name: 'TabIcon',
  fontSize: 14,
});

const AnimatedTabButton = Animated.createAnimatedComponent(TabButton);
const AnimatedTabText = Animated.createAnimatedComponent(TabText);

interface TabItemProps {
  item: CategoryItem;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ item, isActive, onPress }: TabItemProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const activeProgress = useDerivedValue(() => {
    return withSpring(isActive ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [isActive]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ['transparent', theme.primary?.val || '#7FB093']
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeProgress.value,
      [0, 1],
      [theme.colorMuted?.val || '#6C6A66', '#FFFFFF']
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <AnimatedTabButton style={containerStyle}>
        <TabContent>
          {item.icon && <TabIcon>{item.icon}</TabIcon>}
          <AnimatedTabText style={textStyle}>{item.label}</AnimatedTabText>
        </TabContent>
      </AnimatedTabButton>
    </Pressable>
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
        paddingVertical: 8,
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
