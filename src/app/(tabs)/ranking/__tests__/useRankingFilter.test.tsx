import React from 'react';
import { View } from 'react-native';
import { render, act } from '@testing-library/react-native';

import { useRankingFilter } from '../hooks/useRankingFilter';

function HookTest({ catfoods, query }: { catfoods: any[]; query?: string }) {
  const {
    brandList,
    brandCounts,
    filteredCatFoods,
    topCatFoods,
    listCatFoods,
    handleSearchChange,
  } = useRankingFilter(catfoods);

  React.useEffect(() => {
    if (query !== undefined) handleSearchChange(query);
  }, [query, handleSearchChange]);

  return (
    <View testID="out">
      {JSON.stringify({
        brandList,
        brandCounts,
        filtered: filteredCatFoods.length,
        top: topCatFoods.length,
        list: listCatFoods.length,
      })}
    </View>
  );
}

describe('useRankingFilter', () => {
  const sample = [
    { name: 'A', brand: 'X', score: 9, like_count: 10, tags: ['fish'] },
    { name: 'B', brand: 'Y', score: 8, like_count: 5, tags: ['chicken'] },
    { name: 'C', brand: 'X', score: 7, like_count: 2, tags: ['beef'] },
    { name: 'D', brand: 'Z', score: 6, like_count: 1, tags: [] },
    { name: 'E', brand: 'Y', score: 5, like_count: 0, tags: [] },
    { name: 'F', brand: 'X', score: 4, like_count: 3, tags: ['choco'] },
  ];

  it('computes brand list/counts and top/list split', () => {
    const { getByTestId } = render(<HookTest catfoods={sample} />);
    const out = JSON.parse(getByTestId('out').props.children as string);

    expect(out.brandList).toContain('all');
    expect(out.brandCounts.all).toBe(sample.length);

    // 默认按 score 排序，topCatFoods 应为前5名
    expect(out.top).toBe(5);
    expect(out.list).toBe(1);
    expect(out.filtered).toBe(sample.length);
  });

  it('filters by search query (name/brand/tags) and hides top carousel', () => {
    const { getByTestId, rerender } = render(<HookTest catfoods={sample} />);

    act(() => {
      rerender(<HookTest catfoods={sample} query="choco" />);
    });

    const out2 = JSON.parse(getByTestId('out').props.children as string);
    // 匹配 tag 'choco' 的项目只有 1 个，top 应为空（搜索时）
    expect(out2.filtered).toBe(1);
    expect(out2.top).toBe(0);
    expect(out2.list).toBe(1);
  });
});
