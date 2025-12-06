/**
 * API 服务核心工具函数
 * 统一的数据转换、错误处理等
 */

import type { ApiErrorDetail, ApiResponse, PaginatedResponse } from './types';

/**
 * snake_case 转 camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * camelCase 转 snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * 递归转换对象的所有 key 为 camelCase
 */
export function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as unknown as T;
  }

  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
    }
    return result as T;
  }

  return obj as T;
}

/**
 * 递归转换对象的所有 key 为 snake_case
 */
export function toSnakeCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as unknown as T;
  }

  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
    }
    return result as T;
  }

  return obj as T;
}

/**
 * 包装成功响应
 */
export const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  data,
  error: null,
  success: true,
});

/**
 * 包装错误响应
 */
export const wrapError = <T>(error: ApiErrorDetail): ApiResponse<T> => ({
  data: null,
  error,
  success: false,
});

/**
 * 从错误对象创建 ApiErrorDetail
 */
export const createErrorDetail = (error: unknown): ApiErrorDetail => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as Error & { code?: string }).code,
      details: error,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    return {
      message: (err.message as string) || (err.detail as string) || '操作失败',
      code: err.code as string,
      details: err,
    };
  }

  return { message: '未知错误' };
};

/**
 * 统一的响应包装函数
 */
export const wrapResponse = <T>(data: T | null, error: unknown): ApiResponse<T> => {
  if (error) {
    return wrapError(createErrorDetail(error));
  }
  return wrapSuccess(data as T);
};

/**
 * 转换后端分页响应为统一格式
 */
export function normalizePaginatedResponse<T>(
  response: Record<string, unknown>,
  page: number = 1,
  pageSize: number = 20
): PaginatedResponse<T> {
  const results =
    (response.results as unknown[]) ||
    (response.items as unknown[]) ||
    (response.data as unknown[]) ||
    [];
  const count = (response.count as number) || (response.total as number) || results.length;

  return {
    results: Array.isArray(results) ? results.map((item) => toCamelCase<T>(item)) : [],
    count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
    next: (response.next as string) || null,
    previous: (response.previous as string) || null,
  };
}

/**
 * 从响应中提取数据（处理嵌套结构）
 */
export function extractData<T>(response: unknown, key?: string): T {
  if (response && typeof response === 'object') {
    const resp = response as Record<string, unknown>;

    if (key && key in resp) {
      return toCamelCase<T>(resp[key]);
    }

    // 尝试常见的嵌套 key
    const commonKeys = ['data', 'result', 'item', 'record'];
    for (const k of commonKeys) {
      if (k in resp) {
        return toCamelCase<T>(resp[k]);
      }
    }
  }

  return toCamelCase<T>(response);
}

/**
 * 从响应中提取列表数据
 */
export function extractList<T>(response: unknown, key?: string): T[] {
  if (response && typeof response === 'object') {
    const resp = response as Record<string, unknown>;

    if (key && key in resp) {
      const list = resp[key];
      if (Array.isArray(list)) {
        return list.map((item) => toCamelCase<T>(item));
      }
    }

    // 尝试常见的列表 key
    const commonKeys = ['results', 'items', 'data', 'list', 'records'];
    for (const k of commonKeys) {
      if (k in resp) {
        const list = resp[k];
        if (Array.isArray(list)) {
          return list.map((item) => toCamelCase<T>(item));
        }
      }
    }
  }

  // 如果响应本身是数组
  if (Array.isArray(response)) {
    return response.map((item) => toCamelCase<T>(item));
  }

  return [];
}

/**
 * 安全解析 Schema（带错误处理）
 */
export function safeParseSchema<T>(data: unknown, schema: { parse: (data: unknown) => T }): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Schema 验证失败:', error);
    throw new Error('服务器返回数据格式错误');
  }
}

/**
 * 开发环境日志
 */
export const devLog = (message: string, data?: unknown): void => {
  if (__DEV__) {
    console.log(`🔧 [API] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * 开发环境错误日志
 */
export const devError = (message: string, error?: unknown): void => {
  if (__DEV__) {
    console.error(`❌ [API] ${message}`, error !== undefined ? error : '');
  }
};

/**
 * 构建查询字符串
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};
