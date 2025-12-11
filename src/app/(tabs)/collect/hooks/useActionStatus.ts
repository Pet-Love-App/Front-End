/**
 * 点赞/收藏状态管理 Hook
 */

import { useCallback, useEffect, useState } from 'react';

import { supabaseCatfoodService } from '@/src/lib/supabase';

interface ActionStatus {
  liked: boolean;
  likeCount: number;
  favorited: boolean;
}

interface UseActionStatusReturn {
  // 状态
  liked: boolean;
  likeCount: number;
  favorited: boolean;
  isLoading: boolean;

  // 操作
  toggleLike: () => Promise<void>;
  toggleFavorite: () => Promise<void>;
}

/** 点赞/收藏状态管理 */
export function useActionStatus(catfoodId: string): UseActionStatusReturn {
  const [status, setStatus] = useState<ActionStatus>({
    liked: false,
    likeCount: 0,
    favorited: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：并行获取所有状态
  useEffect(() => {
    let isMounted = true;

    const fetchAllStatus = async () => {
      try {
        setIsLoading(true);

        // 并行请求，提高性能
        const [favoriteResult, likeResult, countResult] = await Promise.all([
          supabaseCatfoodService.checkFavorite(catfoodId),
          supabaseCatfoodService.checkLike(catfoodId),
          supabaseCatfoodService.getLikeCount(catfoodId),
        ]);

        if (!isMounted) return;

        setStatus({
          favorited: favoriteResult.data ?? false,
          liked: likeResult.data ?? false,
          likeCount: countResult.data ?? 0,
        });
      } catch (error) {
        console.error('获取状态失败:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllStatus();

    return () => {
      isMounted = false;
    };
  }, [catfoodId]);

  // 切换点赞
  const toggleLike = useCallback(async () => {
    // 乐观更新
    const newLiked = !status.liked;
    const newCount = newLiked ? status.likeCount + 1 : status.likeCount - 1;

    setStatus((prev) => ({
      ...prev,
      liked: newLiked,
      likeCount: newCount,
    }));

    try {
      const result = await supabaseCatfoodService.toggleLike(catfoodId);

      if (result.data) {
        // 同步真实状态
        setStatus((prev) => ({
          ...prev,
          liked: result.data!.liked,
          likeCount: result.data!.likes,
        }));
      }
    } catch (error) {
      console.error('点赞失败:', error);
      // 回滚
      setStatus((prev) => ({
        ...prev,
        liked: !newLiked,
        likeCount: status.likeCount,
      }));
      throw error;
    }
  }, [catfoodId, status]);

  // 切换收藏
  const toggleFavorite = useCallback(async () => {
    // 乐观更新
    const newFavorited = !status.favorited;

    setStatus((prev) => ({
      ...prev,
      favorited: newFavorited,
    }));

    try {
      const result = await supabaseCatfoodService.toggleFavorite(catfoodId);

      if (result.data) {
        // 同步真实状态 - SQL 函数返回 is_favorited 字段
        setStatus((prev) => ({
          ...prev,
          favorited: result.data!.is_favorited ?? newFavorited,
        }));
      }
    } catch (error) {
      console.error('收藏失败:', error);
      // 回滚
      setStatus((prev) => ({
        ...prev,
        favorited: !newFavorited,
      }));
      throw error;
    }
  }, [catfoodId, status]);

  return {
    liked: status.liked,
    likeCount: status.likeCount,
    favorited: status.favorited,
    isLoading,
    toggleLike,
    toggleFavorite,
  };
}
