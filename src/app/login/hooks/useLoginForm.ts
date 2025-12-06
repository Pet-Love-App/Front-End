import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ZodError } from 'zod';

import { useUserStore } from '@/src/store/userStore';
import { loginSchema } from '@/src/schemas/auth.schema';

/**
 * 登录表单 Hook
 * 负责登录表单的状态管理和验证
 */
export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading } = useUserStore();

  const handleLogin = async () => {
    // 清除之前的错误
    setErrors({});

    try {
      // 使用 Zod 验证表单数据
      loginSchema.parse({ email, password });

      // 验证通过，执行登录
      await login(email, password);
      router.replace('/(tabs)/collect');
    } catch (error) {
      if (error instanceof ZodError) {
        // 处理验证错误
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'email' | 'password';
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

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) setErrors({ ...errors, email: undefined });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) setErrors({ ...errors, password: undefined });
  };

  const navigateToRegister = () => {
    router.push('/register' as any);
  };

  return {
    email,
    password,
    errors,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    navigateToRegister,
  };
}
