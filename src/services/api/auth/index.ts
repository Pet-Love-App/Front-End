import { API_ENDPOINTS } from '@/src/config/api';
import { type JWTResponse, type LoginInput, type RegisterInput } from '@/src/schemas/auth.schema';
import { ApiError } from './types';

import { userSchema, type User } from '@/src/schemas/user.schema';
/**
 * 处理 API 响应（用于不使用 BaseApi 的特殊情况）
 */
async function handleResponse<T>(response: Response, schema?: any): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 提取详细的错误信息
    let errorMessage = `请求失败: ${response.status}`;

    if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.username) {
      // Django 返回的字段级错误
      const usernameError = Array.isArray(errorData.username)
        ? errorData.username[0]
        : errorData.username;
      // 翻译常见的英文错误信息
      if (usernameError.includes('already exists')) {
        errorMessage = '该用户名已被注册，请使用其他用户名';
      } else {
        errorMessage = `用户名: ${usernameError}`;
      }
    } else if (errorData.password) {
      const passwordError = Array.isArray(errorData.password)
        ? errorData.password[0]
        : errorData.password;
      errorMessage = `密码: ${passwordError}`;
    } else if (errorData.non_field_errors) {
      errorMessage = Array.isArray(errorData.non_field_errors)
        ? errorData.non_field_errors[0]
        : errorData.non_field_errors;
    }

    // 打印完整的错误数据用于调试
    console.error('API 错误详情:', JSON.stringify(errorData, null, 2));

    throw new ApiError(errorMessage, response.status, errorData);
  }

  const data = await response.json();

  // 如果提供了 schema，则进行验证
  if (schema) {
    try {
      return schema.parse(data);
    } catch (error: any) {
      console.error('数据验证失败:', error);
      throw new ApiError('服务器返回数据格式错误', 500, error.issues);
    }
  }

  return data;
}

/**
 * 认证服务类（适配 Supabase Auth）
 */
class AuthService {
  /**
   * 用户注册
   * @param data 注册数据 { email, password, username }
   */
  async register(data: RegisterInput): Promise<{ user: User; session: JWTResponse }> {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<{ user: User; session: JWTResponse }>(response);
  }

  /**
   * 用户登录
   * @param data 登录数据 { email, password }
   */
  async login(data: LoginInput): Promise<{ user: User; session: JWTResponse }> {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<{ user: User; session: JWTResponse }>(response);
  }

  /**
   * 用户登出
   * @param token 访问令牌
   */
  async logout(token: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    await handleResponse(response);
  }

  /**
   * 刷新 Token
   * @param refreshToken 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<JWTResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return handleResponse<JWTResponse>(response);
  }

  /**
   * 获取当前用户信息
   * @param token 访问令牌
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(API_ENDPOINTS.AUTH.GET_PROFILE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<User>(response, userSchema);
  }

  /**
   * 更新用户资料
   * @param token 访问令牌
   * @param data 要更新的资料 { username?, bio? }
   */
  async updateProfile(token: string, data: { username?: string; bio?: string }): Promise<User> {
    const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return handleResponse<User>(response, userSchema);
  }

  /**
   * 上传头像
   * @param token 访问令牌
   * @param imageUri 图片本地 URI
   */
  async uploadAvatar(token: string, imageUri: string): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await fetch(API_ENDPOINTS.AUTH.UPLOAD_AVATAR, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse<{ avatar_url: string }>(response);
  }

  /**
   * 删除头像
   * @param token 访问令牌
   */
  async deleteAvatar(token: string): Promise<{ message: string }> {
    const response = await fetch(API_ENDPOINTS.AUTH.DELETE_AVATAR, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<{ message: string }>(response);
  }

  /**
   * 修改密码
   * @param token 访问令牌
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(
    token: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    return handleResponse<{ message: string }>(response);
  }

  /**
   * 重置密码（发送邮件）
   * @param email 用户邮箱
   */
  async resetPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return handleResponse<{ message: string }>(response);
  }
}

// 导出单例
export const authService = new AuthService();

// 重新导出类型
export { ApiError } from './types';
export type { JWTResponse, LoginInput, RefreshTokenInput, RegisterInput, User } from './types';
