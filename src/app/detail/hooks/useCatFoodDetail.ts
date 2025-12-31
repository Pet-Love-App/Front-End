import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useCatFoodStore } from '@/src/store/catFoodStore';
import { useCatfoodRealtime } from '@/src/hooks/useCatfoodRealtime';

/**
 * 猫粮详情数据管理 Hook
 * 负责猫粮详情数据的获取
 * 包含实时数据同步功能
 */
export function useCatFoodDetail() {
  const params = useLocalSearchParams();

  // 从路由参数获取猫粮 ID
  const catfoodId = useMemo(() => (params.id ? Number(params.id) : null), [params.id]);

  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const fetchCatFoodById = useCatFoodStore((state) => state.fetchCatFoodById);
  const isLoading = useCatFoodStore((state) => state.isLoading);

  // 使用 useMemo 优化 selector，避免每次渲染都创建新函数
  const catFoodSelector = useCallback(
    (state: ReturnType<typeof useCatFoodStore.getState>) =>
      catfoodId ? state.getCatFoodById(catfoodId) : null,
    [catfoodId]
  );
  const catFood = useCatFoodStore(catFoodSelector);

  // 启用实时订阅 - 监听当前猫粮的评分、点赞变化
  useCatfoodRealtime({
    enabled: !!catfoodId,
    catfoodId: catfoodId || undefined,
    onUpdate: () => {
      // 实时更新已由 store 处理
    },
  });

  useEffect(() => {
    if (catfoodId && !catFood) {
      // 如果缓存中没有数据，则从服务器加载
      fetchCatFoodById(catfoodId).catch(() => {
        Alert.alert('加载失败', '无法获取猫粮详情，请稍后重试');
      });
    }
  }, [catfoodId, catFood, fetchCatFoodById]);

  return {
    catfoodId,
    catFood,
    isLoading,
  };
}
