import { YStack } from 'tamagui';
import SearchBox from '@/src/components/searchBox';

import { BrandFilterMenu } from './BrandFilterMenu';
import { FilterChips } from './FilterChips';
import { StatisticsBar } from './StatisticsBar';

interface SearchFilterSectionProps {
  // 搜索相关
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;

  // 排序相关
  sortBy: 'score' | 'likes';
  onSortChange: (sort: 'score' | 'likes') => void;

  // 品牌筛选相关
  selectedBrand: string;
  brandList: string[];
  brandCounts: Record<string, number>;
  brandMenuExpanded: boolean;
  onSelectBrand: (brand: string) => void;
  onToggleBrandMenu: () => void;
  onResetFilters: () => void;

  // 统计信息
  filteredCount: number;
  totalCount: number;
}

/**
 * 搜索筛选区域组件
 * 整合搜索框、筛选标签、品牌菜单和统计信息
 */
export function SearchFilterSection({
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortBy,
  onSortChange,
  selectedBrand,
  brandList,
  brandCounts,
  brandMenuExpanded,
  onSelectBrand,
  onToggleBrandMenu,
  onResetFilters,
  filteredCount,
  totalCount,
}: SearchFilterSectionProps) {
  return (
    <YStack backgroundColor="#FAFAFA" paddingTop="$3">
      {/* 搜索框 */}
      <YStack paddingHorizontal="$4" paddingBottom="$3">
        <SearchBox
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onClearSearch}
          placeholder="搜索猫粮名称、品牌或标签..."
          size="$4"
        />
      </YStack>

      {/* 快捷筛选标签 */}
      <FilterChips
        sortBy={sortBy}
        selectedBrand={selectedBrand}
        onSortChange={onSortChange}
        onResetFilters={onResetFilters}
        onToggleBrandMenu={onToggleBrandMenu}
        brandMenuExpanded={brandMenuExpanded}
      />

      {/* 统计信息栏 */}
      <StatisticsBar
        searchQuery={searchQuery}
        selectedBrand={selectedBrand}
        filteredCount={filteredCount}
        totalCount={totalCount}
        sortBy={sortBy}
      />

      {/* 品牌筛选弹窗 */}
      <BrandFilterMenu
        visible={brandMenuExpanded}
        brandList={brandList}
        brandCounts={brandCounts}
        selectedBrand={selectedBrand}
        onSelectBrand={onSelectBrand}
        onClose={onToggleBrandMenu}
      />
    </YStack>
  );
}
