import { API_ENDPOINTS } from '@/src/config/api';
import { type JWTResponse, type LoginInput, type RegisterInput } from '@/src/schemas/auth.schema';
import { userSchema, type User } from '@/src/schemas/user.schema';
import { AppError } from '@/src/utils/errorHandler';
import { apiClient } from '../BaseApi';

/**
 * 翻译认证错误信息
 */
function translateAuthError(error: any): string {
  const message = error.message || String(error);

  // 翻译常见的英文错误信息为中文
  if (message.includes('Username already exists')) {
    return '该用户名已被注册，请使用其他用户名';
  } else if (message.includes('Email already exists') || message.includes('already registered')) {
    return '该邮箱已被注册，请使用其他邮箱';
  } else if (message.includes('Invalid credentials')) {
    return '邮箱或密码错误';
  } else if (message.includes('verify your email')) {
    return '请先验证您的邮箱';
  } else if (message.includes('Email not confirmed')) {
    return '邮箱尚未验证，请检查您的邮箱并点击验证链接';
  }

  return message;
}

/**
 * 认证服务类（使用 BaseApi 统一管理请求）
 */
class AuthService {
  /**
   * 用户注册
   * @param data 注册数据 { email, password, username }
   */
  async register(data: RegisterInput): Promise<{ user: User; session: JWTResponse | null }> {
    try {
      console.log('📝 开始注册请求');
      const result = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
      return {
        user: result.user,
        session: result.session, // 可能为 null（需要邮箱验证）
      };
    } catch (error: any) {
      const translatedMessage = translateAuthError(error);
      throw new AppError(translatedMessage, error.code || 'AUTH_ERROR', error.statusCode);
    }
  }

  /**
   * 用户登录
   * @param data 登录数据 { email, password }
   */
  async login(data: LoginInput): Promise<{ user: User; session: JWTResponse }> {
    try {
      console.log('🔐 开始登录请求');
      const result = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
      return {
        user: result.user,
        session: result.session,
      };
    } catch (error: any) {
      const translatedMessage = translateAuthError(error);
      throw new AppError(translatedMessage, error.code || 'AUTH_ERROR', error.statusCode);
    }
  }

  /**
   * 用户登出
   * @param token 访问令牌
   */
  async logout(token: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error: any) {
      // 登出失败不影响本地清理
      console.warn('登出请求失败，但继续清理本地状态:', error);
    }
  }

  /**
   * 刷新 Token
   * @param refreshToken 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<JWTResponse> {
    try {
      const result = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refresh_token: refreshToken,
      });
      return result.session || result;
    } catch (error: any) {
      throw new AppError('刷新令牌失败', 'TOKEN_REFRESH_FAILED', error.statusCode);
    }
  }

  /**
   * 获取当前用户信息
   * @param token 访问令牌
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      const result = await apiClient.get(API_ENDPOINTS.AUTH.GET_PROFILE);
      // 验证返回数据
      return userSchema.parse(result.user || result);
    } catch (error: any) {
      throw new AppError('获取用户信息失败', 'GET_USER_FAILED', error.statusCode);
    }
  }

  /**
   * 更新用户资料
   * @param token 访问令牌
   * @param data 更新数据
   */
  async updateProfile(token: string, data: Partial<User>): Promise<User> {
    try {
      const result = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
      return userSchema.parse(result.user || result);
    } catch (error: any) {
      throw new AppError('更新用户资料失败', 'UPDATE_PROFILE_FAILED', error.statusCode);
    }
  }

  /**
   * 上传头像
   * @param token 访问令牌
   * @param file 头像文件
   */
  async uploadAvatar(token: string, file: any): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      return await apiClient.upload(API_ENDPOINTS.AUTH.UPLOAD_AVATAR, formData);
    } catch (error: any) {
      throw new AppError('上传头像失败', 'UPLOAD_AVATAR_FAILED', error.statusCode);
    }
  }

  /**
   * 删除头像
   * @param token 访问令牌
   */
  async deleteAvatar(token: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.AUTH.DELETE_AVATAR);
    } catch (error: any) {
      throw new AppError('删除头像失败', 'DELETE_AVATAR_FAILED', error.statusCode);
    }
  }

  /**
   * 修改密码
   * @param token 访问令牌
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      throw new AppError('修改密码失败', 'CHANGE_PASSWORD_FAILED', error.statusCode);
    }
  }

  /**
   * 重置密码请求
   * @param email 邮箱
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    } catch (error: any) {
      throw new AppError('发送重置密码邮件失败', 'RESET_PASSWORD_FAILED', error.statusCode);
    }
  }
}

// 导出单例
export const authService = new AuthService();

// 导出类型和类
export { ApiError } from './types';
export type { ChangePasswordInput, JWTResponse, LoginInput, RegisterInput, User } from './types';
