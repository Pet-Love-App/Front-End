/**
 * 评论业务逻辑 Hook
 * 职责：封装评论相关的数据获取和操作逻辑
 */
import { commentService, type Comment } from '@/src/services/api/comment';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface UseCommentsOptions {
  targetType: 'catfood' | 'post' | 'report';
  targetId: number;
  pageSize?: number;
}

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  page: number;
  totalCount: number;
  loadComments: (pageNum?: number, refresh?: boolean) => Promise<void>;
  createComment: (content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  toggleLike: (commentId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * 评论管理 Hook
 */
export function useComments({
  targetType,
  targetId,
  pageSize = 20,
}: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * 加载评论列表
   */
  const loadComments = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else if (pageNum === 1) {
          setIsLoading(true);
        }

        const response = await commentService.getComments(targetType, targetId, pageNum, pageSize);

        if (refresh || pageNum === 1) {
          setComments(response.results);
        } else {
          setComments((prev) => [...prev, ...response.results]);
        }

        setHasMore(!!response.next);
        setPage(pageNum);
        setTotalCount(response.count);
      } catch (error) {
        console.error('加载评论失败:', error);
        Alert.alert('加载失败', '无法加载评论列表');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [targetType, targetId, pageSize]
  );

  /**
   * 创建评论
   */
  const createComment = useCallback(
    async (content: string) => {
      try {
        await commentService.createComment({
          content,
          targetId,
          targetType,
        });

        Alert.alert('✅ 成功', '评论已发表');
        // 刷新评论列表
        await loadComments(1, true);
      } catch (error: any) {
        console.error('发表评论失败:', error);
        throw new Error(error.message || '发表评论失败');
      }
    },
    [targetId, targetType, loadComments]
  );

  /**
   * 删除评论
   */
  const deleteComment = useCallback(async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      Alert.alert('✅ 成功', '评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      throw new Error('删除失败');
    }
  }, []);

  /**
   * 切换点赞状态
   */
  const toggleLike = useCallback(async (commentId: number) => {
    try {
      const result = await commentService.toggleLike(commentId);

      // 更新本地状态
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: result.likes,
                isLiked: result.action === 'liked',
              }
            : comment
        )
      );
    } catch (error) {
      console.error('点赞失败:', error);
      throw new Error('操作失败');
    }
  }, []);

  /**
   * 刷新评论列表
   */
  const refresh = useCallback(() => loadComments(1, true), [loadComments]);

  // 初始加载
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    isRefreshing,
    hasMore,
    page,
    totalCount,
    loadComments,
    createComment,
    deleteComment,
    toggleLike,
    refresh,
  };
}
