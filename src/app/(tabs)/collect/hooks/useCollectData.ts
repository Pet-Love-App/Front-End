import { useCollectStore } from '@/src/store/collectStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * 收藏数据管理 Hook
 * 负责收藏数据的获取、刷新和删除
 */
export function useCollectData() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // 使用 collectStore - 使用选择器避免不必要的重渲染
  const favorites = useCollectStore((state) => state.favorites);
  const isLoading = useCollectStore((state) => state.isLoading);
  const error = useCollectStore((state) => state.error);
  const fetchFavorites = useCollectStore((state) => state.fetchFavorites);
  const removeFavorite = useCollectStore((state) => state.removeFavorite);

  // 初始加载数据
  useEffect(() => {
    fetchFavorites().catch((err) => {
      console.error('获取收藏列表失败:', err);
    });
  }, [fetchFavorites]);

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFavorites();
    } catch (err) {
      Alert.alert('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  };

  // 删除收藏
  const handleDelete = async (favoriteId: number) => {
    Alert.alert('确认删除', '您确定要取消收藏吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFavorite(favoriteId);
            Alert.alert('✅ 成功', '已取消收藏');
          } catch (err) {
            Alert.alert('❌ 失败', '取消收藏失败，请重试');
            console.error('删除收藏失败:', err);
          }
        },
      },
    ]);
  };

  // 点击收藏项，跳转到详情页
  const handlePress = (catfoodId: number) => {
    router.push({
      pathname: '/detail',
      params: { id: catfoodId },
    });
  };

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
