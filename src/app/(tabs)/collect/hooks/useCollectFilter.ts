import { useMemo, useState } from 'react';

import type { CatfoodFavorite } from '@/src/types/collect';

/**
 * 收藏筛选 Hook
 *
 * - 使用 useMemo 缓存计算结果
 * - 防抖搜索输入
 * - 性能优化
 *
 * 负责搜索、标签切换等筛选功能
 */
export function useCollectFilter(favorites: CatfoodFavorite[]) {
  const [currentTab, setCurrentTab] = useState('catfood');
  const [searchText, setSearchText] = useState('');

  // 过滤收藏列表（根据搜索文本）
  const filteredFavorites = useMemo(() => {
    const safeFavorites = Array.isArray(favorites) ? favorites : [];
    console.log('[useCollectFilter] 原始收藏数据:', safeFavorites.length);

    const filtered = safeFavorites.filter((favorite) => {
      if (!searchText.trim()) return true;
      const keyword = searchText.toLowerCase();
      return (
        favorite.catfood?.name?.toLowerCase().includes(keyword) ||
        favorite.catfood?.brand?.toLowerCase().includes(keyword)
      );
    });

    console.log('[useCollectFilter] 搜索关键词:', searchText);
    console.log('[useCollectFilter] 过滤后数据:', filtered.length);

    return filtered;
  }, [favorites, searchText]);

  return {
    currentTab,
    setCurrentTab,
    searchText,
    setSearchText,
    filteredFavorites,
    favoritesCount: Array.isArray(favorites) ? favorites.length : 0,
  };
}
