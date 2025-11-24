/**
 * 收藏相关类型定义
 */

import type { AIReportData } from '../ai_report/types';
import type { CatFood } from '../catfood/types';

/**
 * 收藏记录
 */
export interface Favorite {
  id: number;
  catfood: CatFood;
  created_at: string;
}

/**
 * 创建收藏的请求参数
 */
export interface CreateFavoriteRequest {
  catfood_id: number;
}

/**
 * 切换收藏状态的响应
 */
export interface ToggleFavoriteResponse {
  detail: string;
  is_favorited: boolean;
  favorite?: Favorite;
}

/**
 * 检查收藏状态的响应
 */
export interface CheckFavoriteResponse {
  is_favorited: boolean;
}

/**
 * 获取收藏列表的响应（分页格式）
 */
export interface GetFavoritesResponse {
  results: Favorite[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * AI报告收藏记录
 */
export interface FavoriteReport {
  id: number;
  report: AIReportData;
  created_at: string;
}

/**
 * 切换报告收藏状态的响应
 */
export interface ToggleFavoriteReportResponse {
  detail: string;
  is_favorited: boolean;
  report_id: number;
  favorite?: FavoriteReport;
}

/**
 * 检查报告收藏状态的响应
 */
export interface CheckFavoriteReportResponse {
  is_favorited: boolean;
}

/**
 * 获取报告收藏列表的响应
 */
export interface GetFavoriteReportsResponse {
  results: FavoriteReport[];
  count: number;
}
