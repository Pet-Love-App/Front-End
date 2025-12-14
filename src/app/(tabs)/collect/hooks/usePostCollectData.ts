import { useCallback, useEffect, useState } from 'react';

import { supabaseForumService, type Post } from '@/src/lib/supabase';
import { showAlert, toast } from '@/src/components/dialogs';

/**
 * 帖子收藏数据管理 Hook
 */
export function usePostCollectData() {
  const [refreshing, setRefreshing] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 获取帖子收藏列表
  const fetchFavoritePosts = useCallback(async () => {
    try {
      setIsLoadingPosts(true);
      setPostError(null);
      const { data, error } = await supabaseForumService.getMyFavorites();
      if (error) {
        throw error;
      }
      setFavoritePosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('获取帖子收藏列表失败:', err);
      setPostError('获取帖子收藏列表失败');
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchFavoritePosts();
  }, [fetchFavoritePosts]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFavoritePosts();
    } catch {
      toast.error('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  }, [fetchFavoritePosts]);

  // 取消收藏帖子
  const handleDelete = useCallback((postId: number) => {
    showAlert({
      title: '确认取消收藏',
      message: '您确定要取消收藏此帖子吗？',
      type: 'warning',
      buttons: [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabaseForumService.toggleFavorite(postId);
              if (error) throw error;
              // 乐观更新：立即从列表中移除
              setFavoritePosts((prev) => prev.filter((post) => post.id !== postId));
              toast.success('已取消收藏');
            } catch (err) {
              toast.error('取消收藏失败', '请重试');
              console.error('取消帖子收藏失败:', err);
            }
          },
        },
      ],
    });
  }, []);

  // 点击帖子，打开详情
  const handlePress = useCallback(
    (postId: number) => {
      const post = favoritePosts.find((p) => p.id === postId);
      if (post) {
        setSelectedPost(post);
      }
    },
    [favoritePosts]
  );

  // 关闭帖子详情
  const closePostDetail = useCallback(() => {
    setSelectedPost(null);
  }, []);

  // 帖子删除后的回调
  const handlePostDeleted = useCallback(() => {
    if (selectedPost) {
      setFavoritePosts((prev) => prev.filter((post) => post.id !== selectedPost.id));
    }
    setSelectedPost(null);
  }, [selectedPost]);

  return {
    favoritePosts,
    isLoadingPosts,
    postError,
    refreshing,
    handleRefresh,
    handleDelete,
    handlePress,
    selectedPost,
    closePostDetail,
    handlePostDeleted,
  };
}
