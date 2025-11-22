import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useThemeStore } from '@/src/store/themeStore';
import { useUserStore } from '@/src/store/userStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, ScrollView, Separator, Text, XStack, YStack } from 'tamagui';
import { EditProfileModal } from '../_components/EditProfileModal';
import { LogoutButton } from '../_components/LogoutButton';
import { SettingItem } from '../_components/SettingItem';
import { ThemeSelectorModal } from '../_components/ThemeSelectorModal';

export default function SettingsPage() {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
    <ScrollView backgroundColor={colors.background} flex={1}>
      <YStack
        paddingTop={insets.top + 20}
        paddingBottom={insets.bottom + 30}
        paddingHorizontal="$4"
        gap="$4"
      >
        {/* Header with Back Button */}
        <XStack alignItems="center" gap="$3" marginBottom="$4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Card
              padding="$2"
              borderRadius="$3"
              backgroundColor={colors.background}
              borderWidth={1}
              borderColor={colors.icon + '40'}
            >
              <Ionicons name="chevron-back" size={24} color={colors.icon} />
            </Card>
          </TouchableOpacity>
          <Text fontSize={28} fontWeight="700" color={colors.text}>
            设置
          </Text>
        </XStack>

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
  );
}
