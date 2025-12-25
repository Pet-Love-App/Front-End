import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { useUserStore } from '@/src/store/userStore';

export default function Index() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, _hasHydrated } = useUserStore();
  const [isReady, setIsReady] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

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
          setRedirectTo('/(tabs)/collect');
        } catch (_error) {
          // Token 无效，自动登出并跳转到登录页
          await useUserStore.getState().logout();
          setRedirectTo('/login');
        }
      } else {
        setRedirectTo('/login');
      }
      setIsReady(true);
    };

    checkAuth();
  }, [isAuthenticated, _hasHydrated]);

  // 加载中状态
  if (!_hasHydrated || !isReady) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  // 使用 Redirect 组件进行导航（确保在 Layout 挂载后）
  if (redirectTo) {
    return <Redirect href={redirectTo as any} />;
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
