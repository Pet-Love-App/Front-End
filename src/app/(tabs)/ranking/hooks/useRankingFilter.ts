import { useCallback, useMemo, useState } from 'react';

import type { CatFood } from '@/src/types/catFood';

/**
 * 排行榜筛选 Hook
 * 负责搜索、排序、品牌筛选等功能
 */
export function useRankingFilter(catfoods: CatFood[]) {
  const [sortBy, setSortBy] = useState<'score' | 'likes'>('score');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [brandMenuExpanded, setBrandMenuExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 获取所有品牌列表 - 使用 useMemo 优化性能
  const brandList = useMemo(() => {
    const brands = new Set<string>();
    catfoods.forEach((catfood) => {
      if (catfood.brand && catfood.brand.trim()) {
        brands.add(catfood.brand);
      }
    });
    return ['all', ...Array.from(brands).sort()];
  }, [catfoods]);

  // 获取每个品牌的猫粮数量
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { all: catfoods.length };
    catfoods.forEach((catfood) => {
      const brand = catfood.brand || '未知品牌';
      counts[brand] = (counts[brand] || 0) + 1;
    });
    return counts;
  }, [catfoods]);

  // 搜索、品牌筛选和排序逻辑 - 使用 useMemo 优化性能
  const filteredCatFoods = useMemo(() => {
    let result = catfoods;

    // 品牌过滤
    if (selectedBrand !== 'all') {
      result = result.filter((catfood) => catfood.brand === selectedBrand);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((catfood) => {
        // 搜索猫粮名称
        if (catfood.name.toLowerCase().includes(query)) {
          return true;
        }
        // 搜索品牌
        if (catfood.brand.toLowerCase().includes(query)) {
          return true;
        }
        // 搜索标签
        if (catfood.tags && catfood.tags.some((tag) => tag.toLowerCase().includes(query))) {
          return true;
        }
        return false;
      });
    }

    // 排序
    return [...result].sort((a, b) => {
      if (sortBy === 'likes') {
        // 按点赞数排序（降序）
        return (b.like_count || 0) - (a.like_count || 0);
      } else {
        // 按评分排序（降序）
        return b.score - a.score;
      }
    });
  }, [catfoods, searchQuery, sortBy, selectedBrand]);

  // 轮播图显示的前5名猫粮
  const topCatFoods = useMemo(() => {
    // 只在未搜索且未筛选品牌时显示轮播图
    if (!searchQuery.trim() && selectedBrand === 'all') {
      return filteredCatFoods.slice(0, 5);
    }
    return [];
  }, [filteredCatFoods, searchQuery, selectedBrand]);

  // 列表显示的猫粮（排除轮播图中的前5名）
  const listCatFoods = useMemo(() => {
    // 如果有轮播图，则从第6名开始显示
    if (topCatFoods.length > 0) {
      return filteredCatFoods.slice(5);
    }
    // 如果没有轮播图（有搜索或品牌筛选），显示全部
    return filteredCatFoods;
  }, [filteredCatFoods, topCatFoods]);

  // 处理搜索输入
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 选择品牌
  const handleSelectBrand = useCallback((brand: string) => {
    setSelectedBrand(brand);
    setBrandMenuExpanded(false); // 选择后自动收起
  }, []);

  // 切换品牌菜单展开状态
  const toggleBrandMenu = useCallback(() => {
    setBrandMenuExpanded((prev) => !prev);
  }, []);

  // 重置筛选
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedBrand('all');
  }, []);

  return {
    sortBy,
    setSortBy,
    selectedBrand,
    brandMenuExpanded,
    searchQuery,
    brandList,
    brandCounts,
    filteredCatFoods,
    topCatFoods,
    listCatFoods,
    handleSearchChange,
    handleClearSearch,
    handleSelectBrand,
    toggleBrandMenu,
    resetFilters,
  };
}
