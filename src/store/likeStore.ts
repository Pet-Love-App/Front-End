/**
 * 点赞状态管理
 * 管理用户的猫粮点赞
 */

import type { Like } from '@/src/services/api';
import { likeApi } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LikeState {
  // 状态
  likes: Like[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  // 点赞数量缓存 (catfoodId -> count)
  likeCounts: Record<number, number>;

  // 动作
  fetchLikes: () => Promise<void>;
  addLike: (catfoodId: number) => Promise<void>;
  removeLike: (likeId: number) => Promise<void>;
  toggleLike: (catfoodId: number) => Promise<{ isLiked: boolean; likeCount: number }>;
  checkLike: (catfoodId: number) => Promise<boolean>;
  isLiked: (catfoodId: number) => boolean;
  getLikeCount: (catfoodId: number) => Promise<number>;
  clearLikes: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useLikeStore = create<LikeState>()(
  persist(
    (set, get) => ({
      // 初始状态
      likes: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,
      likeCounts: {},

      // 获取点赞列表
      fetchLikes: async () => {
        try {
          set({ isLoading: true, error: null });

          const likes = await likeApi.getLikes();

          // 确保 likes 始终是数组
          const validLikes = Array.isArray(likes) ? likes : [];

          set({
            likes: validLikes,
            isLoading: false,
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '获取点赞列表失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 点赞列表获取失败:', error);
          throw error;
        }
      },

      // 添加点赞
      addLike: async (catfoodId: number) => {
        try {
          set({ isLoading: true, error: null });

          const like = await likeApi.createLike(catfoodId);

          set((state) => ({
            likes: [like, ...state.likes],
            isLoading: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '点赞失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 点赞失败:', error);
          throw error;
        }
      },

      // 移除点赞
      removeLike: async (likeId: number) => {
        try {
          set({ isLoading: true, error: null });

          await likeApi.deleteLike(likeId);

          set((state) => ({
            likes: state.likes.filter((like) => like.id !== likeId),
            isLoading: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '取消点赞失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 取消点赞失败:', error);
          throw error;
        }
      },

      // 切换点赞状态
      toggleLike: async (catfoodId: number) => {
        try {
          set({ isLoading: true, error: null });

          const response = await likeApi.toggleLike(catfoodId);

          if (response.is_liked && response.like) {
            // 已点赞
            set((state) => ({
              likes: [response.like!, ...state.likes],
              likeCounts: {
                ...state.likeCounts,
                [catfoodId]: response.like_count,
              },
              isLoading: false,
            }));
          } else {
            // 已取消点赞
            set((state) => ({
              likes: state.likes.filter((like) => like.catfood.id !== catfoodId),
              likeCounts: {
                ...state.likeCounts,
                [catfoodId]: response.like_count,
              },
              isLoading: false,
            }));
          }

          return { isLiked: response.is_liked, likeCount: response.like_count };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '操作失败';
          set({
            error: errorMsg,
            isLoading: false,
          });
          console.error('❌ 切换点赞状态失败:', error);
          throw error;
        }
      },

      // 检查是否已点赞
      checkLike: async (catfoodId: number) => {
        try {
          const isLiked = await likeApi.checkLike(catfoodId);
          return isLiked;
        } catch (error) {
          console.error('❌ 检查点赞状态失败:', error);
          return false;
        }
      },

      // 检查本地是否已点赞（不需要网络请求）
      isLiked: (catfoodId: number) => {
        const { likes } = get();
        return likes.some((like) => like.catfood.id === catfoodId);
      },

      // 获取点赞数量
      getLikeCount: async (catfoodId: number) => {
        try {
          // 先检查缓存
          const { likeCounts } = get();
          if (likeCounts[catfoodId] !== undefined) {
            return likeCounts[catfoodId];
          }

          // 从服务器获取
          const count = await likeApi.getLikeCount(catfoodId);

          // 更新缓存
          set((state) => ({
            likeCounts: {
              ...state.likeCounts,
              [catfoodId]: count,
            },
          }));

          return count;
        } catch (error) {
          console.error('❌ 获取点赞数量失败:', error);
          return 0;
        }
      },

      // 清空点赞列表（登出时调用）
      clearLikes: () => {
        set({
          likes: [],
          likeCounts: {},
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
      name: 'likeStorage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化点赞列表和点赞数量缓存
      partialize: (state) => ({
        likes: state.likes,
        likeCounts: state.likeCounts,
      }),
      // 水化完成后的回调
      onRehydrateStorage: () => (state) => {
        console.log('💧 点赞状态恢复完成:', {
          likesCount: state?.likes.length ?? 0,
        });
        state?.setHasHydrated(true);
      },
    }
  )
);
