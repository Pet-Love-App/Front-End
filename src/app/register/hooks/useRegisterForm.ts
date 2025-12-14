import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ZodError } from 'zod';

import { useUserStore } from '@/src/store/userStore';
import { registerSchema } from '@/src/schemas/auth.schema';
import { showAlert, toast } from '@/src/components/dialogs';

/**
 * 注册表单 Hook
 * 负责注册表单的状态管理和验证
 */
export function useRegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});

  const { register, isLoading } = useUserStore();

  const handleRegister = async () => {
    // 清除之前的错误
    setErrors({});

    try {
      // 使用 Zod 验证表单数据
      registerSchema.parse({
        email,
        username,
        password,
      });

      // 验证通过，执行注册
      await register(email, username, password);

      // 检查是否已经自动登录（有 session）
      const { isAuthenticated } = useUserStore.getState();

      if (isAuthenticated) {
        // 自动登录成功
        showAlert({
          title: '注册成功',
          message: '欢迎加入 Pet Love！',
          type: 'success',
          buttons: [
            {
              text: '确定',
              onPress: () => router.replace('/(tabs)/collect'),
            },
          ],
        });
      } else {
        // 需要邮箱验证
        showAlert({
          title: '注册成功',
          message: '请查收验证邮件并完成邮箱验证后登录。',
          type: 'success',
          buttons: [
            {
              text: '确定',
              onPress: () => router.back(), // 返回登录页
            },
          ],
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // 处理验证错误
        const fieldErrors: {
          email?: string;
          username?: string;
          password?: string;
        } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'email' | 'username' | 'password';
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);

        // 显示第一个错误
        const firstError = error.errors[0];
        toast.error('验证失败', firstError.message);
      } else if (error instanceof Error) {
        // 处理 API 错误
        toast.error('注册失败', error.message);
        console.error('注册错误:', error);
      }
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) setErrors({ ...errors, email: undefined });
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (errors.username) setErrors({ ...errors, username: undefined });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) setErrors({ ...errors, password: undefined });
  };

  const navigateBack = () => {
    router.back();
  };

  return {
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
  };
}
