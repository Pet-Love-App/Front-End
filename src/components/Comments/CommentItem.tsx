import { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Separator, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { AvatarImage } from '@/src/components/ui/OptimizedImage';
import type { Comment } from '@/src/lib/supabase';
import { primaryScale, errorScale } from '@/src/design-system/tokens';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

export const CommentItem = memo(function CommentItem({
  comment,
  currentUserId,
  onLike,
  onDelete,
}: CommentItemProps) {
  const isOwner = comment.author.id === currentUserId;
  const likeCount = comment.likes || 0;

  return (
    <YStack paddingVertical="$3" gap="$2">
      <XStack gap="$3">
        <CommentAvatar avatar={comment.author.avatarUrl} authorName={comment.author.username} />

        <YStack flex={1} gap="$2">
          {/* 作者信息 */}
          <XStack alignItems="center" justifyContent="space-between">
            <XStack gap="$2" alignItems="center">
              <Text fontSize="$4" fontWeight="600" color="$foreground">
                {comment.author.username}
              </Text>
              {isOwner && (
                <YStack
                  backgroundColor={primaryScale.primary2}
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius="$2"
                >
                  <Text fontSize="$1" color={primaryScale.primary9}>
                    我
                  </Text>
                </YStack>
              )}
            </XStack>

            {isOwner && (
              <TouchableOpacity onPress={() => onDelete(comment.id)} testID="delete-button">
                <IconSymbol name="trash" size={16} color="$foregroundSubtle" />
              </TouchableOpacity>
            )}
          </XStack>

          {/* 内容 */}
          <Text fontSize="$3" color="$foreground" lineHeight={20}>
            {comment.content}
          </Text>

          {/* 时间和点赞 */}
          <XStack gap="$4" alignItems="center">
            <Text fontSize="$2" color="$foregroundSubtle">
              {formatTime(comment.createdAt)}
            </Text>

            <TouchableOpacity onPress={() => onLike(comment.id)} testID="like-button">
              <XStack gap="$1" alignItems="center">
                <IconSymbol
                  name={comment.isLiked ? 'heart.fill' : 'heart'}
                  size={14}
                  color={comment.isLiked ? errorScale.error6 : '$foregroundSubtle'}
                />
                {likeCount > 0 && (
                  <Text
                    fontSize="$2"
                    color={comment.isLiked ? errorScale.error6 : '$foregroundSubtle'}
                  >
                    {likeCount}
                  </Text>
                )}
              </XStack>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </XStack>

      <Separator marginTop="$2" borderColor="$borderMuted" />
    </YStack>
  );
});

interface CommentAvatarProps {
  avatar?: string | null;
  authorName: string;
}

const CommentAvatar = memo(function CommentAvatar({ avatar }: CommentAvatarProps) {
  if (avatar) {
    return <AvatarImage source={avatar} size={40} cachePolicy="memory-disk" />;
  }

  return (
    <YStack
      width={40}
      height={40}
      borderRadius={20}
      backgroundColor={primaryScale.primary2}
      alignItems="center"
      justifyContent="center"
    >
      <IconSymbol name="person.fill" size={20} color={primaryScale.primary7} />
    </YStack>
  );
});

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
