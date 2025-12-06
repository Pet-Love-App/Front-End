import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';

import { supabaseForumService, type NotificationItem } from '@/src/lib/supabase';

interface MessagesTabProps {
  onCreatePost?: () => void;
}

export function MessagesTab({ onCreatePost }: MessagesTabProps) {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseForumService.getNotifications(true); // 默认拉取未读
      if (error) throw error;
      setList(data || []);
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

  const getNotificationTitle = (n: NotificationItem) =>
    n.verb === 'reply_comment' ? '有人回复了你' : '有人评论了你的帖子';

  const getNotificationContent = (n: NotificationItem) => (n as any)?.comment?.content || '';

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Card margin="$3" padding="$3" elevate>
      <YStack gap="$2">
        <XStack justifyContent="space-between">
          <Text fontWeight="700">{getNotificationTitle(item)}</Text>
          {item.unread ? <Text color="$red10">未读</Text> : null}
        </XStack>
        <Text>{item.actor?.username || ''}</Text>
        {!!getNotificationContent(item) && <Text>{getNotificationContent(item)}</Text>}
        <Text color="$gray10">{new Date(item.createdAt).toLocaleString()}</Text>
        {item.unread ? (
          <Button
            size="$3"
            onPress={() =>
              supabaseForumService
                .markNotificationRead(item.id)
                .then(() => load())
                .catch(() => Alert.alert('错误', '标记已读失败'))
            }
          >
            标记已读
          </Button>
        ) : null}
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
    <>
      <XStack padding="$3" gap="$2" justifyContent="flex-start">
        <Button
          size="$3"
          onPress={() =>
            supabaseForumService
              .markAllNotificationsRead()
              .then(() => load())
              .catch(() => Alert.alert('错误', '操作失败'))
          }
        >
          全部设为已读
        </Button>
        <Button size="$3" chromeless onPress={load}>
          刷新
        </Button>
        {onCreatePost && (
          <Button size="$3" onPress={onCreatePost}>
            发帖
          </Button>
        )}
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
