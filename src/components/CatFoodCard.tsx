import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { CatFood } from '@/src/types/catFood';
import React from 'react';
import { Image } from 'react-native';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';

interface CatFoodCardProps {
  /** 猫粮数据 */
  catfood: CatFood;
  /** 索引（用于排名显示） */
  index?: number;
  /** 点击回调 */
  onPress?: (catfood: CatFood) => void;
  /** 图片点击回调 */
  onImagePress?: (imageUrl: string) => void;
  /** 是否显示排名徽章 */
  showRank?: boolean;
  /** 是否显示营养信息 */
  showNutritionInfo?: boolean;
}

/**
 * 猫粮卡片组件
 * 用于在列表中展示单个猫粮的信息
 */
export const CatFoodCard: React.FC<CatFoodCardProps> = ({
  catfood,
  index = 0,
  onPress,
  onImagePress,
  showRank = true,
  showNutritionInfo = true,
}) => {
  const handlePress = () => {
    onPress?.(catfood);
  };

  const handleImagePress = (e: any) => {
    // 阻止事件冒泡，避免触发卡片的 onPress
    e.stopPropagation();
    if (catfood.imageUrl && onImagePress) {
      onImagePress(catfood.imageUrl);
    }
  };

  // 获取排名徽章背景色
  const getRankBadgeColor = (rank: number) => {
    if (rank === 0) return '$yellow9'; // 第1名 - 金色
    if (rank === 1) return '$gray5'; // 第2名 - 银色
    if (rank === 2) return '$orange9'; // 第3名 - 铜色
    return '$gray5'; // 其他 - 灰色
  };

  // 获取排名徽章文字颜色
  const getRankTextColor = (rank: number) => {
    return rank < 3 ? '$yellow1' : '$gray11';
  };

  return (
    <Card
      elevate
      size="$3"
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      marginHorizontal="$1"
      marginBottom="$0"
      onPress={handlePress}
    >
      <Card.Header padded>
        <XStack gap="$3" alignItems="center">
          {/* 排名徽章 */}
          {showRank && (
            <YStack
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              backgroundColor={getRankBadgeColor(index)}
              borderRadius="$10"
            >
              <Text fontSize="$6" fontWeight="bold" color={getRankTextColor(index)}>
                {index + 1}
              </Text>
            </YStack>
          )}

          {/* 猫粮图片 */}
          {catfood.imageUrl ? (
            <YStack
              onPress={handleImagePress}
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              pressStyle={{ opacity: 0.6 }}
            >
              <Image
                source={{ uri: catfood.imageUrl }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                }}
              />
            </YStack>
          ) : (
            <YStack
              width={80}
              height={80}
              backgroundColor="$gray3"
              borderRadius="$3"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="$gray9" fontSize="$2">
                无图片
              </Text>
            </YStack>
          )}

          {/* 猫粮信息 */}
          <YStack flex={1} gap="$2">
            {/* 名称 */}
            <Text fontSize="$5" fontWeight="bold" numberOfLines={2}>
              {catfood.name}
            </Text>

            {/* 品牌 */}
            <XStack alignItems="center" gap="$2">
              <Text fontSize="$3" color="$gray10">
                {catfood.brand || '未知品牌'}
              </Text>
            </XStack>

            {/* 评分和点赞 */}
            <XStack alignItems="center" gap="$3" flexWrap="wrap">
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="star.fill" size={14} color="$yellow9" />
                <Text fontSize="$3" fontWeight="600">
                  {catfood.score.toFixed(1)}
                </Text>
                <Text fontSize="$2" color="$gray10">
                  ({catfood.countNum})
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="heart.fill" size={14} color="$red9" />
                <Text fontSize="$3" fontWeight="600" color="$red9">
                  {catfood.like_count || 0}
                </Text>
              </XStack>
            </XStack>

            {/* 标签 */}
            {catfood.tags && catfood.tags.length > 0 && (
              <XStack gap="$2" flexWrap="wrap">
                {catfood.tags.slice(0, 3).map((tag, idx) => (
                  <YStack
                    key={idx}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    backgroundColor="$blue3"
                    borderRadius="$2"
                  >
                    <Text fontSize="$1" color="$blue10">
                      {tag}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            )}
          </YStack>
        </XStack>
      </Card.Header>

      {/* 营养信息指示 */}
      {showNutritionInfo && (catfood.ingredient.length > 0 || catfood.percentage) && (
        <>
          <Separator />
          <Card.Footer padded>
            <XStack gap="$3" alignItems="center">
              {catfood.ingredient.length > 0 && (
                <XStack alignItems="center" gap="$1">
                  <IconSymbol name="checkmark.seal.fill" size={14} color="$green10" />
                  <Text fontSize="$2" color="$green10">
                    已录入营养成分
                  </Text>
                </XStack>
              )}
              {catfood.percentage && (
                <XStack alignItems="center" gap="$1">
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={14} color="$blue10" />
                  <Text fontSize="$2" color="$blue10">
                    可查看营养分析
                  </Text>
                </XStack>
              )}
            </XStack>
          </Card.Footer>
        </>
      )}
    </Card>
  );
};
