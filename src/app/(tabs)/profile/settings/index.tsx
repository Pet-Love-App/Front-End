/**
 * 设置页面 - 现代购物App风格
 */
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PageHeader } from '@/src/components/PageHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, neutralScale, infoScale } from '@/src/design-system/tokens';
import { useThemeStore } from '@/src/store/themeStore';
import { useUserStore } from '@/src/store/userStore';

import { EditProfileModal } from '../components/EditProfileModal';
import { LogoutButton } from '../components/LogoutButton';
import { ThemeSelectorModal } from '../components/ThemeSelectorModal';

// 设置项组件
interface SettingItemNewProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingItemNew({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  onPress,
  showArrow = true,
}: SettingItemNewProps) {
  return (
    <XStack
      paddingVertical="$3.5"
      paddingHorizontal="$4"
      alignItems="center"
      gap="$3"
      backgroundColor="white"
      pressStyle={onPress ? { backgroundColor: neutralScale.neutral2 } : undefined}
      onPress={onPress}
    >
      <YStack
        width={40}
        height={40}
        borderRadius={12}
        backgroundColor={iconBgColor}
        alignItems="center"
        justifyContent="center"
      >
        <IconSymbol name={icon as any} size={20} color={iconColor} />
      </YStack>
      <YStack flex={1}>
        <Text fontSize={15} fontWeight="500" color={neutralScale.neutral12}>
          {label}
        </Text>
      </YStack>
      {value && (
        <Text fontSize={14} color={neutralScale.neutral8} marginRight="$2">
          {value}
        </Text>
      )}
      {showArrow && onPress && (
        <IconSymbol name="chevron.right" size={16} color={neutralScale.neutral6} />
      )}
    </XStack>
  );
}

// 信息行组件
interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ label, value, isLast = false }: InfoRowProps) {
  return (
    <XStack
      paddingVertical="$3"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor={neutralScale.neutral2}
    >
      <Text fontSize={14} color={neutralScale.neutral8}>
        {label}
      </Text>
      <Text fontSize={14} fontWeight="500" color={neutralScale.neutral11}>
        {value}
      </Text>
    </XStack>
  );
}

// 分组标题组件
interface SectionTitleProps {
  title: string;
}

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <Text
      fontSize={13}
      fontWeight="600"
      color={neutralScale.neutral8}
      paddingHorizontal="$4"
      paddingTop="$5"
      paddingBottom="$2"
      textTransform="uppercase"
      letterSpacing={0.5}
    >
      {title}
    </Text>
  );
}

// 卡片容器组件
interface CardContainerProps {
  children: React.ReactNode;
}

function CardContainer({ children }: CardContainerProps) {
  return (
    <YStack
      marginHorizontal="$4"
      borderRadius={16}
      backgroundColor="white"
      overflow="hidden"
      borderWidth={1}
      borderColor={neutralScale.neutral3}
    >
      {children}
    </YStack>
  );
}

export default function SettingsPage() {
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
    <YStack flex={1} backgroundColor={neutralScale.neutral1}>
      {/* 背景渐变 */}
      <YStack position="absolute" width="100%" height={200}>
        <LinearGradient
          colors={[primaryScale.primary2, neutralScale.neutral1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      {/* Header */}
      <PageHeader title="设置" showBackButton insets={insets} variant="prominent" />

      {/* Content */}
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* 用户信息卡片 */}
        <SectionTitle title="个人信息" />
        <CardContainer>
          <InfoRow label="用户名" value={user?.username ?? '未登录'} />
          <InfoRow label="用户ID" value={user?.id ? `${user.id.slice(0, 8)}...` : '-'} isLast />
        </CardContainer>

        {/* 账号设置 */}
        <SectionTitle title="账号设置" />
        <CardContainer>
          <SettingItemNew
            icon="person.fill"
            iconBgColor={primaryScale.primary2}
            iconColor={primaryScale.primary8}
            label="编辑个人资料"
            value="用户名 / 头像"
            onPress={() => setProfileModalVisible(true)}
          />
        </CardContainer>

        {/* 外观设置 */}
        <SectionTitle title="外观设置" />
        <CardContainer>
          <SettingItemNew
            icon="moon.fill"
            iconBgColor={infoScale.info2}
            iconColor={infoScale.info8}
            label="主题模式"
            value={getThemeLabel()}
            onPress={() => setThemeModalVisible(true)}
          />
        </CardContainer>

        {/* 关于 */}
        <SectionTitle title="关于" />
        <CardContainer>
          <InfoRow label="应用版本" value="1.0.0" />
          <InfoRow label="开发团队" value="Pet Love Team" isLast />
        </CardContainer>

        {/* 退出登录 */}
        <YStack marginTop="$6" paddingHorizontal="$4">
          <LogoutButton />
        </YStack>

        {/* 底部说明 */}
        <YStack alignItems="center" marginTop="$6" gap="$1">
          <Text fontSize={12} color={neutralScale.neutral6}>
            Made with ❤️ by Pet Love Team
          </Text>
          <Text fontSize={11} color={neutralScale.neutral5}>
            © 2024 Pet Love. All rights reserved.
          </Text>
        </YStack>
      </ScrollView>

      {/* Modals */}
      <ThemeSelectorModal
        open={themeModalVisible}
        onOpenChange={setThemeModalVisible}
        currentTheme={themeMode}
        onThemeChange={setThemeMode}
      />

      <EditProfileModal open={profileModalVisible} onOpenChange={setProfileModalVisible} />
    </YStack>
  );
}
