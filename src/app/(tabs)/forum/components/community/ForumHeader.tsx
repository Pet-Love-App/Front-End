/**
 * ForumHeader - 论坛页面头部组件
 *
 * 包含标题、搜索框、消息通知入口
 * 设计风格：简洁现代，毛玻璃效果
 */

import React, { memo, useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Bell, Search, X } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Text, Input, Stack, useTheme } from 'tamagui';

export interface ForumHeaderProps {
  title?: string;
  unreadCount?: number;
  onSearch?: (query: string) => void;
  onNotificationPress?: () => void;
  paddingTop?: number;
}

const HeaderContainer = styled(YStack, {
  name: 'ForumHeader',
  backgroundColor: '$background',
  paddingHorizontal: '$4',
  gap: '$3',
  paddingBottom: '$4',
});

const TopRow = styled(XStack, {
  name: 'ForumHeaderTop',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '$2',
});

const TitleText = styled(Text, {
  name: 'ForumTitle',
  fontSize: 28,
  fontWeight: '800',
  color: '$color',
  letterSpacing: -0.5,
});

const IconButton = styled(Stack, {
  name: 'IconButton',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$backgroundSubtle',
  position: 'relative',
});

const NotificationBadge = styled(Stack, {
  name: 'NotificationBadge',
  position: 'absolute',
  top: -4,
  right: -4,
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '$secondary',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$1.5',
  borderWidth: 2,
  borderColor: '$background',
});

const BadgeText = styled(Text, {
  name: 'BadgeText',
  fontSize: 11,
  fontWeight: '700',
  color: 'white',
});

const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  backgroundColor: '$backgroundSubtle',
  borderRadius: 16,
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  alignItems: 'center',
  gap: '$3',
  borderWidth: 1,
  borderColor: 'transparent',
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
  backgroundColor: '$backgroundHover',
  alignItems: 'center',
  justifyContent: 'center',
});

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);
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

  const bellScale = useSharedValue(1);

  // 搜索框聚焦动画
  const derivedFocus = useDerivedValue(() => {
    return withSpring(isSearchFocused ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [isSearchFocused]);

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        derivedFocus.value,
        [0, 1],
        ['transparent', theme.primary?.val || '#7FB093']
      ),
      transform: [{ scale: 1 + derivedFocus.value * 0.01 }],
    };
  });

  const bellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
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

  const handleBellPressIn = () => {
    bellScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handleBellPressOut = () => {
    bellScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <HeaderContainer paddingTop={paddingTop}>
      <TopRow>
        <TitleText>{title}</TitleText>

        <XStack gap="$3" alignItems="center">
          <Pressable
            onPress={handleNotificationPress}
            onPressIn={handleBellPressIn}
            onPressOut={handleBellPressOut}
          >
            <AnimatedIconButton style={bellAnimatedStyle}>
              <Bell size={22} color={theme.color?.val} />
              {unreadCount > 0 && (
                <NotificationBadge>
                  <BadgeText>{unreadCount > 99 ? '99+' : unreadCount}</BadgeText>
                </NotificationBadge>
              )}
            </AnimatedIconButton>
          </Pressable>
        </XStack>
      </TopRow>

      <AnimatedSearchContainer style={searchAnimatedStyle}>
        <Search size={20} color={theme.colorMuted?.val} />
        <SearchInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="搜索帖子、标签、用户..."
          placeholderTextColor={theme.colorSubtle?.val}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchText.length > 0 && (
          <Pressable onPress={handleClear}>
            <ClearButton>
              <X size={14} color={theme.colorMuted?.val} />
            </ClearButton>
          </Pressable>
        )}
      </AnimatedSearchContainer>
    </HeaderContainer>
  );
}

export const ForumHeader = memo(ForumHeaderComponent);
