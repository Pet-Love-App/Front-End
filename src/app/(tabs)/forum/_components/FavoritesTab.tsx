import { forumService, type Post } from '@/src/services/api/forum';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Card, Spinner, Text, XStack, YStack } from 'tamagui';

export function FavoritesTab() {
  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderItem = ({ item }: { item: Post }) => (
    <Card margin="$3" padding="$3" elevate>
      <YStack gap="$2">
        <Text fontWeight="700">{item.author.username}</Text>
        <Text>{item.content}</Text>
        <XStack gap="$3" alignItems="center" justifyContent="space-between">
          <Text color="$gray10">{new Date(item.created_at).toLocaleString()}</Text>
          <XStack gap="$3">
            <Text>收藏 {item.favorites_count}</Text>
          </XStack>
        </XStack>
      </YStack>
    </Card>
  );

  if (loading) return <YStack alignItems="center" marginTop={40}><Spinner /></YStack>;

  return (
    <FlatList
      data={list}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    />
  );
}
