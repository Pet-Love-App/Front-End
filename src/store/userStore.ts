import { loginSchema, registerSchema } from '@/src/schemas/auth.schema';
import type { User } from '@/src/schemas/user.schema';
import { ApiError, authService } from '@/src/services/api/auth';
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

  // 认证方法（适配 Supabase）
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;

  // 用户信息方法
  fetchCurrentUser: () => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;
  deleteAvatar: () => Promise<void>;

  // 状态管理方法
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

      // 登录（适配 Supabase）
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          // 使用 Zod 验证输入
          const validatedData = loginSchema.parse({ email, password });

          // 调用登录 API（返回 { user, session }）
          const { user: authUser, session } = await authService.login(validatedData);

          // 保存 tokens
          set({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
          });

          // 获取用户完整信息（含头像、宠物）
          const user = await authService.getCurrentUser(session.access_token);

          set({
            user,
            isLoading: false,
          });
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

      // 注册（适配 Supabase）
      register: async (email: string, username: string, password: string) => {
        try {
          set({ isLoading: true });

          // 使用 Zod 验证输入
          const validatedData = registerSchema.parse({
            email,
            username,
            password,
          });

          // 调用注册 API（返回 { user, session }）
          const { user: authUser, session } = await authService.register(validatedData);

          // 如果没有 session，说明需要邮箱验证
          if (!session) {
            set({ isLoading: false });
            throw new Error('注册成功！请查收验证邮件并完成邮箱验证。');
          }

          // 保存 tokens 并自动登录
          set({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
          });

          // 获取用户完整信息
          const user = await authService.getCurrentUser(session.access_token);

          set({
            user,
            isLoading: false,
          });
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

      // 刷新访问令牌（适配 Supabase）
      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('没有刷新令牌');
          }

          const session = await authService.refreshToken(refreshToken);

          set({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });
        } catch (error) {
          console.error('❌ Token 刷新失败:', error);
          // Token 刷新失败，清除登录状态
          get().logout();
          throw error;
        }
      },

      // 获取当前用户信息（适配 Supabase）
      fetchCurrentUser: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('未登录');
          }

          // 获取完整用户信息（含头像、宠物）
          const user = await authService.getCurrentUser(accessToken);

          set({
            user,
          });
        } catch (error) {
          console.error('❌ 用户信息获取失败:', error);
          throw error;
        }
      },

      // 上传头像（适配 Supabase）
      uploadAvatar: async (imageUri: string) => {
        try {
          set({ isLoading: true });

          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('未登录');
          }

          await authService.uploadAvatar(accessToken, imageUri);

          // 刷新用户信息
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ 头像上传失败:', error);
          throw error;
        }
      },

      // 删除头像（适配 Supabase）
      deleteAvatar: async () => {
        try {
          set({ isLoading: true });

          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('未登录');
          }

          await authService.deleteAvatar(accessToken);

          // 刷新用户信息
          await get().fetchCurrentUser();

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ 头像删除失败:', error);
          throw error;
        }
      },

      // 登出（适配 Supabase）
      logout: async () => {
        try {
          const { accessToken } = get();

          // 如果有 token，调用后端登出接口
          if (accessToken) {
            try {
              await authService.logout(accessToken);
            } catch (error) {
              // 登出接口失败也继续清除本地状态
              console.warn('⚠️ 后端登出失败，但继续清除本地状态:', error);
            }
          }

          // 清除本地状态
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
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
        // Zustand 状态恢复完成
        // console.log('💧 Zustand 状态恢复完成:', {
        //   isAuthenticated: state?.isAuthenticated,
        //   hasUser: !!state?.user,
        // });
        state?.setHasHydrated(true);
      },
    }
  )
);
