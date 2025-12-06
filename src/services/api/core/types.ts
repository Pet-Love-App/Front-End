/**
 * API 服务核心类型定义
 * 统一的响应格式、错误类型、分页类型等
 */

/**
 * API 错误详情
 */
export interface ApiErrorDetail {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * 统一的 API 响应格式
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiErrorDetail | null;
  success: boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
}

/**
 * 列表响应（简化版）
 */
export interface ListResponse<T> {
  items: T[];
  total: number;
}

/**
 * 删除响应
 */
export interface DeleteResponse {
  message: string;
  success?: boolean;
}

/**
 * 切换状态响应（点赞、收藏等）
 */
export interface ToggleResponse {
  toggled: boolean;
  message: string;
  count?: number;
}

/**
 * ID 类型（支持 number 和 string/UUID）
 */
export type EntityId = number | string;

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: EntityId;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 搜索参数
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  orderBy?: string;
  ascending?: boolean;
}
