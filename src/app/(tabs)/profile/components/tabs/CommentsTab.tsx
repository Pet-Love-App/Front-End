import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { supabaseCommentService, type Comment } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import { memo, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { Card, Spinner, Text, XStack, YStack } from 'tamagui';

/**
 * 评论 Tab 组件
 *
 * 功能：
 * - 显示用户的所有评论
 * - 支持下拉刷新
 * - 显示评论内容和时间
 *
 * @component
 */
export const CommentsTab = memo(function CommentsTab() {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { _hasHydrated, isAuthenticated } = useUserStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 加载评论列表
   */
  const loadComments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error } = await supabaseCommentService.getMyComments();
      if (error) {
        throw new Error(error.message);
      }
      setComments(data || []);
    } catch (error: any) {
      console.error('加载评论失败:', error);
      Alert.alert('错误', '加载评论失败，请稍后重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 等待 Zustand 状态恢复完成后再加载评论
    if (_hasHydrated && isAuthenticated) {
      loadComments();
    } else if (_hasHydrated && !isAuthenticated) {
      // 如果已经恢复但未认证，停止加载
      setIsLoading(false);
    }
  }, [_hasHydrated, isAuthenticated]);

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <Spinner size="large" color="#FEBE98" />
        <Text fontSize={14} color={colors.icon} marginTop="$3">
          加载中...
        </Text>
      </YStack>
    );
  }

  if (comments.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadComments(true)} />
        }
      >
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
          <YStack
            width={100}
            height={100}
            borderRadius="$12"
            backgroundColor="$gray2"
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol
              name="bubble.left.and.bubble.right.fill"
              size={50}
              color={colors.icon + '60'}
            />
          </YStack>
          <Text fontSize={16} fontWeight="600" color={colors.text}>
            还没有评论
          </Text>
          <Text fontSize={14} color={colors.icon} textAlign="center">
            去猫粮详情页发表你的第一条评论吧
          </Text>
        </YStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => loadComments(true)} />
      }
    >
      <YStack width="100%" alignItems="center" paddingVertical="$4" gap="$3">
        {comments.map((comment) => (
          <Card
            key={comment.id}
            width="90%"
            padding="$4"
            backgroundColor={colors.background}
            borderWidth={1}
            borderColor={colors.icon + '15'}
            borderRadius="$4"
          >
            <YStack gap="$3">
              {/* 评论内容 */}
              <Text fontSize={15} color={colors.text} lineHeight={22}>
                {comment.content}
              </Text>

              {/* 评论信息 */}
              <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$2" alignItems="center">
                  <IconSymbol name="clock" size={14} color={colors.icon} />
                  <Text fontSize={12} color={colors.icon}>
                    {formatTime(comment.createdAt)}
                  </Text>
                </XStack>
                <XStack gap="$1" alignItems="center">
                  <IconSymbol
                    name={comment.isLiked ? 'heart.fill' : 'heart.fill'}
                    size={14}
                    color={comment.isLiked ? '#FEBE98' : colors.icon}
                  />
                  <Text fontSize={12} color={colors.icon}>
                    {comment.likes || 0}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </Card>
        ))}
      </YStack>
    </ScrollView>
  );
});
