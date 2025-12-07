import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Spinner, Text, YStack } from 'tamagui';
import { LottieAnimation } from '@/src/components/LottieAnimation';

import { useLoginForm } from '../hooks';

/**
 * Login 主屏幕组件
 */
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
      <Text fontSize="$5" color="$gray10" marginBottom="$6" textAlign="center">
        为你的小猫量身定做的健康app
      </Text>

      <YStack width="100%" maxWidth={400}>
        <YStack marginBottom="$3">
          <Input
            size="$5"
            placeholder="邮箱地址"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            disabled={isLoading}
            borderColor={errors.email ? '$red10' : undefined}
          />
          {errors.email && (
            <Text color="$red10" fontSize="$2" marginTop="$1">
              {errors.email}
            </Text>
          )}
        </YStack>

        <YStack marginBottom="$4">
          <Input
            size="$5"
            placeholder="密码"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            disabled={isLoading}
            borderColor={errors.password ? '$red10' : undefined}
          />
          {errors.password && (
            <Text color="$red10" fontSize="$2" marginTop="$1">
              {errors.password}
            </Text>
          )}
        </YStack>

        <Button
          size="$5"
          theme="blue"
          onPress={handleLogin}
          disabled={isLoading}
          opacity={isLoading ? 0.6 : 1}
          marginBottom="$2"
        >
          {isLoading ? <Spinner color="$white1" /> : '登录'}
        </Button>

        <Button size="$4" chromeless onPress={navigateToRegister}>
          <Text color="$blue10">还没有账号？立即注册</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
