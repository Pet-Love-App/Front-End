/**
 * 个人资料头部 - 头像、用户名和简介
 */
import { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, Spinner, Text, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useUserStore } from '@/src/store/userStore';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

interface ProfileHeaderProps {
  username?: string;
  bio?: string;
  onAvatarUpdate?: () => void;
  equippedBadge?: { icon: string; color: string; gradient?: string[] } | null;
}

export function ProfileHeader({
  username = '未登录',
  bio = '这个人很懒,什么都没留下~',
  onAvatarUpdate,
  equippedBadge,
}: ProfileHeaderProps) {
  const { user, uploadAvatar, deleteAvatar } = useUserStore();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [uploading, setUploading] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);

  const avatarUrl = user?.avatarUrl ?? null;
  const avatarSrc = avatarUrl ? `${avatarUrl}?v=${cacheBuster}` : null;

  // 拍照
  const pickFromCamera = async () => {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPerm.status !== 'granted') {
        Alert.alert('需要权限', '请允许相机权限或从相册选择图片');
        return pickFromLibrary();
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ('canceled' in result && !result.canceled && result.assets?.[0]) {
        await doUploadAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('相机错误:', e);
    }
  };

  // 从相册选择
  const pickFromLibrary = async () => {
    try {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libPerm.status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
      });

      if ('canceled' in result && !result.canceled && result.assets?.[0]) {
        await doUploadAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('相册错误:', e);
    }
  };

  // 执行上传头像
  const doUploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      await uploadAvatar(uri);
      setCacheBuster((v) => v + 1);
      Alert.alert('成功', '头像已更新');
      onAvatarUpdate?.();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '请稍后再试';
      Alert.alert('上传失败', message);
    } finally {
      setUploading(false);
    }
  };

  // 删除头像
  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      await deleteAvatar();
      setCacheBuster((v) => v + 1);
      onAvatarUpdate?.();
      Alert.alert('成功', '头像已删除');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '请稍后再试';
      Alert.alert('删除失败', message);
    } finally {
      setUploading(false);
    }
  };

  // 点击头像
  const onPressAvatar = () => {
    const actions: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
      { text: '取消', style: 'cancel' },
      { text: '从相册选择', onPress: pickFromLibrary },
      { text: '拍照', onPress: pickFromCamera },
    ];

    if (avatarUrl) {
      actions.push({
        text: '删除头像',
        style: 'destructive',
        onPress: handleDeleteAvatar,
      });
    }

    Alert.alert('更换头像', '请选择图片来源', actions);
  };

  return (
    <YStack width="100%" alignItems="center" position="relative" paddingBottom="$4">
      {/* 顶部渐变背景 - 美化版本 */}
      <YStack width="100%" height={200} position="relative" overflow="hidden">
        {/* 主渐变层 */}
        <LinearGradient
          colors={
            isDark
              ? (['#2D1F1A', '#3D2A1F', '#1F1714', colors.background] as const)
              : (['#FEBE98', '#FFD5C4', '#FFE4D9', '#FFF8F5'] as const)
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* 次级渐变层 - 增加深度 */}
        <LinearGradient
          colors={
            isDark
              ? (['rgba(254, 190, 152, 0.05)', 'transparent', 'transparent'] as const)
              : (['rgba(255, 255, 255, 0.3)', 'transparent', 'transparent'] as const)
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* 装饰性图案 - 圆形 1 (大) */}
        <YStack
          position="absolute"
          top={-50}
          right={-50}
          width={180}
          height={180}
          borderRadius={90}
          backgroundColor={isDark ? 'rgba(254, 190, 152, 0.04)' : 'rgba(255, 255, 255, 0.15)'}
          style={{
            shadowColor: isDark ? '#FEBE98' : '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isDark ? 0.1 : 0.3,
            shadowRadius: 30,
          }}
        />

        {/* 装饰性图案 - 圆形 2 (中) */}
        <YStack
          position="absolute"
          bottom={-30}
          left={-30}
          width={120}
          height={120}
          borderRadius={60}
          backgroundColor={isDark ? 'rgba(254, 190, 152, 0.06)' : 'rgba(255, 255, 255, 0.2)'}
        />

        {/* 装饰性图案 - 小方形 (左上) */}
        <YStack
          position="absolute"
          top={20}
          left={20}
          width={50}
          height={50}
          borderRadius="$6"
          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.12)'}
          transform={[{ rotate: '15deg' }]}
        />

        {/* 装饰性图案 - 小圆形 (右下) */}
        <YStack
          position="absolute"
          bottom={40}
          right={40}
          width={30}
          height={30}
          borderRadius={15}
          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.18)'}
        />

        {/* 波浪纹理效果 */}
        <YStack
          position="absolute"
          top={60}
          left={-100}
          width={300}
          height={100}
          borderRadius={150}
          backgroundColor={isDark ? 'rgba(254, 190, 152, 0.02)' : 'rgba(255, 255, 255, 0.08)'}
          transform={[{ scaleX: 2 }]}
        />
      </YStack>

      {/* 头像区域 - 美化版本 */}
      <YStack position="absolute" top={90} alignItems="center" zIndex={10}>
        <TouchableOpacity testID="user-avatar" onPress={onPressAvatar} activeOpacity={0.85}>
          <YStack position="relative" alignItems="center">
            {/* 外层光晕 */}
            <YStack
              position="absolute"
              width={148}
              height={148}
              borderRadius={74}
              backgroundColor={isDark ? 'rgba(254, 190, 152, 0.15)' : 'rgba(254, 190, 152, 0.25)'}
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isDark ? 0.3 : 0.5,
                shadowRadius: 20,
              }}
            />

            {/* 中层装饰环 */}
            <YStack
              position="absolute"
              width={138}
              height={138}
              borderRadius={69}
              borderWidth={3}
              borderColor={isDark ? 'rgba(254, 190, 152, 0.2)' : 'rgba(255, 255, 255, 0.6)'}
              style={{
                shadowColor: isDark ? colors.primary : '#FFFFFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            />

            {/* 头像主体 */}
            <YStack
              borderRadius={64}
              overflow="hidden"
              borderWidth={4}
              borderColor={colors.cardBackground as any}
              style={{
                shadowColor: isDark ? '#000000' : colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.25,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <Avatar circular size={128} borderWidth={0} elevation={0}>
                {uploading ? (
                  <Avatar.Fallback
                    backgroundColor={colors.backgroundMuted as any}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Spinner size="large" color={colors.error as any} />
                  </Avatar.Fallback>
                ) : avatarSrc ? (
                  <Avatar.Image src={avatarSrc} />
                ) : (
                  <Avatar.Fallback
                    backgroundColor={colors.primary as any}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {/* 渐变背景 */}
                    <LinearGradient
                      colors={
                        isDark
                          ? ([colors.primary, colors.primaryDark] as const)
                          : ([colors.primaryLight, colors.primary] as const)
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: 128,
                        height: 128,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                    <IconSymbol name="person.fill" size={50} color="white" />
                  </Avatar.Fallback>
                )}
              </Avatar>
            </YStack>

            {/* 相机按钮 - 增强版 */}
            {!uploading && (
              <YStack
                position="absolute"
                bottom={4}
                right={4}
                width={40}
                height={40}
                borderRadius={20}
                overflow="hidden"
                style={{
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? ([colors.primary, colors.primaryDark] as const)
                      : ([colors.primary, colors.primaryDark] as const)
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: colors.cardBackground as any,
                    borderRadius: 20,
                  }}
                >
                  <IconSymbol name="camera.fill" size={18} color="white" />
                </LinearGradient>
              </YStack>
            )}
          </YStack>
        </TouchableOpacity>
      </YStack>

      {/* 用户信息 */}
      <YStack width="100%" alignItems="center" gap="$2.5" paddingTop={40} paddingBottom="$1">
        {/* 用户名和勋章 */}
        <YStack alignItems="center" gap="$1.5">
          <View testID="user-username">
            <Text
              fontSize={24}
              fontWeight="700"
              color={colors.text as any}
              textAlign="center"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>

          {/* 已装备的勋章 */}
          {equippedBadge && (
            <YStack
              flexDirection="row"
              alignItems="center"
              gap="$1.5"
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              backgroundColor={(equippedBadge.color + '15') as any}
              borderRadius={12}
              borderWidth={1}
              borderColor={(equippedBadge.color + '30') as any}
            >
              {equippedBadge.gradient ? (
                <LinearGradient
                  colors={equippedBadge.gradient as [string, string]}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol name={equippedBadge.icon as any} size={12} color="white" />
                </LinearGradient>
              ) : (
                <IconSymbol
                  name={equippedBadge.icon as any}
                  size={16}
                  color={equippedBadge.color}
                />
              )}
            </YStack>
          )}
        </YStack>

        <Text
          fontSize={12}
          color={colors.textSecondary as any}
          textAlign="center"
          numberOfLines={2}
          paddingHorizontal="$6"
          lineHeight={18}
        >
          {bio}
        </Text>
      </YStack>
    </YStack>
  );
}
