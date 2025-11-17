import type { Favorite } from '@/src/services/api';
import { Image } from 'react-native';
import { Button, Card, Text, XStack, YStack } from 'tamagui';

interface CollectListItemProps {
  favorite: Favorite;
  onDelete?: (favoriteId: number) => void;
}

export default function CollectListItem({ favorite, onDelete }: CollectListItemProps) {
  const { catfood } = favorite;

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Card
      elevate
      size="$4"
      bordered
      marginBottom="$1"
      pressStyle={{ scale: 0.98 }}
      animation="bouncy"
    >
      <Card.Header>
        <XStack gap="$1" alignItems="center">
          {catfood.imageUrl && (
            <Image
              source={{ uri: catfood.imageUrl }}
              style={{ width: 60, height: 60, borderRadius: 8 }}
            />
          )}
          <YStack flex={1}>
            <Text fontSize="$5" fontWeight="bold" numberOfLines={1}>
              {catfood.name}
            </Text>
            {catfood.brand && (
              <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                {catfood.brand}
              </Text>
            )}
            <Text fontSize="$2" color="$gray9" marginTop="$1">
              收藏时间: {formatDate(favorite.created_at)}
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize="$7" fontWeight="bold" color="$orange10">
              {catfood.score}
            </Text>
            <Text fontSize="$2" color="$gray9">
              评分
            </Text>
          </YStack>
        </XStack>
      </Card.Header>

      {onDelete && (
        <Card.Footer>
          <XStack justifyContent="flex-end" width="97%" marginBottom="$3">
            <Button size="$3" theme="blue" onPress={() => onDelete(favorite.id)}>
              取消收藏
            </Button>
          </XStack>
        </Card.Footer>
      )}
    </Card>
  );
}
