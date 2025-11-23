import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useUserStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Avatar, Spinner, Text, YStack } from 'tamagui';

interface ProfileHeaderProps {
  /** 用户名 */
  username?: string;
  /** 用户简介 */
  bio?: string;
  /** 头像更新回调 */
  onAvatarUpdate?: () => void;
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
}: ProfileHeaderProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { user, uploadAvatar, deleteAvatar } = useUserStore();
  const [uploading, setUploading] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);

  const avatarUrl = user?.avatar ?? null;
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
    <YStack width="100%" alignItems="center" position="relative" paddingBottom="$4">
      {/* 顶部渐变背景 */}
      <YStack width="100%" height={160} position="relative" overflow="hidden">
        <LinearGradient
          colors={['#FEBE98', '#FDB97A', '#FCA55C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        {/* 装饰性图案 */}
        <YStack
          position="absolute"
          top={-30}
          right={-30}
          width={120}
          height={120}
          borderRadius="$12"
          backgroundColor="rgba(255, 255, 255, 0.1)"
          transform={[{ rotate: '45deg' }]}
        />
        <YStack
          position="absolute"
          bottom={-20}
          left={-20}
          width={80}
          height={80}
          borderRadius="$10"
          backgroundColor="rgba(255, 255, 255, 0.08)"
          transform={[{ rotate: '30deg' }]}
        />
      </YStack>

      {/* 头像区域 - 悬浮在背景上 */}
      <YStack position="absolute" top={70} alignItems="center" zIndex={10}>
        <TouchableOpacity onPress={onPressAvatar} activeOpacity={0.85}>
          <YStack position="relative" alignItems="center">
            {/* 头像 - 完全占满无空隙 */}
            <Avatar circular size={128} borderWidth={0} elevation={0}>
              {uploading ? (
                <Avatar.Fallback
                  backgroundColor="$gray3"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Spinner size="large" color="$red9" />
                </Avatar.Fallback>
              ) : avatarSrc ? (
                <Avatar.Image src={avatarSrc} />
              ) : (
                <Avatar.Fallback
                  backgroundColor="#FEBE98"
                  justifyContent="center"
                  alignItems="center"
                >
                  <IconSymbol name="person.fill" size={50} color="white" />
                </Avatar.Fallback>
              )}
            </Avatar>

            {/* 相机按钮 */}
            {!uploading && (
              <YStack
                position="absolute"
                bottom={4}
                right={4}
                width={36}
                height={36}
                borderRadius="$8"
                backgroundColor="#FEBE98"
                alignItems="center"
                justifyContent="center"
                borderWidth={2}
                borderColor="white"
              >
                <IconSymbol name="camera.fill" size={16} color="white" />
              </YStack>
            )}
          </YStack>
        </TouchableOpacity>
      </YStack>

      {/* 用户信息区域 - 在头像下方留出空间 */}
      <YStack width="100%" alignItems="center" gap="$2.5" paddingTop={40} paddingBottom="$1">
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
          fontSize={12}
          color={colors.icon}
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
