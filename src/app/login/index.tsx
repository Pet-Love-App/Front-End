import { LottieAnimation } from '@/src/components/lottie-animation';
import { loginSchema } from '@/src/schemas/auth.schema';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Spinner, Text, YStack } from 'tamagui';
import { ZodError } from 'zod';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const { login, isLoading } = useUserStore();

  const handleLogin = async () => {
    // 清除之前的错误
    setErrors({});

    try {
      // 使用 Zod 验证表单数据
      loginSchema.parse({ username, password });

      // 验证通过，执行登录
      await login(username, password);
      router.replace('/(tabs)/collect');
    } catch (error) {
      if (error instanceof ZodError) {
        // 处理验证错误
        const fieldErrors: { username?: string; password?: string } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'username' | 'password';
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);

        // 显示第一个错误
        const firstError = error.errors[0];
        Alert.alert('验证失败', firstError.message);
      } else if (error instanceof Error) {
        // 处理 API 错误
        Alert.alert('登录失败', error.message);
        console.error('登录错误:', error);
      }
    }
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="$8"
      paddingTop="$4"
      paddingBottom="$20"
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
            placeholder="用户名"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: undefined });
            }}
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
            placeholder="密码"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
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

        <Button
          size="$4"
          chromeless
          onPress={() => {
            router.push('/register' as any);
          }}
        >
          <Text color="$blue10">还没有账号？立即注册</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
