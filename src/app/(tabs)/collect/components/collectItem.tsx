import { Image } from 'react-native';
import { Button, Card, Separator, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { CatfoodFavorite } from '@/src/types/collect';

interface CollectListItemProps {
  favorite: CatfoodFavorite;
  onDelete?: (favoriteId: string, catfoodId: string) => void;
}

export default function CollectListItem({ favorite, onDelete }: CollectListItemProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { catfood } = favorite;

  // 防御性检查：如果没有 catfood 数据，不渲染
  if (!catfood) return null;

  // 格式化日期
  const formatDate = (dateString: string) => {
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
  };

  // 获取评分颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return '$green10';
    if (score >= 75) return '$blue10';
    if (score >= 60) return '$orange10';
    return '$red10';
  };

  return (
    <Card
      size="$4"
      bordered
      borderColor="$gray4"
      backgroundColor={colors.background}
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
            borderColor={colors.icon + '20'}
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
                backgroundColor={colors.icon + '10'}
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="photo" size={32} color={colors.icon} />
              </YStack>
            )}
          </YStack>

          {/* 猫粮信息 */}
          <YStack flex={1} gap="$1">
            <Text fontSize={18} fontWeight="700" color={colors.text} numberOfLines={2}>
              {catfood.name}
            </Text>
            {catfood.brand && (
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="building.2" size={14} color={colors.icon} />
                <Text fontSize={14} color={colors.icon} numberOfLines={1}>
                  {catfood.brand}
                </Text>
              </XStack>
            )}
            <XStack alignItems="center" gap="$1" marginTop="$1">
              <IconSymbol name="clock" size={14} color={colors.icon + '80'} />
              <Text fontSize={12} color={colors.icon + '80'}>
                收藏于 {formatDate(favorite.createdAt)}
              </Text>
            </XStack>
          </YStack>

          {/* 评分显示 */}
          {catfood.score != null && (
            <YStack alignItems="center" gap="$1" minWidth={60}>
              <YStack
                backgroundColor={getScoreColor(catfood.score) + '15'}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$4"
                borderWidth={2}
                borderColor={getScoreColor(catfood.score)}
              >
                <Text fontSize={24} fontWeight="800" color={getScoreColor(catfood.score)}>
                  {catfood.score}
                </Text>
              </YStack>
              <Text fontSize={12} color={colors.icon} fontWeight="500">
                综合评分
              </Text>
            </YStack>
          )}
        </XStack>
      </Card.Header>

      {onDelete && (
        <>
          <Separator borderColor={colors.icon + '15'} />
          <Card.Footer padding="$3" paddingTop="$2">
            <XStack justifyContent="flex-end" width="100%">
              <Button
                size="$3"
                chromeless
                color={colors.icon}
                icon={<IconSymbol name="heart.slash" size={16} color={colors.icon} />}
                onPress={() => onDelete(favorite.id, catfood.id)}
                pressStyle={{ scale: 0.95, opacity: 0.7 }}
              >
                取消收藏
              </Button>
            </XStack>
          </Card.Footer>
        </>
      )}
    </Card>
  );
}
