import { API_ENDPOINTS } from '@/src/config/api';
import {
  jwtResponseSchema,
  type JWTResponse,
  type LoginInput,
  type RefreshTokenInput,
  type RegisterInput,
} from '@/src/schemas/auth.schema';
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
 * 认证服务类
 */
class AuthService {
  /**
   * 用户注册
   */
  async register(data: RegisterInput): Promise<User> {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<User>(response, userSchema);
  }

  /**
   * 用户登录
   */
  async login(data: LoginInput): Promise<JWTResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<JWTResponse>(response, jwtResponseSchema);
  }

  /**
   * 刷新 Token
   */
  async refreshToken(data: RefreshTokenInput): Promise<JWTResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<JWTResponse>(response, jwtResponseSchema);
  }

  /**
   * 验证 Token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USER.ME, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<User>(response, userSchema);
  }

  /**
   * 修改密码
   */
  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.AUTH.SET_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    await handleResponse(response);
  }
}

// 导出单例
export const authService = new AuthService();

// 重新导出类型
export { ApiError } from './types';
export type { JWTResponse, LoginInput, RefreshTokenInput, RegisterInput, User } from './types';
