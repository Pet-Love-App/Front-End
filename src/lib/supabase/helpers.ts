/**
 * Supabase 辅助函数
 * 提供常用的数据库操作封装
 */

import { logger as appLogger } from '@/src/utils/logger';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './client';

/**
 * Supabase 响应类型
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
  success: boolean;
}

/**
 * 包装Supabase响应为统一格式
 */
export const wrapResponse = <T>(
  data: T | null,
  error: PostgrestError | null
): SupabaseResponse<T> => {
  return {
    data,
    error,
    success: !error && data !== null,
  };
};

/**
 * 处理Supabase错误
 */
export const handleSupabaseError = (error: PostgrestError | null, context: string) => {
  if (error) {
    appLogger.error(`Supabase错误 [${context}]`, new Error(error.message), {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
  }
  return null;
};

/**
 * 转换snake_case到camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * 递归转换对象的key从snake_case到camelCase
 */
export const convertKeysToCamel = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamel);
  }

  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce(
      (acc, key) => {
        const camelKey = snakeToCamel(key);
        acc[camelKey] = convertKeysToCamel((obj as Record<string, unknown>)[key]);
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  return obj;
};

/**
 * 构建percentData从营养成分字段
 */
export const buildPercentData = (data: {
  crude_protein?: number;
  crude_fat?: number;
  carbohydrates?: number;
  crude_fiber?: number;
  crude_ash?: number;
  others?: number;
}) => {
  const percentData: Record<string, number> = {};

  if (data.crude_protein !== null && data.crude_protein !== undefined) {
    percentData.protein = data.crude_protein;
  }
  if (data.crude_fat !== null && data.crude_fat !== undefined) {
    percentData.fat = data.crude_fat;
  }
  if (data.carbohydrates !== null && data.carbohydrates !== undefined) {
    percentData.carbohydrates = data.carbohydrates;
  }
  if (data.crude_fiber !== null && data.crude_fiber !== undefined) {
    percentData.fiber = data.crude_fiber;
  }
  if (data.crude_ash !== null && data.crude_ash !== undefined) {
    percentData.ash = data.crude_ash;
  }
  if (data.others !== null && data.others !== undefined) {
    percentData.others = data.others;
  }

  return Object.keys(percentData).length > 0 ? percentData : null;
};

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 计算分页的offset和limit
 */
export const calculatePagination = ({ page = 1, pageSize = 20 }: PaginationParams) => {
  return {
    from: (page - 1) * pageSize,
    to: page * pageSize - 1,
  };
};

/**
 * 获取当前用户ID
 */
export const getCurrentUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
};

/**
 * 检查用户是否已认证
 */
export const isAuthenticated = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

/**
 * 日志工具（使用统一的 logger）
 */
export const logger = {
  query: (table: string, operation: string, params?: unknown) => {
    appLogger.debug('Supabase Query', { table, operation, params: params || null });
  },
  success: (table: string, operation: string, count?: number) => {
    appLogger.info('Supabase Success', { table, operation, count });
  },
  error: (table: string, operation: string, error: unknown) => {
    appLogger.error('Supabase Error', error as Error, { table, operation });
  },
};
