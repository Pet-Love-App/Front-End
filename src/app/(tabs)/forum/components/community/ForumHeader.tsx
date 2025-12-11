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
import { styled, XStack, YStack, Text, Input, Stack, useTheme } from 'tamagui';

import { useUserStore } from '@/src/store/userStore';
import { primaryScale, neutralScale, errorScale } from '@/src/design-system/tokens';

export interface ForumHeaderProps {
  title?: string;
  unreadCount?: number;
  onSearch?: (query: string) => void;
  onNotificationPress?: () => void;
  paddingTop?: number;
}

// 统一头部高度常量
const HEADER_HEIGHT = 56;

const HeaderContainer = styled(YStack, {
  name: 'ForumHeader',
  backgroundColor: '$background',
  paddingHorizontal: 16,
  gap: 12,
});

const TopRow = styled(XStack, {
  name: 'ForumHeaderTop',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: HEADER_HEIGHT,
});

const TitleText = styled(Text, {
  name: 'ForumTitle',
  fontSize: 20,
  fontWeight: '700',
  color: '$color',
  letterSpacing: 0,
});

const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  backgroundColor: neutralScale.neutral2,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  alignItems: 'center',
  gap: 10,
  borderWidth: 1.5,
  borderColor: neutralScale.neutral3,
});

const SearchInput = styled(Input, {
  name: 'SearchInput',
  flex: 1,
  backgroundColor: 'transparent',
  borderWidth: 0,
  fontSize: 15,
  color: '$color',
  padding: 0,
  height: 24,

  focusStyle: {
    borderWidth: 0,
  },
});

const ClearButton = styled(Stack, {
  name: 'ClearButton',
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: neutralScale.neutral4,
  alignItems: 'center',
  justifyContent: 'center',
});

const AnimatedSearchContainer = Animated.createAnimatedComponent(SearchContainer);

function ForumHeaderComponent({
  title = '社区',
  unreadCount = 0,
  onSearch,
  onNotificationPress,
  paddingTop = 0,
}: ForumHeaderProps) {
  const theme = useTheme();
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
      borderColor: interpolateColor(
        derivedFocus.value,
        [0, 1],
        [neutralScale.neutral3, primaryScale.primary5]
      ),
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
    <HeaderContainer paddingTop={paddingTop}>
      <TopRow>
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
            backgroundColor={primaryScale.primary2}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={primaryScale.primary3}
            overflow="hidden"
          >
            {avatarUrl ? (
              <RNImage
                source={{ uri: avatarUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <User size={20} color={primaryScale.primary7} />
            )}
          </AnimatedStack>
        </Pressable>

        {/* 中间：标题 */}
        <TitleText>{title}</TitleText>

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
            backgroundColor={neutralScale.neutral2}
            alignItems="center"
            justifyContent="center"
            borderWidth={1.5}
            borderColor={neutralScale.neutral3}
          >
            <Bell size={20} color={neutralScale.neutral10} />
            {unreadCount > 0 && (
              <Stack
                position="absolute"
                top={-4}
                right={-4}
                minWidth={18}
                height={18}
                borderRadius={9}
                backgroundColor={errorScale.error6}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal={4}
                borderWidth={2}
                borderColor="white"
              >
                <Text fontSize={10} fontWeight="700" color="white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </Stack>
            )}
          </AnimatedStack>
        </Pressable>
      </TopRow>

      {/* 搜索框 */}
      <YStack paddingBottom={12}>
        <AnimatedSearchContainer style={searchAnimatedStyle}>
          <Search size={18} color={neutralScale.neutral7} />
          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="搜索帖子、标签、用户..."
            placeholderTextColor={neutralScale.neutral6}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClear}>
              <ClearButton>
                <X size={14} color={neutralScale.neutral7} />
              </ClearButton>
            </Pressable>
          )}
        </AnimatedSearchContainer>
      </YStack>
    </HeaderContainer>
  );
}

export const ForumHeader = memo(ForumHeaderComponent);
