/**
 * 统一错误处理工具
 * 处理 API 错误、网络错误、验证错误等
 */

import { ZodError } from 'zod';

/**
 * API 错误类型
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * 标准化的错误对象
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * 错误代码常量
 */
export const ErrorCodes = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // 认证错误
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',

  // 权限错误
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // 资源错误
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // 服务器错误
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // 业务错误
  BUSINESS_ERROR: 'BUSINESS_ERROR',

  // 未知错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * 从 HTTP 状态码获取错误代码
 */
function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ErrorCodes.INVALID_INPUT;
    case 401:
      return ErrorCodes.AUTH_REQUIRED;
    case 403:
      return ErrorCodes.PERMISSION_DENIED;
    case 404:
      return ErrorCodes.NOT_FOUND;
    case 409:
      return ErrorCodes.ALREADY_EXISTS;
    case 422:
      return ErrorCodes.VALIDATION_ERROR;
    case 500:
      return ErrorCodes.SERVER_ERROR;
    case 503:
      return ErrorCodes.SERVICE_UNAVAILABLE;
    default:
      return ErrorCodes.UNKNOWN_ERROR;
  }
}

/**
 * 解析 API 错误响应
 */
export function parseApiError(error: any): AppError {
  // 网络错误
  if (!error.response && error.message) {
    if (error.message.includes('Network request failed')) {
      return new AppError('网络连接失败，请检查网络设置', ErrorCodes.NETWORK_ERROR);
    }
    if (error.message.includes('timeout')) {
      return new AppError('请求超时，请稍后重试', ErrorCodes.TIMEOUT_ERROR);
    }
  }

  // API 响应错误
  if (error.response || (error.status && typeof error.status === 'number')) {
    const status = error.response ? error.response.status : error.status;
    const data = error.response ? error.response.data : error;
    const errorCode = getErrorCodeFromStatus(status);

    // 提取错误消息
    let message = '请求失败';
    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (data.detail) {
        message = data.detail;
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else if (data.errors) {
        // 处理字段级错误
        const fieldErrors = Object.entries(data.errors)
          .map(
            ([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
          )
          .join('\n');
        message = fieldErrors || '输入数据有误';
      }
    }

    // 特殊处理一些常见错误
    if (status === 401) {
      message = '登录已过期，请重新登录';
    } else if (status === 403) {
      message = '没有权限执行此操作';
    } else if (status === 404) {
      message = '请求的资源不存在';
    } else if (status === 500) {
      message = '服务器错误，请稍后重试';
    }

    return new AppError(message, errorCode, status, data);
  }

  // Zod 验证错误
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    const message = firstError
      ? `${firstError.path.join('.')}: ${firstError.message}`
      : '数据验证失败';
    return new AppError(message, ErrorCodes.VALIDATION_ERROR, undefined, error.errors);
  }

  // 其他错误
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCodes.UNKNOWN_ERROR);
  }

  // 未知错误
  return new AppError('发生未知错误', ErrorCodes.UNKNOWN_ERROR);
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: AppError): string {
  // 根据错误代码返回友好的消息
  switch (error.code) {
    case ErrorCodes.NETWORK_ERROR:
      return '网络连接失败，请检查网络设置';
    case ErrorCodes.TIMEOUT_ERROR:
      return '请求超时，请稍后重试';
    case ErrorCodes.AUTH_REQUIRED:
    case ErrorCodes.AUTH_EXPIRED:
      return '登录已过期，请重新登录';
    case ErrorCodes.AUTH_INVALID:
      return '登录信息无效';
    case ErrorCodes.PERMISSION_DENIED:
      return '没有权限执行此操作';
    case ErrorCodes.NOT_FOUND:
      return '请求的资源不存在';
    case ErrorCodes.ALREADY_EXISTS:
      return '资源已存在';
    case ErrorCodes.VALIDATION_ERROR:
    case ErrorCodes.INVALID_INPUT:
      return error.message || '输入数据有误';
    case ErrorCodes.SERVER_ERROR:
      return '服务器错误，请稍后重试';
    case ErrorCodes.SERVICE_UNAVAILABLE:
      return '服务暂时不可用，请稍后重试';
    default:
      return error.message || '操作失败，请重试';
  }
}

/**
 * 处理错误并返回用户友好的消息
 */
export function handleError(error: any): string {
  const appError = parseApiError(error);
  const friendlyMessage = getUserFriendlyMessage(appError);

  // 在开发环境下打印详细错误
  if (__DEV__) {
    console.error('Error Details:', {
      code: appError.code,
      message: appError.message,
      status: appError.status,
      details: appError.details,
    });
  }

  return friendlyMessage;
}

/**
 * 错误日志记录
 */
export function logError(error: any, context?: string) {
  const appError = parseApiError(error);

  const errorLog = {
    code: appError.code,
    message: appError.message,
    status: appError.status,
    details: appError.details,
    timestamp: new Date().toISOString(),
  };

  console.error(`[Error${context ? ` - ${context}` : ''}]:`, errorLog);

  // 在生产环境中将错误发送到错误追踪服务
  if (__DEV__) {
    // 开发环境：仅控制台输出
    console.debug('[Dev] Full error details:', errorLog);
  } else {
    // 生产环境：可以集成 Sentry 或其他错误追踪服务
    // 示例：
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(appError, {
    //     extra: errorLog,
    //   });
    // }

    // 对于严重错误（5xx），可以考虑发送到后端日志系统
    if (appError.status && appError.status >= 500) {
      // 可以调用后端日志接口记录严重错误
      // logErrorToBackend(errorLog).catch(console.error);
    }
  }
}

/**
 * 检查是否是认证错误
 */
export function isAuthError(error: any): boolean {
  const appError = parseApiError(error);
  return ([ErrorCodes.AUTH_REQUIRED, ErrorCodes.AUTH_EXPIRED, ErrorCodes.AUTH_INVALID] as string[]).includes(
    appError.code
  );
}

/**
 * 检查是否是网络错误
 */
export function isNetworkError(error: any): boolean {
  const appError = parseApiError(error);
  return ([ErrorCodes.NETWORK_ERROR, ErrorCodes.TIMEOUT_ERROR] as string[]).includes(appError.code);
}

/**
 * 检查是否是服务器错误
 */
export function isServerError(error: any): boolean {
  const appError = parseApiError(error);
  return ([ErrorCodes.SERVER_ERROR, ErrorCodes.SERVICE_UNAVAILABLE] as string[]).includes(appError.code);
}
