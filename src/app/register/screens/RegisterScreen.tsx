import { LottieAnimation } from '@/src/components/LottieAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Spinner, Text, YStack } from 'tamagui';
import { useRegisterForm } from '../hooks';

/**
 * Register 主屏幕组件
 */
export function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const {
    email,
    username,
    password,
    errors,
    isLoading,
    handleEmailChange,
    handleUsernameChange,
    handlePasswordChange,
    handleRegister,
    navigateBack,
  } = useRegisterForm();

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
        注册新账号
      </Text>
      <Text fontSize="$5" color="$gray10" marginBottom="$6" textAlign="center">
        加入Pet Love大家庭
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

        <YStack marginBottom="$3">
          <Input
            size="$5"
            placeholder="用户名（3-150个字符，字母、数字、下划线）"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            disabled={isLoading}
            borderColor={errors.username ? '$red10' : undefined}
          />
          {errors.username && (
            <Text color="$red10" fontSize="$2" marginTop="$1">
              {errors.username}
            </Text>
          )}
        </YStack>

        <YStack marginBottom="$4">
          <Input
            size="$5"
            placeholder="密码（至少6位，包含字母和数字）"
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
          onPress={handleRegister}
          disabled={isLoading}
          opacity={isLoading ? 0.6 : 1}
          marginBottom="$2"
        >
          {isLoading ? <Spinner color="$white1" /> : '注册'}
        </Button>

        <Button size="$4" chromeless onPress={navigateBack}>
          <Text color="$blue10">已有账号？返回登录</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
