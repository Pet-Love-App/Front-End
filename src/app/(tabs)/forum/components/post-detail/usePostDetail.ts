/**
 * usePostDetail - 帖子详情 Hook
 *
 * 管理帖子详情页的所有状态和业务逻辑
 * 包括：评论加载、点赞、回复、编辑、删除等
 */

import { useCallback, useEffect, useState } from 'react';

import {
  supabaseCommentService,
  supabaseForumService,
  type Comment,
  type Post,
} from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import { showAlert } from '@/src/components/dialogs';

import { MESSAGES } from '../../constants';

export interface UsePostDetailOptions {
  post: Post | null;
  visible: boolean;
  onPostDeleted?: () => void;
}

export interface UsePostDetailReturn {
  // 状态
  comments: Comment[];
  isLoading: boolean;
  newComment: string;
  replyTarget: Comment | null;
  editingComment: { id: number; content: string } | null;

  // 用户相关
  currentUserId: string | null;
  isPostAuthor: boolean;

  // 评论操作
  setNewComment: (content: string) => void;
  setReplyTarget: (comment: Comment | null) => void;
  submitComment: () => Promise<void>;
  toggleCommentLike: (commentId: number) => Promise<void>;

  // 评论编辑
  startEditComment: (comment: Comment) => void;
  cancelEditComment: () => void;
  saveEditComment: () => Promise<void>;
  setEditingContent: (content: string) => void;
  deleteComment: (commentId: number) => void;

  // 帖子操作
  deletePost: () => void;
  refreshComments: () => Promise<void>;
}

/**
 * 帖子详情 Hook
 */
export function usePostDetail({
  post,
  visible,
  onPostDeleted,
}: UsePostDetailOptions): UsePostDetailReturn {
  // 状态
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(
    null
  );

  // 用户信息
  const currentUser = useUserStore((s) => s.user);
  const currentUserId = currentUser?.id || null;
  const isPostAuthor = !!(currentUser && post && currentUser.id === post.author.id);

  /**
   * 加载评论列表
   */
  const loadComments = useCallback(async () => {
    if (!post) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabaseCommentService.getComments({
        targetType: 'post',
        targetId: post.id,
      });
      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('加载评论失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  /**
   * 当详情页显示时加载评论
   */
  useEffect(() => {
    if (visible && post) {
      loadComments();
    } else {
      // 重置状态
      setComments([]);
      setNewComment('');
      setReplyTarget(null);
      setEditingComment(null);
    }
  }, [visible, post, loadComments]);

  /**
   * 提交新评论
   */
  const submitComment = useCallback(async () => {
    if (!post || !newComment.trim()) return;

    try {
      const { error } = await supabaseCommentService.createComment({
        targetType: 'post',
        targetId: post.id,
        content: newComment.trim(),
        parentId: replyTarget?.id || undefined,
      });

      if (error) throw error;

      setNewComment('');
      setReplyTarget(null);
      await loadComments();
    } catch {
      showAlert({
        title: '错误',
        message: MESSAGES.ERROR.OPERATION_FAILED,
        type: 'error',
      });
    }
  }, [post, newComment, replyTarget, loadComments]);

  /**
   * 切换评论点赞
   */
  const toggleCommentLike = useCallback(async (commentId: number) => {
    try {
      const { data, error } = await supabaseCommentService.toggleCommentLike(commentId);
      if (error) throw error;
      if (!data) return;

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: data.likes || 0, isLiked: data.liked } : c
        )
      );
    } catch {
      showAlert({
        title: '错误',
        message: MESSAGES.ERROR.OPERATION_FAILED,
        type: 'error',
      });
    }
  }, []);

  /**
   * 开始编辑评论
   */
  const startEditComment = useCallback((comment: Comment) => {
    setEditingComment({ id: comment.id, content: comment.content });
  }, []);

  /**
   * 取消编辑评论
   */
  const cancelEditComment = useCallback(() => {
    setEditingComment(null);
  }, []);

  /**
   * 设置编辑中的评论内容
   */
  const setEditingContent = useCallback((content: string) => {
    setEditingComment((prev) => (prev ? { ...prev, content } : null));
  }, []);

  /**
   * 保存编辑的评论
   */
  const saveEditComment = useCallback(async () => {
    if (!editingComment || !editingComment.content.trim()) return;

    try {
      const { error } = await supabaseCommentService.updateComment(
        editingComment.id,
        editingComment.content.trim()
      );
      if (error) throw error;

      setComments((prev) =>
        prev.map((c) =>
          c.id === editingComment.id ? { ...c, content: editingComment.content.trim() } : c
        )
      );
      setEditingComment(null);
    } catch {
      showAlert({
        title: '错误',
        message: MESSAGES.ERROR.UPDATE_FAILED,
        type: 'error',
      });
    }
  }, [editingComment]);

  /**
   * 删除评论（带确认）
   */
  const deleteComment = useCallback((commentId: number) => {
    showAlert({
      title: '确认删除',
      message: MESSAGES.CONFIRM.DELETE_COMMENT,
      type: 'warning',
      buttons: [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabaseCommentService.deleteComment(commentId);
              if (error) throw error;
              setComments((prev) => prev.filter((c) => c.id !== commentId));
            } catch {
              showAlert({
                title: '错误',
                message: MESSAGES.ERROR.DELETE_FAILED,
                type: 'error',
              });
            }
          },
        },
      ],
    });
  }, []);

  /**
   * 删除帖子（带确认）
   */
  const deletePost = useCallback(() => {
    if (!post) return;

    showAlert({
      title: '确认删除',
      message: MESSAGES.CONFIRM.DELETE_POST,
      type: 'warning',
      buttons: [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabaseForumService.deletePost(post.id);
              if (error) throw error;
              onPostDeleted?.();
            } catch {
              showAlert({
                title: '错误',
                message: MESSAGES.ERROR.DELETE_FAILED,
                type: 'error',
              });
            }
          },
        },
      ],
    });
  }, [post, onPostDeleted]);

  return {
    // 状态
    comments,
    isLoading,
    newComment,
    replyTarget,
    editingComment,

    // 用户相关
    currentUserId,
    isPostAuthor,

    // 评论操作
    setNewComment,
    setReplyTarget,
    submitComment,
    toggleCommentLike,

    // 评论编辑
    startEditComment,
    cancelEditComment,
    saveEditComment,
    setEditingContent,
    deleteComment,

    // 帖子操作
    deletePost,
    refreshComments: loadComments,
  };
}
