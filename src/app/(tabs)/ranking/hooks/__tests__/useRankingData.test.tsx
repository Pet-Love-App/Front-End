import { renderHook, act } from '@testing-library/react-native';
import { useRankingData } from '../useRankingData';
import { useAllCatFoods, useCatFoodStore } from '@/src/store/catFoodStore';
import { useCatfoodRealtime } from '@/src/hooks/useCatfoodRealtime';

// Mock dependencies
jest.mock('@/src/store/catFoodStore', () => ({
  useAllCatFoods: jest.fn(),
  useCatFoodStore: jest.fn(),
}));

jest.mock('@/src/hooks/useCatfoodRealtime', () => ({
  useCatfoodRealtime: jest.fn(),
}));

describe('useRankingData', () => {
  const mockFetchCatFoods = jest.fn();
  const mockCatFoods = [{ id: '1', name: 'Food 1' }];

  beforeEach(() => {
    jest.clearAllMocks();

    (useAllCatFoods as jest.Mock).mockReturnValue({
      catfoods: [],
      isLoading: false,
      hasMore: true,
    });

    (useCatFoodStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        fetchCatFoods: mockFetchCatFoods,
        isRefreshing: false,
        isLoadingMore: false,
        pagination: { all: { page: 1 } },
      };
      return selector(state);
    });
  });

  it('should fetch data on mount if empty', () => {
    renderHook(() => useRankingData());
    expect(mockFetchCatFoods).toHaveBeenCalledWith(1, true);
  });

  it('should not fetch data on mount if not empty', () => {
    (useAllCatFoods as jest.Mock).mockReturnValue({
      catfoods: mockCatFoods,
      isLoading: false,
      hasMore: true,
    });

    renderHook(() => useRankingData());
    expect(mockFetchCatFoods).not.toHaveBeenCalled();
  });

  it('should handle refresh', async () => {
    const { result } = renderHook(() => useRankingData());

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(mockFetchCatFoods).toHaveBeenCalledWith(1, true);
  });

  it('should handle load more', () => {
    const { result } = renderHook(() => useRankingData());

    act(() => {
      result.current.handleLoadMore();
    });

    expect(mockFetchCatFoods).toHaveBeenCalledWith(2, false);
  });

  it('should not load more if no more data', () => {
    (useAllCatFoods as jest.Mock).mockReturnValue({
      catfoods: [],
      isLoading: false,
      hasMore: false,
    });

    const { result } = renderHook(() => useRankingData());

    act(() => {
      result.current.handleLoadMore();
    });

    // Should only be called once for initial load
    expect(mockFetchCatFoods).toHaveBeenCalledTimes(1);
    // Should not be called for load more
    expect(mockFetchCatFoods).not.toHaveBeenCalledWith(2, false);
  });
});
