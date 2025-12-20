/**
 * AppHeader - 统一的页面头部组件
 *
 * 设计规范：
 * - 左侧：用户头像（点击进入个人中心）
 * - 中间：页面标题
 * - 右侧：消息通知图标（带未读数量badge）
 */
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, neutralScale, errorScale } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/userStore';
import { supabaseForumService, supabase } from '@/src/lib/supabase';

export interface AppHeaderProps {
  /** 页面标题 */
  title: string;
  /** 安全区域信息 */
  insets: EdgeInsets;
  /** 是否显示头像 */
  showAvatar?: boolean;
  /** 是否显示通知图标 */
  showNotification?: boolean;
  /** 自定义右侧元素 */
  rightElement?: React.ReactNode;
  /** 背景色 */
  backgroundColor?: string;
}

export function AppHeader({
  title,
  insets,
  showAvatar = true,
  showNotification = true,
  rightElement,
  backgroundColor = 'transparent',
}: AppHeaderProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // 获取未读通知数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await supabaseForumService.getNotifications(true);
      if (result.data) {
        setUnreadCount(result.data.length);
      }
    } catch (error) {
      console.error('获取未读通知失败:', error);
    }
  }, []);

  useEffect(() => {
    if (!showNotification) return;

    fetchUnreadCount();

    // 订阅通知变化
    const notificationsChannel = supabase
      .channel('app_header_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [showNotification, fetchUnreadCount]);

  // 当页面获得焦点时刷新未读数量
  useFocusEffect(
    useCallback(() => {
      if (showNotification) {
        fetchUnreadCount();
      }
    }, [showNotification, fetchUnreadCount])
  );

  // 跳转到个人中心
  const handleAvatarPress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  // 跳转到通知页面
  const handleNotificationPress = useCallback(() => {
    router.push('/(tabs)/forum/notifications' as any);
  }, [router]);

  return (
    <XStack
      paddingTop={insets.top}
      paddingHorizontal="$4"
      paddingBottom="$3"
      backgroundColor={backgroundColor as any}
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      {/* 左侧：头像 */}
      <XStack width={40} alignItems="center">
        {showAvatar && user?.avatarUrl && (
          <Pressable onPress={handleAvatarPress} testID="avatar-button">
            <Image
              source={{ uri: user.avatarUrl }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: neutralScale.neutral4,
              }}
            />
          </Pressable>
        )}
      </XStack>

      {/* 中间：标题 */}
      <Text
        fontSize="$6"
        fontWeight="bold"
        color="$color"
        textAlign="center"
        flex={1}
      >
        {title}
      </Text>

      {/* 右侧：通知或自定义元素 */}
      <XStack width={40} alignItems="center" justifyContent="flex-end">
        {rightElement ? (
          rightElement
        ) : showNotification ? (
          <Pressable onPress={handleNotificationPress} testID="notification-button">
            <YStack>
              <IconSymbol
                name="bell"
                size={24}
                color={neutralScale.neutral11}
              />
              {unreadCount > 0 && (
                <YStack
                  position="absolute"
                  top={-4}
                  right={-4}
                  backgroundColor={errorScale.error9}
                  borderRadius={10}
                  minWidth={16}
                  height={16}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal={4}
                >
                  <Text
                    color="white"
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </YStack>
              )}
            </YStack>
          </Pressable>
        ) : null}
      </XStack>
    </XStack>
  );
}
