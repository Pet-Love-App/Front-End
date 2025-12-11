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
import { useRouter } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, neutralScale, errorScale } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/userStore';
import { supabaseForumService } from '@/src/lib/supabase';

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
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await supabaseForumService.getNotifications(true);
        if (result.data) {
          setUnreadCount(result.data.length);
        }
      } catch (error) {
        console.error('获取未读通知失败:', error);
      }
    };

    if (showNotification) {
      fetchUnreadCount();
    }
  }, [showNotification]);

  // 跳转到个人中心
  const handleAvatarPress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  // 跳转到通知页面
  const handleNotificationPress = useCallback(() => {
    // TODO: 跳转到通知页面
    // router.push('/notifications');
  }, []);

  // 统一头部高度常量
  const HEADER_HEIGHT = 56;

  return (
    <YStack paddingTop={insets.top} paddingHorizontal={16} backgroundColor={backgroundColor}>
      <XStack alignItems="center" justifyContent="space-between" height={HEADER_HEIGHT}>
        {/* 左侧：头像 */}
        {showAvatar ? (
          <Pressable onPress={handleAvatarPress}>
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={primaryScale.primary2}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor={primaryScale.primary4}
              overflow="hidden"
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 40, height: 40 }}
                  resizeMode="cover"
                />
              ) : (
                <IconSymbol name="person.fill" size={20} color={primaryScale.primary7} />
              )}
            </YStack>
          </Pressable>
        ) : (
          <YStack width={40} />
        )}

        {/* 中间：标题 */}
        <Text
          fontSize={18}
          fontWeight="700"
          color={neutralScale.neutral12}
          flex={1}
          textAlign="center"
        >
          {title}
        </Text>

        {/* 右侧：通知图标或自定义元素 */}
        {rightElement ? (
          rightElement
        ) : showNotification ? (
          <Pressable onPress={handleNotificationPress}>
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={neutralScale.neutral2}
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor={neutralScale.neutral3}
            >
              <IconSymbol name="bell.fill" size={20} color={neutralScale.neutral9} />
              {/* 未读消息badge */}
              {unreadCount > 0 && (
                <YStack
                  position="absolute"
                  top={-2}
                  right={-2}
                  minWidth={18}
                  height={18}
                  borderRadius={9}
                  backgroundColor={errorScale.error8}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal="$1"
                >
                  <Text fontSize={10} fontWeight="700" color="white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </YStack>
              )}
            </YStack>
          </Pressable>
        ) : (
          <YStack width={40} />
        )}
      </XStack>
    </YStack>
  );
}
