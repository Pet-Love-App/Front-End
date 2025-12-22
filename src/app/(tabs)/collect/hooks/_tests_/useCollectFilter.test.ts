import { renderHook, act } from '@testing-library/react-native';
import { useCollectFilter } from '../useCollectFilter';

describe('useCollectFilter', () => {
  it('filters favorites by name and brand and reports counts', () => {
    const favorites = [
      { id: '1', name: 'Chicken Mix', brand: 'BrandA' },
      { id: '2', catfood: { name: 'Fish Delight', brand: 'BrandB' } },
      { id: '3', name: 'Beefy', brand: 'BrandC' },
    ] as any;

    const { result } = renderHook(() => useCollectFilter(favorites));

    // initial
    expect(result.current.favoritesCount).toBe(3);
    expect(result.current.filteredFavorites).toHaveLength(3);

    // search by name
    act(() => {
      result.current.setSearchText('fish');
    });
    expect(result.current.filteredFavorites).toHaveLength(1);

    // search by brand
    act(() => {
      result.current.setSearchText('branda');
    });
    expect(result.current.filteredFavorites).toHaveLength(1);

    // tab switching
    expect(result.current.currentTab).toBe('catfood');
    act(() => {
      result.current.setCurrentTab('post');
    });
    expect(result.current.currentTab).toBe('post');
  });
});
