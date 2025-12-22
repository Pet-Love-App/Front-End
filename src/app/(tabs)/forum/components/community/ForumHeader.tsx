/**
 * ForumHeader - 论坛页面头部组件
 *
 * 统一风格：左侧头像，中间标题，右侧通知图标
 * 包含搜索框
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Pressable, Image as RNImage } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Bell, Search, X, User } from '@tamagui/lucide-icons';
import { XStack, YStack, Text, Input, Stack, useTheme } from 'tamagui';

import { useUserStore } from '@/src/store/userStore';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

export interface ForumHeaderProps {
  title?: string;
  unreadCount?: number;
  onSearch?: (query: string) => void;
  onNotificationPress?: () => void;
  paddingTop?: number;
}

// 统一头部高度常量
const HEADER_HEIGHT = 56;

function ForumHeaderComponent({
  title = '社区',
  unreadCount = 0,
  onSearch,
  onNotificationPress,
  paddingTop = 0,
}: ForumHeaderProps) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const avatarUrl = useUserStore((state) => state.user?.avatarUrl);

  const bellScale = useSharedValue(1);
  const avatarScale = useSharedValue(1);

  // 搜索框聚焦动画
  const derivedFocus = useDerivedValue(() => {
    return withSpring(isSearchFocused ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [isSearchFocused]);

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(derivedFocus.value, [0, 1], [colors.border, colors.primary]),
      transform: [{ scale: 1 + derivedFocus.value * 0.01 }],
    };
  });

  const bellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const handleSearchSubmit = useCallback(() => {
    onSearch?.(searchText.trim());
  }, [searchText, onSearch]);

  const handleClear = useCallback(() => {
    setSearchText('');
    onSearch?.('');
  }, [onSearch]);

  const handleNotificationPress = useCallback(() => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/(tabs)/forum/notifications' as any);
    }
  }, [onNotificationPress]);

  const handleAvatarPress = useCallback(() => {
    router.push('/(tabs)/profile' as any);
  }, []);

  const handleBellPressIn = () => {
    bellScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handleBellPressOut = () => {
    bellScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handleAvatarPressIn = () => {
    avatarScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handleAvatarPressOut = () => {
    avatarScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const AnimatedStack = Animated.createAnimatedComponent(Stack);

  return (
    <YStack
      backgroundColor={colors.background as any}
      paddingHorizontal={16}
      gap={12}
      paddingTop={paddingTop}
    >
      <XStack alignItems="center" justifyContent="space-between" height={HEADER_HEIGHT}>
        {/* 左侧：头像 */}
        <Pressable
          onPress={handleAvatarPress}
          onPressIn={handleAvatarPressIn}
          onPressOut={handleAvatarPressOut}
        >
          <AnimatedStack
            style={avatarAnimatedStyle}
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={(isDark ? '#3D2A1F' : colors.primaryLight) as any}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={(isDark ? '#4D3A2F' : colors.primaryLight) as any}
            overflow="hidden"
          >
            {avatarUrl ? (
              <RNImage
                source={{ uri: avatarUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <User size={20} color={colors.primary as any} />
            )}
          </AnimatedStack>
        </Pressable>

        {/* 中间：标题 */}
        <Text fontSize={20} fontWeight="700" color={colors.text as any}>
          {title}
        </Text>

        {/* 右侧：通知图标 */}
        <Pressable
          onPress={handleNotificationPress}
          onPressIn={handleBellPressIn}
          onPressOut={handleBellPressOut}
        >
          <AnimatedStack
            style={bellAnimatedStyle}
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={colors.backgroundMuted as any}
            alignItems="center"
            justifyContent="center"
            borderWidth={1.5}
            borderColor={colors.border as any}
          >
            <Bell size={20} color={colors.icon as any} />
            {unreadCount > 0 && (
              <Stack
                position="absolute"
                top={-4}
                right={-4}
                minWidth={18}
                height={18}
                borderRadius={9}
                backgroundColor={colors.error as any}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal={4}
                borderWidth={2}
                borderColor={colors.cardBackground as any}
              >
                <Text fontSize={10} fontWeight="700" color="white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </Stack>
            )}
          </AnimatedStack>
        </Pressable>
      </XStack>

      {/* 搜索框 */}
      <YStack paddingBottom={12}>
        <AnimatedStack
          style={[
            searchAnimatedStyle,
            {
              flexDirection: 'row',
              backgroundColor: colors.backgroundMuted,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              alignItems: 'center',
              gap: 10,
              borderWidth: 1.5,
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary as any} />
          <Input
            value={searchText}
            onChangeText={setSearchText}
            placeholder="搜索帖子、标签、用户..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            flex={1}
            backgroundColor="transparent"
            borderWidth={0}
            fontSize={15}
            color={colors.text as any}
            padding={0}
            height={24}
            focusStyle={{ borderWidth: 0 }}
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClear}>
              <Stack
                width={24}
                height={24}
                borderRadius={12}
                backgroundColor={colors.border as any}
                alignItems="center"
                justifyContent="center"
              >
                <X size={14} color={colors.textSecondary as any} />
              </Stack>
            </Pressable>
          )}
        </AnimatedStack>
      </YStack>
    </YStack>
  );
}

export const ForumHeader = memo(ForumHeaderComponent);
