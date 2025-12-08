import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { ProductImage } from '@/src/components/ui/OptimizedImage';
import type { CatFood } from '@/src/types/catFood';
import { rankColors, tagColors } from '@/src/design-system/tokens';

interface CatFoodCardProps {
  catfood: CatFood;
  index?: number;
  onPress?: (catfood: CatFood) => void;
  onImagePress?: (imageUrl: string) => void;
  showRank?: boolean;
  showNutritionInfo?: boolean;
}

const getRankStyle = (rank: number) => {
  if (rank === 0) return { bg: rankColors.gold[0], text: 'white' };
  if (rank === 1) return { bg: rankColors.silver[0], text: '#333' };
  if (rank === 2) return { bg: rankColors.bronze[0], text: 'white' };
  return { bg: rankColors.normal[0], text: '#666' };
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

  const handleImagePress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (catfood.imageUrl && onImagePress) {
      onImagePress(catfood.imageUrl);
    }
  };

  const rankStyle = getRankStyle(index);

  return (
    <Card
      bordered
      borderColor="$borderColor"
      backgroundColor="$background"
      animation="quick"
      scale={0.95}
      hoverStyle={{ scale: 0.97 }}
      pressStyle={{ scale: 0.93 }}
      marginHorizontal="$2"
      marginBottom="$3"
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
              backgroundColor={rankStyle.bg}
              borderRadius={9999}
            >
              <Text fontSize="$6" fontWeight="bold" color={rankStyle.text}>
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
              <ProductImage
                source={catfood.imageUrl}
                style={{ width: 80, height: 80 }}
                borderRadius={8}
                cachePolicy="memory-disk"
              />
            </YStack>
          ) : (
            <YStack
              width={80}
              height={80}
              backgroundColor="$backgroundMuted"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="$foregroundSubtle" fontSize="$2">
                无图片
              </Text>
            </YStack>
          )}

          {/* 猫粮信息 */}
          <YStack flex={1} gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$foreground" numberOfLines={2}>
              {catfood.name}
            </Text>

            <Text fontSize="$3" color="$foregroundMuted">
              {catfood.brand || '未知品牌'}
            </Text>

            {/* 评分和点赞 */}
            <XStack alignItems="center" gap="$3" flexWrap="wrap">
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="star.fill" size={14} color="$warning7" />
                <Text fontSize="$3" fontWeight="600" color="$foreground">
                  {catfood.score.toFixed(1)}
                </Text>
                <Text fontSize="$2" color="$foregroundSubtle">
                  ({catfood.countNum})
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="heart.fill" size={14} color="$error7" />
                <Text fontSize="$3" fontWeight="600" color="$error7">
                  {catfood.like_count || 0}
                </Text>
              </XStack>
            </XStack>

            {/* 标签 */}
            {catfood.tags && catfood.tags.length > 0 && (
              <XStack gap="$1.5" flexWrap="wrap">
                {catfood.tags.slice(0, 3).map((tag, idx) => (
                  <YStack
                    key={idx}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    backgroundColor={tagColors[idx % tagColors.length]}
                    borderRadius={9999}
                  >
                    <Text fontSize="$1" fontWeight="500" color="#333">
                      {tag}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            )}
          </YStack>
        </XStack>
      </Card.Header>

      {/* 营养信息 */}
      {showNutritionInfo && (catfood.ingredient?.length > 0 || catfood.percentage) && (
        <>
          <Separator borderColor="$borderColor" />
          <Card.Footer padded>
            <XStack gap="$3" alignItems="center">
              {catfood.ingredient?.length > 0 && (
                <XStack alignItems="center" gap="$1">
                  <IconSymbol name="checkmark.seal.fill" size={14} color="$success7" />
                  <Text fontSize="$2" color="$success7">
                    已录入营养成分
                  </Text>
                </XStack>
              )}
              {catfood.percentage && (
                <XStack alignItems="center" gap="$1">
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={14} color="$info7" />
                  <Text fontSize="$2" color="$info7">
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
}
