import { z } from 'zod';

// 登录表单验证
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, '请输入用户名')
    .min(3, '用户名至少3个字符')
    .max(150, '用户名最多150个字符'),
  password: z.string().min(1, '请输入密码').min(6, '密码至少6个字符'),
});

// 注册表单验证
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, '请输入用户名')
      .min(3, '用户名至少3个字符')
      .max(150, '用户名最多150个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    password: z
      .string()
      .min(1, '请输入密码')
      .min(6, '密码至少6个字符')
      .regex(/[A-Za-z]/, '密码必须包含字母')
      .regex(/[0-9]/, '密码必须包含数字'),
    re_password: z.string().min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.re_password, {
    message: '两次输入的密码不一致',
    path: ['re_password'],
  });

// 修改密码验证
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, '请输入当前密码'),
    new_password: z
      .string()
      .min(1, '请输入新密码')
      .min(6, '密码至少6个字符')
      .regex(/[A-Za-z]/, '密码必须包含字母')
      .regex(/[0-9]/, '密码必须包含数字'),
    re_new_password: z.string().min(1, '请确认新密码'),
  })
  .refine((data) => data.new_password === data.re_new_password, {
    message: '两次输入的新密码不一致',
    path: ['re_new_password'],
  });

// 用户响应类型
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  // email 可以是空字符串、有效邮箱、null 或 undefined
  email: z.union([z.string().email(), z.literal(''), z.null(), z.undefined()]).optional(),
  first_name: z.union([z.string(), z.literal(''), z.null(), z.undefined()]).optional(),
  last_name: z.union([z.string(), z.literal(''), z.null(), z.undefined()]).optional(),
});

// JWT 响应类型
export const jwtResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

// 刷新 Token 请求
export const refreshTokenSchema = z.object({
  refresh: z.string(),
});

// 类型导出
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type User = z.infer<typeof userSchema>;
export type JWTResponse = z.infer<typeof jwtResponseSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
