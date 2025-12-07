/**
 * RankingScreen - 猫粮排行榜页面（重构版）
 *
 * 企业级最佳实践：
 * - 组件化：拆分成多个小组件，职责单一
 * - 性能优化：useMemo、useCallback、React.memo、懒加载
 * - 状态管理：Zustand store + 选择器模式
 * - 用户体验：下拉刷新、无限滚动、空状态
 * - 代码质量：TypeScript、清晰的注释
 * - 可维护性：小文件、易于理解和修改
 */

import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { CatFoodCard } from '@/src/components/CatFoodCard';
import { Skeleton } from '@/src/components/lazy';
import { PageHeader } from '@/src/components/PageHeader';
import type { CatFood } from '@/src/types/catFood';
import { useLazyLoad } from '@/src/hooks';

import {
  EmptyState,
  ImagePreviewModal,
  ListFooter,
  SearchFilterSection,
  TopRankingSwiper,
} from '../components';
import { useImagePreview, useRankingData, useRankingFilter } from '../hooks';

export function RankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 懒加载控制
  const { isReady: isSwiperReady } = useLazyLoad({ delay: 150, waitForInteraction: true });

  // 使用自定义 hooks
  const { catfoods, isLoading, isRefreshing, isLoadingMore, handleRefresh, handleLoadMore } =
    useRankingData();

  const {
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
  } = useRankingFilter(catfoods);

  const { previewVisible, previewImageUrl, handleImagePress, closePreview } = useImagePreview();

  // 跳转到详情页
  const handleCatFoodPress = (catfood: CatFood) => {
    router.push({
      pathname: '/detail',
      params: { id: catfood.id },
    });
  };

  // 渲染猫粮卡片
  const renderCatFoodCard = ({ item, index }: { item: CatFood; index: number }) => {
    // 如果有轮播图（前5名），列表从第6名开始显示
    const displayIndex = topCatFoods.length > 0 ? index + 5 : index;

    return (
      <CatFoodCard
        catfood={item}
        index={displayIndex}
        onPress={handleCatFoodPress}
        onImagePress={handleImagePress}
      />
    );
  };

  // 渲染列表头部
  const renderHeader = () => {
    return (
      <>
        {/* 热门推荐轮播图 - 懒加载 */}
        {topCatFoods.length > 0 &&
          (isSwiperReady ? (
            <TopRankingSwiper data={topCatFoods} topCount={5} onPress={handleCatFoodPress} />
          ) : (
            <YStack height={200} margin="$3" borderRadius="$4" overflow="hidden">
              <Skeleton width="100%" height={200} borderRadius={12} />
            </YStack>
          ))}

        {/* 搜索框和筛选区域 */}
        <SearchFilterSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedBrand={selectedBrand}
          brandList={brandList}
          brandCounts={brandCounts}
          brandMenuExpanded={brandMenuExpanded}
          onSelectBrand={handleSelectBrand}
          onToggleBrandMenu={toggleBrandMenu}
          onResetFilters={resetFilters}
          filteredCount={filteredCatFoods.length}
          totalCount={catfoods.length}
        />
      </>
    );
  };

  // 渲染空状态
  const renderEmpty = () => {
    if (isLoading) return null;

    // 搜索结果为空
    if (searchQuery.trim()) {
      return <EmptyState type="search" searchQuery={searchQuery} onReset={resetFilters} />;
    }

    // 列表为空但有轮播图
    if (topCatFoods.length > 0 && listCatFoods.length === 0) {
      return <EmptyState type="complete" />;
    }

    // 原始空状态
    return <EmptyState type="default" onRefresh={handleRefresh} />;
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <PageHeader
        title="猫粮排行榜"
        subtitle="数据驱动的专业评测"
        icon={{
          name: 'trophy.fill',
          size: 26,
          color: '#FEBE98',
          backgroundColor: '#FFF5ED',
          borderColor: '#FFE4D1',
        }}
        insets={insets}
        backgroundColor="$background"
      />

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        visible={previewVisible}
        imageUrl={previewImageUrl}
        onClose={closePreview}
      />

      {/* 猫粮列表 */}
      <FlatList
        data={listCatFoods}
        renderItem={renderCatFoodCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: Math.max(10, insets.bottom) }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onEndReached={searchQuery.trim() ? undefined : handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          searchQuery.trim() ? null : <ListFooter isLoadingMore={isLoadingMore} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </YStack>
  );
}
