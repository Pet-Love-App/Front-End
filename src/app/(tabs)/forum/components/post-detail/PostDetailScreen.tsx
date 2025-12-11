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

import React, { memo, useCallback, useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, YStack } from 'tamagui';

import { supabaseForumService, type Post } from '@/src/lib/supabase';

import { UserProfileModal, type UserProfile } from '../community/UserProfileModal';
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

  // 帖子状态（用于点赞/收藏）
  const [localPost, setLocalPost] = React.useState<Post | null>(post);
  // 用户信息模态框
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    avatar?: string;
  } | null>(null);

  // 当外部 post 变化时同步
  React.useEffect(() => {
    setLocalPost(post);
  }, [post]);

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
   * 处理点击评论作者
   */
  const handleAuthorPress = useCallback(
    (author: { id: string; username: string; avatar?: string }) => {
      setSelectedUser(author);
    },
    []
  );

  /**
   * 分享帖子
   */
  const handleShare = useCallback(() => {
    // TODO: 实现分享功能
  }, []);

  /**
   * 点赞帖子
   */
  const handleLikePost = useCallback(async () => {
    if (!localPost) return;

    // 乐观更新 UI
    const wasLiked = localPost.isLiked ?? false;
    const prevCount = localPost.likesCount ?? 0;

    setLocalPost((prev) =>
      prev
        ? {
            ...prev,
            isLiked: !wasLiked,
            likesCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
          }
        : null
    );

    try {
      const { data, error } = await supabaseForumService.toggleLike(localPost.id);
      if (error) throw error;

      // 用服务器返回的真实数据更新
      if (data) {
        setLocalPost((prev) =>
          prev
            ? {
                ...prev,
                isLiked: data.action === 'liked',
                likesCount: data.likesCount ?? prev.likesCount,
              }
            : null
        );
      }
    } catch (error) {
      // 出错时回滚
      setLocalPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: wasLiked,
              likesCount: prevCount,
            }
          : null
      );
      console.error('点赞失败:', error);
    }
  }, [localPost]);

  /**
   * 收藏帖子
   */
  const handleBookmark = useCallback(async () => {
    if (!localPost) return;

    // 乐观更新 UI
    const wasBookmarked = localPost.isFavorited ?? false;
    const prevCount = localPost.favoritesCount ?? 0;

    setLocalPost((prev) =>
      prev
        ? {
            ...prev,
            isFavorited: !wasBookmarked,
            favoritesCount: wasBookmarked ? Math.max(0, prevCount - 1) : prevCount + 1,
          }
        : null
    );

    try {
      const { data, error } = await supabaseForumService.toggleFavorite(localPost.id);
      if (error) throw error;

      // 用服务器返回的真实数据更新
      if (data) {
        setLocalPost((prev) =>
          prev
            ? {
                ...prev,
                isFavorited: data.action === 'favorited',
                favoritesCount: data.favoritesCount ?? prev.favoritesCount,
              }
            : null
        );
      }
    } catch (error) {
      // 出错时回滚
      setLocalPost((prev) =>
        prev
          ? {
              ...prev,
              isFavorited: wasBookmarked,
              favoritesCount: prevCount,
            }
          : null
      );
      console.error('收藏失败:', error);
    }
  }, [localPost]);

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
  if (!visible || !localPost) {
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
          <PostContent post={localPost} />

          {/* 媒体画廊 */}
          {localPost.media && localPost.media.length > 0 && (
            <PostMediaGallery media={localPost.media} />
          )}

          {/* 操作栏 */}
          <PostActions
            likeCount={localPost.likesCount || 0}
            commentCount={comments.length}
            isLiked={localPost.isLiked}
            isBookmarked={localPost.isFavorited}
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
            onAuthorPress={handleAuthorPress}
          />
        </ContentScrollView>
      </KeyboardAvoidingView>

      {/* 用户信息模态框 */}
      {selectedUser && (
        <UserProfileModal
          visible={!!selectedUser}
          user={{
            id: selectedUser.id,
            username: selectedUser.username,
            avatar: selectedUser.avatar || undefined,
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isFollowing: false,
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </Container>
  );
}

export const PostDetailScreen = memo(PostDetailScreenComponent);
