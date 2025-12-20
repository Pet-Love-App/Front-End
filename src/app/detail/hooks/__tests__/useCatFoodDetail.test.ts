import { renderHook, waitFor } from '@testing-library/react-native';
import { useCatFoodDetail } from '../useCatFoodDetail';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { useCatfoodRealtime } from '@/src/hooks/useCatfoodRealtime';
import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/src/store/catFoodStore', () => ({
  useCatFoodStore: jest.fn(),
}));

jest.mock('@/src/hooks/useCatfoodRealtime', () => ({
  useCatfoodRealtime: jest.fn(),
}));

describe('useCatFoodDetail', () => {
  const mockFetchCatFoodById = jest.fn();
  const mockGetCatFoodById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    
    // Default mock implementations
    mockFetchCatFoodById.mockResolvedValue({});
    mockGetCatFoodById.mockReturnValue(null);

    // Mock store implementation
    (useCatFoodStore as unknown as jest.Mock).mockImplementation((selector) => {
      // If selector is a function, call it with state
      if (typeof selector === 'function') {
        return selector({
          fetchCatFoodById: mockFetchCatFoodById,
          getCatFoodById: mockGetCatFoodById,
          isLoading: false,
        });
      }
      return selector; // Should not happen with current usage
    });
    
    // Mock store properties access (for isLoading and fetchCatFoodById)
    // Actually the mock implementation above handles the selector pattern used in the hook:
    // useCatFoodStore((state) => state.fetchCatFoodById)
  });

  it('should return null catfoodId if no id in params', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    
    const { result } = renderHook(() => useCatFoodDetail());

    expect(result.current.catfoodId).toBeNull();
    expect(result.current.catFood).toBeNull(); 
  });

  it('should parse catfoodId from params', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    
    const { result } = renderHook(() => useCatFoodDetail());

    expect(result.current.catfoodId).toBe(123);
  });

  it('should fetch catfood if not in store', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    mockGetCatFoodById.mockReturnValue(null);
    mockFetchCatFoodById.mockResolvedValue({});

    renderHook(() => useCatFoodDetail());

    await waitFor(() => {
      expect(mockFetchCatFoodById).toHaveBeenCalledWith(123);
    });
  });

  it('should not fetch catfood if already in store', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    mockGetCatFoodById.mockReturnValue({ id: 123, name: 'Test Food' });

    renderHook(() => useCatFoodDetail());

    expect(mockFetchCatFoodById).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    mockGetCatFoodById.mockReturnValue(null);
    mockFetchCatFoodById.mockRejectedValue(new Error('Fetch failed'));

    renderHook(() => useCatFoodDetail());

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('加载失败', '无法获取猫粮详情，请稍后重试');
    });
  });

  it('should enable realtime updates when catfoodId is present', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    
    renderHook(() => useCatFoodDetail());

    expect(useCatfoodRealtime).toHaveBeenCalledWith(expect.objectContaining({
      enabled: true,
      catfoodId: 123,
    }));
  });
});
