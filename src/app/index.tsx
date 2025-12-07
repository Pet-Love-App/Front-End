import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { useUserStore } from '@/src/store/userStore';

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useUserStore();

  useEffect(() => {
    // 等待状态恢复
    if (!_hasHydrated) {
      return;
    }

    const checkAuth = async () => {
      if (isAuthenticated) {
        // 验证 token 是否有效
        try {
          await useUserStore.getState().fetchCurrentUser();
          router.replace('/(tabs)/collect');
        } catch (_error) {
          // Token 无效，自动登出并跳转到登录页
          await useUserStore.getState().logout();
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [isAuthenticated, _hasHydrated, router]);

  // 加载中状态
  if (!_hasHydrated) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      <Spinner size="large" color="$blue10" />
    </YStack>
  );
}
