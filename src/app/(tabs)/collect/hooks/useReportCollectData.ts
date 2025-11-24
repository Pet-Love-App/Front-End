import { useCollectStore } from '@/src/store/collectStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * 报告收藏数据管理 Hook
 * 负责报告收藏数据的获取、刷新和删除
 */
export function useReportCollectData() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // 使用 collectStore - 使用选择器避免不必要的重渲染
  const favoriteReports = useCollectStore((state) => state.favoriteReports);
  const isLoadingReports = useCollectStore((state) => state.isLoadingReports);
  const reportError = useCollectStore((state) => state.reportError);
  const fetchFavoriteReports = useCollectStore((state) => state.fetchFavoriteReports);
  const removeFavoriteReport = useCollectStore((state) => state.removeFavoriteReport);

  // 初始加载数据
  useEffect(() => {
    fetchFavoriteReports().catch((err) => {
      console.error('获取报告收藏列表失败:', err);
    });
  }, [fetchFavoriteReports]);

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFavoriteReports();
    } catch (err) {
      Alert.alert('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  };

  // 删除报告收藏
  const handleDelete = async (favoriteId: number) => {
    Alert.alert('确认删除', '您确定要取消收藏此报告吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFavoriteReport(favoriteId);
            Alert.alert('✅ 成功', '已取消收藏');
          } catch (err) {
            Alert.alert('❌ 失败', '取消收藏失败，请重试');
            console.error('删除报告收藏失败:', err);
          }
        },
      },
    ]);
  };

  // 点击报告，显示报告详情（可以导航到报告详情页或显示模态框）
  const handlePress = (catfoodId: number, reportId: number) => {
    // 跳转到猫粮详情页并打开AI报告
    router.push({
      pathname: '/detail',
      params: {
        id: catfoodId,
        showReport: '1', // 标记需要自动打开报告
      },
    });
  };

  return {
    favoriteReports,
    isLoadingReports,
    reportError,
    refreshing,
    handleRefresh,
    handleDelete,
    handlePress,
  };
}
