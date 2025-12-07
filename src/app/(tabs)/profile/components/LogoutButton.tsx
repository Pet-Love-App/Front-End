import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useUserStore } from '@/src/store/userStore';

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useUserStore();

  const handleLogout = () => {
    Alert.alert('确认登出', '确定要退出登录吗？', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            console.error('登出失败:', error);
            Alert.alert('错误', '登出失败，请重试');
          }
        },
      },
    ]);
  };

  return (
    <Button
      size="$5"
      backgroundColor="$red10"
      color="white"
      icon={<IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="white" />}
      onPress={handleLogout}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      animation="quick"
      fontWeight="600"
    >
      退出登录
    </Button>
  );
}
