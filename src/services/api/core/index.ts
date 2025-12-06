/**
 * API 核心模块统一导出
 */

// 类型
export type {
  ApiErrorDetail,
  ApiResponse,
  DeleteResponse,
  ListResponse,
  PaginatedResponse,
  PaginationParams,
  ToggleResponse,
} from './types';

// 工具函数
export {
  buildQueryString,
  camelToSnake,
  createErrorDetail,
  devError,
  devLog,
  extractData,
  extractList,
  normalizePaginatedResponse,
  safeParseSchema,
  snakeToCamel,
  toCamelCase,
  toSnakeCase,
  wrapError,
  wrapResponse,
  wrapSuccess,
} from './helpers';

// HTTP 客户端
export { apiClient, httpClient } from './httpClient';
export type { RequestOptions } from './httpClient';
