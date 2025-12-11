/**
 * EditProfileModal - �༭�������ϵ���
 *
 * ���е�����ʽ���ο� ThemeSelectorModal ʵ��
 * ֧���޸��û��������빦��
 */
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Dialog, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { errorScale, neutralScale, primaryScale } from '@/src/design-system/tokens/colors';
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

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user, fetchCurrentUser } = useUserStore();

  const [username, setUsername] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(user?.username || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswords(false);
    }
  }, [open, user?.username]);

  const handleClose = () => onOpenChange(false);

  const handleUpdateUsername = async () => {
    try {
      const trimmedUsername = username.trim();
      updateUsernameSchema.parse({ username: trimmedUsername });
      if (trimmedUsername === user?.username) {
        Alert.alert('��ʾ', '�û���û�б仯');
        return;
      }
      setIsUpdatingUsername(true);
      const { error } = await supabaseProfileService.updateProfile({ username: trimmedUsername });
      if (error) throw new Error(error.message);
      await fetchCurrentUser();
      Alert.alert('�ɹ�', '�û����Ѹ���');
      handleClose();
    } catch (error: any) {
      Alert.alert('����ʧ��', error.errors?.[0]?.message || error.message || '�û��������ѱ�ռ��');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        Alert.alert('��֤ʧ��', '��������������벻һ��');
        return;
      }
      const passwordData: ChangePasswordInput = {
        current_password: currentPassword,
        new_password: newPassword,
        re_new_password: confirmPassword,
      };
      changePasswordSchema.parse(passwordData);
      setIsChangingPassword(true);
      const { error } = await supabaseAuthService.updatePassword({ newPassword });
      if (error) throw new Error(error.message);
      Alert.alert('�ɹ�', '�������޸ģ���ʹ�����������µ�¼', [
        {
          text: 'ȷ��',
          onPress: () => {
            handleClose();
            useUserStore.getState().logout();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('�޸�ʧ��', error.errors?.[0]?.message || error.message || '�޷��޸�����');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const canUpdateUsername = username.trim() && username.trim() !== user?.username;
  const canChangePassword = currentPassword && newPassword && confirmPassword;

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
          <YStack alignItems="center" gap="$2" marginBottom="$4">
            <YStack
              width={56}
              height={56}
              borderRadius={28}
              backgroundColor={primaryScale.primary2}
              alignItems="center"
              justifyContent="center"
            >
              <IconSymbol name="person.fill" size={28} color={primaryScale.primary7} />
            </YStack>
            <Text fontSize={20} fontWeight="700" color={neutralScale.neutral12}>
              �༭��������
            </Text>
            <Text fontSize={13} color={neutralScale.neutral8}>
              �޸��û���������
            </Text>
          </YStack>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack gap="$3" marginBottom="$5">
              <XStack alignItems="center" gap="$2">
                <YStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  backgroundColor={primaryScale.primary2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="at" size={14} color={primaryScale.primary7} />
                </YStack>
                <Text fontSize={15} fontWeight="600" color={neutralScale.neutral11}>
                  �޸��û���
                </Text>
              </XStack>

              <YStack gap="$1.5">
                <Text fontSize={12} color={neutralScale.neutral7} fontWeight="500">
                  ��ǰ�û���
                </Text>
                <YStack
                  backgroundColor={neutralScale.neutral2}
                  paddingHorizontal="$3"
                  paddingVertical="$2.5"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor={neutralScale.neutral4}
                >
                  <Text fontSize={14} color={neutralScale.neutral10} fontWeight="500">
                    {user?.username || 'δ����'}
                  </Text>
                </YStack>
              </YStack>

              <YStack gap="$1.5">
                <Text fontSize={12} color={neutralScale.neutral7} fontWeight="500">
                  ���û���
                </Text>
                <TextInput
                  placeholder="�������û���"
                  placeholderTextColor={neutralScale.neutral6}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </YStack>

              <Button
                height={44}
                backgroundColor={primaryScale.primary7}
                borderRadius={12}
                pressStyle={{ backgroundColor: primaryScale.primary8, scale: 0.98 }}
                onPress={handleUpdateUsername}
                disabled={!canUpdateUsername || isUpdatingUsername}
                opacity={!canUpdateUsername || isUpdatingUsername ? 0.5 : 1}
                icon={<IconSymbol name="checkmark.circle.fill" size={18} color="white" />}
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  {isUpdatingUsername ? '������...' : '�����û���'}
                </Text>
              </Button>
            </YStack>

            <YStack height={1} backgroundColor={neutralScale.neutral3} marginVertical="$3" />

            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <YStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  backgroundColor={errorScale.error2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="lock.fill" size={14} color={errorScale.error9} />
                </YStack>
                <Text fontSize={15} fontWeight="600" color={neutralScale.neutral11}>
                  �޸�����
                </Text>
              </XStack>

              <YStack gap="$1.5">
                <Text fontSize={12} color={neutralScale.neutral7} fontWeight="500">
                  ��ǰ���� <Text color={errorScale.error9}>*</Text>
                </Text>
                <TextInput
                  placeholder="���뵱ǰ����"
                  placeholderTextColor={neutralScale.neutral6}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPasswords}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </YStack>

              <YStack gap="$1.5">
                <Text fontSize={12} color={neutralScale.neutral7} fontWeight="500">
                  ������ <Text color={errorScale.error9}>*</Text>
                </Text>
                <TextInput
                  placeholder="���������루����6λ��"
                  placeholderTextColor={neutralScale.neutral6}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPasswords}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </YStack>

              <YStack gap="$1.5">
                <Text fontSize={12} color={neutralScale.neutral7} fontWeight="500">
                  ȷ�������� <Text color={errorScale.error9}>*</Text>
                </Text>
                <TextInput
                  placeholder="�ٴ�����������"
                  placeholderTextColor={neutralScale.neutral6}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPasswords}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </YStack>

              <XStack
                alignItems="center"
                gap="$2"
                paddingVertical="$1"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setShowPasswords(!showPasswords)}
              >
                <IconSymbol
                  name={showPasswords ? 'eye.slash.fill' : 'eye.fill'}
                  size={16}
                  color={neutralScale.neutral7}
                />
                <Text fontSize={13} color={neutralScale.neutral8} fontWeight="500">
                  {showPasswords ? '��������' : '��ʾ����'}
                </Text>
              </XStack>

              <Button
                height={44}
                backgroundColor={errorScale.error9}
                borderRadius={12}
                pressStyle={{ backgroundColor: errorScale.error10, scale: 0.98 }}
                onPress={handleChangePassword}
                disabled={!canChangePassword || isChangingPassword}
                opacity={!canChangePassword || isChangingPassword ? 0.5 : 1}
                icon={<IconSymbol name="key.fill" size={18} color="white" />}
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  {isChangingPassword ? '�޸���...' : '�޸�����'}
                </Text>
              </Button>
            </YStack>
          </ScrollView>

          <Dialog.Close displayWhenAdapted asChild>
            <Button
              marginTop="$4"
              height={48}
              backgroundColor={neutralScale.neutral2}
              borderRadius={12}
              pressStyle={{ backgroundColor: neutralScale.neutral3 }}
              onPress={handleClose}
            >
              <Text fontSize={15} fontWeight="600" color={neutralScale.neutral11}>
                ���
              </Text>
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  scrollView: { maxHeight: 400 },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: neutralScale.neutral4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '500',
    color: neutralScale.neutral11,
  },
});
