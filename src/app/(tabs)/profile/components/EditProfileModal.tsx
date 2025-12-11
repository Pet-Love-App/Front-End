/**
 * EditProfileModal - 编辑个人资料弹窗
 *
 * 功能：
 * - 修改用户名
 * - 修改密码
 * - 表单验证
 * - 实时错误提示
 */
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Dialog, Text, XStack, YStack } from 'tamagui';
import { Button, Input } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import {
  errorScale,
  neutralScale,
  primaryScale,
  successScale,
} from '@/src/design-system/tokens/colors';
import { supabaseAuthService, supabaseProfileService } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import {
  changePasswordSchema,
  updateUsernameSchema,
  type ChangePasswordInput,
} from '@/src/schemas/user.schema';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EditMode = 'username' | 'password' | null;

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user, fetchCurrentUser } = useUserStore();

  // 编辑模式状态
  const [editMode, setEditMode] = useState<EditMode>(null);

  // 用户名相关状态
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // 密码相关状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (open) {
      setEditMode(null);
      setUsername(user?.username || '');
      setUsernameError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowPasswords(false);
    }
  }, [open, user?.username]);

  const handleClose = () => onOpenChange(false);

  const validateUsername = (value: string): boolean => {
    try {
      const trimmed = value.trim();
      updateUsernameSchema.parse({ username: trimmed });
      if (trimmed === user?.username) {
        setUsernameError('用户名没有变化');
        return false;
      }
      setUsernameError('');
      return true;
    } catch (error: any) {
      setUsernameError(error.errors?.[0]?.message || '用户名格式不正确');
      return false;
    }
  };

  const handleUpdateUsername = async () => {
    const trimmedUsername = username.trim();
    if (!validateUsername(trimmedUsername)) return;

    try {
      setIsUpdatingUsername(true);
      const { error } = await supabaseProfileService.updateProfile({ username: trimmedUsername });
      if (error) throw new Error(error.message);
      await fetchCurrentUser();
      Alert.alert('成功', '用户名已更新');
      setEditMode(null);
    } catch (error: any) {
      setUsernameError(error.message || '用户名可能已被占用');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const validatePassword = (): boolean => {
    try {
      if (newPassword !== confirmPassword) {
        setPasswordError('两次输入的密码不一致');
        return false;
      }
      const passwordData: ChangePasswordInput = {
        current_password: currentPassword,
        new_password: newPassword,
        re_new_password: confirmPassword,
      };
      changePasswordSchema.parse(passwordData);
      setPasswordError('');
      return true;
    } catch (error: any) {
      setPasswordError(error.errors?.[0]?.message || '密码格式不正确');
      return false;
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setIsChangingPassword(true);
      const { error } = await supabaseAuthService.updatePassword({ newPassword });
      if (error) throw new Error(error.message);
      Alert.alert('成功', '密码已修改，请使用新密码重新登录', [
        {
          text: '确定',
          onPress: () => {
            handleClose();
            useUserStore.getState().logout();
          },
        },
      ]);
    } catch (error: any) {
      setPasswordError(error.message || '无法修改密码');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const canUpdateUsername = username.trim() && username.trim() !== user?.username && !usernameError;
  const canChangePassword = currentPassword && newPassword && confirmPassword && !passwordError;

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="black"
        />
        <Dialog.Content
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={['quick', { opacity: { overshootClamping: true } }]}
          enterStyle={{ y: -20, opacity: 0, scale: 0.95 }}
          exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor="white"
          borderRadius={24}
          padding="$5"
          width="90%"
          maxWidth={420}
          maxHeight="85%"
        >
          {/* 头部 */}
          <YStack alignItems="center" gap="$2" marginBottom="$4">
            <YStack
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor={primaryScale.primary2}
              alignItems="center"
              justifyContent="center"
            >
              <IconSymbol name="person.circle.fill" size={32} color={primaryScale.primary8} />
            </YStack>
            <Text fontSize={22} fontWeight="700" color={neutralScale.neutral12}>
              编辑个人资料
            </Text>
            <Text fontSize={14} color={neutralScale.neutral9} textAlign="center">
              修改用户名或密码
            </Text>
          </YStack>

          {/* 内容区域 */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack gap="$4">
              {/* 用户名卡片 */}
              <YStack
                backgroundColor={
                  editMode === 'username' ? primaryScale.primary1 : neutralScale.neutral1
                }
                borderRadius={16}
                borderWidth={2}
                borderColor={
                  editMode === 'username' ? primaryScale.primary4 : neutralScale.neutral3
                }
                padding="$4"
                gap="$3"
              >
                <TouchableOpacity
                  onPress={() => setEditMode(editMode === 'username' ? null : 'username')}
                  activeOpacity={0.7}
                >
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$3">
                      <YStack
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor={primaryScale.primary3}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="at" size={20} color={primaryScale.primary9} />
                      </YStack>
                      <YStack>
                        <Text fontSize={16} fontWeight="700" color={neutralScale.neutral12}>
                          用户名
                        </Text>
                        <Text fontSize={13} color={neutralScale.neutral9}>
                          {user?.username || '未设置'}
                        </Text>
                      </YStack>
                    </XStack>
                    <IconSymbol
                      name={editMode === 'username' ? 'chevron.up' : 'chevron.down'}
                      size={20}
                      color={neutralScale.neutral9}
                    />
                  </XStack>
                </TouchableOpacity>

                {editMode === 'username' && (
                  <YStack gap="$3" marginTop="$2">
                    <YStack gap="$2">
                      <Text fontSize={13} color={neutralScale.neutral10} fontWeight="600">
                        新用户名
                      </Text>
                      <TextInput
                        placeholder="输入新用户名"
                        placeholderTextColor={neutralScale.neutral6}
                        value={username}
                        onChangeText={(text) => {
                          setUsername(text);
                          if (text.trim()) validateUsername(text);
                        }}
                        onBlur={() => username.trim() && validateUsername(username)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[styles.input, usernameError && styles.inputError]}
                      />
                      {usernameError && (
                        <XStack alignItems="center" gap="$1.5">
                          <IconSymbol
                            name="exclamationmark.circle.fill"
                            size={14}
                            color={errorScale.error9}
                          />
                          <Text fontSize={12} color={errorScale.error9} fontWeight="500">
                            {usernameError}
                          </Text>
                        </XStack>
                      )}
                    </YStack>

                    <XStack gap="$2">
                      <Button
                        flex={1}
                        size="md"
                        variant="outline"
                        onPress={() => {
                          setEditMode(null);
                          setUsername(user?.username || '');
                          setUsernameError('');
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        flex={1}
                        size="md"
                        variant="primary"
                        onPress={handleUpdateUsername}
                        disabled={!canUpdateUsername || isUpdatingUsername}
                        loading={isUpdatingUsername}
                      >
                        {isUpdatingUsername ? '更新中' : '确认更新'}
                      </Button>
                    </XStack>
                  </YStack>
                )}
              </YStack>

              {/* 密码卡片 */}
              <YStack
                backgroundColor={
                  editMode === 'password' ? errorScale.error1 : neutralScale.neutral1
                }
                borderRadius={16}
                borderWidth={2}
                borderColor={editMode === 'password' ? errorScale.error4 : neutralScale.neutral3}
                padding="$4"
                gap="$3"
              >
                <TouchableOpacity
                  onPress={() => setEditMode(editMode === 'password' ? null : 'password')}
                  activeOpacity={0.7}
                >
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$3">
                      <YStack
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor={errorScale.error3}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="lock.fill" size={20} color={errorScale.error9} />
                      </YStack>
                      <YStack>
                        <Text fontSize={16} fontWeight="700" color={neutralScale.neutral12}>
                          密码
                        </Text>
                        <Text fontSize={13} color={neutralScale.neutral9}>
                          ••••••••
                        </Text>
                      </YStack>
                    </XStack>
                    <IconSymbol
                      name={editMode === 'password' ? 'chevron.up' : 'chevron.down'}
                      size={20}
                      color={neutralScale.neutral9}
                    />
                  </XStack>
                </TouchableOpacity>

                {editMode === 'password' && (
                  <YStack gap="$3" marginTop="$2">
                    <YStack gap="$2">
                      <Text fontSize={13} color={neutralScale.neutral10} fontWeight="600">
                        当前密码 <Text color={errorScale.error9}>*</Text>
                      </Text>
                      <YStack position="relative">
                        <TextInput
                          placeholder="输入当前密码"
                          placeholderTextColor={neutralScale.neutral6}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          secureTextEntry={!showPasswords}
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={styles.input}
                        />
                        <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() => setShowPasswords(!showPasswords)}
                          activeOpacity={0.7}
                        >
                          <IconSymbol
                            name={showPasswords ? 'eye.slash.fill' : 'eye.fill'}
                            size={18}
                            color={neutralScale.neutral7}
                          />
                        </TouchableOpacity>
                      </YStack>
                    </YStack>

                    <YStack gap="$2">
                      <Text fontSize={13} color={neutralScale.neutral10} fontWeight="600">
                        新密码 <Text color={errorScale.error9}>*</Text>
                      </Text>
                      <TextInput
                        placeholder="至少6位字符"
                        placeholderTextColor={neutralScale.neutral6}
                        value={newPassword}
                        onChangeText={(text) => {
                          setNewPassword(text);
                          if (passwordError) setPasswordError('');
                        }}
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[styles.input, passwordError && styles.inputError]}
                      />
                    </YStack>

                    <YStack gap="$2">
                      <Text fontSize={13} color={neutralScale.neutral10} fontWeight="600">
                        确认新密码 <Text color={errorScale.error9}>*</Text>
                      </Text>
                      <TextInput
                        placeholder="再次输入新密码"
                        placeholderTextColor={neutralScale.neutral6}
                        value={confirmPassword}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          if (passwordError) setPasswordError('');
                        }}
                        onBlur={() => newPassword && confirmPassword && validatePassword()}
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[styles.input, passwordError && styles.inputError]}
                      />
                      {passwordError && (
                        <XStack alignItems="center" gap="$1.5">
                          <IconSymbol
                            name="exclamationmark.circle.fill"
                            size={14}
                            color={errorScale.error9}
                          />
                          <Text fontSize={12} color={errorScale.error9} fontWeight="500">
                            {passwordError}
                          </Text>
                        </XStack>
                      )}
                    </YStack>

                    <YStack
                      backgroundColor={errorScale.error2}
                      padding="$3"
                      borderRadius={10}
                      gap="$1.5"
                    >
                      <XStack alignItems="center" gap="$2">
                        <IconSymbol name="info.circle.fill" size={16} color={errorScale.error9} />
                        <Text fontSize={12} fontWeight="600" color={errorScale.error10}>
                          重要提示
                        </Text>
                      </XStack>
                      <Text fontSize={12} color={neutralScale.neutral10} lineHeight={16}>
                        修改密码后需要重新登录
                      </Text>
                    </YStack>

                    <XStack gap="$2">
                      <Button
                        flex={1}
                        size="md"
                        variant="outline"
                        onPress={() => {
                          setEditMode(null);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          setShowPasswords(false);
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        flex={1}
                        size="md"
                        variant="danger"
                        onPress={handleChangePassword}
                        disabled={!canChangePassword || isChangingPassword}
                        loading={isChangingPassword}
                      >
                        {isChangingPassword ? '修改中' : '确认修改'}
                      </Button>
                    </XStack>
                  </YStack>
                )}
              </YStack>
            </YStack>
          </ScrollView>

          {/* 底部关闭按钮 */}
          <Dialog.Close displayWhenAdapted asChild>
            <Button marginTop="$4" size="lg" variant="ghost" onPress={handleClose}>
              关闭
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 450,
  },
  input: {
    height: 46,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: neutralScale.neutral4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 15,
    fontWeight: '500',
    color: neutralScale.neutral12,
  },
  inputError: {
    borderColor: errorScale.error7,
    backgroundColor: errorScale.error1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
  },
});
