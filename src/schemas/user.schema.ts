import { z } from 'zod';

/**
 * 宠物 Schema
 */
export const petSchema = z.object({
  id: z.number(),
  name: z.string(),
  species: z.string(), // 'dog' | 'cat' | 'bird' | 'other'
  species_display: z.string().optional(), // 中文显示名称
  breed: z.string().optional(),
  age: z.number().nullable().optional(),
  photo: z.string().nullable().optional(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * 用户完整信息 Schema（含头像和宠物）
 */
export const userDetailSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatar: z.string().nullable().optional(), // 头像 URL
  pets: z.array(petSchema).optional(), // 用户的宠物列表
});

/**
 * 创建/更新宠物的输入 Schema
 */
export const petInputSchema = z.object({
  name: z.string().min(1, '请输入宠物名称').max(100, '宠物名称最多100个字符'),
  species: z.enum(['dog', 'cat', 'bird', 'other'], {
    errorMap: () => ({ message: '请选择宠物种类' }),
  }),
  breed: z.string().max(100, '品种最多100个字符').optional(),
  age: z.number().int().min(0, '年龄不能为负数').max(100, '年龄过大').nullable().optional(),
  description: z.string().max(500, '描述最多500个字符').optional(),
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
export type Pet = z.infer<typeof petSchema>;
export type UserDetail = z.infer<typeof userDetailSchema>;
export type PetInput = z.infer<typeof petInputSchema>;
export type AvatarUploadResponse = z.infer<typeof avatarUploadResponseSchema>;
export type DeleteResponse = z.infer<typeof deleteResponseSchema>;

