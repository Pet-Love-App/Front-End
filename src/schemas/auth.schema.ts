import { z } from 'zod';

// 登录表单验证（Supabase 使用 email）
export const loginSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码').min(6, '密码至少6个字符'),
});

// 注册表单验证（Supabase 使用 email + username）
export const registerSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少6个字符')
    .regex(/[A-Za-z]/, '密码必须包含字母')
    .regex(/[0-9]/, '密码必须包含数字'),
  username: z
    .string()
    .min(1, '请输入用户名')
    .min(3, '用户名至少3个字符')
    .max(150, '用户名最多150个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
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

// Supabase Session 响应类型
export const supabaseSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  expires_at: z.number().optional(),
  token_type: z.string().optional(),
  user: z
    .object({
      id: z.string(), // Supabase 使用 UUID
      email: z.string().optional(),
    })
    .optional(),
});

// Supabase 用户响应
export const supabaseUserSchema = z.object({
  id: z.string(), // UUID
  email: z.string(),
  user_metadata: z
    .object({
      username: z.string().optional(),
    })
    .optional(),
});

// 登录/注册响应（包含 user 和 session）
export const authResponseSchema = z.object({
  user: supabaseUserSchema,
  session: supabaseSessionSchema,
});

// JWT 响应类型（兼容旧代码）
export const jwtResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

// 类型导出
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type JWTResponse = z.infer<typeof jwtResponseSchema>;
export type SupabaseSession = z.infer<typeof supabaseSessionSchema>;
export type SupabaseUser = z.infer<typeof supabaseUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
