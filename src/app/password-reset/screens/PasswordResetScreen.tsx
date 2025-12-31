/**
 * 密码重置页面
 */
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, Spinner } from 'tamagui';
import { Button, Input } from '@/src/design-system';
import { neutralScale } from '@/src/design-system/tokens';

import { usePasswordResetForm } from '../hooks/usePasswordResetForm';

export function PasswordResetScreen() {
  const insets = useSafeAreaInsets();
  const {
    newPassword,
    confirmPassword,
    errors,
    isLoading,
    isValidSession,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = usePasswordResetForm();

  // 正在检查 session
  if (isValidSession === null) {
    return (
      <View testID="password-reset-screen" style={{ flex: 1 }}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$8"
          backgroundColor="$background"
        >
          <Spinner size="large" color="$primary" />
          <Text fontSize="$5" color={neutralScale.neutral9} marginTop="$4">
            正在验证...
          </Text>
        </YStack>
      </View>
    );
  }

  // Session 无效，需要先验证邮箱
  if (isValidSession === false) {
    return (
      <View testID="password-reset-screen" style={{ flex: 1 }}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$8"
          paddingTop={insets.top + 16}
          paddingBottom={insets.bottom + 80}
          backgroundColor="$background"
        >
          <Text fontSize="$9" fontWeight="bold" marginBottom="$3" textAlign="center">
            需要验证邮箱
          </Text>
          <Text fontSize="$5" color={neutralScale.neutral9} marginBottom="$6" textAlign="center">
            请先验证邮箱后再设置新密码
          </Text>
        </YStack>
      </View>
    );
  }

  // 正常显示重置表单
  return (
    <View testID="password-reset-screen" style={{ flex: 1 }}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$8"
        paddingTop={insets.top + 16}
        paddingBottom={insets.bottom + 80}
        backgroundColor="$background"
      >
        <Text fontSize="$9" fontWeight="bold" marginBottom="$3" textAlign="center">
          重置密码
        </Text>
        <Text fontSize="$5" color={neutralScale.neutral9} marginBottom="$6" textAlign="center">
          请设置您的新密码
        </Text>

        <YStack width="100%" maxWidth={400} gap="$3">
          <Input
            size="lg"
            placeholder="新密码（至少6位，含字母和数字）"
            value={newPassword}
            onChangeText={handleNewPasswordChange}
            secureTextEntry
            disabled={isLoading}
            error={!!errors.newPassword}
            errorMessage={errors.newPassword}
            testID="password-reset-new-password-input"
          />

          <Input
            size="lg"
            placeholder="确认新密码"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry
            disabled={isLoading}
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            testID="password-reset-confirm-password-input"
          />

          <Button
            size="lg"
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            marginTop="$2"
            testID="password-reset-submit-button"
          >
            重置密码
          </Button>
        </YStack>
      </YStack>
    </View>
  );
}
