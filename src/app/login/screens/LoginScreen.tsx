/**
 * 登录页面
 */
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { Button, Input } from '@/src/design-system';
import { infoScale, neutralScale } from '@/src/design-system/tokens';

import { useLoginForm } from '../hooks';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const {
    email,
    password,
    errors,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    navigateToRegister,
  } = useLoginForm();

  return (
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
        欢迎来到Pet Love!
      </Text>
      <Text fontSize="$5" color={neutralScale.neutral9} marginBottom="$6" textAlign="center">
        为你的小猫量身定做的健康app
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
          disabled={isLoading}
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <Input
          size="lg"
          placeholder="密码"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          disabled={isLoading}
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <Button
          size="lg"
          variant="primary"
          onPress={handleLogin}
          loading={isLoading}
          fullWidth
          marginTop="$2"
        >
          登录
        </Button>

        <YStack alignItems="center" marginTop="$2">
          <Text
            color={infoScale.info9}
            fontSize="$4"
            onPress={navigateToRegister}
            pressStyle={{ opacity: 0.7 }}
          >
            还没有账号？立即注册
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
