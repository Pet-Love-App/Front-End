/**
 * PostDetailScreen - 帖子详情页
 *
 * Premium Design with:
 * - 全宽无边框媒体展示
 * - 悬浮底部操作栏
 * - 固定底部评论输入框
 * - 流畅的过渡动画
 */

import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, YStack, ScrollView } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { supabaseForumService, type Post } from '@/src/lib/supabase';

import { UserProfileModal } from '@/src/components/UserProfileModal';
import { CommentSection } from './CommentSection';
import { CommentInput } from './CommentInput';
import { PostActions } from './PostActions';
import { PostContent } from './PostContent';
import { PostDetailHeader } from './PostDetailHeader';
import { PostMediaGallery } from './PostMediaGallery';
import { usePostDetail } from './usePostDetail';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  backgroundColor: '#fff',
  zIndex: 300,
});

const ContentScrollView = styled(ScrollView, {
  name: 'PostContentScroll',
  flex: 1,
  backgroundColor: '#fff',
});

const Divider = styled(YStack, {
  name: 'Divider',
  height: 8,
  backgroundColor: '#f5f5f7',
});

// 底部固定区域
const BottomFixedContainer = styled(YStack, {
  name: 'BottomFixed',
  backgroundColor: '#fff',
  borderTopWidth: 0.5,
  borderTopColor: 'rgba(0, 0, 0, 0.06)',
});

const AnimatedContainer = Animated.createAnimatedComponent(Container);

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
  const scrollRef = useRef<any>(null);

  // 动画状态
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  // 帖子状态（用于点赞/收藏）
  const [localPost, setLocalPost] = useState<Post | null>(post);
  // 用户信息模态框
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    avatar?: string;
  } | null>(null);

  // 当外部 post 变化时同步
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // 入场/出场 - 无动画，直接显示
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      opacity.value = 1;
    } else {
      translateY.value = SCREEN_HEIGHT;
      opacity.value = 0;
    }
  }, [visible, translateY, opacity]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

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
    scrollRef.current?.scrollToEnd({ animated: true });
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
    }
  }, [localPost]);

  /**
   * 收藏帖子
   */
  const handleBookmark = useCallback(async () => {
    if (!localPost) return;

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
      setLocalPost((prev) =>
        prev
          ? {
              ...prev,
              isFavorited: wasBookmarked,
              favoritesCount: prevCount,
            }
          : null
      );
    }
  }, [localPost]);

  // 处理 Android 系统返回键
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // 不可见时不渲染
  if (!visible || !localPost) {
    return null;
  }

  return (
    <AnimatedContainer
      style={[{ top: headerOffset, paddingTop: insets.top }, containerAnimatedStyle]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerOffset + insets.top}
      >
        {/* 顶部导航栏 - 极简设计 */}
        <PostDetailHeader
          isAuthor={isPostAuthor}
          onClose={onClose}
          onEdit={handleEdit}
          onDelete={deletePost}
          onShare={handleShare}
        />

        {/* 帖子内容区域 */}
        <ContentScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {/* 媒体画廊 - 全宽沉浸式 */}
          {localPost.media && localPost.media.length > 0 && (
            <PostMediaGallery media={localPost.media} />
          )}

          {/* 帖子内容 - 高质量排版 */}
          <PostContent post={localPost} />

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

        {/* 固定底部评论输入框 */}
        <BottomFixedContainer>
          <CommentInput
            value={newComment}
            onChangeText={setNewComment}
            onSubmit={submitComment}
            replyTarget={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
          />
        </BottomFixedContainer>
      </KeyboardAvoidingView>

      {/* 用户信息模态框 */}
      {selectedUser && (
        <UserProfileModal
          visible={!!selectedUser}
          userId={selectedUser.id}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </AnimatedContainer>
  );
}

export const PostDetailScreen = memo(PostDetailScreenComponent);
