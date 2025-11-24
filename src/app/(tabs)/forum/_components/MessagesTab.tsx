import { forumService, type NotificationItem } from '@/src/services/api/forum';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';

export function MessagesTab() {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await forumService.getNotifications(true); // 默认拉取未读
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

  const titleFor = (n: NotificationItem) =>
    n.verb === 'reply_comment' ? '有人回复了你' : '有人评论了你的帖子';

  const contentFor = (n: NotificationItem) => (n as any)?.comment?.content || '';

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Card margin="$3" padding="$3" elevate>
      <YStack gap="$2">
        <XStack justifyContent="space-between">
          <Text fontWeight="700">{titleFor(item)}</Text>
          {item.unread ? <Text color="$red10">未读</Text> : null}
        </XStack>
        <Text>{item.actor?.username || ''}</Text>
        {!!contentFor(item) && <Text>{contentFor(item)}</Text>}
        <Text color="$gray10">{new Date(item.created_at).toLocaleString()}</Text>
        {item.unread ? (
          <Button size="$3" onPress={() => forumService.markNotificationRead(item.id).then(() => load())}>
            标记已读
          </Button>
        ) : null}
      </YStack>
    </Card>
  );

  if (loading) return <YStack alignItems="center" marginTop={40}><Spinner /></YStack>;

  return (
    <>
      <XStack padding="$3" gap="$2">
        <Button size="$3" onPress={() => forumService.markAllNotificationsRead().then(() => load())}>全部设为已读</Button>
        <Button size="$3" chromeless onPress={load}>刷新</Button>
      </XStack>
      <FlatList
        data={list}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      />
    </>
  );
}
