import { ThemedText } from '@/src/components/themed-text';
import { Colors } from '@/src/constants/theme';
import { CatFoodCollectItem } from '@/src/types/collect';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
    ViewStyle,
} from 'react-native';

export interface CollectCardProps {
  /** 标签1 */
  tag1: string;
  /** 标签2 */
  tag2: string;
  /** 猫粮名称 */
  name: string;
  /** 猫粮简介 */
  description: string;
  /** 收藏人数 */
  collectCount: number;
  /** 点击卡片时的回调 */
  onPress?: () => void;
  /** 长按卡片时的回调 */
  onLongPress?: () => void;
  /** 自定义样式 */
  style?: ViewStyle;
}

/**
 * 从 CatFoodCollectItem 创建 CollectCardProps
 */
export type CollectCardPropsFromItem = Omit<CatFoodCollectItem, 'id' | 'collectTime' | 'imageUrl' | 'brand' | 'price' | 'rating'> & {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
};

/**
 * 收藏卡片组件
 * 
 * 用于展示收藏的猫粮信息，包含标签、名称、简介和收藏人数
 * 
 * @example
 * ```tsx
 * <CollectCard
 *   tag1="成猫粮"
 *   tag2="高蛋白"
 *   name="皇家猫粮"
 *   description="专为成年猫设计的营养配方"
 *   collectCount={1234}
 *   onPress={() => console.log('点击了卡片')}
 * />
 * ```
 */
export function CollectCard({
  tag1,
  tag2,
  name,
  description,
  collectCount,
  onPress,
  onLongPress,
  style,
}: CollectCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isPressed, setIsPressed] = React.useState(false);

  const cardBackgroundColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const shadowColor = isDark ? '#000000' : '#000000';
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const tagBackgroundColor = isDark ? '#2A2A2A' : '#FFF5E6';
  const tagTextColor = isDark ? '#FFB366' : '#FF8C42';
  const descriptionColor = isDark ? '#B0B0B0' : '#666666';
  const collectIconColor = isDark ? '#FFB366' : '#FF6B6B';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.card,
        {
          backgroundColor: cardBackgroundColor,
          shadowColor,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {/* 标签区域 */}
      <View style={styles.tagsContainer}>
        <View style={[styles.tag, { backgroundColor: tagBackgroundColor }]}>
          <ThemedText style={[styles.tagText, { color: tagTextColor }]}>
            {tag1}
          </ThemedText>
        </View>
        <View style={[styles.tag, { backgroundColor: tagBackgroundColor }]}>
          <ThemedText style={[styles.tagText, { color: tagTextColor }]}>
            {tag2}
          </ThemedText>
        </View>
      </View>

      {/* 猫粮名称 */}
      <ThemedText style={[styles.name, { color: textColor }]}>
        {name}
      </ThemedText>

      {/* 猫粮简介 */}
      <ThemedText
        style={[styles.description, { color: descriptionColor }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {description}
      </ThemedText>

      {/* 收藏人数 */}
      <View style={styles.collectContainer}>
        <ThemedText style={[styles.collectIcon, { color: collectIconColor }]}>
          ❤️
        </ThemedText>
        <ThemedText style={[styles.collectText, { color: descriptionColor }]}>
          {formatCollectCount(collectCount)} 人收藏
        </ThemedText>
      </View>
    </Pressable>
  );
}

/**
 * 格式化收藏人数
 * 1000以下显示原数字
 * 1000-9999显示 1.2K 格式
 * 10000以上显示 1.2W 格式
 */
function formatCollectCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 10000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return (count / 10000).toFixed(1) + 'W';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  collectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  collectIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  collectText: {
    fontSize: 13,
  },
});
