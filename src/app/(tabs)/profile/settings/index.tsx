/**
 * 设置页面 - 现代购物App风格
 */
import { useState } from 'react';
import { View, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PageHeader } from '@/src/components/PageHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale } from '@/src/design-system/tokens';
import { useThemeStore } from '@/src/store/themeStore';
import { useUserStore } from '@/src/store/userStore';
import { usePetStore } from '@/src/hooks/usePetStore';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

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
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}

function SettingItemNew({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  onPress,
  showArrow = true,
  rightElement,
  colors,
}: SettingItemNewProps) {
  return (
    <XStack
      paddingVertical="$3.5"
      paddingHorizontal="$4"
      alignItems="center"
      gap="$3"
      backgroundColor={colors.cardBackground as any}
      pressStyle={onPress ? { backgroundColor: colors.hover as any } : undefined}
      onPress={onPress}
    >
      <YStack
        width={40}
        height={40}
        borderRadius={12}
        style={{ backgroundColor: iconBgColor }}
        alignItems="center"
        justifyContent="center"
      >
        <IconSymbol name={icon as any} size={20} color={iconColor} />
      </YStack>
      <YStack flex={1}>
        <Text fontSize={15} fontWeight="500" color={colors.text as any}>
          {label}
        </Text>
      </YStack>
      {rightElement ? (
        rightElement
      ) : (
        <>
          {value && (
            <Text fontSize={14} color={colors.textSecondary as any} marginRight="$2">
              {value}
            </Text>
          )}
          {showArrow && onPress && (
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          )}
        </>
      )}
    </XStack>
  );
}

// 信息行组件
interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
  colors: ReturnType<typeof useThemeColors>;
}

function InfoRow({ label, value, isLast = false, colors }: InfoRowProps) {
  return (
    <XStack
      paddingVertical="$3"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor={colors.borderMuted as any}
    >
      <Text fontSize={14} color={colors.textSecondary as any}>
        {label}
      </Text>
      <Text fontSize={14} fontWeight="500" color={colors.text as any}>
        {value}
      </Text>
    </XStack>
  );
}

// 分组标题组件
interface SectionTitleProps {
  title: string;
  colors: ReturnType<typeof useThemeColors>;
}

function SectionTitle({ title, colors }: SectionTitleProps) {
  return (
    <Text
      fontSize={13}
      fontWeight="600"
      color={colors.textSecondary as any}
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
  colors: ReturnType<typeof useThemeColors>;
}

function CardContainer({ children, colors }: CardContainerProps) {
  return (
    <YStack
      marginHorizontal="$4"
      borderRadius={16}
      backgroundColor={colors.cardBackground as any}
      overflow="hidden"
      borderWidth={1}
      borderColor={colors.borderMuted as any}
    >
      {children}
    </YStack>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode } = useThemeStore();
  const { user } = useUserStore();
  const { isVisible, setVisible } = usePetStore();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

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

  // 渐变背景颜色
  const gradientColors = isDark
    ? (['#1F1714', colors.background] as const)
    : ([primaryScale.primary2, colors.background] as const);

  return (
    <View testID="settings-screen" style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor={colors.background as any}>
        {/* 背景渐变 */}
        <YStack position="absolute" width="100%" height={200}>
          <LinearGradient
            colors={gradientColors}
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
          <SectionTitle title="个人信息" colors={colors} />
          <CardContainer colors={colors}>
            <InfoRow label="用户名" value={user?.username ?? '未登录'} colors={colors} />
            <InfoRow
              label="用户ID"
              value={user?.id ? `${user.id.slice(0, 8)}...` : '-'}
              isLast
              colors={colors}
            />
          </CardContainer>

          {/* 账号设置 */}
          <SectionTitle title="账号设置" colors={colors} />
          <CardContainer colors={colors}>
            <SettingItemNew
              icon="person.fill"
              iconBgColor={isDark ? '#3D2A1F' : primaryScale.primary2}
              iconColor={primaryScale.primary8}
              label="编辑个人资料"
              value="用户名 / 密码 / 简介"
              onPress={() => setIsEditProfileOpen(true)}
              colors={colors}
            />
          </CardContainer>

          {/* 外观设置 */}
          <SectionTitle title="外观设置" colors={colors} />
          <YStack
            marginHorizontal="$4"
            marginTop="$2"
            backgroundColor={colors.cardBackground as any}
            borderRadius={16}
            overflow="hidden"
            borderWidth={1}
            borderColor={colors.borderMuted as any}
          >
            <View testID="theme-setting">
              <SettingItemNew
                icon="moon.fill"
                iconBgColor={isDark ? '#2D1F3D' : '#F3E8FF'}
                iconColor="#9333EA"
                label="深色模式"
                value={
                  themeMode === 'system' ? '跟随系统' : themeMode === 'dark' ? '已开启' : '已关闭'
                }
                onPress={() => setIsThemeSelectorOpen(true)}
                colors={colors}
              />
            </View>
            <SettingItemNew
              icon="pawprint.fill"
              iconBgColor={isDark ? '#2D1F0A' : '#FFF4E6'}
              iconColor="#FF9500"
              label="桌面宠物"
              showArrow={false}
              colors={colors}
              rightElement={
                <Switch
                  value={isVisible}
                  onValueChange={setVisible}
                  trackColor={{ false: colors.border, true: '#FF9500' }}
                  thumbColor={isDark ? '#FAFAFA' : '#FFFFFF'}
                />
              }
            />
          </YStack>

          {/* 关于与帮助 */}
          <SectionTitle title="关于与帮助" colors={colors} />
          <CardContainer colors={colors}>
            <InfoRow label="应用版本" value="1.0.0" colors={colors} />
            <InfoRow label="开发团队" value="Pet Love Team" isLast colors={colors} />
          </CardContainer>

          {/* 退出登录 */}
          <YStack marginTop="$6" paddingHorizontal="$4">
            <LogoutButton />
          </YStack>

          {/* 底部说明 */}
          <YStack alignItems="center" marginTop="$6" gap="$1">
            <Text fontSize={12} color={colors.textTertiary as any}>
              Made with ❤️ by Pet Love Team
            </Text>
            <Text fontSize={11} color={colors.textMuted as any}>
              © 2024 Pet Love. All rights reserved.
            </Text>
          </YStack>
        </ScrollView>

        {/* Modals */}
        <ThemeSelectorModal
          open={isThemeSelectorOpen}
          onOpenChange={setIsThemeSelectorOpen}
          currentTheme={themeMode}
          onThemeChange={setThemeMode}
        />

        <EditProfileModal open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen} />
      </YStack>
    </View>
  );
}
