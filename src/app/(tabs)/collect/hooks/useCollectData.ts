import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { supabaseCatfoodService } from '@/src/lib/supabase';
import type { CatfoodFavorite } from '@/src/types/collect';

/**
 * 收藏数据管理 Hook
 */
export function useCollectData() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<CatfoodFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取收藏列表
  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await supabaseCatfoodService.getUserFavorites();
      if (result.data) {
        setFavorites(result.data as CatfoodFavorite[]);
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      console.error('获取收藏列表失败:', err);
      setError('获取收藏列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFavorites();
    } catch (_err) {
      Alert.alert('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  }, [fetchFavorites]);

  // 删除收藏
  const handleDelete = useCallback((favoriteId: string, catfoodId: string) => {
    Alert.alert('确认删除', '您确定要取消收藏吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await supabaseCatfoodService.toggleFavorite(catfoodId);
            if (result.data) {
              // 乐观更新：立即从列表中移除
              setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
              Alert.alert('✅ 成功', '已取消收藏');
            } else {
              Alert.alert('❌ 失败', result.error?.message || '取消收藏失败，请重试');
            }
          } catch (err) {
            Alert.alert('❌ 失败', '取消收藏失败，请重试');
            console.error('删除收藏失败:', err);
          }
        },
      },
    ]);
  }, []);

  // 点击收藏项，跳转到详情页
  const handlePress = useCallback(
    (catfoodId: string) => {
      router.push({
        pathname: '/detail',
        params: { id: catfoodId },
      });
    },
    [router]
  );

  return {
    favorites,
    isLoading,
    error,
    refreshing,
    handleRefresh,
    handleDelete,
    handlePress,
  };
}
