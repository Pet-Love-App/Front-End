import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { useUserStore } from '@/src/store/userStore';

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useUserStore();

  // 等待状态恢复
  if (!_hasHydrated) {
    console.log('⏳ 等待 Zustand 状态恢复...');
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        // 验证 token 是否有效
        try {
          console.log('✅ 检测到登录状态，验证 token...');
          await useUserStore.getState().fetchCurrentUser();
          console.log('✅ Token 有效，跳转到主页');
          router.replace('/(tabs)/collect');
        } catch (error) {
          // Token 无效，自动登出并跳转到登录页
          console.log('❌ Token 无效，自动登出');
          await useUserStore.getState().logout();
          router.replace('/login');
        }
      } else {
        console.log('❌ 未登录，跳转到登录页');
        router.replace('/login');
      }
    };

    checkAuth();
  }, [isAuthenticated, _hasHydrated, router]);

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
