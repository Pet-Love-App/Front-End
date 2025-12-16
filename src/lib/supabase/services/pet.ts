/**
 * Supabase 宠物服务
 */

import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

import { supabase } from '../client';
import { logger, wrapResponse, type SupabaseResponse } from '../helpers';
import type { Pet } from '@/src/schemas/pet.schema';

// ==================== 类型定义 ====================

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

      const pets = data || [];
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
      return { data: data as Pet, error: null, success: true };
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
      return { data: data as Pet, error: null, success: true };
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
      return { data: data as Pet, error: null, success: true };
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
        logger.error('pets', 'uploadPetPhoto', new Error('用户未登录'));
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
        logger.error('pets', 'uploadPetPhoto', petError || new Error('宠物不存在'));
        return {
          data: null,
          error: { message: '宠物不存在或无权限', code: 'NOT_FOUND', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 准备文件
      const fileName = `${user.id}/pet_${petId}_${Date.now()}.jpg`;

      // 处理 file:// URI
      let fileUri = imageUri;
      if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }

      // 检查文件信息
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        return {
          data: null,
          error: {
            message: '图片文件不存在',
            code: 'FILE_NOT_FOUND',
            details: `URI: ${fileUri}`,
            hint: '',
          } as any,
          success: false,
        };
      }

      // 使用 FileSystem 读取文件为 base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      if (!base64Data || base64Data.length === 0) {
        return {
          data: null,
          error: {
            message: '无法读取图片数据',
            code: 'READ_ERROR',
            details: 'Base64 data is empty',
            hint: '',
          } as any,
          success: false,
        };
      }

      // 将 base64 转换为 ArrayBuffer
      const arrayBuffer = decode(base64Data);

      // 验证文件不为空
      if (arrayBuffer.byteLength === 0) {
        return {
          data: null,
          error: {
            message: '图片文件为空或无法读取',
            code: 'INVALID_FILE',
            details: `File size: 0 bytes`,
            hint: '',
          } as any,
          success: false,
        };
      }

      // 上传到 Storage
      const { error: uploadError } = await supabase.storage
        .from('pets')
        .upload(fileName, arrayBuffer, {
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
            details: uploadError.message,
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
        logger.error('pets', 'uploadPetPhoto', updateError);
        return wrapResponse<Pet>(null, updateError);
      }

      logger.success('pets', 'uploadPetPhoto');
      return { data: updatedPet as Pet, error: null, success: true };
    } catch (err) {
      logger.error('pets', 'uploadPetPhoto', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: String(err), hint: '' } as any,
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
      return { data: updatedPet as Pet, error: null, success: true };
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
