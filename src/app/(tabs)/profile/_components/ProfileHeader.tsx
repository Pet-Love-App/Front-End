import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useUserStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Avatar, Button, Spinner, Text, XStack, YStack } from 'tamagui';

interface ProfileHeaderProps {
  /** 用户名 */
  username?: string;
  /** 用户简介 */
  bio?: string;
  /** 头像更新回调 */
  onAvatarUpdate?: () => void;
  /** 编辑资料回调 */
  onEditProfile?: () => void;
}

/**
 * 个人资料头部组件
 * 包含头像、用户信息、统计数据和编辑功能
 * 遵循企业级组件设计规范
 */
export function ProfileHeader({
  username = '未登录',
  bio = '这个人很懒，什么都没留下~',
  onAvatarUpdate,
  onEditProfile,
}: ProfileHeaderProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { user, uploadAvatar, deleteAvatar } = useUserStore();
  const [uploading, setUploading] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);

  const avatarUrl = user?.avatar ?? null;
  const avatarSrc = avatarUrl ? `${avatarUrl}?v=${cacheBuster}` : null;

  // 从相机拍照
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
    } catch (e: any) {
      Alert.alert('上传失败', e?.message ?? '请稍后再试');
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
    } catch (e: any) {
      Alert.alert('删除失败', e?.message ?? '请稍后再试');
    } finally {
      setUploading(false);
    }
  };

  // 点击头像处理
  const onPressAvatar = () => {
    const actions: any[] = [
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
    <YStack width="100%" alignItems="center" gap="$4" paddingVertical="$4">
      {/* 头像区域 */}
      <YStack alignItems="center" position="relative">
        <TouchableOpacity onPress={onPressAvatar} activeOpacity={0.85}>
          <YStack position="relative">
            <Avatar
              circular
              size="$12"
              borderWidth={4}
              borderColor={colors.tint}
              elevation="$4"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={8}
            >
              {uploading ? (
                <Avatar.Fallback
                  backgroundColor={colors.background}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Spinner size="large" color={colors.tint} />
                </Avatar.Fallback>
              ) : avatarSrc ? (
                <Avatar.Image src={avatarSrc} />
              ) : (
                <Avatar.Fallback
                  backgroundColor={colors.tint}
                  justifyContent="center"
                  alignItems="center"
                >
                  <IconSymbol name="person.fill" size={56} color="white" />
                </Avatar.Fallback>
              )}
            </Avatar>

            {/* 编辑按钮悬浮标识 */}
            {!uploading && (
              <YStack
                position="absolute"
                bottom={0}
                right={0}
                width={40}
                height={40}
                borderRadius="$10"
                backgroundColor={colors.tint}
                alignItems="center"
                justifyContent="center"
                borderWidth={3}
                borderColor={colors.background}
                shadowColor="$shadowColor"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.2}
                shadowRadius={4}
              >
                <IconSymbol name="camera.fill" size={18} color="white" />
              </YStack>
            )}
          </YStack>
        </TouchableOpacity>
      </YStack>

      {/* 用户信息区域 */}
      <YStack width="90%" alignItems="center" gap="$2">
        {/* 用户名 */}
        <Text
          fontSize={24}
          fontWeight="700"
          color={colors.text}
          textAlign="center"
          numberOfLines={1}
        >
          {username}
        </Text>

        {/* 用户简介 */}
        <Text
          fontSize={14}
          color={colors.icon}
          textAlign="center"
          numberOfLines={2}
          paddingHorizontal="$4"
        >
          {bio}
        </Text>
      </YStack>

      {/* 统计数据区域 */}
      <XStack
        width="90%"
        paddingVertical="$4"
        paddingHorizontal="$3"
        backgroundColor={colors.background}
        borderRadius="$4"
        borderWidth={1}
        borderColor={colors.icon + '20'}
        justifyContent="center"
      >
        <YStack flex={1} alignItems="center" gap="$1">
          <Text fontSize={20} fontWeight="700" color={colors.text}>
            {user?.pets?.length ?? 0}
          </Text>
          <Text fontSize={12} color={colors.icon}>
            我的宠物
          </Text>
        </YStack>
      </XStack>

      {/* 编辑资料按钮 */}
      <Button
        width="90%"
        size="$4"
        borderRadius="$3"
        backgroundColor="transparent"
        borderWidth={1.5}
        borderColor={colors.tint}
        color={colors.tint}
        fontWeight="600"
        pressStyle={{
          scale: 0.97,
          opacity: 0.8,
          backgroundColor: colors.tint + '10',
        }}
        hoverStyle={{
          backgroundColor: colors.tint + '10',
        }}
        onPress={onEditProfile}
        icon={<IconSymbol name="pencil" size={16} color={colors.tint} />}
      >
        编辑资料
      </Button>
    </YStack>
  );
}
