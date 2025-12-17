/**
 * PostActions - 帖子操作栏
 *
 * 显示帖子的点赞、评论数、分享等操作按钮
 */

import React, { memo, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Heart, MessageCircle, Share2, Bookmark } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Text, Stack } from 'tamagui';

export interface PostActionsProps {
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
  /** 是否已点赞 */
  isLiked?: boolean;
  /** 是否已收藏 */
  isBookmarked?: boolean;
  /** 点赞操作 */
  onLike?: () => void;
  /** 评论操作（滚动到评论区） */
  onComment?: () => void;
  /** 分享操作 */
  onShare?: () => void;
  /** 收藏操作 */
  onBookmark?: () => void;
}

// 样式组件
const Container = styled(XStack, {
  name: 'PostActions',
  alignItems: 'center',
  justifyContent: 'space-around',
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#fff',
  borderTopWidth: 0.5,
  borderTopColor: 'rgba(0, 0, 0, 0.06)',
});

const ActionItem = styled(XStack, {
  name: 'ActionItem',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 20,
  pressStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    scale: 0.96,
  },
});

const ActionCount = styled(Text, {
  name: 'ActionCount',
  fontSize: 14,
  fontWeight: '600',
  color: '#8e8e93',
});

const ActiveCount = styled(Text, {
  name: 'ActiveCount',
  fontSize: 14,
  fontWeight: '600',
});

const AnimatedActionItem = Animated.createAnimatedComponent(ActionItem);
const AnimatedHeart = Animated.createAnimatedComponent(Stack);

/**
 * 格式化数字显示
 */
function formatCount(count: number): string {
  if (count === 0) return '';
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

/**
 * 帖子操作栏组件 - 底部悬浮设计
 */
function PostActionsComponent({
  likeCount,
  commentCount,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: PostActionsProps) {
  // 点赞动画
  const likeScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  // 收藏动画
  const bookmarkScale = useSharedValue(1);

  // 点赞按钮动画样式
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  // 爱心图标动画样式
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  // 收藏按钮动画样式
  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const handleLike = useCallback(() => {
    // 触发流畅的弹跳动画
    likeScale.value = withSequence(
      withTiming(0.9, { duration: 100, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    // 爱心图标特殊动画（点赞时放大更多）
    if (!isLiked) {
      heartScale.value = withSequence(
        withTiming(1.4, { duration: 150, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 8, stiffness: 300 })
      );
    } else {
      heartScale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
    }

    onLike?.();
  }, [onLike, isLiked, likeScale, heartScale]);

  const handleBookmark = useCallback(() => {
    bookmarkScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    onBookmark?.();
  }, [onBookmark, bookmarkScale]);

  return (
    <Container>
      {/* 点赞按钮 */}
      <AnimatedActionItem onPress={handleLike} style={likeAnimatedStyle}>
        <AnimatedHeart style={heartAnimatedStyle}>
          <Heart
            size={22}
            color={isLiked ? '#ff3b30' : '#8e8e93'}
            fill={isLiked ? '#ff3b30' : 'transparent'}
            strokeWidth={isLiked ? 0 : 1.8}
          />
        </AnimatedHeart>
        {likeCount > 0 && (
          <ActiveCount style={{ color: isLiked ? '#ff3b30' : '#8e8e93' }}>
            {formatCount(likeCount)}
          </ActiveCount>
        )}
      </AnimatedActionItem>

      {/* 评论按钮 */}
      <ActionItem onPress={onComment}>
        <MessageCircle size={22} color="#8e8e93" strokeWidth={1.8} />
        {commentCount > 0 && <ActionCount>{formatCount(commentCount)}</ActionCount>}
      </ActionItem>

      {/* 收藏按钮 */}
      <AnimatedActionItem onPress={handleBookmark} style={bookmarkAnimatedStyle}>
        <Bookmark
          size={22}
          color={isBookmarked ? '#007aff' : '#8e8e93'}
          fill={isBookmarked ? '#007aff' : 'transparent'}
          strokeWidth={isBookmarked ? 0 : 1.8}
        />
      </AnimatedActionItem>

      {/* 分享按钮 */}
      <ActionItem onPress={onShare}>
        <Share2 size={22} color="#8e8e93" strokeWidth={1.8} />
      </ActionItem>
    </Container>
  );
}

export const PostActions = memo(PostActionsComponent);
