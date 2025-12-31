import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ZodError } from 'zod';
import { z } from 'zod';

import { useUserStore } from '@/src/store/userStore';
import { toast } from '@/src/components/dialogs';

// 忘记密码表单验证
const forgotPasswordSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
});

/**
 * 忘记密码表单 Hook
 * 负责忘记密码表单的状态管理和验证
 */
export function useForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword, isLoading } = useUserStore();

  const handleSubmit = async () => {
    // 清除之前的错误
    setErrors({});
    setIsSuccess(false);

    try {
      // 使用 Zod 验证表单数据
      forgotPasswordSchema.parse({ email });

      // 验证通过，发送重置 OTP 验证码
      await resetPassword(email);
      setIsSuccess(true);
      toast.success('发送成功', '验证码已发送到您的邮箱，请查收');

      // 立即跳转到验证页面
      // 使用 router.replace 确保路由正确
      router.replace({
        pathname: '/password-reset/verify' as any,
        params: { email },
      } as any);
    } catch (error) {
      if (error instanceof ZodError) {
        // 处理验证错误
        const fieldErrors: { email?: string } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'email';
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);

        // 显示第一个错误
        const firstError = error.errors[0];
        toast.error('验证失败', firstError.message);
      } else if (error instanceof Error) {
        // 处理 API 错误
        const errorMessage = error.message || '发送失败';

        // 检查是否是速率限制错误
        if (errorMessage.includes('after') && errorMessage.includes('seconds')) {
          // 提取等待时间（例如 "after 8 seconds"）
          const match = errorMessage.match(/after (\d+) seconds?/i);
          const waitSeconds = match ? parseInt(match[1], 10) : 8;
          toast.warning('发送过于频繁', `请等待 ${waitSeconds} 秒后再试`);
        } else {
          toast.error('发送失败', errorMessage);
        }
      }
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) setErrors({ ...errors, email: undefined });
    setIsSuccess(false);
  };

  const navigateBack = () => {
    router.back();
  };

  return {
    email,
    errors,
    isLoading,
    isSuccess,
    handleEmailChange,
    handleSubmit,
    navigateBack,
  };
}
