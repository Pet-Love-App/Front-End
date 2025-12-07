import { useEffect } from 'react';

import { useAllCatFoods, useCatFoodStore } from '@/src/store/catFoodStore';

/**
 * 排行榜数据管理 Hook
 * 负责猫粮数据的获取、刷新和加载更多
 */
export function useRankingData() {
  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const { catfoods, isLoading, hasMore } = useAllCatFoods();
  const fetchCatFoods = useCatFoodStore((state) => state.fetchCatFoods);
  const isRefreshing = useCatFoodStore((state) => state.isRefreshing);
  const isLoadingMore = useCatFoodStore((state) => state.isLoadingMore);
  const pagination = useCatFoodStore((state) => state.pagination);

  // 初始加载
  useEffect(() => {
    // 如果没有数据，则加载
    if (catfoods.length === 0 && !isLoading) {
      fetchCatFoods(1, true);
    }
  }, [catfoods.length, isLoading, fetchCatFoods]);

  // 下拉刷新
  const handleRefresh = async () => {
    await fetchCatFoods(1, true);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = pagination.all.page + 1;
      fetchCatFoods(nextPage, false);
    }
  };

  return {
    catfoods,
    isLoading,
    hasMore,
    isRefreshing,
    isLoadingMore,
    handleRefresh,
    handleLoadMore,
  };
}
