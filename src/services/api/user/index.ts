import { API_ENDPOINTS } from '@/src/config/api';
import {
  avatarUploadResponseSchema,
  deleteResponseSchema,
  userSchema,
  type AvatarUploadResponse,
  type DeleteResponse,
  type User,
} from '@/src/schemas/user.schema';
import { apiClient } from '../BaseApi';

/**
 * 处理响应并验证 Schema
 */
function validateResponse<T>(data: any, schema: any): T {
  try {
    return schema.parse(data);
  } catch (error: any) {
    console.error('数据验证失败:', error);
    throw new Error('服务器返回数据格式错误');
  }
}

/**
 * 用户服务类
 */
class UserService {
  /**
   * 获取当前用户完整信息（含头像、宠物）
   */
  async getCurrentUser(): Promise<User> {
    const data = await apiClient.get(API_ENDPOINTS.USER.ME);
    return validateResponse<User>(data, userSchema);
  }

  /**
   * 获取指定用户信息
   */
  async getUser(userId: number): Promise<User> {
    const data = await apiClient.get(API_ENDPOINTS.USER.DETAIL(userId));
    return validateResponse<User>(data, userSchema);
  }

  /**
   * 上传头像
   * @param imageUri 图片的本地 URI（从 ImagePicker 获取）
   */
  async uploadAvatar(imageUri: string): Promise<AvatarUploadResponse> {
    const formData = new FormData();

    // 从 URI 中提取文件扩展名
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const data = await apiClient.upload(API_ENDPOINTS.USER.AVATAR, formData);
    return validateResponse<AvatarUploadResponse>(data, avatarUploadResponseSchema);
  }

  /**
   * 删除头像
   */
  async deleteAvatar(): Promise<DeleteResponse> {
    const data = await apiClient.delete(API_ENDPOINTS.USER.AVATAR);
    return validateResponse<DeleteResponse>(data, deleteResponseSchema);
  }
}

// 导出单例
export const userService = new UserService();

// 重新导出类型
export type { AvatarUploadResponse, DeleteResponse, User } from './types';
