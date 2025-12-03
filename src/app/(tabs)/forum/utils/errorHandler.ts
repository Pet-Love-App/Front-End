/**
 * 统一错误处理工具
 * 提供一致的错误提示和日志记录
 */

import { Alert } from 'react-native';

export interface ErrorHandlerOptions {
  /** 错误上下文，用于日志记录 */
  context?: string;
  /** 是否显示用户提示，默认 true */
  showAlert?: boolean;
  /** 自定义错误标题 */
  title?: string;
  /** 自定义错误消息 */
  customMessage?: string;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * 处理错误并显示用户友好的提示
 * @param error 错误对象
 * @param options 处理选项
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  const { context = 'Unknown', showAlert = true, title = '错误', customMessage, onError } = options;

  // 1. 标准化错误对象
  const err = error instanceof Error ? error : new Error(String(error));

  // 2. 记录错误日志（生产环境可接入错误监控服务）
  console.error(`[${context}]`, err);

  // 3. 触发错误回调
  onError?.(err);

  // 4. 显示用户提示
  if (showAlert) {
    const message = customMessage || err.message || '操作失败，请重试';
    Alert.alert(title, message);
  }

  return err;
}

/**
 * 处理 API 错误
 * 提取并格式化 API 返回的错误信息
 */
export function handleApiError(error: unknown, context?: string) {
  let message = '网络请求失败，请检查网络连接';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const apiError = error as any;
    if (apiError.response?.data?.message) {
      message = apiError.response.data.message;
    } else if (apiError.response?.data?.error) {
      message = apiError.response.data.error;
    }
  }

  return handleError(new Error(message), {
    context: context || 'API',
    title: '请求失败',
  });
}

/**
 * 处理验证错误
 * 用于表单验证失败等场景
 */
export function handleValidationError(message: string, context?: string) {
  return handleError(new Error(message), {
    context: context || 'Validation',
    title: '提示',
  });
}

/**
 * 静默处理错误（仅记录日志，不显示提示）
 */
export function logError(error: unknown, context?: string) {
  return handleError(error, {
    context,
    showAlert: false,
  });
}

/**
 * 创建错误处理器工厂
 * 用于创建带有固定上下文的错误处理器
 */
export function createErrorHandler(context: string) {
  return {
    handle: (error: unknown, options?: Omit<ErrorHandlerOptions, 'context'>) =>
      handleError(error, { ...options, context }),
    handleApi: (error: unknown) => handleApiError(error, context),
    handleValidation: (message: string) => handleValidationError(message, context),
    log: (error: unknown) => logError(error, context),
  };
}
