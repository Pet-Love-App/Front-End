import type { User } from '@/src/schemas/auth.schema';
import { loginSchema, registerSchema } from '@/src/schemas/auth.schema';
import { ApiError, authService } from '@/src/services/api/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, rePassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      // 登录
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });

          // 使用 Zod 验证输入
          const validatedData = loginSchema.parse({ username, password });

          // 调用登录 API
          const { access, refresh } = await authService.login(validatedData);

          // 获取用户信息
          const user = await authService.getCurrentUser(access);

          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ 登录成功:', user);
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ 登录失败:', error);

          // 处理不同类型的错误
          if (error instanceof ApiError) {
            throw new Error(error.message);
          }
          throw error;
        }
      },

      // 注册
      register: async (username: string, password: string, rePassword: string) => {
        try {
          set({ isLoading: true });

          // 使用 Zod 验证输入
          const validatedData = registerSchema.parse({
            username,
            password,
            re_password: rePassword,
          });

          // 调用注册 API
          await authService.register(validatedData);

          set({ isLoading: false });
          console.log('✅ 注册成功');
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ 注册失败:', error);

          // 处理不同类型的错误
          if (error instanceof ApiError) {
            throw new Error(error.message);
          }
          throw error;
        }
      },

      // 刷新访问令牌
      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('没有刷新令牌');
          }

          const { access, refresh } = await authService.refreshToken({
            refresh: refreshToken,
          });

          set({
            accessToken: access,
            refreshToken: refresh,
          });

          console.log('✅ Token 刷新成功');
        } catch (error) {
          console.error('❌ Token 刷新失败:', error);
          // Token 刷新失败，清除登录状态
          get().logout();
          throw error;
        }
      },

      // 获取当前用户信息
      fetchCurrentUser: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('未登录');
          }

          const user = await authService.getCurrentUser(accessToken);
          set({ user });
          console.log('✅ 用户信息获取成功:', user);
        } catch (error) {
          console.error('❌ 用户信息获取失败:', error);
          throw error;
        }
      },

      // 登出
      logout: async () => {
        try {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          console.log('✅ 登出成功');
        } catch (error) {
          console.error('❌ 登出失败:', error);
          throw error;
        }
      },

      // 设置用户
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // 设置 tokens
      setTokens: (accessToken: string | null, refreshToken: string | null) => {
        set({ accessToken, refreshToken });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 设置水化状态
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'userStorage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化这些字段
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // 水化完成后的回调
      onRehydrateStorage: () => (state) => {
        console.log('💧 Zustand 状态恢复完成:', {
          isAuthenticated: state?.isAuthenticated,
          hasUser: !!state?.user,
        });
        state?.setHasHydrated(true);
      },
    }
  )
);
