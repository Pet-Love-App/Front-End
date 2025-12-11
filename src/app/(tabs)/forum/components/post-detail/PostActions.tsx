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
} from 'react-native-reanimated';
import { Heart, MessageCircle, Share2, Bookmark } from '@tamagui/lucide-icons';
import { styled, XStack, Text, Button } from 'tamagui';

import { ForumColors } from '../../constants';

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
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  backgroundColor: 'transparent',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$3',
  pressStyle: {
    backgroundColor: '$backgroundHover',
    opacity: 0.8,
  },
});

const ActionText = styled(Text, {
  name: 'ActionText',
  fontSize: 13,
  color: '$colorMuted',
});

const AnimatedButton = Animated.createAnimatedComponent(ActionButton);

/**
 * 帖子操作栏组件
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
  const likeScale = useSharedValue(1);

  // 点赞动画
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const handleLike = useCallback(() => {
    // 触发弹跳动画
    likeScale.value = withSequence(withSpring(1.3), withSpring(1));
    onLike?.();
  }, [onLike, likeScale]);

  return (
    <Container>
      {/* 点赞按钮 */}
      <AnimatedButton onPress={handleLike} style={likeAnimatedStyle}>
        <Heart
          size={20}
          color={isLiked ? '#ef4444' : ForumColors.text}
          fill={isLiked ? '#ef4444' : 'transparent'}
        />
        <ActionText style={{ color: isLiked ? '#ef4444' : ForumColors.text }}>
          {likeCount > 0 ? likeCount : '点赞'}
        </ActionText>
      </AnimatedButton>

      {/* 评论按钮 */}
      <ActionButton onPress={onComment}>
        <MessageCircle size={20} color={ForumColors.text} />
        <ActionText>{commentCount > 0 ? commentCount : '评论'}</ActionText>
      </ActionButton>

      {/* 收藏按钮 */}
      <ActionButton onPress={onBookmark}>
        <Bookmark
          size={20}
          color={isBookmarked ? ForumColors.clay : ForumColors.text}
          fill={isBookmarked ? ForumColors.clay : 'transparent'}
        />
        <ActionText style={{ color: isBookmarked ? ForumColors.clay : ForumColors.text }}>
          收藏
        </ActionText>
      </ActionButton>

      {/* 分享按钮 */}
      <ActionButton onPress={onShare}>
        <Share2 size={20} color={ForumColors.text} />
        <ActionText>分享</ActionText>
      </ActionButton>
    </Container>
  );
}

export const PostActions = memo(PostActionsComponent);
