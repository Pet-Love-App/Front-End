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
import { primaryScale, neutralScale, errorScale } from '@/src/design-system/tokens';

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
      {/* 顶部渐变背景 */}
      <YStack width="100%" height={160} position="relative" overflow="hidden">
        <LinearGradient
          colors={[primaryScale.primary7, primaryScale.primary6, primaryScale.primary5]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
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

      {/* 头像区域 */}
      <YStack position="absolute" top={70} alignItems="center" zIndex={10}>
        <TouchableOpacity testID="user-avatar" onPress={onPressAvatar} activeOpacity={0.85}>
          <YStack position="relative" alignItems="center">
            <Avatar circular size={128} borderWidth={0} elevation={0}>
              {uploading ? (
                <Avatar.Fallback
                  backgroundColor={neutralScale.neutral2}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Spinner size="large" color={errorScale.error8} />
                </Avatar.Fallback>
              ) : avatarSrc ? (
                <Avatar.Image src={avatarSrc} />
              ) : (
                <Avatar.Fallback
                  backgroundColor={primaryScale.primary7}
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
                backgroundColor={primaryScale.primary7}
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

      {/* 用户信息 */}
      <YStack width="100%" alignItems="center" gap="$2.5" paddingTop={40} paddingBottom="$1">
        {/* 用户名和勋章 */}
        <YStack alignItems="center" gap="$1.5">
          <View testID="user-username">
            <Text
              fontSize={24}
              fontWeight="700"
              color={neutralScale.neutral12}
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
          color={neutralScale.neutral8}
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
