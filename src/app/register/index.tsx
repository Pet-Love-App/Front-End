import { LottieAnimation } from '@/src/components/LottieAnimation';
import { registerSchema } from '@/src/schemas/auth.schema';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Spinner, Text, YStack } from 'tamagui';
import { ZodError } from 'zod';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    re_password?: string;
  }>({});

  const { register, isLoading } = useUserStore();

  const handleRegister = async () => {
    // 清除之前的错误
    setErrors({});

    try {
      // 使用 Zod 验证表单数据
      registerSchema.parse({
        username,
        password,
        re_password: confirmPassword,
      });

      // 验证通过，执行注册
      await register(username, password, confirmPassword);

      Alert.alert('注册成功', '请登录', [
        {
          text: '确定',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      if (error instanceof ZodError) {
        // 处理验证错误
        const fieldErrors: {
          username?: string;
          password?: string;
          re_password?: string;
        } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'username' | 'password' | 're_password';
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);

        // 显示第一个错误
        const firstError = error.errors[0];
        Alert.alert('验证失败', firstError.message);
      } else if (error instanceof Error) {
        // 处理 API 错误
        Alert.alert('注册失败', error.message);
        console.error('注册错误:', error);
      }
    }
  };

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
            placeholder="用户名（字母、数字、下划线）"
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

        <YStack marginBottom="$3">
          <Input
            size="$5"
            placeholder="密码（至少6位，包含字母和数字）"
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

        <YStack marginBottom="$4">
          <Input
            size="$5"
            placeholder="确认密码"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.re_password) setErrors({ ...errors, re_password: undefined });
            }}
            secureTextEntry
            disabled={isLoading}
            borderColor={errors.re_password ? '$red10' : undefined}
          />
          {errors.re_password && (
            <Text color="$red10" fontSize="$2" marginTop="$1">
              {errors.re_password}
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

        <Button size="$4" chromeless onPress={() => router.back()}>
          <Text color="$blue10">已有账号？返回登录</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
