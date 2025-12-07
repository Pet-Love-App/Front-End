/**
 * Supabase 宠物服务
 */

import { supabase } from '../client';
import { convertKeysToCamel, logger, wrapResponse, type SupabaseResponse } from '../helpers';

// ==================== 类型定义 ====================

/**
 * 宠物数据库 Schema
 */
export interface PetDB {
  id: number;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  photo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 宠物信息（前端使用，camelCase）
 */
export interface Pet {
  id: number;
  userId: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  photoUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建/更新宠物参数
 */
export interface PetInput {
  name: string;
  species?: string;
  breed?: string | null;
  age?: number | null;
  description?: string | null;
}

// ==================== Pet 服务 ====================

class SupabasePetService {
  /**
   * 获取当前用户的宠物列表
   */
  async getMyPets(): Promise<SupabaseResponse<Pet[]>> {
    logger.query('pets', 'getMyPets');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('pets', 'getMyPets', error);
        return wrapResponse<Pet[]>(null, error);
      }

      const pets = data ? convertKeysToCamel(data) : [];
      logger.success('pets', 'getMyPets', pets.length);
      return { data: pets, error: null, success: true };
    } catch (err) {
      logger.error('pets', 'getMyPets', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取宠物详情
   */
  async getPet(petId: number): Promise<SupabaseResponse<Pet>> {
    logger.query('pets', 'getPet', { petId });

    try {
      const { data, error } = await supabase.from('pets').select('*').eq('id', petId).single();

      if (error) {
        logger.error('pets', 'getPet', error);
        return wrapResponse<Pet>(null, error);
      }

      logger.success('pets', 'getPet');
      return { data: convertKeysToCamel(data), error: null, success: true };
    } catch (err) {
      logger.error('pets', 'getPet', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 创建宠物
   */
  async createPet(petData: PetInput): Promise<SupabaseResponse<Pet>> {
    logger.query('pets', 'createPet', petData);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('pets')
        .insert({
          user_id: user.id,
          name: petData.name,
          species: petData.species || 'cat',
          breed: petData.breed || null,
          age: petData.age || null,
          description: petData.description || null,
        })
        .select()
        .single();

      if (error) {
        logger.error('pets', 'createPet', error);
        return wrapResponse<Pet>(null, error);
      }

      logger.success('pets', 'createPet');
      return { data: convertKeysToCamel(data), error: null, success: true };
    } catch (err) {
      logger.error('pets', 'createPet', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 更新宠物信息
   */
  async updatePet(petId: number, petData: Partial<PetInput>): Promise<SupabaseResponse<Pet>> {
    logger.query('pets', 'updatePet', { petId, ...petData });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('pets')
        .update({
          ...(petData.name && { name: petData.name }),
          ...(petData.species && { species: petData.species }),
          ...(petData.breed !== undefined && { breed: petData.breed }),
          ...(petData.age !== undefined && { age: petData.age }),
          ...(petData.description !== undefined && { description: petData.description }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', petId)
        .eq('user_id', user.id) // 确保只能更新自己的宠物
        .select()
        .single();

      if (error) {
        logger.error('pets', 'updatePet', error);
        return wrapResponse<Pet>(null, error);
      }

      logger.success('pets', 'updatePet');
      return { data: convertKeysToCamel(data), error: null, success: true };
    } catch (err) {
      logger.error('pets', 'updatePet', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 删除宠物
   */
  async deletePet(petId: number): Promise<SupabaseResponse<void>> {
    logger.query('pets', 'deletePet', { petId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 先获取宠物信息以删除照片
      const { data: pet } = await supabase
        .from('pets')
        .select('photo_url')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single();

      // 如果有照片，从 Storage 删除
      if (pet?.photo_url) {
        const path = pet.photo_url.split('/pets/')[1];
        if (path) {
          await supabase.storage.from('pets').remove([path]);
        }
      }

      // 删除宠物记录
      const { error } = await supabase.from('pets').delete().eq('id', petId).eq('user_id', user.id);

      if (error) {
        logger.error('pets', 'deletePet', error);
        return wrapResponse<void>(null, error);
      }

      logger.success('pets', 'deletePet');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('pets', 'deletePet', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 上传宠物照片
   */
  async uploadPetPhoto(petId: number, imageUri: string): Promise<SupabaseResponse<Pet>> {
    logger.query('pets', 'uploadPetPhoto', { petId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 验证宠物所有权
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('id')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single();

      if (petError || !pet) {
        return {
          data: null,
          error: { message: '宠物不存在或无权限', code: 'NOT_FOUND', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 准备文件
      const fileName = `${user.id}/pet_${petId}_${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // 上传到 Storage
      const { error: uploadError } = await supabase.storage.from('pets').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

      if (uploadError) {
        logger.error('pets', 'uploadPetPhoto', uploadError);
        return {
          data: null,
          error: {
            message: uploadError.message,
            code: 'UPLOAD_ERROR',
            details: '',
            hint: '',
          } as any,
          success: false,
        };
      }

      // 获取公开 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('pets').getPublicUrl(fileName);

      // 更新宠物记录
      const { data: updatedPet, error: updateError } = await supabase
        .from('pets')
        .update({
          photo_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', petId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        logger.error('pets', 'uploadPetPhoto (update)', updateError);
        return wrapResponse<Pet>(null, updateError);
      }

      logger.success('pets', 'uploadPetPhoto');
      return { data: convertKeysToCamel(updatedPet), error: null, success: true };
    } catch (err) {
      logger.error('pets', 'uploadPetPhoto', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 删除宠物照片
   */
  async deletePetPhoto(petId: number): Promise<SupabaseResponse<Pet>> {
    logger.query('pets', 'deletePetPhoto', { petId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 获取宠物信息
      const { data: pet } = await supabase
        .from('pets')
        .select('photo_url')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single();

      // 如果有照片，从 Storage 删除
      if (pet?.photo_url) {
        const path = pet.photo_url.split('/pets/')[1];
        if (path) {
          await supabase.storage.from('pets').remove([path]);
        }
      }

      // 清空照片 URL
      const { data: updatedPet, error } = await supabase
        .from('pets')
        .update({
          photo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', petId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('pets', 'deletePetPhoto', error);
        return wrapResponse<Pet>(null, error);
      }

      logger.success('pets', 'deletePetPhoto');
      return { data: convertKeysToCamel(updatedPet), error: null, success: true };
    } catch (err) {
      logger.error('pets', 'deletePetPhoto', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

// 导出单例
export const supabasePetService = new SupabasePetService();

export default supabasePetService;
