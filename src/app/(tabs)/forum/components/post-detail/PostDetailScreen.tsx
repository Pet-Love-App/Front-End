/**
 * PostDetailScreen - 帖子详情页
 *
 * 组件化设计，将帖子详情拆分为多个独立组件：
 * - PostDetailHeader: 顶部导航栏
 * - PostContent: 帖子内容（作者、正文、标签）
 * - PostMediaGallery: 媒体画廊
 * - PostActions: 操作栏（点赞、评论、分享）
 * - CommentSection: 评论区
 */

import React, { memo, useCallback, useEffect } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, YStack } from 'tamagui';

import type { Post } from '@/src/lib/supabase';

import { CommentSection } from './CommentSection';
import { PostActions } from './PostActions';
import { PostContent } from './PostContent';
import { PostDetailHeader } from './PostDetailHeader';
import { PostMediaGallery } from './PostMediaGallery';
import { usePostDetail } from './usePostDetail';

export interface PostDetailScreenProps {
  /** 是否显示 */
  visible: boolean;
  /** 帖子数据 */
  post: Post | null;
  /** 关闭详情页 */
  onClose: () => void;
  /** 顶部偏移（适配 header） */
  headerOffset?: number;
  /** 编辑帖子 */
  onEditPost?: (post: Post) => void;
  /** 帖子删除后回调 */
  onPostDeleted?: () => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'PostDetailScreen',
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '$background',
  zIndex: 300,
  shadowColor: 'rgba(0, 0, 0, 0.15)',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 1,
  shadowRadius: 16,
  elevation: 8,
});

const ContentScrollView = styled(ScrollView, {
  name: 'PostContentScroll',
  flex: 1,
  backgroundColor: '$background',
});

const Divider = styled(YStack, {
  name: 'Divider',
  height: 8,
  backgroundColor: '$backgroundSubtle',
});

/**
 * 帖子详情页组件
 */
function PostDetailScreenComponent({
  visible,
  post,
  onClose,
  headerOffset = 0,
  onEditPost,
  onPostDeleted,
}: PostDetailScreenProps) {
  const insets = useSafeAreaInsets();

  // 使用详情页 Hook 管理所有状态和逻辑
  const {
    comments,
    isLoading,
    newComment,
    replyTarget,
    editingComment,
    currentUserId,
    isPostAuthor,
    setNewComment,
    setReplyTarget,
    submitComment,
    toggleCommentLike,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    setEditingContent,
    deleteComment,
    deletePost,
  } = usePostDetail({
    post,
    visible,
    onPostDeleted,
  });

  /**
   * 处理编辑帖子
   */
  const handleEdit = useCallback(() => {
    if (post) {
      onEditPost?.(post);
    }
  }, [post, onEditPost]);

  /**
   * 滚动到评论区
   */
  const scrollToComments = useCallback(() => {
    // 评论区会在 CommentSection 组件中处理
  }, []);

  /**
   * 分享帖子
   */
  const handleShare = useCallback(() => {
    // TODO: 实现分享功能
  }, []);

  /**
   * 收藏帖子
   */
  const handleBookmark = useCallback(() => {
    // TODO: 实现收藏功能
  }, []);

  /**
   * 点赞帖子
   */
  const handleLikePost = useCallback(() => {
    // TODO: 实现帖子点赞功能
  }, []);

  // 处理 Android 系统返回键
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true; // 阻止默认行为
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // 不可见时不渲染
  if (!visible || !post) {
    return null;
  }

  return (
    <Container style={{ top: headerOffset, paddingTop: insets.top }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerOffset + insets.top}
      >
        {/* 顶部导航栏 */}
        <PostDetailHeader
          isAuthor={isPostAuthor}
          onClose={onClose}
          onEdit={handleEdit}
          onDelete={deletePost}
        />

        {/* 帖子内容区域 */}
        <ContentScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
        >
          {/* 帖子内容 */}
          <PostContent post={post} />

          {/* 媒体画廊 */}
          {post.media && post.media.length > 0 && <PostMediaGallery media={post.media} />}

          {/* 操作栏 */}
          <PostActions
            likeCount={post.likesCount || 0}
            commentCount={comments.length}
            isLiked={post.isFavorited}
            onLike={handleLikePost}
            onComment={scrollToComments}
            onShare={handleShare}
            onBookmark={handleBookmark}
          />

          {/* 分隔线 */}
          <Divider />

          {/* 评论区 */}
          <CommentSection
            comments={comments}
            isLoading={isLoading}
            currentUserId={currentUserId}
            newComment={newComment}
            replyTarget={replyTarget}
            editingComment={editingComment}
            onCommentChange={setNewComment}
            onSubmitComment={submitComment}
            onToggleLike={toggleCommentLike}
            onSetReplyTarget={setReplyTarget}
            onStartEdit={startEditComment}
            onSaveEdit={saveEditComment}
            onCancelEdit={cancelEditComment}
            onEditChange={setEditingContent}
            onDeleteComment={deleteComment}
          />
        </ContentScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

export const PostDetailScreen = memo(PostDetailScreenComponent);
