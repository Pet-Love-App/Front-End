import type { AIReportData } from '@/src/services/api';
import { aiReportService } from '@/src/services/api';
import type { ReportFavorite } from '@/src/types/collect';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * 报告收藏数据管理 Hook
 */
export function useReportCollectData() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AIReportData | null>(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [favoriteReports, setFavoriteReports] = useState<ReportFavorite[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);

  // 获取报告收藏列表
  const fetchFavoriteReports = useCallback(async () => {
    try {
      setIsLoadingReports(true);
      setReportError(null);
      const reports = await aiReportService.getFavoriteReports();
      setFavoriteReports(Array.isArray(reports) ? reports : []);
    } catch (err) {
      console.error('获取报告收藏列表失败:', err);
      setReportError('获取报告收藏列表失败');
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchFavoriteReports();
  }, [fetchFavoriteReports]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFavoriteReports();
    } catch (err) {
      Alert.alert('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  }, [fetchFavoriteReports]);

  // 删除报告收藏
  const handleDelete = useCallback((favoriteId: number, reportId: number) => {
    Alert.alert('确认删除', '您确定要取消收藏此报告吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await aiReportService.deleteFavoriteReport(favoriteId);
            // 乐观更新：立即从列表中移除
            setFavoriteReports((prev) => prev.filter((fav) => fav.id !== favoriteId));
            Alert.alert('✅ 成功', '已取消收藏');
          } catch (err) {
            Alert.alert('❌ 失败', '取消收藏失败，请重试');
            console.error('删除报告收藏失败:', err);
          }
        },
      },
    ]);
  }, []);

  // 点击报告，直接打开报告详情模态框
  const handlePress = useCallback((report: AIReportData) => {
    setSelectedReport(report);
    setIsReportModalVisible(true);
  }, []);

  // 关闭报告模态框
  const closeReportModal = useCallback(() => {
    setIsReportModalVisible(false);
    setSelectedReport(null);
  }, []);

  return {
    favoriteReports,
    isLoadingReports,
    reportError,
    refreshing,
    handleRefresh,
    handleDelete,
    handlePress,
    selectedReport,
    isReportModalVisible,
    closeReportModal,
  };
}
