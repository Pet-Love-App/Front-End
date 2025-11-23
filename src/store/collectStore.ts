/**
 * 收藏状态管理
 * 管理用户的猫粮收藏
 */

import type { Favorite } from '@/src/services/api';
import { collectApi } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CollectState {
  // 状态
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // 动作
  fetchFavorites: () => Promise<void>;
  addFavorite: (catfoodId: number) => Promise<void>;
  removeFavorite: (favoriteId: number) => Promise<void>;
  toggleFavorite: (catfoodId: number) => Promise<boolean>;
  checkFavorite: (catfoodId: number) => Promise<boolean>;
  isFavorited: (catfoodId: number) => boolean;
  clearFavorites: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useCollectStore = create<CollectState>()(
  persist(
    (set, get) => ({
      // 初始状态
      favorites: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // 获取收藏列表
      fetchFavorites: async () => {
        try {
          set({ isLoading: true, error: null });

          const favorites = await collectApi.getFavorites();

          // 确保 favorites 始终是数组
          const validFavorites = Array.isArray(favorites) ? favorites : [];

          set({
            favorites: validFavorites,
            isLoading: false,
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '获取收藏列表失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 收藏列表获取失败:', error);
          throw error;
        }
      },

      // 添加收藏
      addFavorite: async (catfoodId: number) => {
        try {
          set({ isLoading: true, error: null });

          const favorite = await collectApi.createFavorite(catfoodId);

          set((state) => ({
            favorites: [favorite, ...state.favorites],
            isLoading: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '收藏失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 收藏失败:', error);
          throw error;
        }
      },

      // 移除收藏
      removeFavorite: async (favoriteId: number) => {
        try {
          set({ isLoading: true, error: null });

          await collectApi.deleteFavorite(favoriteId);

          set((state) => ({
            favorites: state.favorites.filter((fav) => fav.id !== favoriteId),
            isLoading: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '取消收藏失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 取消收藏失败:', error);
          throw error;
        }
      },

      // 切换收藏状态
      toggleFavorite: async (catfoodId: number) => {
        try {
          set({ isLoading: true, error: null });

          const response = await collectApi.toggleFavorite(catfoodId);

          if (response.is_favorited && response.favorite) {
            // 已收藏
            set((state) => ({
              favorites: [response.favorite!, ...state.favorites],
              isLoading: false,
            }));
          } else {
            // 已取消收藏
            set((state) => ({
              favorites: state.favorites.filter((fav) => fav.catfood.id !== catfoodId),
              isLoading: false,
            }));
          }

          return response.is_favorited;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '操作失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 切换收藏状态失败:', error);
          throw error;
        }
      },

      // 检查是否已收藏
      checkFavorite: async (catfoodId: number) => {
        try {
          const isFavorited = await collectApi.checkFavorite(catfoodId);
          return isFavorited;
        } catch (error) {
          console.error('❌ 检查收藏状态失败:', error);
          return false;
        }
      },

      // 检查本地是否已收藏（不需要网络请求）
      isFavorited: (catfoodId: number) => {
        const { favorites } = get();
        return favorites.some((fav) => fav.catfood.id === catfoodId);
      },

      // 清空收藏列表（登出时调用）
      clearFavorites: () => {
        set({
          favorites: [],
          error: null,
        });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 设置错误信息
      setError: (error: string | null) => {
        set({ error });
      },

      // 设置水化状态
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'collectStorage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化收藏列表
      partialize: (state) => ({
        favorites: state.favorites,
      }),
      // 水化完成后的回调
      onRehydrateStorage: () => (state) => {
        console.log('💧 收藏状态恢复完成:', {
          favoritesCount: state?.favorites.length ?? 0,
        });
        state?.setHasHydrated(true);
      },
    }
  )
);
