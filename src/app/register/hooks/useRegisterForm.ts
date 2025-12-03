import { registerSchema } from '@/src/schemas/auth.schema';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { ZodError } from 'zod';

/**
 * 注册表单 Hook
 * 负责注册表单的状态管理和验证
 */
export function useRegisterForm() {
  const router = useRouter();
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

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (errors.username) setErrors({ ...errors, username: undefined });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) setErrors({ ...errors, password: undefined });
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.re_password) setErrors({ ...errors, re_password: undefined });
  };

  const navigateBack = () => {
    router.back();
  };

  return {
    username,
    password,
    confirmPassword,
    errors,
    isLoading,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleRegister,
    navigateBack,
  };
}
