/**
 * 猫粮状态管理 Store
 *
 * 功能特性：
 * - 规范化数据存储（以ID为key的对象）
 * - 智能缓存策略（避免重复请求）
 * - 持久化支持（AsyncStorage）
 * - 分页管理
 * - 搜索功能
 * - 乐观更新
 * - 完善的错误处理
 *
 * @module catFoodStore
 */

import { catFoodService } from '@/src/services/api/catfood';
import type { CatFood } from '@/src/types/catFood';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ==================== 类型定义 ====================

/**
 * 分页信息
 */
interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * 列表类型
 */
type ListType = 'all' | 'search' | 'favorites';

/**
 * 缓存元数据
 */
interface CacheMetadata {
  timestamp: number;
  expiresIn: number; // 缓存过期时间（毫秒）
}

/**
 * 猫粮状态接口
 */
interface CatFoodState {
  // ==================== 数据状态 ====================

  /**
   * 规范化的猫粮数据存储（以ID为key）
   * 好处：O(1)查找，避免数据重复，便于更新
   */
  entities: Record<number, CatFood>;

  /**
   * 不同列表的ID数组
   * 分离数据和列表顺序，便于管理
   */
  lists: {
    all: number[]; // 全部列表
    search: number[]; // 搜索结果
    favorites: number[]; // 收藏列表
  };

  /**
   * 分页信息
   */
  pagination: Record<ListType, PaginationInfo>;

  /**
   * 缓存元数据
   */
  cacheMetadata: Record<number, CacheMetadata>;

  // ==================== UI 状态 ====================

  /**
   * 加载状态
   */
  isLoading: boolean;

  /**
   * 刷新状态
   */
  isRefreshing: boolean;

  /**
   * 加载更多状态
   */
  isLoadingMore: boolean;

  /**
   * 错误信息
   */
  error: string | null;

  /**
   * 水化状态
   */
  _hasHydrated: boolean;

  // ==================== 数据操作 ====================

  /**
   * 获取猫粮列表
   * @param page 页码（从1开始）
   * @param refresh 是否刷新（清空现有数据）
   */
  fetchCatFoods: (page?: number, refresh?: boolean) => Promise<void>;

  /**
   * 获取单个猫粮详情
   * @param id 猫粮ID
   * @param forceRefresh 强制刷新（忽略缓存）
   */
  fetchCatFoodById: (id: number, forceRefresh?: boolean) => Promise<CatFood>;

  /**
   * 搜索猫粮
   * @param query 搜索关键词
   * @param page 页码
   */
  searchCatFoods: (query: string, page?: number) => Promise<void>;

  /**
   * 加载更多
   * @param listType 列表类型
   */
  loadMore: (listType?: ListType) => Promise<void>;

  /**
   * 更新猫粮数据（乐观更新）
   * @param id 猫粮ID
   * @param data 要更新的数据
   */
  updateCatFood: (id: number, data: Partial<CatFood>) => void;

  /**
   * 批量添加猫粮到store
   * @param catfoods 猫粮数组
   * @param listType 添加到哪个列表
   */
  addCatFoods: (catfoods: CatFood[], listType?: ListType) => void;

  // ==================== 缓存管理 ====================

  /**
   * 检查缓存是否有效
   * @param id 猫粮ID
   */
  isCacheValid: (id: number) => boolean;

  /**
   * 清除过期缓存
   */
  clearExpiredCache: () => void;

  /**
   * 清除所有缓存
   */
  clearAllCache: () => void;

  // ==================== 工具方法 ====================

  /**
   * 根据ID获取猫粮
   * @param id 猫粮ID
   */
  getCatFoodById: (id: number) => CatFood | undefined;

  /**
   * 获取指定列表的猫粮数组
   * @param listType 列表类型
   */
  getCatFoodsByList: (listType?: ListType) => CatFood[];

  /**
   * 设置加载状态
   */
  setLoading: (loading: boolean) => void;

  /**
   * 设置错误信息
   */
  setError: (error: string | null) => void;

  /**
   * 设置水化状态
   */
  setHasHydrated: (hasHydrated: boolean) => void;

  /**
   * 重置状态
   */
  reset: () => void;
}

// ==================== 常量配置 ====================

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  DEFAULT_EXPIRE: 5 * 60 * 1000, // 5分钟
  DETAIL_EXPIRE: 10 * 60 * 1000, // 10分钟
  LIST_EXPIRE: 3 * 60 * 1000, // 3分钟
};

/**
 * 默认分页配置
 */
const DEFAULT_PAGE_SIZE = 20;

/**
 * 初始分页信息
 */
const INITIAL_PAGINATION: PaginationInfo = {
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  hasMore: true,
};

// ==================== Store 实现 ====================

export const useCatFoodStore = create<CatFoodState>()(
  persist(
    (set, get) => ({
      // ==================== 初始状态 ====================

      entities: {},
      lists: {
        all: [],
        search: [],
        favorites: [],
      },
      pagination: {
        all: { ...INITIAL_PAGINATION },
        search: { ...INITIAL_PAGINATION },
        favorites: { ...INITIAL_PAGINATION },
      },
      cacheMetadata: {},
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: null,
      _hasHydrated: false,

      // ==================== 数据获取 ====================

      /**
       * 获取猫粮列表
       */
      fetchCatFoods: async (page = 1, refresh = false) => {
        const state = get();

        // 防止重复请求
        if (state.isLoading && !refresh) {
          console.log('⏸️ 正在加载中，跳过重复请求');
          return;
        }

        try {
          // 设置加载状态
          if (refresh) {
            set({ isRefreshing: true, error: null });
          } else {
            set({ isLoading: true, error: null });
          }

          console.log(`📡 获取猫粮列表 - 第${page}页`);

          // 调用API
          const response = await catFoodService.getCatFoods(page, DEFAULT_PAGE_SIZE);

          if (!response || !Array.isArray(response.results)) {
            throw new Error('响应数据格式异常');
          }

          const { results, count, next } = response;

          // 更新entities（规范化存储）
          const newEntities = { ...state.entities };
          const newIds: number[] = [];
          const timestamp = Date.now();

          results.forEach((catfood) => {
            newEntities[catfood.id] = catfood;
            newIds.push(catfood.id);

            // 更新缓存元数据
            state.cacheMetadata[catfood.id] = {
              timestamp,
              expiresIn: CACHE_CONFIG.LIST_EXPIRE,
            };
          });

          // 更新列表（追加或替换）
          const updatedList = refresh || page === 1 ? newIds : [...state.lists.all, ...newIds];

          // 去重
          const uniqueList = Array.from(new Set(updatedList));

          set({
            entities: newEntities,
            lists: {
              ...state.lists,
              all: uniqueList,
            },
            pagination: {
              ...state.pagination,
              all: {
                page,
                pageSize: DEFAULT_PAGE_SIZE,
                total: count,
                hasMore: next !== null,
              },
            },
            cacheMetadata: { ...state.cacheMetadata },
          });

          console.log(`✅ 成功加载 ${results.length} 条猫粮数据`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '获取猫粮列表失败';
          console.error('❌ 获取猫粮列表失败:', error);
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },

      /**
       * 获取单个猫粮详情
       */
      fetchCatFoodById: async (id: number, forceRefresh = false) => {
        const state = get();

        // 检查缓存
        if (!forceRefresh && state.entities[id] && state.isCacheValid(id)) {
          console.log(`💾 使用缓存数据 - ID: ${id}`);
          return state.entities[id];
        }

        try {
          set({ isLoading: true, error: null });
          console.log(`📡 获取猫粮详情 - ID: ${id}`);

          const catfood = await catFoodService.getCatFood(id);

          // 更新entity
          const newEntities = { ...state.entities, [id]: catfood };

          // 更新缓存元数据
          const newMetadata = {
            ...state.cacheMetadata,
            [id]: {
              timestamp: Date.now(),
              expiresIn: CACHE_CONFIG.DETAIL_EXPIRE,
            },
          };

          set({
            entities: newEntities,
            cacheMetadata: newMetadata,
          });

          console.log(`✅ 成功获取猫粮详情 - ${catfood.name}`);
          return catfood;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '获取猫粮详情失败';
          console.error('❌ 获取猫粮详情失败:', error);
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 搜索猫粮
       */
      searchCatFoods: async (query: string, page = 1) => {
        const state = get();

        if (!query.trim()) {
          console.warn('⚠️ 搜索关键词为空');
          set({
            lists: { ...state.lists, search: [] },
            pagination: {
              ...state.pagination,
              search: { ...INITIAL_PAGINATION },
            },
          });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          console.log(`🔍 搜索猫粮 - 关键词: "${query}", 第${page}页`);

          const response = await catFoodService.searchCatFood({
            name: query,
            page,
            page_size: DEFAULT_PAGE_SIZE,
          });

          if (!response || !Array.isArray(response.results)) {
            throw new Error('搜索响应数据格式异常');
          }

          const { results, count, next } = response;

          // 更新entities
          const newEntities = { ...state.entities };
          const newIds: number[] = [];
          const timestamp = Date.now();

          results.forEach((catfood) => {
            newEntities[catfood.id] = catfood;
            newIds.push(catfood.id);

            state.cacheMetadata[catfood.id] = {
              timestamp,
              expiresIn: CACHE_CONFIG.LIST_EXPIRE,
            };
          });

          // 更新搜索列表
          const updatedSearchList = page === 1 ? newIds : [...state.lists.search, ...newIds];

          set({
            entities: newEntities,
            lists: {
              ...state.lists,
              search: Array.from(new Set(updatedSearchList)),
            },
            pagination: {
              ...state.pagination,
              search: {
                page,
                pageSize: DEFAULT_PAGE_SIZE,
                total: count,
                hasMore: next !== null,
              },
            },
            cacheMetadata: { ...state.cacheMetadata },
          });

          console.log(`✅ 搜索成功，找到 ${results.length} 条结果`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '搜索猫粮失败';
          console.error('❌ 搜索猫粮失败:', error);
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 加载更多
       */
      loadMore: async (listType: ListType = 'all') => {
        const state = get();
        const pagination = state.pagination[listType];

        if (!pagination.hasMore || state.isLoadingMore) {
          console.log('⏸️ 没有更多数据或正在加载中');
          return;
        }

        try {
          set({ isLoadingMore: true, error: null });
          const nextPage = pagination.page + 1;

          console.log(`📄 加载更多 - ${listType} 列表，第${nextPage}页`);

          if (listType === 'all') {
            await get().fetchCatFoods(nextPage, false);
          } else if (listType === 'search') {
            // 需要保存搜索关键词以支持加载更多
            console.warn('⚠️ 搜索列表的加载更多需要提供搜索关键词');
          }

          console.log('✅ 加载更多成功');
        } catch (error) {
          console.error('❌ 加载更多失败:', error);
        } finally {
          set({ isLoadingMore: false });
        }
      },

      /**
       * 更新猫粮数据（乐观更新）
       */
      updateCatFood: (id: number, data: Partial<CatFood>) => {
        const state = get();
        const existingCatFood = state.entities[id];

        if (!existingCatFood) {
          console.warn(`⚠️ 猫粮不存在 - ID: ${id}`);
          return;
        }

        const updatedCatFood = { ...existingCatFood, ...data };

        set({
          entities: {
            ...state.entities,
            [id]: updatedCatFood,
          },
        });

        console.log(`✅ 乐观更新猫粮 - ID: ${id}`);
      },

      /**
       * 批量添加猫粮
       */
      addCatFoods: (catfoods: CatFood[], listType: ListType = 'all') => {
        const state = get();
        const newEntities = { ...state.entities };
        const newIds: number[] = [];
        const timestamp = Date.now();

        catfoods.forEach((catfood) => {
          newEntities[catfood.id] = catfood;
          newIds.push(catfood.id);

          state.cacheMetadata[catfood.id] = {
            timestamp,
            expiresIn: CACHE_CONFIG.DEFAULT_EXPIRE,
          };
        });

        const updatedList = [...state.lists[listType], ...newIds];

        set({
          entities: newEntities,
          lists: {
            ...state.lists,
            [listType]: Array.from(new Set(updatedList)),
          },
          cacheMetadata: { ...state.cacheMetadata },
        });

        console.log(`✅ 批量添加 ${catfoods.length} 条猫粮到 ${listType} 列表`);
      },

      // ==================== 缓存管理 ====================

      /**
       * 检查缓存是否有效
       */
      isCacheValid: (id: number) => {
        const state = get();
        const metadata = state.cacheMetadata[id];

        if (!metadata) return false;

        const now = Date.now();
        const isValid = now - metadata.timestamp < metadata.expiresIn;

        return isValid;
      },

      /**
       * 清除过期缓存
       */
      clearExpiredCache: () => {
        const state = get();
        const now = Date.now();
        const validIds: number[] = [];
        const newEntities: Record<number, CatFood> = {};
        const newMetadata: Record<number, CacheMetadata> = {};

        // 遍历所有entity，保留有效的
        Object.entries(state.entities).forEach(([idStr, catfood]) => {
          const id = Number(idStr);
          const metadata = state.cacheMetadata[id];

          if (metadata && now - metadata.timestamp < metadata.expiresIn) {
            validIds.push(id);
            newEntities[id] = catfood;
            newMetadata[id] = metadata;
          }
        });

        // 更新列表（移除无效ID）
        const filterList = (list: number[]) => list.filter((id) => validIds.includes(id));

        set({
          entities: newEntities,
          lists: {
            all: filterList(state.lists.all),
            search: filterList(state.lists.search),
            favorites: filterList(state.lists.favorites),
          },
          cacheMetadata: newMetadata,
        });

        const removedCount = Object.keys(state.entities).length - validIds.length;
        console.log(`🧹 清除了 ${removedCount} 条过期缓存`);
      },

      /**
       * 清除所有缓存
       */
      clearAllCache: () => {
        set({
          entities: {},
          lists: {
            all: [],
            search: [],
            favorites: [],
          },
          pagination: {
            all: { ...INITIAL_PAGINATION },
            search: { ...INITIAL_PAGINATION },
            favorites: { ...INITIAL_PAGINATION },
          },
          cacheMetadata: {},
          error: null,
        });

        console.log('🧹 清除所有缓存');
      },

      // ==================== 工具方法 ====================

      /**
       * 根据ID获取猫粮
       */
      getCatFoodById: (id: number) => {
        return get().entities[id];
      },

      /**
       * 获取指定列表的猫粮数组
       */
      getCatFoodsByList: (listType: ListType = 'all') => {
        const state = get();
        const ids = state.lists[listType];
        return ids.map((id) => state.entities[id]).filter(Boolean);
      },

      /**
       * 设置加载状态
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * 设置错误信息
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * 设置水化状态
       */
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      /**
       * 重置状态（用于登出等场景）
       */
      reset: () => {
        set({
          entities: {},
          lists: {
            all: [],
            search: [],
            favorites: [],
          },
          pagination: {
            all: { ...INITIAL_PAGINATION },
            search: { ...INITIAL_PAGINATION },
            favorites: { ...INITIAL_PAGINATION },
          },
          cacheMetadata: {},
          isLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          error: null,
        });

        console.log('🔄 重置猫粮Store');
      },
    }),
    {
      name: 'catFoodStorage',
      storage: createJSONStorage(() => AsyncStorage),
      // 持久化策略：只保存核心数据
      partialize: (state) => ({
        entities: state.entities,
        lists: state.lists,
        cacheMetadata: state.cacheMetadata,
      }),
      // 水化完成后的回调
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('💧 猫粮状态恢复完成:', {
            entityCount: Object.keys(state.entities).length,
            allListCount: state.lists.all.length,
          });

          // 清除过期缓存
          state.clearExpiredCache();
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// ==================== 便捷 Hooks ====================

/**
 * 获取全部猫粮列表
 */
export const useAllCatFoods = () => {
  const catfoods = useCatFoodStore((state) => state.getCatFoodsByList('all'));
  const isLoading = useCatFoodStore((state) => state.isLoading);
  const hasMore = useCatFoodStore((state) => state.pagination.all.hasMore);

  return { catfoods, isLoading, hasMore };
};

/**
 * 根据ID获取猫粮
 */
export const useCatFood = (id: number) => {
  return useCatFoodStore((state) => state.getCatFoodById(id));
};

/**
 * 获取搜索结果
 */
export const useSearchResults = () => {
  const results = useCatFoodStore((state) => state.getCatFoodsByList('search'));
  const isLoading = useCatFoodStore((state) => state.isLoading);
  const hasMore = useCatFoodStore((state) => state.pagination.search.hasMore);

  return { results, isLoading, hasMore };
};
