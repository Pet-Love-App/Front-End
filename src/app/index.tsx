import { useUserStore } from '@/src/store/userStore';
import { Redirect } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

export default function Index() {
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

  console.log('🔍 检查登录状态:', { isAuthenticated });

  // 根据登录状态重定向
  if (isAuthenticated) {
    console.log('✅ 已登录，跳转到主页');
    return <Redirect href="/(tabs)/collect" />;
  } else {
    console.log('❌ 未登录，跳转到登录页');
    return <Redirect href="/login" />;
  }
}
