import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ZodError } from 'zod';
import { z } from 'zod';

import { useUserStore } from '@/src/store/userStore';
import { toast } from '@/src/components/dialogs';
import { supabase } from '@/src/lib/supabase/client';

// 密码重置表单验证
const passwordResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, '请输入新密码')
      .min(6, '密码至少6个字符')
      .regex(/[A-Za-z]/, '密码必须包含字母')
      .regex(/[0-9]/, '密码必须包含数字'),
    confirmPassword: z.string().min(1, '请确认新密码'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmPassword'],
  });

/**
 * 密码重置表单 Hook
 * 负责密码重置表单的状态管理和验证
 */
export function usePasswordResetForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const { updatePassword, isLoading } = useUserStore();

  // 检查是否有有效的 session（验证 OTP 后应该已经有 session）
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
        // 确保 store 中的 session 是最新的
        useUserStore.getState().setSession(session);
      } else {
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async () => {
    // 清除之前的错误
    setErrors({});

    if (!isValidSession) {
      toast.error('重置失败', '请先验证邮箱，请重新申请密码重置');
      router.replace('/forgot-password');
      return;
    }

    // 再次检查 session 是否有效
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error('重置失败', 'Session 已过期，请重新验证邮箱');
      router.replace('/forgot-password');
      return;
    }

    try {
      // 使用 Zod 验证表单数据
      passwordResetSchema.parse({
        newPassword,
        confirmPassword,
      });

      // 验证通过，更新密码
      await updatePassword(newPassword);

      // 密码更新成功后，立即跳转到登录页面
      // 不需要等待，因为密码更新成功后 session 已被清除
      toast.success('重置成功', '密码已成功重置，请使用新密码登录');
      router.replace('/login');
    } catch (error) {
      if (error instanceof ZodError) {
        // 处理验证错误
        const fieldErrors: {
          newPassword?: string;
          confirmPassword?: string;
        } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'newPassword' | 'confirmPassword';
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);

        // 显示第一个错误
        const firstError = error.errors[0];
        toast.error('验证失败', firstError.message);
      } else if (error instanceof Error) {
        // 处理 API 错误
        console.error('密码重置失败:', error);
        toast.error('重置失败', error.message || '密码重置失败，请重试');
      } else {
        // 处理未知错误
        console.error('密码重置未知错误:', error);
        toast.error('重置失败', '发生未知错误，请重试');
      }
    }
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
  };

  return {
    newPassword,
    confirmPassword,
    errors,
    isLoading,
    isValidSession,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  };
}
