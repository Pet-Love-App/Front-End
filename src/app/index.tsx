import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, YStack } from 'tamagui';

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
    if (isAuthenticated) {
      console.log('✅ 已登录，跳转到主页');
      router.replace('/(tabs)/collect');
    } else {
      console.log('❌ 未登录，跳转到登录页');
      router.replace('/login');
    }
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
