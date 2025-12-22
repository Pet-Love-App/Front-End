/**
 * 登出按钮 - 退出当前账户
 */
import { useRouter } from 'expo-router';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useUserStore } from '@/src/store/userStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { showAlert, toast } from '@/src/components/dialogs';

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useUserStore();
  const colors = useThemeColors();

  const handleLogout = () => {
    showAlert({
      title: '确认登出',
      message: '确定要退出登录吗？',
      type: 'warning',
      buttons: [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('登出失败:', error);
              toast.error('登出失败', '请重试');
            }
          },
        },
      ],
    });
  };

  return (
    <Button
      testID="logout-button"
      size="$5"
      width="100%"
      height={56}
      backgroundColor={colors.error as any}
      color="white"
      icon={<IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="white" />}
      onPress={handleLogout}
      pressStyle={{ scale: 0.98, opacity: 0.9, backgroundColor: colors.error as any }}
      animation="quick"
      fontWeight="700"
      fontSize={16}
      borderRadius="$5"
    >
      退出登录
    </Button>
  );
}
