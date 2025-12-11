/**
 * 消息通知页面
 *
 * 类似小红书的通知中心，显示：
 * - 帖子评论通知
 * - 评论回复通知
 * - 帖子点赞通知
 *
 * 设计风格：简洁现代，分组展示
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, ChevronLeft, CheckCheck, MessageCircle, Reply } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Avatar, Spinner, Stack } from 'tamagui';

import { supabaseForumService, type NotificationItem } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';

// 样式组件
const Container = styled(YStack, {
  name: 'NotificationsContainer',
  flex: 1,
  backgroundColor: '$background',
});

const Header = styled(XStack, {
  name: 'NotificationsHeader',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  backgroundColor: '$background',
});

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  fontSize: 18,
  fontWeight: '700',
  color: '$color',
});

const BackButton = styled(Stack, {
  name: 'BackButton',
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

const MarkAllButton = styled(XStack, {
  name: 'MarkAllButton',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: 8,
  backgroundColor: '$backgroundSubtle',
  alignItems: 'center',
  gap: '$1.5',
});

const NotificationCard = styled(XStack, {
  name: 'NotificationCard',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  gap: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  variants: {
    unread: {
      true: {
        backgroundColor: '$blue1',
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  } as const,
});

const NotificationContent = styled(YStack, {
  name: 'NotificationContent',
  flex: 1,
  gap: '$1',
});

const NotificationText = styled(Text, {
  name: 'NotificationText',
  fontSize: 14,
  color: '$color',
  lineHeight: 20,
});

const NotificationPreview = styled(Text, {
  name: 'NotificationPreview',
  fontSize: 13,
  color: '$colorMuted',
  numberOfLines: 2,
  lineHeight: 18,
});

const NotificationTime = styled(Text, {
  name: 'NotificationTime',
  fontSize: 12,
  color: '$colorSubtle',
});

const IconContainer = styled(Stack, {
  name: 'IconContainer',
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$10',
  gap: '$4',
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: 15,
  color: '$colorMuted',
  textAlign: 'center',
});

const UnreadDot = styled(Stack, {
  name: 'UnreadDot',
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$blue9',
  position: 'absolute',
  top: 0,
  right: 0,
});

/**
 * 格式化时间为相对时间
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/**
 * 获取通知图标和颜色
 */
function getNotificationStyle(verb: NotificationItem['verb']) {
  switch (verb) {
    case 'comment_post':
      return {
        icon: MessageCircle,
        bgColor: '$green3',
        iconColor: '$green10',
        label: '评论了你的帖子',
      };
    case 'reply_comment':
      return {
        icon: Reply,
        bgColor: '$blue3',
        iconColor: '$blue10',
        label: '回复了你的评论',
      };
    default:
      return {
        icon: Bell,
        bgColor: '$gray3',
        iconColor: '$gray10',
        label: '通知',
      };
  }
}

/**
 * 通知项组件
 */
const NotificationItemComponent = React.memo(function NotificationItemComponent({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}) {
  const style = getNotificationStyle(item.verb);
  const Icon = style.icon;

  return (
    <Pressable onPress={() => onPress(item)}>
      <NotificationCard unread={item.unread}>
        {/* 头像区域 */}
        <YStack position="relative">
          <Avatar circular size="$4">
            <Avatar.Fallback
              backgroundColor="$backgroundSubtle"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={14} fontWeight="600" color="$color">
                {item.actor?.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </Avatar.Fallback>
          </Avatar>
          {/* 通知类型图标 */}
          <IconContainer
            backgroundColor={style.bgColor}
            position="absolute"
            bottom={-4}
            right={-4}
            width={20}
            height={20}
            borderRadius={10}
            borderWidth={2}
            borderColor="$background"
          >
            <Icon size={10} color={style.iconColor} />
          </IconContainer>
        </YStack>

        {/* 内容区域 */}
        <NotificationContent>
          <NotificationText>
            <Text fontWeight="600">{item.actor?.username || '用户'}</Text> {style.label}
          </NotificationText>

          {/* 预览内容 */}
          {item.comment?.content && (
            <NotificationPreview>"{item.comment.content}"</NotificationPreview>
          )}
          {item.post?.content && !item.comment && (
            <NotificationPreview>"{item.post.content}"</NotificationPreview>
          )}

          <NotificationTime>{formatRelativeTime(item.createdAt)}</NotificationTime>
        </NotificationContent>

        {/* 未读标记 */}
        {item.unread && <UnreadDot />}
      </NotificationCard>
    </Pressable>
  );
});

/**
 * 消息通知页面
 */
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 未读数量
  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  /**
   * 加载通知
   */
  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error } = await supabaseForumService.getNotifications();
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      logger.error('加载通知失败', error as Error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * 标记全部已读
   */
  const handleMarkAllRead = useCallback(async () => {
    try {
      const { error } = await supabaseForumService.markAllNotificationsRead();
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (error) {
      logger.error('标记已读失败', error as Error);
    }
  }, []);

  /**
   * 点击通知
   */
  const handleNotificationPress = useCallback(async (item: NotificationItem) => {
    // 标记为已读
    if (item.unread) {
      try {
        await supabaseForumService.markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
        );
      } catch (error) {
        logger.error('标记已读失败', error as Error);
      }
    }

    // 跳转到相关帖子（如果有）
    if (item.post?.id) {
      // TODO: 跳转到帖子详情
      // router.push(`/(tabs)/forum/post/${item.post.id}`);
    }
  }, []);

  /**
   * 渲染通知项
   */
  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationItemComponent item={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress]
  );

  /**
   * 空状态
   */
  const EmptyComponent = useMemo(
    () => (
      <EmptyContainer>
        <Bell size={48} color="$colorMuted" opacity={0.5} />
        <EmptyText>暂无消息通知{'\n'}互动后会收到通知哦~</EmptyText>
      </EmptyContainer>
    ),
    []
  );

  return (
    <Container>
      {/* 头部 */}
      <Header paddingTop={insets.top}>
        <Pressable onPress={() => router.back()}>
          <BackButton>
            <ChevronLeft size={24} color="$color" />
          </BackButton>
        </Pressable>

        <HeaderTitle>消息通知</HeaderTitle>

        {unreadCount > 0 ? (
          <Pressable onPress={handleMarkAllRead}>
            <MarkAllButton>
              <CheckCheck size={16} color="$colorMuted" />
              <Text fontSize={13} color="$colorMuted">
                全部已读
              </Text>
            </MarkAllButton>
          </Pressable>
        ) : (
          <Stack width={80} />
        )}
      </Header>

      {/* 通知列表 */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={EmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor="#7FB093"
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 20,
          }}
        />
      )}
    </Container>
  );
}
