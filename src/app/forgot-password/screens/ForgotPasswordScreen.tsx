/**
 * 忘记密码页面
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { Button, Input } from '@/src/design-system';
import { infoScale, neutralScale, successScale } from '@/src/design-system/tokens';

import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

export function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { email, errors, isLoading, isSuccess, handleEmailChange, handleSubmit, navigateBack } =
    useForgotPasswordForm();

  return (
    <View testID="forgot-password-screen" style={{ flex: 1 }}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$8"
        paddingTop={insets.top + 16}
        paddingBottom={insets.bottom + 80}
        backgroundColor="$background"
      >
        <LottieAnimation
          source={require('@/assets/animations/cat_playing.json')}
          width={300}
          height={200}
        />

        <Text fontSize="$9" fontWeight="bold" marginBottom="$3" textAlign="center">
          忘记密码？
        </Text>
        <Text fontSize="$5" color={neutralScale.neutral9} marginBottom="$6" textAlign="center">
          请输入您的邮箱地址，我们将发送验证码
        </Text>

        <YStack width="100%" maxWidth={400} gap="$3">
          <Input
            size="lg"
            placeholder="邮箱地址"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            disabled={isLoading || isSuccess}
            error={!!errors.email}
            errorMessage={errors.email}
            testID="forgot-password-email-input"
          />

          {isSuccess && (
            <YStack
              padding="$4"
              borderRadius="$4"
              backgroundColor={successScale.success2}
              borderWidth={1}
              borderColor={successScale.success6}
            >
              <Text fontSize="$4" color={successScale.success11} textAlign="center">
                验证码已发送！请查收您的邮箱，我们将跳转到验证页面。
              </Text>
            </YStack>
          )}

          <Button
            size="lg"
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isSuccess}
            fullWidth
            marginTop="$2"
            testID="forgot-password-submit-button"
          >
            {isSuccess ? '已发送' : '发送验证码'}
          </Button>

          <YStack alignItems="center" marginTop="$2">
            <Pressable
              onPress={navigateBack}
              testID="back-button"
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text color={infoScale.info9} fontSize="$4">
                返回登录
              </Text>
            </Pressable>
          </YStack>
        </YStack>
      </YStack>
    </View>
  );
}
