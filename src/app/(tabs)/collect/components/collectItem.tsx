/**
 * 猫粮收藏列表项 - 展示收藏的猫粮信息
 */
import { Image } from 'react-native';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { CatfoodFavorite } from '@/src/types/collect';
import {
  primaryScale,
  successScale,
  infoScale,
  warningScale,
  errorScale,
  neutralScale,
} from '@/src/design-system/tokens';

interface CollectListItemProps {
  favorite: CatfoodFavorite;
  onDelete?: (favoriteId: string, catfoodId: string) => void;
}

// 格式化日期为相对时间
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 月前`;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 根据分数获取颜色
function getScoreColor(score: number) {
  if (score >= 90) return successScale.success9;
  if (score >= 75) return infoScale.info9;
  if (score >= 60) return warningScale.warning9;
  return errorScale.error9;
}

export default function CollectListItem({ favorite, onDelete }: CollectListItemProps) {
  const { catfood } = favorite;
  if (!catfood) return null;

  const scoreColor = catfood.score != null ? getScoreColor(catfood.score) : null;

  return (
    <Card
      size="$4"
      bordered
      borderColor={neutralScale.neutral3}
      backgroundColor="white"
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      animation="quick"
    >
      <Card.Header padding="$4">
        <XStack gap="$3" alignItems="center">
          {/* 猫粮图片 */}
          <YStack
            borderRadius="$3"
            overflow="hidden"
            borderWidth={1}
            borderColor={neutralScale.neutral3}
          >
            {catfood.imageUrl ? (
              <Image
                source={{ uri: catfood.imageUrl }}
                style={{ width: 80, height: 80, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <YStack
                width={80}
                height={80}
                backgroundColor={neutralScale.neutral2}
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="photo" size={32} color={neutralScale.neutral7} />
              </YStack>
            )}
          </YStack>

          {/* 猫粮信息 */}
          <YStack flex={1} gap="$1">
            <Text fontSize={18} fontWeight="700" color="$foreground" numberOfLines={2}>
              {catfood.name}
            </Text>
            {catfood.brand && (
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="building.2" size={14} color={neutralScale.neutral8} />
                <Text fontSize={14} color={neutralScale.neutral8} numberOfLines={1}>
                  {catfood.brand}
                </Text>
              </XStack>
            )}
            <XStack alignItems="center" gap="$1" marginTop="$1">
              <IconSymbol name="clock" size={14} color={neutralScale.neutral7} />
              <Text fontSize={12} color={neutralScale.neutral7}>
                收藏于 {formatDate(favorite.createdAt)}
              </Text>
            </XStack>
          </YStack>

          {/* 评分显示 */}
          {catfood.score != null && scoreColor && (
            <YStack alignItems="center" gap="$1" minWidth={60}>
              <YStack
                backgroundColor={scoreColor + '15'}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$4"
                borderWidth={2}
                borderColor={scoreColor}
              >
                <Text fontSize={24} fontWeight="800" color={scoreColor}>
                  {catfood.score}
                </Text>
              </YStack>
              <Text fontSize={12} color={neutralScale.neutral8} fontWeight="500">
                综合评分
              </Text>
            </YStack>
          )}
        </XStack>
      </Card.Header>

      {onDelete && (
        <>
          <Separator borderColor={neutralScale.neutral2} />
          <Card.Footer padding="$3" paddingTop="$2">
            <XStack justifyContent="flex-end" width="100%" alignItems="center">
              <Button
                size="$3"
                backgroundColor={neutralScale.neutral2}
                borderWidth={1}
                borderColor={neutralScale.neutral3}
                color={neutralScale.neutral9}
                paddingHorizontal="$4"
                height={36}
                icon={<IconSymbol name="heart.slash" size={18} color={errorScale.error9} />}
                onPress={() => onDelete(favorite.id, catfood.id)}
                pressStyle={{
                  scale: 0.97,
                  opacity: 0.8,
                  backgroundColor: errorScale.error2,
                }}
              >
                <Text fontSize={14} fontWeight="600" color={errorScale.error9}>
                  取消收藏
                </Text>
              </Button>
            </XStack>
          </Card.Footer>
        </>
      )}
    </Card>
  );
}
