/**
 * Supabase 用户 Profile 服务
 *
 * - 管理 `profiles` 表中的用户资料
 * - 处理头像上传到 Supabase Storage
 * - 与 Auth 用户关联
 */

import { decode } from 'base64-arraybuffer';
// 使用 legacy API，因为新 API (File/Directory) 在 SDK 54 中仍需迁移
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../client';
import { convertKeysToCamel, logger, wrapResponse, type SupabaseResponse } from '../helpers';

// ==================== 类型定义 ====================

/**
 * 用户 Profile（数据库 Schema）
 */
export interface ProfileDB {
  id: string; // 与 auth.users.id 关联
  username: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用户 Profile（前端使用，camelCase）
 */
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 完整用户信息（含宠物）
 */
export interface UserWithPets extends Profile {
  email?: string;
  pets?: any[];
}

/**
 * 更新 Profile 参数
 */
export interface UpdateProfileParams {
  username?: string;
  bio?: string;
  phone?: string;
}

// ==================== Profile 服务 ====================

class SupabaseProfileService {
  /**
   * 获取当前用户 Profile
   */
  async getCurrentProfile(): Promise<SupabaseResponse<UserWithPets>> {
    logger.query('profiles', 'getCurrentProfile');

    try {
      // 获取当前认证用户
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.error('profiles', 'getCurrentProfile', authError || '未登录');
        const errorObj = authError || {
          message: '未登录',
          code: 'NOT_AUTHENTICATED',
          details: '',
          hint: '',
        };
        return {
          data: null,
          error: errorObj as any,
          success: false,
        };
      }

      // 查询 profile（暂时不关联 pets，避免关系错误）
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // 如果 profile 不存在，自动创建
        if (profileError.code === 'PGRST116') {
          const newProfile = await this.createProfile(user.id, {
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          });
          return newProfile;
        }

        logger.error('profiles', 'getCurrentProfile', profileError);
        return wrapResponse<UserWithPets>(null, profileError);
      }

      // 转换为 camelCase 并添加 email
      const camelProfile = convertKeysToCamel(profile);

      // 单独查询用户的宠物列表（保持 snake_case，与 Pet schema 一致）
      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const pets = petsData || [];

      const result = {
        ...(camelProfile as object),
        email: user.email,
        pets,
      } as unknown as UserWithPets;

      logger.success('profiles', 'getCurrentProfile');
      return { data: result, error: null, success: true };
    } catch (err) {
      logger.error('profiles', 'getCurrentProfile', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 创建用户 Profile
   */
  async createProfile(
    userId: string,
    params: { username: string }
  ): Promise<SupabaseResponse<UserWithPets>> {
    logger.query('profiles', 'createProfile', { userId });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: params.username,
        })
        .select()
        .single();

      if (error) {
        logger.error('profiles', 'createProfile', error);
        return wrapResponse<UserWithPets>(null, error);
      }

      const result = {
        ...(convertKeysToCamel(data) as object),
        pets: [],
      } as unknown as UserWithPets;

      logger.success('profiles', 'createProfile');
      return { data: result, error: null, success: true };
    } catch (err) {
      logger.error('profiles', 'createProfile', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 更新用户 Profile
   */
  async updateProfile(params: UpdateProfileParams): Promise<SupabaseResponse<Profile>> {
    logger.query('profiles', 'updateProfile', params);

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
        .from('profiles')
        .update({
          ...(params.username && { username: params.username }),
          ...(params.bio !== undefined && { bio: params.bio }),
          ...(params.phone !== undefined && { phone: params.phone }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('profiles', 'updateProfile', error);
        return wrapResponse<Profile>(null, error);
      }

      logger.success('profiles', 'updateProfile');
      return { data: convertKeysToCamel(data) as Profile, error: null, success: true };
    } catch (err) {
      logger.error('profiles', 'updateProfile', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 上传头像
   *
   * @param imageUri - 本地图片 URI（file://...）
   */
  async uploadAvatar(imageUri: string): Promise<SupabaseResponse<{ avatarUrl: string }>> {
    logger.query('profiles', 'uploadAvatar');

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

      // 准备文件路径
      const fileName = `${user.id}/avatar_${Date.now()}.jpg`;

      // 处理 file:// URI
      let fileUri = imageUri;
      if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }

      // 使用 FileSystem 读取文件为 base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // 将 base64 转换为 ArrayBuffer
      const arrayBuffer = decode(base64Data);

      // 上传到 Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        logger.error('profiles', 'uploadAvatar', uploadError);
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
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // 更新 profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('profiles', 'uploadAvatar (update profile)', updateError);
        return wrapResponse<{ avatarUrl: string }>(null, updateError);
      }

      logger.success('profiles', 'uploadAvatar');
      return { data: { avatarUrl: publicUrl }, error: null, success: true };
    } catch (err) {
      logger.error('profiles', 'uploadAvatar', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 删除头像
   */
  async deleteAvatar(): Promise<SupabaseResponse<void>> {
    logger.query('profiles', 'deleteAvatar');

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

      // 获取当前头像 URL
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      // 如果有头像，从 Storage 删除
      if (profile?.avatar_url) {
        const path = profile.avatar_url.split('/avatars/')[1];
        if (path) {
          await supabase.storage.from('avatars').remove([path]);
        }
      }

      // 清空 profile 中的头像 URL
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        logger.error('profiles', 'deleteAvatar', error);
        return wrapResponse<void>(null, error);
      }

      logger.success('profiles', 'deleteAvatar');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('profiles', 'deleteAvatar', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取指定用户的 Profile（公开信息）
   */
  async getProfileById(userId: string): Promise<SupabaseResponse<Profile>> {
    logger.query('profiles', 'getProfileById', { userId });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, is_admin, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('profiles', 'getProfileById', error);
        return wrapResponse<Profile>(null, error);
      }

      logger.success('profiles', 'getProfileById');
      return { data: convertKeysToCamel(data) as Profile, error: null, success: true };
    } catch (err) {
      logger.error('profiles', 'getProfileById', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

// 导出单例
export const supabaseProfileService = new SupabaseProfileService();

export default supabaseProfileService;
