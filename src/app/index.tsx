import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Spinner, YStack } from 'tamagui';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useUserStore();

  useEffect(() => {
    if (!_hasHydrated) {
      console.log('⏳ 等待 Zustand 状态恢复...');
      return;
    }

    console.log('🔍 检查登录状态:', { isAuthenticated, _hasHydrated });

    if (isAuthenticated) {
      console.log('✅ 已登录，跳转到主页');
      router.replace('/(tabs)/collect');
    } else {
      console.log('❌ 未登录，跳转到登录页');
      router.replace('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
      <Spinner size="large" color="$blue10" />
    </YStack>
  );
}
