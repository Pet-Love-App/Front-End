/**
 * EditProfileModal - 编辑个人资料弹窗
 *
 * 功能：
 * - 修改用户名
 * - 修改个人简介
 * - 修改密码
 * - 表单验证
 * - 实时错误提示
 */
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { showAlert, toast } from '@/src/components/dialogs';
import { Dialog, Text, XStack, YStack } from 'tamagui';
import { Button, Input } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
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

type EditMode = 'username' | 'bio' | 'password' | null;

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user, fetchCurrentUser } = useUserStore();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // 编辑模式状态
  const [editMode, setEditMode] = useState<EditMode>(null);

  // 样式定义
  const dynamicStyles = React.useMemo(() => {
    return {
      scrollView: {
        maxHeight: 450,
      },
      input: {
        height: 46,
        borderWidth: 1.5,
        borderRadius: 12,
        borderColor: colors.border as any,
        backgroundColor: colors.inputBackground as any,
        paddingHorizontal: 16,
        paddingRight: 48,
        fontSize: 15,
        fontWeight: '500' as const,
        color: colors.text as any,
      },
      textArea: {
        minHeight: 100,
        borderWidth: 1.5,
        borderRadius: 12,
        borderColor: colors.border as any,
        backgroundColor: colors.inputBackground as any,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        fontWeight: '500' as const,
        color: colors.text as any,
      },
      inputError: {
        borderColor: colors.error,
        backgroundColor: colors.errorMuted,
      },
      eyeIcon: {
        position: 'absolute' as const,
        right: 14,
        top: 14,
        padding: 4,
      },
    };
  }, [colors]);

  // 用户名相关状态
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // 个人简介相关状态
  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState('');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);

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
      setBio(user?.bio || '');
      setBioError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowPasswords(false);
    }
  }, [open, user?.username, user?.bio]);

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
      toast.success('用户名已更新');
      setEditMode(null);
    } catch (error: any) {
      setUsernameError(error.message || '用户名可能已被占用');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const validateBio = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length > 200) {
      setBioError('个人简介不能超过200个字符');
      return false;
    }
    if (trimmed === user?.bio) {
      setBioError('个人简介没有变化');
      return false;
    }
    setBioError('');
    return true;
  };

  const handleUpdateBio = async () => {
    const trimmedBio = bio.trim();
    if (!validateBio(trimmedBio)) return;

    try {
      setIsUpdatingBio(true);
      const { error } = await supabaseProfileService.updateProfile({
        bio: trimmedBio || undefined,
      });
      if (error) throw new Error(error.message);
      await fetchCurrentUser();
      toast.success('个人简介已更新');
      setEditMode(null);
    } catch (error: any) {
      setBioError(error.message || '更新失败，请重试');
    } finally {
      setIsUpdatingBio(false);
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
      showAlert({
        title: '成功',
        message: '密码已修改，请使用新密码重新登录',
        type: 'success',
        buttons: [
          {
            text: '确定',
            onPress: () => {
              handleClose();
              useUserStore.getState().logout();
            },
          },
        ],
      });
    } catch (error: any) {
      setPasswordError(error.message || '无法修改密码');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const canUpdateUsername = username.trim() && username.trim() !== user?.username && !usernameError;
  const canUpdateBio = bio.trim() !== (user?.bio || '') && !bioError;
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
          backgroundColor={colors.overlay as any}
        />
        <Dialog.Content
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={['quick', { opacity: { overshootClamping: true } }]}
          enterStyle={{ y: -20, opacity: 0, scale: 0.95 }}
          exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor={colors.cardBackground as any}
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
              backgroundColor={(isDark ? '#3D2A1F' : colors.primaryLight) as any}
              alignItems="center"
              justifyContent="center"
            >
              <IconSymbol name="person.circle.fill" size={32} color={colors.primary} />
            </YStack>
            <Text fontSize={22} fontWeight="700" color={colors.text as any}>
              编辑个人资料
            </Text>
            <Text fontSize={14} color={colors.textSecondary as any} textAlign="center">
              修改用户名、个人简介或密码
            </Text>
          </YStack>

          {/* 内容区域 */}
          <ScrollView
            style={dynamicStyles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack gap="$4">
              {/* 用户名卡片 */}
              <YStack
                backgroundColor={
                  (editMode === 'username' ? colors.selected : colors.backgroundSubtle) as any
                }
                borderRadius={16}
                borderWidth={2}
                borderColor={
                  (editMode === 'username' ? colors.primaryLight : colors.borderMuted) as any
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
                        backgroundColor={(isDark ? '#3D2A1F' : colors.primaryLight) as any}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="at" size={20} color={colors.primary} />
                      </YStack>
                      <YStack>
                        <Text fontSize={16} fontWeight="700" color={colors.text as any}>
                          用户名
                        </Text>
                        <Text fontSize={13} color={colors.textSecondary as any}>
                          {user?.username || '未设置'}
                        </Text>
                      </YStack>
                    </XStack>
                    <IconSymbol
                      name={editMode === 'username' ? 'chevron.up' : 'chevron.down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </XStack>
                </TouchableOpacity>

                {editMode === 'username' && (
                  <YStack gap="$3" marginTop="$2">
                    <YStack gap="$2">
                      <Text fontSize={13} color={colors.textSecondary as any} fontWeight="600">
                        新用户名
                      </Text>
                      <TextInput
                        placeholder="输入新用户名"
                        placeholderTextColor={colors.textMuted}
                        value={username}
                        onChangeText={(text) => {
                          setUsername(text);
                          if (text.trim()) validateUsername(text);
                        }}
                        onBlur={() => username.trim() && validateUsername(username)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[dynamicStyles.input, usernameError && dynamicStyles.inputError]}
                      />
                      {usernameError && (
                        <XStack alignItems="center" gap="$1.5">
                          <IconSymbol
                            name="exclamationmark.circle.fill"
                            size={14}
                            color={colors.error}
                          />
                          <Text fontSize={12} color={colors.error as any} fontWeight="500">
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

              {/* 个人简介卡片 */}
              <YStack
                backgroundColor={
                  (editMode === 'bio' ? colors.successMuted : colors.backgroundSubtle) as any
                }
                borderRadius={16}
                borderWidth={2}
                borderColor={(editMode === 'bio' ? colors.success : colors.borderMuted) as any}
                padding="$4"
                gap="$3"
              >
                <TouchableOpacity
                  onPress={() => setEditMode(editMode === 'bio' ? null : 'bio')}
                  activeOpacity={0.7}
                >
                  <XStack alignItems="center" justifyContent="space-between" flex={1}>
                    <XStack alignItems="center" gap="$3" flex={1}>
                      <YStack
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor={(isDark ? '#0D2818' : colors.successMuted) as any}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="text.alignleft" size={20} color={colors.success} />
                      </YStack>
                      <YStack flex={1} minWidth={0}>
                        <Text fontSize={16} fontWeight="700" color={colors.text as any}>
                          个人简介
                        </Text>
                        <Text
                          fontSize={13}
                          color={colors.textSecondary as any}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {user?.bio || '未填写'}
                        </Text>
                      </YStack>
                    </XStack>
                    <YStack flexShrink={0}>
                      <IconSymbol
                        name={editMode === 'bio' ? 'chevron.up' : 'chevron.down'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </YStack>
                  </XStack>
                </TouchableOpacity>

                {editMode === 'bio' && (
                  <YStack gap="$3" marginTop="$2">
                    <YStack gap="$2">
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={13} color={colors.textSecondary as any} fontWeight="600">
                          个人简介
                        </Text>
                        <Text fontSize={12} color={colors.textTertiary as any}>
                          {bio.length}/200
                        </Text>
                      </XStack>
                      <TextInput
                        placeholder="介绍一下你自己吧..."
                        placeholderTextColor={colors.textMuted}
                        value={bio}
                        onChangeText={(text) => {
                          setBio(text);
                          if (bioError) setBioError('');
                        }}
                        onBlur={() => bio.trim() && validateBio(bio)}
                        multiline
                        numberOfLines={4}
                        maxLength={200}
                        textAlignVertical="top"
                        style={[dynamicStyles.textArea, bioError && dynamicStyles.inputError]}
                      />
                      {bioError && (
                        <XStack alignItems="center" gap="$1.5">
                          <IconSymbol
                            name="exclamationmark.circle.fill"
                            size={14}
                            color={colors.error}
                          />
                          <Text fontSize={12} color={colors.error as any} fontWeight="500">
                            {bioError}
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
                          setBio(user?.bio || '');
                          setBioError('');
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        flex={1}
                        size="md"
                        variant="primary"
                        onPress={handleUpdateBio}
                        disabled={!canUpdateBio || isUpdatingBio}
                        loading={isUpdatingBio}
                      >
                        {isUpdatingBio ? '更新中' : '确认更新'}
                      </Button>
                    </XStack>
                  </YStack>
                )}
              </YStack>

              {/* 密码卡片 */}
              <YStack
                backgroundColor={
                  (editMode === 'password' ? colors.errorMuted : colors.backgroundSubtle) as any
                }
                borderRadius={16}
                borderWidth={2}
                borderColor={(editMode === 'password' ? colors.error : colors.borderMuted) as any}
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
                        backgroundColor={(isDark ? '#2D0F0F' : colors.errorMuted) as any}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="lock.fill" size={20} color={colors.error} />
                      </YStack>
                      <YStack>
                        <Text fontSize={16} fontWeight="700" color={colors.text as any}>
                          密码
                        </Text>
                        <Text fontSize={13} color={colors.textSecondary as any}>
                          ••••••••
                        </Text>
                      </YStack>
                    </XStack>
                    <IconSymbol
                      name={editMode === 'password' ? 'chevron.up' : 'chevron.down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </XStack>
                </TouchableOpacity>

                {editMode === 'password' && (
                  <YStack gap="$3" marginTop="$2">
                    <YStack gap="$2">
                      <XStack gap="$1">
                        <Text fontSize={13} color={colors.textSecondary as any} fontWeight="600">
                          当前密码
                        </Text>
                        <Text color={colors.error as any}>*</Text>
                      </XStack>
                      <YStack position="relative">
                        <TextInput
                          placeholder="输入当前密码"
                          placeholderTextColor={colors.textMuted}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          secureTextEntry={!showPasswords}
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={dynamicStyles.input}
                        />
                        <TouchableOpacity
                          style={dynamicStyles.eyeIcon}
                          onPress={() => setShowPasswords(!showPasswords)}
                          activeOpacity={0.7}
                        >
                          <IconSymbol
                            name={showPasswords ? 'eye.slash.fill' : 'eye.fill'}
                            size={18}
                            color={colors.textTertiary}
                          />
                        </TouchableOpacity>
                      </YStack>
                    </YStack>

                    <YStack gap="$2">
                      <XStack gap="$1">
                        <Text fontSize={13} color={colors.textSecondary as any} fontWeight="600">
                          新密码
                        </Text>
                        <Text color={colors.error as any}>*</Text>
                      </XStack>
                      <TextInput
                        placeholder="至少6位字符"
                        placeholderTextColor={colors.textMuted}
                        value={newPassword}
                        onChangeText={(text) => {
                          setNewPassword(text);
                          if (passwordError) setPasswordError('');
                        }}
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[dynamicStyles.input, passwordError && dynamicStyles.inputError]}
                      />
                    </YStack>

                    <YStack gap="$2">
                      <XStack gap="$1">
                        <Text fontSize={13} color={colors.textSecondary as any} fontWeight="600">
                          确认新密码
                        </Text>
                        <Text color={colors.error as any}>*</Text>
                      </XStack>
                      <TextInput
                        placeholder="再次输入新密码"
                        placeholderTextColor={colors.textMuted}
                        value={confirmPassword}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          if (passwordError) setPasswordError('');
                        }}
                        onBlur={() => newPassword && confirmPassword && validatePassword()}
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[dynamicStyles.input, passwordError && dynamicStyles.inputError]}
                      />
                      {passwordError && (
                        <XStack alignItems="center" gap="$1.5">
                          <IconSymbol
                            name="exclamationmark.circle.fill"
                            size={14}
                            color={colors.error}
                          />
                          <Text fontSize={12} color={colors.error as any} fontWeight="500">
                            {passwordError}
                          </Text>
                        </XStack>
                      )}
                    </YStack>

                    <YStack
                      backgroundColor={colors.errorMuted as any}
                      padding="$3"
                      borderRadius={10}
                      gap="$1.5"
                    >
                      <XStack alignItems="center" gap="$2">
                        <IconSymbol name="info.circle.fill" size={16} color={colors.error} />
                        <Text fontSize={12} fontWeight="600" color={colors.error as any}>
                          重要提示
                        </Text>
                      </XStack>
                      <Text fontSize={12} color={colors.textSecondary as any} lineHeight={16}>
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
            <Button
              marginTop="$4"
              size="lg"
              variant="ghost"
              color={colors.textSecondary as any}
              onPress={handleClose}
            >
              关闭
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
