import { forumService, type Post } from '@/src/services/api/forum';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';
import { PostDetailModal } from './PostDetailModal';

interface Props {
  onOpenPost?: (post: Post) => void;
  externalReloadRef?: React.MutableRefObject<(() => void) | null>;
}

export function SquareTab({ onOpenPost, externalReloadRef }: Props) {
  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await forumService.getSquareList('latest');
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

  // 暴露外部刷新方法
  useEffect(() => {
    if (externalReloadRef) externalReloadRef.current = load;
    return () => {
      if (externalReloadRef) externalReloadRef.current = null;
    };
  }, [externalReloadRef, load]);

  const renderItem = ({ item }: { item: Post }) => (
    <Card margin="$3" padding="$3" elevate>
      <YStack gap="$2">
        <Text fontWeight="700">{item.author.username}</Text>
        <Text>{item.content}</Text>
        {item.media?.length ? (
          <Text color="$gray10">[含{item.media.length}个{item.media[0].media_type === 'video' ? '视频' : '图片'}]</Text>
        ) : null}

        <XStack gap="$3" alignItems="center" justifyContent="space-between">
          <Text color="$gray10">{new Date(item.created_at).toLocaleString()}</Text>
          <XStack gap="$3">
            <Text>收藏 {item.favorites_count}</Text>
          </XStack>
        </XStack>

        <XStack gap="$2">
          <Button size="$3" onPress={() => setActivePost(item)}>查看详情</Button>
        </XStack>
      </YStack>
    </Card>
  );

  if (loading) return <YStack alignItems="center" marginTop={40}><Spinner /></YStack>;

  return (
    <>
      <FlatList
        data={list}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      />

      <PostDetailModal visible={!!activePost} post={activePost} onClose={() => setActivePost(null)} />
    </>
  );
}
