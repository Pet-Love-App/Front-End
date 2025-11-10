import { z } from 'zod';
import { petSchema } from './pet.schema';

/**
 * 用户信息 Schema
 * 包含用户基础信息、头像和宠物列表
 */
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatar: z.string().nullable().optional(), // 头像 URL
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

// 类型导出
export type User = z.infer<typeof userSchema>;
export type AvatarUploadResponse = z.infer<typeof avatarUploadResponseSchema>;
export type DeleteResponse = z.infer<typeof deleteResponseSchema>;

// 重新导出宠物相关类型，方便统一导入
export type { Pet, PetInput } from './pet.schema';
