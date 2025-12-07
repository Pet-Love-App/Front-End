import { z } from 'zod';

import { petSchema } from './pet.schema';

/**
 * 用户信息 Schema（适配 Supabase）
 * 包含用户基础信息、头像和宠物列表
 */
export const userSchema = z.object({
  id: z.string(), // Supabase 使用 UUID
  email: z.string().email().optional(),
  username: z.string(),
  bio: z.string().nullable().optional(), // 用户简介
  avatar_url: z.string().nullable().optional(), // 头像 URL
  is_admin: z.boolean().optional().default(false), // 管理员标识
  created_at: z.string().optional(), // 创建时间
  updated_at: z.string().optional(), // 更新时间
  pets: z.array(petSchema).optional(), // 用户的宠物列表
});

/**
 * 头像上传响应 Schema
 */
export const avatarUploadResponseSchema = z.object({
  message: z.string(),
  avatar: z.string(), // 新头像的 URL
});

/**
 * 删除响应 Schema
 */
export const deleteResponseSchema = z.object({
  message: z.string(),
});

/**
 * 更新用户名请求 Schema
 */
export const updateUsernameSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符').max(20, '用户名最多20个字符'),
});

/**
 * 修改密码请求 Schema
 */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, '请输入当前密码'),
  new_password: z.string().min(6, '新密码至少需要6个字符'),
  re_new_password: z.string().min(6, '确认密码至少需要6个字符'),
});

/**
 * 通用成功响应 Schema
 */
export const successResponseSchema = z.object({
  message: z.string(),
});

// 类型导出
export type User = z.infer<typeof userSchema>;
export type AvatarUploadResponse = z.infer<typeof avatarUploadResponseSchema>;
export type DeleteResponse = z.infer<typeof deleteResponseSchema>;
export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;

// 重新导出宠物相关类型，方便统一导入
export type { Pet, PetInput } from './pet.schema';
