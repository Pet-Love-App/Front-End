import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Profile 数据管理 Hook
 * 负责用户数据的获取和认证状态管理
 */
export function useProfileData() {
  // 使用 userStore - 使用选择器避免不必要的重渲染
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const _hasHydrated = useUserStore((state) => state._hasHydrated);

  const router = useRouter();

  // 加载用户数据
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) return;
    if (!user) {
      fetchCurrentUser().catch((e) => {
        console.warn('获取用户信息失败', e);
      });
    }
  }, [user, fetchCurrentUser, isAuthenticated, _hasHydrated]);

  // 处理未认证状态
  const handleUnauthenticated = () => {
    router.replace('/login');
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    _hasHydrated,
    fetchCurrentUser,
    handleUnauthenticated,
  };
}
