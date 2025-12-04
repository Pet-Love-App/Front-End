import { supabase } from '@/src/config/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

/**
 * 存储服务
 * 封装 Supabase Storage 文件上传操作
 */
export const storageService = {
  /**
   * 上传头像
   */
  async uploadAvatar(userId: string, fileUri: string): Promise<string> {
    try {
      // 读取文件为 base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const filePath = `${userId}/avatar.jpg`;
      const contentType = 'image/jpeg';

      // 上传到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType,
          upsert: true, // 覆盖已存在的文件
        });

      if (error) throw error;

      // 获取公开 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  /**
   * 删除头像
   */
  async deleteAvatar(userId: string): Promise<void> {
    const filePath = `${userId}/avatar.jpg`;

    const { error } = await supabase.storage.from('avatars').remove([filePath]);

    if (error) throw error;
  },

  /**
   * 上传宠物照片
   */
  async uploadPetPhoto(fileUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `pet_${Date.now()}.jpg`;
      const filePath = `pets/${fileName}`;

      const { data, error } = await supabase.storage
        .from('pets')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('pets').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload pet photo error:', error);
      throw error;
    }
  },

  /**
   * 上传帖子媒体（图片或视频）
   */
  async uploadPostMedia(
    fileUri: string,
    mediaType: 'image' | 'video'
  ): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const ext = mediaType === 'image' ? 'jpg' : 'mp4';
      const fileName = `post_${Date.now()}.${ext}`;
      const filePath = `post-media/${fileName}`;
      const contentType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';

      const { data, error } = await supabase.storage
        .from('post-media')
        .upload(filePath, decode(base64), {
          contentType,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('post-media').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload post media error:', error);
      throw error;
    }
  },

  /**
   * 批量上传帖子媒体
   */
  async uploadPostMediaBatch(
    files: Array<{ uri: string; type: 'image' | 'video' }>
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadPostMedia(file.uri, file.type)
    );

    return Promise.all(uploadPromises);
  },

  /**
   * 上传猫粮图片
   */
  async uploadCatfoodImage(fileUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `catfood_${Date.now()}.jpg`;
      const filePath = `catfood-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('catfood-images')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('catfood-images').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload catfood image error:', error);
      throw error;
    }
  },

  /**
   * 删除文件
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) throw error;
  },

  /**
   * 从 URL 提取文件路径
   * 用于删除文件时获取路径
   */
  extractPathFromUrl(url: string, bucket: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
      return pathParts[1] || null;
    } catch {
      return null;
    }
  },

  /**
   * 获取文件的公开 URL
   */
  getPublicUrl(bucket: string, filePath: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  },

  /**
   * 列出存储桶中的文件
   */
  async listFiles(bucket: string, folder?: string) {
    const { data, error } = await supabase.storage.from(bucket).list(folder);

    if (error) throw error;
    return data;
  },

  /**
   * 获取文件信息
   */
  async getFileInfo(bucket: string, filePath: string) {
    const { data, error } = await supabase.storage.from(bucket).list(filePath);

    if (error) throw error;
    return data;
  },
};

export default storageService;

