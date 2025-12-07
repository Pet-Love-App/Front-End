import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, ScrollView, Separator, Text, XStack, YStack } from 'tamagui';
import { PageHeader } from '@/src/components/PageHeader';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useThemeStore } from '@/src/store/themeStore';
import { useUserStore } from '@/src/store/userStore';

import { EditProfileModal } from '../components/EditProfileModal';
import { LogoutButton } from '../components/LogoutButton';
import { SettingItem } from '../components/SettingItem';
import { ThemeSelectorModal } from '../components/ThemeSelectorModal';

export default function SettingsPage() {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const _router = useRouter();
  const { themeMode, setThemeMode } = useThemeStore();
  const { user } = useUserStore();

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return '浅色';
      case 'dark':
        return '深色';
      case 'system':
        return '跟随系统';
    }
  };

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      {/* Header */}
      <PageHeader title="设置" showBackButton insets={insets} variant="prominent" />

      {/* Content */}
      <ScrollView flex={1}>
        <YStack paddingBottom={insets.bottom + 30} paddingHorizontal="$4" gap="$4">
          {/* User Info Section */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={colors.text} paddingHorizontal="$2">
              个人信息
            </Text>

            <Card
              padding="$4"
              borderWidth={1}
              borderColor={colors.icon + '40'}
              backgroundColor={colors.background}
              bordered
            >
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={15} color={colors.icon}>
                    用户名
                  </Text>
                  <Text fontSize={16} fontWeight="500" color={colors.text}>
                    {user?.username ?? '未登录'}
                  </Text>
                </XStack>

                <Separator borderColor={colors.icon + '20'} />

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={15} color={colors.icon}>
                    用户ID
                  </Text>
                  <Text fontSize={16} fontWeight="500" color={colors.text}>
                    {user?.id ?? '-'}
                  </Text>
                </XStack>
              </YStack>
            </Card>

            <SettingItem
              icon="person.fill"
              label="编辑个人资料"
              value="用户名/密码"
              onPress={() => setProfileModalVisible(true)}
            />
          </YStack>

          {/* Appearance Section */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={colors.text} paddingHorizontal="$2">
              外观设置
            </Text>

            <SettingItem
              icon="moon.fill"
              label="主题模式"
              value={getThemeLabel()}
              onPress={() => setThemeModalVisible(true)}
            />
          </YStack>

          {/* About Section */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color={colors.text} paddingHorizontal="$2">
              关于
            </Text>

            <Card
              padding="$4"
              borderWidth={1}
              borderColor={colors.icon + '40'}
              backgroundColor={colors.background}
            >
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={15} color={colors.icon}>
                    应用版本
                  </Text>
                  <Text fontSize={16} fontWeight="500" color={colors.text}>
                    1.0.0
                  </Text>
                </XStack>

                <Separator borderColor={colors.icon + '20'} />

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={15} color={colors.icon}>
                    开发团队
                  </Text>
                  <Text fontSize={16} fontWeight="500" color={colors.text}>
                    Pet Love Team
                  </Text>
                </XStack>
              </YStack>
            </Card>
          </YStack>

          {/* Danger Zone */}
          <YStack gap="$3" marginTop="$6">
            <Text fontSize={18} fontWeight="600" color="$red10" paddingHorizontal="$2">
              账号操作
            </Text>

            <LogoutButton />
          </YStack>
        </YStack>

        {/* Modals */}
        <ThemeSelectorModal
          open={themeModalVisible}
          onOpenChange={setThemeModalVisible}
          currentTheme={themeMode}
          onThemeChange={setThemeMode}
        />

        <EditProfileModal open={profileModalVisible} onOpenChange={setProfileModalVisible} />
      </ScrollView>
    </YStack>
  );
}
