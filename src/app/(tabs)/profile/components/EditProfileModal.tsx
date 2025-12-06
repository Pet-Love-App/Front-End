/**
 * 用户资料编辑模态框
 * 支持修改用户名和密码
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { supabaseAuthService, supabaseProfileService } from '@/src/lib/supabase';
import {
  changePasswordSchema,
  updateUsernameSchema,
  type ChangePasswordInput,
} from '@/src/schemas/user.schema';
import { useUserStore } from '@/src/store/userStore';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Button, Dialog, Separator, Text, XStack, YStack } from 'tamagui';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { user, fetchCurrentUser } = useUserStore();

  // 用户名编辑
  const [username, setUsername] = useState(user?.username || '');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // 密码修改
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const dialogWidth = Math.min(screenWidth - 48, 500);

  // 重置表单
  const resetForm = () => {
    setUsername(user?.username || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords(false);
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // 更新用户名
  const handleUpdateUsername = async () => {
    try {
      // 验证用户名
      updateUsernameSchema.parse({ username: username.trim() });

      if (username.trim() === user?.username) {
        Alert.alert('提示', '用户名没有变化');
        return;
      }

      setIsUpdatingUsername(true);
      const { error } = await supabaseProfileService.updateProfile({
        username: username.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      await fetchCurrentUser();
      Alert.alert('✅ 成功', '用户名已更新');
      handleClose();
    } catch (error: any) {
      console.error('更新用户名失败:', error);
      if (error.errors) {
        Alert.alert('❌ 验证失败', error.errors[0]?.message || '用户名格式不正确');
      } else {
        Alert.alert('❌ 更新失败', error.message || '无法更新用户名，用户名可能已被占用');
      }
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    try {
      // 验证两次输入的密码是否一致
      if (newPassword !== confirmPassword) {
        Alert.alert('❌ 验证失败', '两次输入的新密码不一致');
        return;
      }

      // 构建请求数据
      const passwordData: ChangePasswordInput = {
        current_password: currentPassword,
        new_password: newPassword,
        re_new_password: confirmPassword,
      };

      // 验证数据格式
      changePasswordSchema.parse(passwordData);

      setIsChangingPassword(true);

      // 注意：Supabase 修改密码不需要验证当前密码（用户已登录）
      const { error } = await supabaseAuthService.updatePassword({
        newPassword: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert('✅ 成功', '密码已修改，请使用新密码重新登录', [
        {
          text: '确定',
          onPress: () => {
            handleClose();
            // 可以选择退出登录
            useUserStore.getState().logout();
          },
        },
      ]);
    } catch (error: any) {
      console.error('修改密码失败:', error);
      if (error.errors) {
        Alert.alert('❌ 验证失败', error.errors[0]?.message || '密码格式不正确');
      } else {
        Alert.alert('❌ 修改失败', error.message || '无法修改密码');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          style={{ pointerEvents: 'auto' }}
        />

        <Dialog.Content
          bordered
          key="content"
          animateOnly={['transform', 'opacity']}
          animation="quick"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          padding="$0"
          backgroundColor={colors.background}
          width={dialogWidth}
          maxHeight="85%"
        >
          {/* Header */}
          <YStack
            paddingHorizontal="$4"
            paddingTop="$4"
            paddingBottom="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Dialog.Title fontSize={20} fontWeight="700" color={colors.text}>
              编辑个人资料
            </Dialog.Title>
            <Text fontSize="$3" color="$gray10" marginTop="$1">
              修改用户名或密码
            </Text>
          </YStack>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: 500 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >
            <YStack padding="$4" gap="$5">
              {/* 用户名部分 */}
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <IconSymbol name="person.fill" size={18} color={colors.tint} />
                  <Text fontSize="$5" fontWeight="600" color={colors.text}>
                    修改用户名
                  </Text>
                </XStack>

                <YStack gap="$2">
                  <Text fontSize="$3" color={colors.icon}>
                    当前用户名：{user?.username}
                  </Text>
                  <TextInput
                    placeholder="输入新用户名"
                    placeholderTextColor={colors.icon}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.icon,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                  <Button
                    size="$3"
                    backgroundColor="$blue9"
                    color="white"
                    onPress={handleUpdateUsername}
                    disabled={isUpdatingUsername || !username.trim()}
                    opacity={isUpdatingUsername || !username.trim() ? 0.5 : 1}
                    icon={<IconSymbol name="checkmark.circle.fill" size={18} color="white" />}
                  >
                    {isUpdatingUsername ? '更新中...' : '更新用户名'}
                  </Button>
                </YStack>
              </YStack>

              <Separator borderColor={colors.icon + '20'} />

              {/* 密码修改部分 */}
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <IconSymbol name="lock.fill" size={18} color={colors.tint} />
                  <Text fontSize="$5" fontWeight="600" color={colors.text}>
                    修改密码
                  </Text>
                </XStack>

                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="500" color={colors.text}>
                    当前密码 <Text color="$red10">*</Text>
                  </Text>
                  <TextInput
                    placeholder="输入当前密码"
                    placeholderTextColor={colors.icon}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showPasswords}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.icon,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                </YStack>

                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="500" color={colors.text}>
                    新密码 <Text color="$red10">*</Text>
                  </Text>
                  <TextInput
                    placeholder="输入新密码（至少6位）"
                    placeholderTextColor={colors.icon}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPasswords}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.icon,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                </YStack>

                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="500" color={colors.text}>
                    确认新密码 <Text color="$red10">*</Text>
                  </Text>
                  <TextInput
                    placeholder="再次输入新密码"
                    placeholderTextColor={colors.icon}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPasswords}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.icon,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                </YStack>

                <Button
                  size="$3"
                  variant="outlined"
                  onPress={() => setShowPasswords(!showPasswords)}
                  borderColor={colors.icon}
                  color={colors.text}
                  icon={
                    <IconSymbol
                      name={showPasswords ? 'eye.slash.fill' : 'eye.fill'}
                      size={18}
                      color={colors.icon}
                    />
                  }
                >
                  {showPasswords ? '隐藏密码' : '显示密码'}
                </Button>

                <Button
                  size="$3"
                  backgroundColor="$red9"
                  color="white"
                  onPress={handleChangePassword}
                  disabled={
                    isChangingPassword || !currentPassword || !newPassword || !confirmPassword
                  }
                  opacity={
                    isChangingPassword || !currentPassword || !newPassword || !confirmPassword
                      ? 0.5
                      : 1
                  }
                  icon={<IconSymbol name="key.fill" size={18} color="white" />}
                  marginTop="$2"
                >
                  {isChangingPassword ? '修改中...' : '修改密码'}
                </Button>
              </YStack>
            </YStack>
          </ScrollView>

          {/* Footer */}
          <XStack
            gap="$3"
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            backgroundColor={colors.background}
          >
            <Dialog.Close displayWhenAdapted asChild flex={1}>
              <Button
                size="$4"
                variant="outlined"
                onPress={handleClose}
                borderColor={colors.icon}
                color={colors.text}
              >
                关闭
              </Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
