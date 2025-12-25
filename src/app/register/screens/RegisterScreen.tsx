/**
 * 注册页面
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { Button, Input } from '@/src/design-system';
import { infoScale, neutralScale } from '@/src/design-system/tokens';

import { useRegisterForm } from '../hooks';

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
    <View testID="register-screen" style={{ flex: 1 }}>
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
        <Text fontSize="$5" color={neutralScale.neutral9} marginBottom="$6" textAlign="center">
          加入Pet Love大家庭
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
            testID="register-email-input"
          />

          <Input
            size="lg"
            placeholder="用户名（3-150个字符）"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            disabled={isLoading}
            error={!!errors.username}
            errorMessage={errors.username}
            testID="register-username-input"
          />

          <Input
            size="lg"
            placeholder="密码（至少6位，含字母和数字）"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            disabled={isLoading}
            error={!!errors.password}
            errorMessage={errors.password}
            testID="register-password-input"
          />

          <Button
            size="lg"
            variant="primary"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            marginTop="$2"
            testID="register-button"
          >
            注册
          </Button>

          <YStack alignItems="center" marginTop="$2">
            <Pressable
              onPress={navigateBack}
              testID="back-button"
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text color={infoScale.info9} fontSize="$4">
                已有账号？返回登录
              </Text>
            </Pressable>
          </YStack>
        </YStack>
      </YStack>
    </View>
  );
}
