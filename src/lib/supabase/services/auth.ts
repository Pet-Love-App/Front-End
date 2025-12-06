/**
 * Supabase 认证服务
 *
 * - 统一的错误处理和响应格式
 * - TypeScript 类型安全
 * - 自动 Session 管理
 */

import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../client';
import { logger } from '../helpers';

// ==================== 类型定义 ====================

/**
 * 认证响应类型
 */
export interface AuthResponse<T = unknown> {
  data: T | null;
  error: AuthErrorDetail | null;
  success: boolean;
}

/**
 * 认证错误详情
 */
export interface AuthErrorDetail {
  message: string;
  code?: string;
  status?: number;
}

/**
 * 登录参数
 */
export interface LoginParams {
  email: string;
  password: string;
}

/**
 * 注册参数
 */
export interface RegisterParams {
  email: string;
  password: string;
  username: string;
}

/**
 * 登录/注册成功响应
 */
export interface AuthSuccessData {
  user: SupabaseUser;
  session: Session;
}

/**
 * 密码重置参数
 */
export interface ResetPasswordParams {
  email: string;
}

/**
 * 更新密码参数
 */
export interface UpdatePasswordParams {
  newPassword: string;
}

// ==================== 错误处理 ====================

/**
 * 认证错误消息映射（中文本地化）
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': '邮箱或密码错误',
  'Email not confirmed': '邮箱尚未验证，请检查邮箱并点击验证链接',
  'User already registered': '该邮箱已被注册',
  'Password should be at least 6 characters': '密码至少需要6个字符',
  'Unable to validate email address: invalid format': '邮箱格式不正确',
  'Email rate limit exceeded': '请求过于频繁，请稍后再试',
  'For security purposes, you can only request this once every 60 seconds':
    '出于安全考虑，每60秒只能请求一次',
  'New password should be different from the old password': '新密码不能与旧密码相同',
  'Auth session missing!': '登录已过期，请重新登录',
  'JWT expired': '登录已过期，请重新登录',
  'Invalid Refresh Token': '登录已过期，请重新登录',
  'Refresh Token Not Found': '登录已过期，请重新登录',
};

/**
 * 转换 Supabase Auth 错误为用户友好消息
 */
const translateAuthError = (error: AuthError): AuthErrorDetail => {
  const message = error.message || '认证失败';

  // 查找匹配的错误消息
  for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return {
        message: value,
        code: error.code,
        status: error.status,
      };
    }
  }

  // 默认返回原始消息
  return {
    message,
    code: error.code,
    status: error.status,
  };
};

/**
 * 包装认证响应
 */
const wrapAuthResponse = <T>(data: T | null, error: AuthError | null): AuthResponse<T> => {
  if (error) {
    return {
      data: null,
      error: translateAuthError(error),
      success: false,
    };
  }

  return {
    data,
    error: null,
    success: true,
  };
};

// ==================== 认证服务 ====================

class SupabaseAuthService {
  /**
   * 用户登录
   *
   * @param params - 登录参数 { email, password }
   * @returns AuthResponse<AuthSuccessData>
   *
   * @example
   * const { data, error } = await supabaseAuthService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   */
  async login(params: LoginParams): Promise<AuthResponse<AuthSuccessData>> {
    logger.query('auth', 'login', { email: params.email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) {
        logger.error('auth', 'login', error);
        return wrapAuthResponse<AuthSuccessData>(null, error);
      }

      if (!data.user || !data.session) {
        return {
          data: null,
          error: { message: '登录失败，请重试' },
          success: false,
        };
      }

      logger.success('auth', 'login');
      return wrapAuthResponse({ user: data.user, session: data.session }, null);
    } catch (err) {
      logger.error('auth', 'login', err);
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 用户注册
   *
   * @param params - 注册参数 { email, password, username }
   * @returns AuthResponse<AuthSuccessData | null>
   *
   * 注意：如果启用了邮箱验证，session 可能为 null
   *
   * @example
   * const { data, error } = await supabaseAuthService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   username: 'myusername'
   * });
   */
  async register(
    params: RegisterParams
  ): Promise<AuthResponse<AuthSuccessData | { user: SupabaseUser; session: null }>> {
    logger.query('auth', 'register', { email: params.email, username: params.username });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            username: params.username,
          },
        },
      });

      if (error) {
        logger.error('auth', 'register', error);
        return wrapAuthResponse<AuthSuccessData | { user: SupabaseUser; session: null }>(
          null,
          error
        );
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: '注册失败，请重试' },
          success: false,
        };
      }

      // 如果需要邮箱验证，session 为 null
      if (!data.session) {
        logger.success('auth', 'register (需要邮箱验证)');
        return {
          data: { user: data.user, session: null },
          error: null,
          success: true,
        };
      }

      logger.success('auth', 'register');
      return wrapAuthResponse({ user: data.user, session: data.session }, null);
    } catch (err) {
      logger.error('auth', 'register', err);
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<AuthResponse<void>> {
    logger.query('auth', 'logout');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('auth', 'logout', error);
        return wrapAuthResponse<void>(null, error);
      }

      logger.success('auth', 'logout');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('auth', 'logout', err);
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 获取当前 Session
   */
  async getSession(): Promise<AuthResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return wrapAuthResponse<Session>(null, error);
      }

      return wrapAuthResponse(data.session, null);
    } catch (err) {
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<AuthResponse<SupabaseUser>> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return wrapAuthResponse<SupabaseUser>(null, error);
      }

      return wrapAuthResponse(data.user, null);
    } catch (err) {
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 刷新 Session
   *
   * Supabase SDK 会自动刷新，此方法用于手动刷新
   */
  async refreshSession(): Promise<AuthResponse<Session>> {
    logger.query('auth', 'refreshSession');

    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        logger.error('auth', 'refreshSession', error);
        return wrapAuthResponse<Session>(null, error);
      }

      if (!data.session) {
        return {
          data: null,
          error: { message: '刷新失败，请重新登录' },
          success: false,
        };
      }

      logger.success('auth', 'refreshSession');
      return wrapAuthResponse(data.session, null);
    } catch (err) {
      logger.error('auth', 'refreshSession', err);
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 发送密码重置邮件
   */
  async resetPassword(params: ResetPasswordParams): Promise<AuthResponse<void>> {
    logger.query('auth', 'resetPassword', { email: params.email });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
        redirectTo: undefined, // 可配置重定向 URL
      });

      if (error) {
        logger.error('auth', 'resetPassword', error);
        return wrapAuthResponse<void>(null, error);
      }

      logger.success('auth', 'resetPassword');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('auth', 'resetPassword', err);
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 更新密码（需要已登录）
   */
  async updatePassword(params: UpdatePasswordParams): Promise<AuthResponse<SupabaseUser>> {
    logger.query('auth', 'updatePassword');

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: params.newPassword,
      });

      if (error) {
        logger.error('auth', 'updatePassword', error);
        return wrapAuthResponse<SupabaseUser>(null, error);
      }

      logger.success('auth', 'updatePassword');
      return wrapAuthResponse(data.user, null);
    } catch (err) {
      logger.error('auth', 'updatePassword', err);
      return {
        data: null,
        error: { message: String(err) },
        success: false,
      };
    }
  }

  /**
   * 监听认证状态变化
   *
   * @param callback - 状态变化回调
   * @returns 取消订阅函数
   *
   * @example
   * const unsubscribe = supabaseAuthService.onAuthStateChange((event, session) => {
   *   if (event === 'SIGNED_IN') {
   *     console.log('用户已登录', session?.user);
   *   } else if (event === 'SIGNED_OUT') {
   *     console.log('用户已登出');
   *   }
   * });
   *
   * // 清理时调用
   * unsubscribe();
   */
  onAuthStateChange(
    callback: (
      event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
      session: Session | null
    ) => void
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event as any, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}

// 导出单例
export const supabaseAuthService = new SupabaseAuthService();

export default supabaseAuthService;
