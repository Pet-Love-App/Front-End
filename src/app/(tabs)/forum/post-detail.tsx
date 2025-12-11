/**
 * 帖子详情页面
 *
 * 独立页面，用于从通知等处跳转显示帖子详情
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Spinner, Stack } from 'tamagui';
import { Pressable, ScrollView } from 'react-native';

import {
  supabaseForumService,
  supabaseCommentService,
  type Post,
  type Comment,
} from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';
import { useUserStore } from '@/src/store/userStore';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';
import { CommentSection } from './components/post-detail/CommentSection';

// 样式组件
const Container = styled(YStack, {
  name: 'PostDetailContainer',
  flex: 1,
  backgroundColor: 'white',
});

const Header = styled(XStack, {
  name: 'PostDetailHeader',
  paddingHorizontal: 16,
  paddingVertical: 12,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: neutralScale.neutral3,
  backgroundColor: 'white',
});

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  fontSize: 17,
  fontWeight: '600',
  color: neutralScale.neutral12,
});

const BackButton = styled(Stack, {
  name: 'BackButton',
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
});

const PostContent = styled(YStack, {
  name: 'PostContent',
  padding: 16,
  gap: 12,
  borderBottomWidth: 1,
  borderBottomColor: neutralScale.neutral3,
});

const PostText = styled(Text, {
  name: 'PostText',
  fontSize: 16,
  lineHeight: 26,
  color: neutralScale.neutral11,
});

const AuthorRow = styled(XStack, {
  name: 'AuthorRow',
  alignItems: 'center',
  gap: 10,
});

const AuthorName = styled(Text, {
  name: 'AuthorName',
  fontSize: 14,
  fontWeight: '600',
  color: neutralScale.neutral12,
});

const PostTime = styled(Text, {
  name: 'PostTime',
  fontSize: 13,
  color: neutralScale.neutral7,
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

const ErrorContainer = styled(YStack, {
  name: 'ErrorContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  padding: 24,
});

/**
 * 格式化时间
 */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 帖子详情页面
 */
export default function PostDetailPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ postId: string; commentId?: string }>();
  const postId = params.postId ? parseInt(params.postId, 10) : null;
  const highlightCommentId = params.commentId ? parseInt(params.commentId, 10) : null;

  const { user } = useUserStore();
  const currentUserId = user?.id || null;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 评论相关状态
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(
    null
  );
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

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

  /**
   * 加载评论
   */
  const loadComments = useCallback(async () => {
    if (!postId) return;

    try {
      setIsCommentsLoading(true);
      const { data, error: fetchError } = await supabaseCommentService.getComments({
        targetType: 'post',
        targetId: postId,
      });
      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err) {
      logger.error('加载评论失败', err as Error);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  /**
   * 提交评论
   */
  const handleSubmitComment = useCallback(async () => {
    if (!postId || !newComment.trim()) return;

    try {
      const { error: submitError } = await supabaseCommentService.createComment({
        targetType: 'post',
        targetId: postId,
        content: newComment.trim(),
        parentId: replyTarget?.id,
      });

      if (submitError) throw submitError;

      setNewComment('');
      setReplyTarget(null);
      loadComments();
    } catch (err) {
      logger.error('评论失败', err as Error);
    }
  }, [postId, newComment, replyTarget, loadComments]);

  /**
   * 切换评论点赞
   */
  const handleToggleLike = useCallback(
    async (commentId: number) => {
      try {
        await supabaseCommentService.toggleCommentLike(commentId);
        loadComments();
      } catch (err) {
        logger.error('点赞失败', err as Error);
      }
    },
    [loadComments]
  );

  /**
   * 开始编辑评论
   */
  const handleStartEdit = useCallback((comment: Comment) => {
    setEditingComment({ id: comment.id, content: comment.content });
  }, []);

  /**
   * 保存编辑
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editingComment) return;

    try {
      const { error: updateError } = await supabaseCommentService.updateComment(
        editingComment.id,
        editingComment.content
      );
      if (updateError) throw updateError;

      setEditingComment(null);
      loadComments();
    } catch (err) {
      logger.error('编辑评论失败', err as Error);
    }
  }, [editingComment, loadComments]);

  /**
   * 删除评论
   */
  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      try {
        const { error: deleteError } = await supabaseCommentService.deleteComment(commentId);
        if (deleteError) throw deleteError;
        loadComments();
      } catch (err) {
        logger.error('删除评论失败', err as Error);
      }
    },
    [loadComments]
  );

  // 加载中
  if (isLoading) {
    return (
      <Container>
        <Header paddingTop={insets.top}>
          <Pressable onPress={() => router.back()}>
            <BackButton>
              <ChevronLeft size={24} color={neutralScale.neutral12} />
            </BackButton>
          </Pressable>
          <HeaderTitle>帖子详情</HeaderTitle>
          <Stack width={40} />
        </Header>
        <LoadingContainer>
          <Spinner size="large" color={primaryScale.primary7} />
        </LoadingContainer>
      </Container>
    );
  }

  // 错误状态
  if (error || !post) {
    return (
      <Container>
        <Header paddingTop={insets.top}>
          <Pressable onPress={() => router.back()}>
            <BackButton>
              <ChevronLeft size={24} color={neutralScale.neutral12} />
            </BackButton>
          </Pressable>
          <HeaderTitle>帖子详情</HeaderTitle>
          <Stack width={40} />
        </Header>
        <ErrorContainer>
          <Text fontSize={16} color={neutralScale.neutral8}>
            {error || '帖子不存在'}
          </Text>
          <Pressable onPress={() => router.back()}>
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
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* 头部 */}
      <Header paddingTop={insets.top}>
        <Pressable onPress={() => router.back()}>
          <BackButton>
            <ChevronLeft size={24} color={neutralScale.neutral12} />
          </BackButton>
        </Pressable>
        <HeaderTitle>帖子详情</HeaderTitle>
        <Stack width={40} />
      </Header>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* 帖子内容 */}
        <PostContent>
          <AuthorRow>
            <Stack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor={primaryScale.primary2}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={14} fontWeight="600" color={primaryScale.primary8}>
                {post.author?.username?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </Stack>
            <YStack>
              <AuthorName>{post.author?.username || '匿名用户'}</AuthorName>
              <PostTime>{formatTime(post.createdAt)}</PostTime>
            </YStack>
          </AuthorRow>
          <PostText>{post.content}</PostText>
        </PostContent>

        {/* 评论区 */}
        <CommentSection
          comments={comments}
          isLoading={isCommentsLoading}
          currentUserId={currentUserId}
          newComment={newComment}
          replyTarget={replyTarget}
          editingComment={editingComment}
          onCommentChange={setNewComment}
          onSubmitComment={handleSubmitComment}
          onToggleLike={handleToggleLike}
          onSetReplyTarget={setReplyTarget}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingComment(null)}
          onEditChange={(content) =>
            setEditingComment((prev) => (prev ? { ...prev, content } : null))
          }
          onDeleteComment={handleDeleteComment}
        />
      </ScrollView>
    </Container>
  );
}
