import Tag from '@/src/components/ui/Tag';
import { forumService, type Post } from '@/src/services/api/forum';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';

interface FavoritesTabProps {
  onOpenPost?: (post: Post) => void;
}

export function FavoritesTab({ onOpenPost }: FavoritesTabProps) {
  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const animationRefs = useRef<Record<number, LottieView | null>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await forumService.getMyFavorites();
      setList(res);
    } catch (e) {
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = async (postId: number, wasFavorited: boolean) => {
    try {
      const res = await forumService.toggleFavorite(postId);
      setList((prev) =>
        prev
          .filter((p) => !(p.id === postId && res.action === 'unfavorited'))
          .map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_favorited: res.action === 'favorited',
                  favorites_count: res.favorites_count ?? p.favorites_count,
                }
              : p
          )
      );
      if (!wasFavorited && res.action === 'favorited') {
        setTimeout(() => animationRefs.current[postId]?.play(), 0);
      }
    } catch (e) {
      Alert.alert('错误', '操作失败');
    }
  };

  const renderTags = (item: Post) => {
    if (!item.tags || item.tags.length === 0) return null;
    return (
      <XStack gap="$2" alignItems="center" flexWrap="wrap" marginTop="$2">
        {item.tags.map((tag, index) => (
          <Tag key={`${item.id}-${tag}`} name={tag} index={index} />
        ))}
      </XStack>
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Card margin="$3" padding="$3" elevate>
      <YStack gap="$2">
        <Text fontWeight="700">{item.author.username}</Text>
        <Text>{item.content}</Text>
        {renderTags(item)}
        <XStack gap="$3" alignItems="center" justifyContent="space-between">
          <Text color="$gray10">{new Date(item.created_at).toLocaleString()}</Text>
          <XStack gap="$3" alignItems="center">
            <Button
              size="$2"
              onPress={() => toggleFavorite(item.id, item.is_favorited)}
              backgroundColor={item.is_favorited ? '$yellow4' : '$background'}
            >
              <XStack alignItems="center" gap="$1">
                <Text fontSize="$5" color={item.is_favorited ? '$yellow10' : '$gray10'}>
                  {item.is_favorited ? '★' : '☆'}
                </Text>
                <Text fontSize="$3" color="$gray11">
                  {item.favorites_count}
                </Text>
              </XStack>
              <YStack
                position="absolute"
                top={-20}
                left={-20}
                width={60}
                height={60}
                pointerEvents="none"
              >
                <LottieView
                  ref={(ref) => {
                    animationRefs.current[item.id] = ref;
                  }}
                  source={require('@/assets/animations/Tap_Burst.json')}
                  loop={false}
                  autoPlay={false}
                  style={{ width: 60, height: 60 }}
                />
              </YStack>
            </Button>
          </XStack>
        </XStack>
        <XStack gap="$2">
          <Button size="$3" onPress={() => onOpenPost?.(item)}>
            查看详情
          </Button>
        </XStack>
      </YStack>
    </Card>
  );

  if (loading) {
    return (
      <YStack alignItems="center" marginTop={40}>
        <Spinner />
      </YStack>
    );
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    />
  );
}
