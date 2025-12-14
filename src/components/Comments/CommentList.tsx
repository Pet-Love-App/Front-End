/**
 * 评论列表组件
 * 职责：展示评论列表和空状态
 */
import { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Comment } from '@/src/lib/supabase';

import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  isLoading: boolean;
  hasMore: boolean;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onLoadMore: () => void;
}

export const CommentList = memo(function CommentList({
  comments,
  currentUserId,
  isLoading,
  hasMore,
  onLike,
  onDelete,
  onLoadMore,
}: CommentListProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 防御性编程：确保 comments 是数组
  const safeComments = Array.isArray(comments) ? comments : [];

  // 加载中状态
  if (isLoading && safeComments.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$6">
        <ActivityIndicator size="large" color={colors.tint} />
        <Text fontSize="$3" color={colors.icon} marginTop="$2">
          加载中...
        </Text>
      </YStack>
    );
  }

  // 空状态
  if (safeComments.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$6" gap="$2">
        <IconSymbol name="bubble.left" size={48} color={colors.icon + '40'} />
        <Text fontSize="$4" color={colors.icon}>
          还没有评论
        </Text>
        <Text fontSize="$2" color={colors.icon}>
          快来发表第一条评论吧~
        </Text>
      </YStack>
    );
  }

  // 评论列表
  return (
    <YStack>
      {safeComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}

      {/* 加载更多按钮 */}
      {hasMore && (
        <Button
          size="$3"
          variant="outlined"
          onPress={onLoadMore}
          borderColor={colors.icon + '30'}
          color={colors.text}
          marginTop="$2"
          disabled={isLoading}
        >
          {isLoading ? '加载中...' : '加载更多'}
        </Button>
      )}
    </YStack>
  );
});
