/**
 * CatFood Store 集成测试
 *
 * 测试猫粮状态管理的核心功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { act } from '@testing-library/react-native';
import { useCatFoodStore } from '../catFoodStore';
import type { CatFood } from '@/src/types/catFood';

// Mock Supabase service
jest.mock('@/src/lib/supabase', () => ({
  supabaseCatfoodService: {
    listCatfoods: jest.fn(),
    getCatfoodDetail: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// 创建 mock 猫粮数据
const createMockCatFood = (id: number, overrides = {}): CatFood => ({
  id,
  name: `Cat Food ${id}`,
  brand: 'Test Brand',
  barcode: null,
  imageUrl: `https://example.com/catfood${id}.jpg`,
  like_count: 10,
  score: 4.5,
  countNum: 100,
  tags: [],
  ingredient: [],
  additive: [],
  safety: '',
  nutrient: '',
  percentage: false,
  percentData: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('CatFoodStore', () => {
  // 每个测试前重置 store 状态
  beforeEach(() => {
    act(() => {
      useCatFoodStore.getState().reset();
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty entities', () => {
      const state = useCatFoodStore.getState();
      expect(Object.keys(state.entities)).toHaveLength(0);
    });

    it('should have empty lists', () => {
      const state = useCatFoodStore.getState();
      expect(state.lists.all).toHaveLength(0);
      expect(state.lists.search).toHaveLength(0);
      expect(state.lists.favorites).toHaveLength(0);
    });

    it('should have default pagination state', () => {
      const state = useCatFoodStore.getState();
      expect(state.pagination.all.page).toBe(0);
      expect(state.pagination.all.hasMore).toBe(true);
    });

    it('should have loading states as false', () => {
      const state = useCatFoodStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.isLoadingMore).toBe(false);
    });

    it('should have no error', () => {
      const state = useCatFoodStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('addCatFoods', () => {
    it('should add catfoods to entities', () => {
      // Arrange
      const catfoods = [createMockCatFood(1), createMockCatFood(2)];

      // Act
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods);
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(Object.keys(state.entities)).toHaveLength(2);
      expect(state.entities[1].name).toBe('Cat Food 1');
      expect(state.entities[2].name).toBe('Cat Food 2');
    });

    it('should add catfood ids to the specified list', () => {
      // Arrange
      const catfoods = [createMockCatFood(1), createMockCatFood(2)];

      // Act
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods, 'all');
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.lists.all).toContain(1);
      expect(state.lists.all).toContain(2);
    });

    it('should handle duplicate ids', () => {
      // Arrange
      const catfood1 = createMockCatFood(1);
      const catfood1Updated = createMockCatFood(1, { name: 'Updated Name' });

      // Act
      act(() => {
        useCatFoodStore.getState().addCatFoods([catfood1]);
        useCatFoodStore.getState().addCatFoods([catfood1Updated]);
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.lists.all.filter((id) => id === 1)).toHaveLength(1); // 去重后只有一个
      expect(state.entities[1].name).toBe('Updated Name'); // 数据被更新
    });
  });

  describe('updateCatFood', () => {
    it('should update existing catfood', () => {
      // Arrange
      const catfood = createMockCatFood(1);
      act(() => {
        useCatFoodStore.getState().addCatFoods([catfood]);
      });

      // Act
      act(() => {
        useCatFoodStore.getState().updateCatFood(1, { like_count: 20 });
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.entities[1].like_count).toBe(20);
      expect(state.entities[1].name).toBe('Cat Food 1'); // 其他字段不变
    });

    it('should not throw when updating non-existent catfood', () => {
      // Act & Assert
      expect(() => {
        act(() => {
          useCatFoodStore.getState().updateCatFood(999, { like_count: 20 });
        });
      }).not.toThrow();
    });
  });

  describe('batchUpdateCatFoods', () => {
    it('should update multiple catfoods at once', () => {
      // Arrange
      const catfoods = [createMockCatFood(1), createMockCatFood(2), createMockCatFood(3)];
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods);
      });

      // Act
      act(() => {
        useCatFoodStore.getState().batchUpdateCatFoods([
          { id: 1, data: { like_count: 100 } },
          { id: 2, data: { like_count: 200 } },
        ]);
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.entities[1].like_count).toBe(100);
      expect(state.entities[2].like_count).toBe(200);
      expect(state.entities[3].like_count).toBe(10); // 未更新的保持原值
    });
  });

  describe('getCatFoodById', () => {
    it('should return catfood by id', () => {
      // Arrange
      const catfood = createMockCatFood(1);
      act(() => {
        useCatFoodStore.getState().addCatFoods([catfood]);
      });

      // Act
      const result = useCatFoodStore.getState().getCatFoodById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result?.name).toBe('Cat Food 1');
    });

    it('should return undefined for non-existent id', () => {
      // Act
      const result = useCatFoodStore.getState().getCatFoodById(999);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getCatFoodsByList', () => {
    it('should return catfoods for specified list', () => {
      // Arrange
      const catfoods = [createMockCatFood(1), createMockCatFood(2)];
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods, 'all');
      });

      // Act
      const result = useCatFoodStore.getState().getCatFoodsByList('all');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Cat Food 1');
    });

    it('should return empty array for empty list', () => {
      // Act
      const result = useCatFoodStore.getState().getCatFoodsByList('search');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('isCacheValid', () => {
    it('should return false for non-cached item', () => {
      // Act
      const result = useCatFoodStore.getState().isCacheValid(999);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for recently cached item', () => {
      // Arrange
      const catfood = createMockCatFood(1);
      act(() => {
        useCatFoodStore.getState().addCatFoods([catfood]);
      });

      // Act
      const result = useCatFoodStore.getState().isCacheValid(1);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('clearAllCache', () => {
    it('should clear all entities and lists', () => {
      // Arrange
      const catfoods = [createMockCatFood(1), createMockCatFood(2)];
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods, 'all');
      });

      // Act
      act(() => {
        useCatFoodStore.getState().clearAllCache();
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(Object.keys(state.entities)).toHaveLength(0);
      expect(state.lists.all).toHaveLength(0);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      // Act
      act(() => {
        useCatFoodStore.getState().setLoading(true);
      });

      // Assert
      expect(useCatFoodStore.getState().isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      // Act
      act(() => {
        useCatFoodStore.getState().setError('Test error');
      });

      // Assert
      expect(useCatFoodStore.getState().error).toBe('Test error');
    });

    it('should clear error when set to null', () => {
      // Arrange
      act(() => {
        useCatFoodStore.getState().setError('Test error');
      });

      // Act
      act(() => {
        useCatFoodStore.getState().setError(null);
      });

      // Assert
      expect(useCatFoodStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Arrange
      act(() => {
        useCatFoodStore.getState().addCatFoods([createMockCatFood(1)]);
        useCatFoodStore.getState().setLoading(true);
        useCatFoodStore.getState().setError('Test error');
      });

      // Act
      act(() => {
        useCatFoodStore.getState().reset();
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(Object.keys(state.entities)).toHaveLength(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('clearExpiredCache', () => {
    it('should remove expired cache entries', () => {
      // Arrange
      const catfoods = [createMockCatFood(1)];
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods);
      });

      // Manually expire cache
      act(() => {
        const state = useCatFoodStore.getState();
        state.cacheMetadata[1] = {
          timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago (expired)
          expiresIn: 5 * 60 * 1000, // 5 minute expiry
        };
      });

      // Act
      act(() => {
        useCatFoodStore.getState().clearExpiredCache();
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(Object.keys(state.entities)).toHaveLength(0);
    });

    it('should keep valid cache entries', () => {
      // Arrange
      const catfoods = [createMockCatFood(1)];
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods);
      });

      // Act
      act(() => {
        useCatFoodStore.getState().clearExpiredCache();
      });

      // Assert - recently added, should still be there
      const state = useCatFoodStore.getState();
      expect(Object.keys(state.entities)).toHaveLength(1);
    });
  });

  describe('pagination state', () => {
    it('should update pagination info correctly', () => {
      // Arrange
      const catfoods = Array.from({ length: 20 }, (_, i) => createMockCatFood(i + 1));

      // Act
      act(() => {
        useCatFoodStore.getState().addCatFoods(catfoods, 'all');
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.lists.all).toHaveLength(20);
    });

    it('should manage separate lists independently', () => {
      // Arrange
      const allCatfoods = [createMockCatFood(1)];
      const searchCatfoods = [createMockCatFood(2)];

      // Act
      act(() => {
        useCatFoodStore.getState().addCatFoods(allCatfoods, 'all');
        useCatFoodStore.getState().addCatFoods(searchCatfoods, 'search');
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.lists.all).toContain(1);
      expect(state.lists.search).toContain(2);
      expect(state.lists.all).not.toContain(2);
    });
  });

  describe('setHasHydrated', () => {
    it('should set hydration state', () => {
      // Act
      act(() => {
        useCatFoodStore.getState().setHasHydrated(true);
      });

      // Assert
      expect(useCatFoodStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle updating non-existent catfood gracefully', () => {
      // Act & Assert - should not throw
      expect(() => {
        act(() => {
          useCatFoodStore.getState().updateCatFood(999, { like_count: 10 });
        });
      }).not.toThrow();
    });

    it('should handle empty batch updates', () => {
      // Act & Assert
      expect(() => {
        act(() => {
          useCatFoodStore.getState().batchUpdateCatFoods([]);
        });
      }).not.toThrow();
    });

    it('should handle getting catfoods from empty list', () => {
      // Act
      const result = useCatFoodStore.getState().getCatFoodsByList('favorites');

      // Assert
      expect(result).toEqual([]);
    });

    it('should deduplicate when adding same catfood twice', () => {
      // Arrange
      const catfood = createMockCatFood(1);

      // Act
      act(() => {
        useCatFoodStore.getState().addCatFoods([catfood], 'all');
        useCatFoodStore.getState().addCatFoods([catfood], 'all');
      });

      // Assert
      const state = useCatFoodStore.getState();
      expect(state.lists.all.filter((id) => id === 1)).toHaveLength(1);
    });
  });
});
