import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useItemDetail } from '../useItemDetail';
import { supabaseAdditiveService } from '@/src/lib/supabase';
import { searchService } from '@/src/services/api';
import { logger } from '@/src/utils/logger';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseAdditiveService: {
    searchAdditive: jest.fn(),
    searchIngredient: jest.fn(),
  },
}));

jest.mock('@/src/services/api', () => ({
  searchService: {
    searchBaike: jest.fn(),
  },
}));

jest.mock('@/src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(), // Add error mock
  },
}));

describe('useItemDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    // Arrange & Act
    const { result } = renderHook(() => useItemDetail());

    // Assert
    expect(result.current.item).toBeNull();
    expect(result.current.baikeInfo).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadingItemName).toBeNull();
    expect(result.current.modalVisible).toBe(false);
  });

  it('should fetch additive successfully', async () => {
    // Arrange
    const mockAdditive = { id: 1, name: 'Test Additive', type: 'Type A' };
    const mockBaike = { title: 'Test Additive', extract: 'Description' };

    // Mock the return structure of searchAdditive
    (supabaseAdditiveService.searchAdditive as jest.Mock).mockResolvedValue({
      data: {
        matchType: 'exact',
        additive: mockAdditive,
      },
    });
    (searchService.searchBaike as jest.Mock).mockResolvedValue({ ok: true, data: mockBaike });

    const { result } = renderHook(() => useItemDetail());

    // Act
    await act(async () => {
      await result.current.fetchAdditive('Test Additive');
    });

    // Assert Final State
    await waitFor(() => {
      expect(result.current.item).toEqual(mockAdditive);
    });
    expect(result.current.baikeInfo).toEqual(mockBaike);
  });

  it('should handle additive not found in DB but found in Baike', async () => {
    // Arrange
    const mockBaike = { title: 'Unknown Additive', extract: 'Description' };

    // Mock the return structure of searchAdditive for not found
    (supabaseAdditiveService.searchAdditive as jest.Mock).mockResolvedValue({
      data: {
        matchType: 'not_found',
      },
    });
    (searchService.searchBaike as jest.Mock).mockResolvedValue({ ok: true, data: mockBaike });

    const { result } = renderHook(() => useItemDetail());

    // Act
    await act(async () => {
      await result.current.fetchAdditive('Unknown Additive');
    });

    // Assert
    await waitFor(() => {
      expect(result.current.item).toEqual(
        expect.objectContaining({
          name: 'Unknown Additive',
          type: '未分类',
          applicableRange: '暂无数据',
        })
      );
    });
    expect(result.current.baikeInfo).toEqual(mockBaike);
  });

  it('should fetch ingredient successfully', async () => {
    // Arrange
    const mockIngredient = { id: 2, name: 'Test Ingredient', type: 'Type B' };
    const mockBaike = { title: 'Test Ingredient', extract: 'Description' };

    // Mock the return structure of searchIngredient
    (supabaseAdditiveService.searchIngredient as jest.Mock).mockResolvedValue({
      data: {
        ingredient: {
          name: 'Test Ingredient',
          type: 'Type B',
          desc: 'Description',
        },
      },
    });
    (searchService.searchBaike as jest.Mock).mockResolvedValue({ ok: true, data: mockBaike });

    const { result } = renderHook(() => useItemDetail());

    // Act
    await act(async () => {
      await result.current.fetchIngredient('Test Ingredient');
    });

    // Assert
    await waitFor(() => {
      expect(result.current.item).toEqual(
        expect.objectContaining({
          name: 'Test Ingredient',
          type: 'Type B',
        })
      );
    });
    expect(result.current.baikeInfo).toEqual(mockBaike);
  });

  it('should handle baike search failure gracefully', async () => {
    // Arrange
    const mockAdditive = { id: 1, name: 'Test Additive', type: 'Type A' };

    (supabaseAdditiveService.searchAdditive as jest.Mock).mockResolvedValue({
      data: {
        matchType: 'exact',
        additive: mockAdditive,
      },
    });
    (searchService.searchBaike as jest.Mock).mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useItemDetail());

    // Act
    await act(async () => {
      await result.current.fetchAdditive('Test Additive');
    });

    // Assert
    await waitFor(() => {
      expect(result.current.item).toEqual(mockAdditive);
    });
    expect(result.current.baikeInfo).toBeNull();
  });

  it('should close modal and reset state', async () => {
    // Arrange
    const { result } = renderHook(() => useItemDetail());

    // Set some state first
    act(() => {
      // We can't set state directly, so we simulate a fetch start
      result.current.fetchAdditive('Test');
    });

    // Act
    act(() => {
      result.current.closeModal();
    });

    // Assert
    expect(result.current.modalVisible).toBe(false);
    expect(result.current.item).toBeNull();
    expect(result.current.baikeInfo).toBeNull();
  });
});
