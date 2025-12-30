/**
 * 帖子详情页面（独立全屏页面）
 *
 * 放在 app 根目录下，作为独立的全屏页面
 * 用于从评论、通知、收藏等处跳转显示帖子详情
 * 返回时会正确回到之前的页面
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { YStack, Spinner, Text, Stack, XStack } from 'tamagui';
import { Pressable } from 'react-native';
import { ChevronLeft } from '@tamagui/lucide-icons';

import { supabaseForumService, type Post } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';
import { PostDetailScreen } from './(tabs)/forum/components/post-detail';
import { neutralScale, primaryScale } from '@/src/design-system/tokens';

/**
 * 帖子详情页面
 */
export default function PostDetailPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ postId: string; commentId?: string }>();
  const postId = params.postId ? parseInt(params.postId, 10) : null;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理返回 - 使用 router.back() 返回上一页
   */
  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  /**
   * 加载帖子详情
   */
  const loadPost = useCallback(async () => {
    if (!postId) {
      setError('无效的帖子ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabaseForumService.getPostDetail(postId);
      if (fetchError) throw fetchError;
      if (!data) throw new Error('帖子不存在');
      setPost(data);
    } catch (err) {
      logger.error('加载帖子失败', err as Error);
      setError('加载帖子失败');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  /**
   * 处理编辑帖子
   */
  const handleEditPost = useCallback((editPost: Post) => {
    router.push({
      pathname: '/(tabs)/forum/create-post',
      params: { editPostId: editPost.id.toString() },
    });
  }, []);

  /**
   * 处理帖子删除
   */
  const handlePostDeleted = useCallback(() => {
    handleGoBack();
  }, [handleGoBack]);

  // 加载中
  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="white" testID="loading-spinner">
        <XStack
          paddingTop={insets.top}
          paddingHorizontal={16}
          paddingVertical={12}
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor={neutralScale.neutral3}
        >
          <Pressable onPress={handleGoBack} testID="close-button">
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
            >
              <ChevronLeft size={24} color={neutralScale.neutral12} />
            </Stack>
          </Pressable>
          <Text
            flex={1}
            textAlign="center"
            fontSize={17}
            fontWeight="600"
            color={neutralScale.neutral12}
          >
            帖子详情
          </Text>
          <Stack width={40} />
        </XStack>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={primaryScale.primary7} />
        </YStack>
      </YStack>
    );
  }

  // 错误状态
  if (error || !post) {
    return (
      <YStack flex={1} backgroundColor="white" testID="error-view">
        <XStack
          paddingTop={insets.top}
          paddingHorizontal={16}
          paddingVertical={12}
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor={neutralScale.neutral3}
        >
          <Pressable onPress={handleGoBack} testID="close-button">
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
            >
              <ChevronLeft size={24} color={neutralScale.neutral12} />
            </Stack>
          </Pressable>
          <Text
            flex={1}
            textAlign="center"
            fontSize={17}
            fontWeight="600"
            color={neutralScale.neutral12}
          >
            帖子详情
          </Text>
          <Stack width={40} />
        </XStack>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={16} padding={24}>
          <Text fontSize={16} color={neutralScale.neutral8}>
            {error || '帖子不存在'}
          </Text>
          <Pressable onPress={handleGoBack}>
            <XStack
              paddingHorizontal={20}
              paddingVertical={10}
              borderRadius={20}
              backgroundColor={primaryScale.primary7}
            >
              <Text color="white" fontWeight="600">
                返回
              </Text>
            </XStack>
          </Pressable>
        </YStack>
      </YStack>
    );
  }

  // 复用 PostDetailScreen 组件显示帖子详情
  return (
    <YStack flex={1} backgroundColor="white" testID="post-detail-screen">
      <PostDetailScreen
        post={post}
        onBack={handleGoBack}
        onEdit={handleEditPost}
        onDelete={handlePostDeleted}
        initialCommentId={params.commentId ? parseInt(params.commentId, 10) : undefined}
      />
    </YStack>
  );
}
