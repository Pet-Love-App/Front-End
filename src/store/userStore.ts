/**
 * 用户状态管理 Store
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserWithPets } from '@/src/lib/supabase';
import { supabaseAuthService, supabaseProfileService } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';
import { loginSchema, registerSchema } from '@/src/schemas/auth.schema';

import type { Session } from '@supabase/supabase-js';

// ==================== 类型定义 ====================

interface UserState {
  // 用户信息
  user: UserWithPets | null;
  session: Session | null;
  accessToken: string | null;

  // 状态标志
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // 认证方法
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;

  // 用户信息方法
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (params: { username?: string; bio?: string; phone?: string }) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;
  deleteAvatar: () => Promise<void>;

  // 密码管理
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // 状态管理方法
  setUser: (user: UserWithPets | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

// ==================== Store 实现 ====================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ==================== 初始状态 ====================
      user: null,
      session: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      // ==================== 认证方法 ====================

      /** 用户登录 */
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          // 使用 Zod 验证输入
          const validatedData = loginSchema.parse({ email, password });

          // 调用 Supabase Auth 登录
          const { data, error } = await supabaseAuthService.login(validatedData);

          if (error || !data) {
            throw new Error(error?.message || '登录失败');
          }

          // 保存 session 和 accessToken
          set({
            session: data.session,
            accessToken: data.session?.access_token || null,
            isAuthenticated: true,
          });

          // 获取用户完整信息（含头像、宠物）
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('登录失败', error as Error);
          throw error;
        }
      },

      /** 用户注册 */
      register: async (email: string, username: string, password: string) => {
        try {
          set({ isLoading: true });

          // 使用 Zod 验证输入
          const validatedData = registerSchema.parse({
            email,
            username,
            password,
          });

          // 调用 Supabase Auth 注册
          const { data, error } = await supabaseAuthService.register(validatedData);

          if (error || !data) {
            throw new Error(error?.message || '注册失败');
          }

          // 如果没有 session，说明需要邮箱验证
          if (!data.session) {
            set({ isLoading: false });
            throw new Error('注册成功！请查收验证邮件并完成邮箱验证。');
          }

          // 保存 session 和 accessToken 并自动登录
          set({
            session: data.session,
            accessToken: data.session?.access_token || null,
            isAuthenticated: true,
          });

          // 获取用户完整信息
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('注册失败', error as Error);
          throw error;
        }
      },

      /** 用户登出 */
      logout: async () => {
        try {
          // 调用 Supabase Auth 登出
          await supabaseAuthService.logout();

          // 清除本地状态
          set({
            user: null,
            session: null,
            accessToken: null,
            isAuthenticated: false,
          });
        } catch (error) {
          logger.error('登出失败', error as Error);
          // 即使登出失败，也清除本地状态
          set({
            user: null,
            session: null,
            accessToken: null,
            isAuthenticated: false,
          });
        }
      },

      /** 刷新访问令牌 */
      refreshAccessToken: async () => {
        try {
          const { data, error } = await supabaseAuthService.refreshSession();

          if (error || !data) {
            logger.warn('刷新令牌失败', { error: error?.message });
            // Token 刷新失败，清除登录状态
            get().logout();
            throw new Error('登录已过期，请重新登录');
          }

          // 更新 session 和 accessToken
          set({
            session: data,
            accessToken: data.access_token,
          });
        } catch (error) {
          logger.error('刷新令牌失败', error as Error);
          throw error;
        }
      },

      // ==================== 用户信息方法 ====================

      /** 获取当前用户完整信息 */
      fetchCurrentUser: async () => {
        try {
          const { data, error } = await supabaseProfileService.getCurrentProfile();

          if (error || !data) {
            logger.error('获取用户信息失败', new Error(error?.message || '获取用户信息失败'));
            throw new Error(error?.message || '获取用户信息失败');
          }

          set({ user: data });
        } catch (error) {
          logger.error('用户信息获取失败', error as Error);
          throw error;
        }
      },

      /** 更新用户资料 */
      updateProfile: async (params: { username?: string; bio?: string; phone?: string }) => {
        try {
          set({ isLoading: true });

          const { error } = await supabaseProfileService.updateProfile(params);

          if (error) {
            throw new Error(error.message || '更新资料失败');
          }

          // 刷新用户信息
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('更新资料失败', error as Error);
          throw error;
        }
      },

      /** 上传头像 */
      uploadAvatar: async (imageUri: string) => {
        try {
          set({ isLoading: true });

          const { error } = await supabaseProfileService.uploadAvatar(imageUri);

          if (error) {
            throw new Error(error.message || '上传头像失败');
          }

          // 刷新用户信息
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('头像上传失败', error as Error);
          throw error;
        }
      },

      /** 删除头像 */
      deleteAvatar: async () => {
        try {
          set({ isLoading: true });

          const { error } = await supabaseProfileService.deleteAvatar();

          if (error) {
            throw new Error(error.message || '删除头像失败');
          }

          // 刷新用户信息
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('头像删除失败', error as Error);
          throw error;
        }
      },

      // ==================== 密码管理 ====================

      /** 更新密码（需要已登录） */
      updatePassword: async (newPassword: string) => {
        try {
          set({ isLoading: true });

          const { error } = await supabaseAuthService.updatePassword({ newPassword });

          if (error) {
            throw new Error(error.message || '修改密码失败');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('修改密码失败', error as Error);
          throw error;
        }
      },

      /** 发送密码重置邮件 */
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true });

          const { error } = await supabaseAuthService.resetPassword({ email });

          if (error) {
            throw new Error(error.message || '发送重置邮件失败');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          logger.error('发送重置邮件失败', error as Error);
          throw error;
        }
      },

      // ==================== 状态管理方法 ====================

      setUser: (user: UserWithPets | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setSession: (session: Session | null) => {
        set({
          session,
          accessToken: session?.access_token || null,
          isAuthenticated: !!session,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'userStorage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化这些字段
      partialize: (state) => ({
        // 注意：session 不需要持久化，Supabase SDK 会自动处理
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // 水化完成后的回调
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);

        // Supabase SDK 会自动从 AsyncStorage 恢复 Session
        // 检查是否有有效的 Session
        if (state?.isAuthenticated) {
          supabaseAuthService
            .getSession()
            .then(({ data: session }) => {
              if (session) {
                state.setSession(session);
                // 刷新用户信息
                state.fetchCurrentUser().catch((error) => {
                  logger.warn('刷新用户信息失败', { error: String(error) });
                });
              } else {
                // Session 已过期，清除登录状态
                state.setUser(null);
                state.setSession(null);
              }
            })
            .catch((error) => {
              logger.warn('获取 Session 失败', { error: String(error) });
              state.setUser(null);
              state.setSession(null);
            });
        }
      },
    }
  )
);
