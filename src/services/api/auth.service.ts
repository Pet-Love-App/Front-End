import { API_ENDPOINTS } from '@/src/config/api';
import {
  jwtResponseSchema,
  userSchema,
  type JWTResponse,
  type LoginInput,
  type RefreshTokenInput,
  type RegisterInput,
  type User,
} from '@/src/schemas/auth.schema';

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 处理 API 响应
 */
async function handleResponse<T>(response: Response, schema?: any): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || errorData.message || `请求失败: ${response.status}`,
      response.status,
      errorData
    );
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
 * 认证服务
 */
export const authService = {
  /**
   * 用户注册
   */
  async register(data: RegisterInput): Promise<User> {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<User>(response, userSchema);
  },

  /**
   * 用户登录
   */
  async login(data: LoginInput): Promise<JWTResponse> {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<JWTResponse>(response, jwtResponseSchema);
  },

  /**
   * 刷新 Token
   */
  async refreshToken(data: RefreshTokenInput): Promise<JWTResponse> {
    const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<JWTResponse>(response, jwtResponseSchema);
  },

  /**
   * 验证 Token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_TOKEN, {
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
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USER_ME, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<User>(response, userSchema);
  },

  /**
   * 修改密码
   */
  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.SET_PASSWORD, {
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
  },
};
