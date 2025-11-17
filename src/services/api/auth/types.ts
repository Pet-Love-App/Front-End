/**
 * 认证相关的类型定义
 * 重新导出 schemas 中的类型，保持统一的导入路径
 */

export type {
  ChangePasswordInput,
  JWTResponse,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from '@/src/schemas/auth.schema';

// User 类型从 user.schema 导出
export type { User } from '@/src/schemas/user.schema';

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
