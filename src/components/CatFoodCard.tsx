/**
 * CatFoodCard - 猫粮卡片组件
 *
 * 采用现代购物App风格设计：
 * - 清晰的视觉层次
 * - 精致的微交互
 * - 优雅的排名展示
 */

import { Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { CatFood } from '@/src/types/catFood';
import {
  primaryScale,
  neutralScale,
  warningScale,
  errorScale,
  successScale,
} from '@/src/design-system/tokens';

interface CatFoodCardProps {
  catfood: CatFood;
  index?: number;
  onPress?: (catfood: CatFood) => void;
  onImagePress?: (imageUrl: string) => void;
  showRank?: boolean;
  showNutritionInfo?: boolean;
}

// 排名徽章配置
const getRankConfig = (rank: number) => {
  if (rank === 0) {
    return {
      gradient: ['#FFD700', '#FFA500'] as const,
      textColor: '#FFFFFF',
      icon: 'crown.fill' as const,
      bgColor: '#FFF9E6',
      borderColor: '#FFD700',
      label: '冠军',
    };
  }
  if (rank === 1) {
    return {
      gradient: ['#E8E8E8', '#B0B0B0'] as const,
      textColor: '#FFFFFF',
      icon: 'medal.fill' as const,
      bgColor: '#F8F8F8',
      borderColor: '#C0C0C0',
      label: '亚军',
    };
  }
  if (rank === 2) {
    return {
      gradient: ['#DEB887', '#CD853F'] as const,
      textColor: '#FFFFFF',
      icon: 'medal.fill' as const,
      bgColor: '#FDF5EE',
      borderColor: '#CD853F',
      label: '季军',
    };
  }
  return {
    gradient: [neutralScale.neutral4, neutralScale.neutral5] as const,
    textColor: neutralScale.neutral11,
    icon: 'number' as const,
    bgColor: '#FFFFFF',
    borderColor: neutralScale.neutral4,
    label: '',
  };
};

export function CatFoodCard({
  catfood,
  index = 0,
  onPress,
  onImagePress,
  showRank = true,
  showNutritionInfo = true,
}: CatFoodCardProps) {
  const handlePress = () => onPress?.(catfood);
  const handleImagePress = () => {
    if (catfood.imageUrl && onImagePress) {
      onImagePress(catfood.imageUrl);
    }
  };

  const rankConfig = getRankConfig(index);
  const isTopThree = index < 3;

  return (
    <Pressable onPress={handlePress} testID="cat-food-card">
      {({ pressed }) => (
        <YStack
          backgroundColor="$background"
          marginHorizontal="$3"
          marginBottom="$3"
          borderRadius={16}
          borderWidth={isTopThree ? 1.5 : 1}
          borderColor={(isTopThree ? rankConfig.borderColor : neutralScale.neutral3) as any}
          overflow="hidden"
          opacity={pressed ? 0.96 : 1}
          scale={pressed ? 0.985 : 1}
          animation="quick"
        >
          {/* 主内容区 */}
          <XStack padding="$3.5" gap="$3">
            {/* 左侧：排名徽章 */}
            {showRank && (
              <YStack alignItems="center" gap="$1.5" width={50}>
                <YStack
                  width={46}
                  height={46}
                  borderRadius={23}
                  overflow="hidden"
                  alignItems="center"
                  justifyContent="center"
                >
                  <LinearGradient
                    colors={rankConfig.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {isTopThree ? (
                    <IconSymbol name={rankConfig.icon} size={22} color={rankConfig.textColor} />
                  ) : (
                    <Text fontSize="$5" fontWeight="900" color={rankConfig.textColor as any}>
                      {index + 1}
                    </Text>
                  )}
                </YStack>
                {isTopThree && (
                  <Text
                    fontSize={10}
                    fontWeight="800"
                    color={rankConfig.borderColor as any}
                    testID="cat-food-rank"
                  >
                    {rankConfig.label}
                  </Text>
                )}
              </YStack>
            )}

            {/* 中间：产品图片 */}
            <Pressable onPress={handleImagePress} testID="cat-food-image-pressable">
              <YStack
                width={90}
                height={90}
                borderRadius={12}
                overflow="hidden"
                backgroundColor={neutralScale.neutral2}
                borderWidth={1}
                borderColor={neutralScale.neutral3}
              >
                {catfood.imageUrl ? (
                  <Image
                    source={{ uri: catfood.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    testID="cat-food-image"
                  />
                ) : (
                  <YStack flex={1} alignItems="center" justifyContent="center">
                    <IconSymbol name="photo" size={32} color={neutralScale.neutral5} />
                  </YStack>
                )}
              </YStack>
            </Pressable>

            {/* 右侧：产品信息 */}
            <YStack flex={1} gap="$2" justifyContent="space-between">
              {/* 名称 */}
              <Text
                fontSize="$4"
                fontWeight="700"
                color="$color"
                numberOfLines={2}
                lineHeight={22}
                testID="cat-food-name"
              >
                {catfood.name}
              </Text>

              {/* 品牌标签 */}
              <XStack alignItems="center">
                <YStack
                  backgroundColor={primaryScale.primary2}
                  paddingHorizontal="$2"
                  paddingVertical={4}
                  borderRadius={6}
                  borderWidth={1}
                  borderColor={primaryScale.primary4}
                >
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color={primaryScale.primary10}
                    testID="cat-food-brand"
                  >
                    {catfood.brand || '未知品牌'}
                  </Text>
                </YStack>
              </XStack>

              {/* 评分和点赞 */}
              <XStack alignItems="center" gap="$3">
                {/* 评分 */}
                <XStack
                  alignItems="center"
                  gap="$1"
                  backgroundColor={warningScale.warning1}
                  paddingHorizontal="$2"
                  paddingVertical={4}
                  borderRadius={6}
                >
                  <IconSymbol name="star.fill" size={13} color={warningScale.warning6} />
                  <Text fontSize={13} fontWeight="800" color={warningScale.warning8}>
                    {catfood.score?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize={10} color={neutralScale.neutral8}>
                    ({catfood.countNum || 0})
                  </Text>
                </XStack>

                {/* 点赞 */}
                <XStack alignItems="center" gap="$1">
                  <IconSymbol name="heart.fill" size={13} color={errorScale.error5} />
                  <Text fontSize={13} fontWeight="700" color={errorScale.error7}>
                    {catfood.like_count || 0}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </XStack>

          {/* 底部信息区：标签 + 营养状态 */}
          {((catfood.tags && catfood.tags.length > 0) ||
            (showNutritionInfo && (catfood.ingredient?.length > 0 || catfood.percentage))) && (
            <YStack
              paddingHorizontal="$3.5"
              paddingBottom="$3"
              paddingTop="$1"
              gap="$2"
              borderTopWidth={1}
              borderTopColor={neutralScale.neutral2}
            >
              {/* 标签 */}
              {catfood.tags && catfood.tags.length > 0 && (
                <XStack gap="$1.5" flexWrap="wrap">
                  {catfood.tags.slice(0, 4).map((tag, idx) => (
                    <YStack
                      key={idx}
                      paddingHorizontal="$2"
                      paddingVertical={3}
                      backgroundColor={
                        idx === 0
                          ? `${primaryScale.primary3}80`
                          : idx === 1
                            ? `${warningScale.warning2}80`
                            : `${neutralScale.neutral3}80`
                      }
                      borderRadius={10}
                    >
                      <Text
                        fontSize={10}
                        fontWeight="600"
                        color={
                          idx === 0
                            ? primaryScale.primary10
                            : idx === 1
                              ? warningScale.warning10
                              : neutralScale.neutral10
                        }
                      >
                        #{tag}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              )}

              {/* 营养信息标签 */}
              {showNutritionInfo && (catfood.ingredient?.length > 0 || catfood.percentage) && (
                <XStack gap="$2">
                  {catfood.ingredient?.length > 0 && (
                    <XStack
                      alignItems="center"
                      gap="$1"
                      backgroundColor={successScale.success1}
                      paddingHorizontal="$2"
                      paddingVertical={4}
                      borderRadius={6}
                    >
                      <IconSymbol
                        name="checkmark.seal.fill"
                        size={12}
                        color={successScale.success7}
                      />
                      <Text fontSize={10} fontWeight="600" color={successScale.success8}>
                        已录入营养成分
                      </Text>
                    </XStack>
                  )}
                  {catfood.percentage && (
                    <XStack
                      alignItems="center"
                      gap="$1"
                      backgroundColor="#EFF6FF"
                      paddingHorizontal="$2"
                      paddingVertical={4}
                      borderRadius={6}
                    >
                      <IconSymbol name="chart.line.uptrend.xyaxis" size={12} color="#2563EB" />
                      <Text fontSize={10} fontWeight="600" color="#1D4ED8">
                        可查看分析
                      </Text>
                    </XStack>
                  )}
                </XStack>
              )}
            </YStack>
          )}
        </YStack>
      )}
    </Pressable>
  );
}
