/**
 * 评论区主组件
 * 职责：组合子组件，协调评论相关的用户交互
 */
import { memo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useUserStore } from '@/src/store/userStore';
import { showAlert } from '@/src/components/dialogs';

import { CommentInput } from './CommentInput';
import { CommentList } from './CommentList';
import { useComments } from './useComments';

interface CommentSectionProps {
  /** 目标对象类型 */
  targetType: 'catfood' | 'post' | 'report';
  /** 目标对象ID */
  targetId: number;
}

/**
 * 评论区组件
 * 展示评论列表、评论输入框，处理评论相关交互
 */
export const CommentSection = memo(function CommentSection({
  targetType,
  targetId,
}: CommentSectionProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();

  // 使用自定义Hook管理评论状态和逻辑
  const {
    comments,
    isLoading,
    hasMore,
    page,
    totalCount,
    loadComments,
    createComment,
    deleteComment,
    toggleLike,
  } = useComments({
    targetType,
    targetId,
  });

  /**
   * 处理评论提交
   */
  const handleSubmitComment = useCallback(
    async (content: string) => {
      if (!isAuthenticated) {
        showAlert({
          title: '请先登录',
          message: '登录后才能发表评论',
          type: 'warning',
          buttons: [
            { text: '取消', style: 'cancel' },
            { text: '去登录', onPress: () => router.push('/login') },
          ],
        });
        throw new Error('未登录');
      }

      await createComment(content);
    },
    [isAuthenticated, createComment, router]
  );

  /**
   * 处理点赞
   */
  const handleLike = useCallback(
    async (commentId: number) => {
      if (!isAuthenticated) {
        showAlert({
          title: '请先登录',
          message: '登录后才能点赞',
          type: 'warning',
          buttons: [
            { text: '取消', style: 'cancel' },
            { text: '去登录', onPress: () => router.push('/login') },
          ],
        });
        return;
      }

      try {
        await toggleLike(commentId);
      } catch (error) {
        showAlert({
          title: '失败',
          message: '操作失败，请重试',
          type: 'error',
        });
      }
    },
    [isAuthenticated, toggleLike, router]
  );

  /**
   * 处理删除评论
   */
  const handleDelete = useCallback(
    (commentId: number) => {
      showAlert({
        title: '确认删除',
        message: '确定要删除这条评论吗？',
        type: 'warning',
        buttons: [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteComment(commentId);
              } catch (error) {
                showAlert({
                  title: '失败',
                  message: '删除失败，请重试',
                  type: 'error',
                });
              }
            },
          },
        ],
      });
    },
    [deleteComment]
  );

  /**
   * 处理加载更多
   */
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadComments(page + 1);
    }
  }, [isLoading, hasMore, page, loadComments]);

  return (
    <Card
      padding="$4"
      marginHorizontal="$2"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$5"
      bordered
      borderColor="$gray4"
    >
      <YStack gap="$3">
        {/* 标题栏 */}
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$2">
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={20} color={colors.tint} />
            <Text fontSize="$6" fontWeight="700" color={colors.text}>
              评论
            </Text>
            {totalCount > 0 && (
              <YStack
                backgroundColor={colors.tintAlpha20 as any}
                paddingHorizontal="$2"
                paddingVertical="$0.5"
                borderRadius="$3"
              >
                <Text fontSize="$2" color={colors.tint} fontWeight="600">
                  {totalCount}
                </Text>
              </YStack>
            )}
          </XStack>
        </XStack>

        {/* 评论输入框 */}
        <CommentInput
          isAuthenticated={isAuthenticated}
          onSubmit={handleSubmitComment}
          placeholder="说点什么..."
        />

        <Separator borderColor={colors.iconAlpha20 as any} />

        {/* 评论列表 */}
        <CommentList
          comments={comments}
          currentUserId={user?.id}
          isLoading={isLoading}
          hasMore={hasMore}
          onLike={handleLike}
          onDelete={handleDelete}
          onLoadMore={handleLoadMore}
        />
      </YStack>
    </Card>
  );
});
