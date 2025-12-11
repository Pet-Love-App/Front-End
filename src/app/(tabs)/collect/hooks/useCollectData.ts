import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { supabaseCatfoodService } from '@/src/lib/supabase';
import type { CatfoodFavorite } from '@/src/types/collect';
import { appEvents, APP_EVENTS } from '@/src/utils';

/**
 * 收藏数据管理 Hook
 */
export function useCollectData() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<CatfoodFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstLoad = useRef(true);

  // 获取收藏列表
  const fetchFavorites = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      console.log('[useCollectData] 开始获取收藏列表...');
      const result = await supabaseCatfoodService.getUserFavorites();
      if (result.data) {
        console.log('[useCollectData] 收藏列表获取成功，数量:', result.data.length);
        setFavorites(result.data as CatfoodFavorite[]);
      } else if (result.error) {
        console.log('[useCollectData] 收藏列表获取失败:', result.error.message);
        setError(result.error.message);
      }
    } catch (err) {
      console.error('获取收藏列表失败:', err);
      setError('获取收藏列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 监听收藏变更事件
  useEffect(() => {
    console.log('[useCollectData] 开始监听收藏变更事件');
    const unsubscribe = appEvents.on(APP_EVENTS.FAVORITE_CHANGED, (data) => {
      console.log('[useCollectData] 收到收藏变更事件:', data);
      // 收藏变更时静默刷新列表
      fetchFavorites(false);
    });

    return () => {
      console.log('[useCollectData] 停止监听收藏变更事件');
      unsubscribe();
    };
  }, [fetchFavorites]);

  // 页面获得焦点时刷新数据（从详情页返回时自动更新）
  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        // 首次加载显示 loading
        fetchFavorites(true);
        isFirstLoad.current = false;
      } else {
        // 后续获得焦点时静默刷新
        fetchFavorites(false);
      }
    }, [fetchFavorites])
  );

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFavorites(false);
    } catch (_err) {
      Alert.alert('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  }, [fetchFavorites]);

  // 删除收藏
  const handleDelete = useCallback((favoriteId: string, catfoodId: string) => {
    console.log('[handleDelete] 删除收藏:', { favoriteId, catfoodId });
    Alert.alert('确认删除', '您确定要取消收藏吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await supabaseCatfoodService.toggleFavorite(catfoodId);
            console.log('[handleDelete] API 返回:', result.data);
            if (result.data) {
              // 乐观更新：从列表中移除对应的项
              // 注意：API 返回的数据结构中，id 字段是 catfoodId
              setFavorites((prev) => {
                const filtered = prev.filter((fav: any) => {
                  // 使用 catfoodId 或 id 字段进行匹配
                  const favId = fav.catfoodId || fav.id;
                  return favId?.toString() !== catfoodId?.toString();
                });
                console.log('[handleDelete] 过滤前:', prev.length, '过滤后:', filtered.length);
                return filtered;
              });
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
