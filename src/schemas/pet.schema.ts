import { z } from 'zod';

/**
 * 宠物 Schema
 */
export const petSchema = z.object({
  id: z.number(),
  name: z.string(),
  species: z.string(),
  species_display: z.string().optional(),
  breed: z.string().optional().nullable(),
  age: z.number().nullable().optional(),
  photo_url: z.string().nullable().optional(), // 后端返回 photo_url
  description: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
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

// 类型导出
export type Pet = z.infer<typeof petSchema>;
export type PetInput = z.infer<typeof petInputSchema>;
