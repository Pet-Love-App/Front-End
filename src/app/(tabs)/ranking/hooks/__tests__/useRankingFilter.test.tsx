import { renderHook, act } from '@testing-library/react-native';
import { useRankingFilter } from '../useRankingFilter';
import type { CatFood } from '@/src/types/catFood';

const mockCatFoods: CatFood[] = [
  {
    id: '1',
    name: 'Food A',
    brand: 'Brand X',
    score: 4.5,
    like_count: 10,
    tags: ['kitten'],
  } as CatFood,
  {
    id: '2',
    name: 'Food B',
    brand: 'Brand Y',
    score: 4.0,
    like_count: 20,
    tags: ['adult'],
  } as CatFood,
  {
    id: '3',
    name: 'Food C',
    brand: 'Brand X',
    score: 4.8,
    like_count: 5,
    tags: ['senior'],
  } as CatFood,
  { id: '4', name: 'Food D', brand: 'Brand Z', score: 3.5, like_count: 15, tags: [] } as CatFood,
  { id: '5', name: 'Food E', brand: 'Brand Y', score: 4.2, like_count: 8, tags: [] } as CatFood,
  { id: '6', name: 'Food F', brand: 'Brand X', score: 4.1, like_count: 12, tags: [] } as CatFood,
];

describe('useRankingFilter', () => {
  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    expect(result.current.sortBy).toBe('score');
    expect(result.current.selectedBrand).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filteredCatFoods).toHaveLength(6);
    // Default sort is by score descending
    expect(result.current.filteredCatFoods[0].id).toBe('3'); // 4.8
    expect(result.current.filteredCatFoods[1].id).toBe('1'); // 4.5
  });

  it('should filter by brand', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    act(() => {
      result.current.handleSelectBrand('Brand X');
    });

    expect(result.current.selectedBrand).toBe('Brand X');
    expect(result.current.filteredCatFoods).toHaveLength(3);
    expect(result.current.filteredCatFoods.every((item) => item.brand === 'Brand X')).toBe(true);
  });

  it('should filter by search query', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    act(() => {
      result.current.handleSearchChange('Food A');
    });

    expect(result.current.filteredCatFoods).toHaveLength(1);
    expect(result.current.filteredCatFoods[0].name).toBe('Food A');
  });

  it('should sort by likes', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    act(() => {
      result.current.setSortBy('likes');
    });

    expect(result.current.sortBy).toBe('likes');
    // Sort by likes descending
    expect(result.current.filteredCatFoods[0].id).toBe('2'); // 20 likes
    expect(result.current.filteredCatFoods[1].id).toBe('4'); // 15 likes
  });

  it('should calculate brand counts correctly', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    expect(result.current.brandCounts).toEqual({
      all: 6,
      'Brand X': 3,
      'Brand Y': 2,
      'Brand Z': 1,
    });
  });

  it('should split topCatFoods and listCatFoods correctly when no filter', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    // Top 5
    expect(result.current.topCatFoods).toHaveLength(5);
    // Remaining 1
    expect(result.current.listCatFoods).toHaveLength(1);
  });

  it('should not show topCatFoods when filtered', () => {
    const { result } = renderHook(() => useRankingFilter(mockCatFoods));

    act(() => {
      result.current.handleSelectBrand('Brand X');
    });

    expect(result.current.topCatFoods).toHaveLength(0);
    expect(result.current.listCatFoods).toHaveLength(3);
  });
});
