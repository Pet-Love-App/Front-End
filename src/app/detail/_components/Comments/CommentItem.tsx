/**
 * 单条评论组件
 * 职责：展示单条评论的UI和交互
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Comment } from '@/src/services/api/comment';
import { memo } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Separator, Text, XStack, YStack } from 'tamagui';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

export const CommentItem = memo(function CommentItem({
  comment,
  currentUserId,
  onLike,
  onDelete,
}: CommentItemProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  const isOwner = comment.author.id === currentUserId;
  const likeCount = comment.likes || 0;

  return (
    <YStack paddingVertical="$3" gap="$2">
      <XStack gap="$3">
        {/* 头像 */}
        <CommentAvatar avatar={comment.author.avatar} authorName={comment.author.username} />

        {/* 内容区 */}
        <YStack flex={1} gap="$2">
          {/* 作者信息 */}
          <XStack alignItems="center" justifyContent="space-between">
            <XStack gap="$2" alignItems="center">
              <Text fontSize="$4" fontWeight="600" color={colors.text}>
                {comment.author.username}
              </Text>
              {isOwner && (
                <YStack
                  backgroundColor={colors.tint + '20'}
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius="$2"
                >
                  <Text fontSize="$1" color={colors.tint}>
                    我
                  </Text>
                </YStack>
              )}
            </XStack>

            {/* 删除按钮 */}
            {isOwner && (
              <TouchableOpacity onPress={() => onDelete(comment.id)}>
                <IconSymbol name="trash" size={16} color={colors.icon} />
              </TouchableOpacity>
            )}
          </XStack>

          {/* 评论内容 */}
          <Text fontSize="$3" color={colors.text} lineHeight={20}>
            {comment.content}
          </Text>

          {/* 底部信息（时间、点赞） */}
          <XStack gap="$4" alignItems="center">
            <Text fontSize="$2" color={colors.icon}>
              {formatTime(comment.createdAt)}
            </Text>

            <TouchableOpacity onPress={() => onLike(comment.id)}>
              <XStack gap="$1" alignItems="center">
                <IconSymbol
                  name={comment.isLiked ? 'heart.fill' : 'heart'}
                  size={14}
                  color={comment.isLiked ? '#E74C3C' : colors.icon}
                />
                {likeCount > 0 && (
                  <Text fontSize="$2" color={comment.isLiked ? '#E74C3C' : colors.icon}>
                    {likeCount}
                  </Text>
                )}
              </XStack>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </XStack>

      <Separator marginTop="$2" borderColor={colors.icon + '15'} />
    </YStack>
  );
});

/**
 * 评论头像组件
 */
interface CommentAvatarProps {
  avatar?: string | null;
  authorName: string;
}

const CommentAvatar = memo(function CommentAvatar({ avatar, authorName }: CommentAvatarProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        style={styles.avatar}
        defaultSource={require('@/assets/appIcon.png')}
      />
    );
  }

  return (
    <YStack
      width={40}
      height={40}
      borderRadius="$10"
      backgroundColor={colors.tint + '30'}
      alignItems="center"
      justifyContent="center"
    >
      <IconSymbol name="person.fill" size={20} color={colors.tint} />
    </YStack>
  );
});

/**
 * 格式化时间工具函数
 */
function formatTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
});
