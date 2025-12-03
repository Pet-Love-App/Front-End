/**
 * 点赞相关类型定义
 */

import type { CatFood } from '../catfood/types';

/**
 * 点赞记录
 */
export interface Like {
  id: number;
  catfood: CatFood;
  created_at: string;
}

/**
 * 创建点赞的请求参数
 */
export interface CreateLikeRequest {
  catfood_id: number;
}

/**
 * 切换点赞状态的响应
 */
export interface ToggleLikeResponse {
  detail: string;
  is_liked: boolean;
  like?: Like;
  like_count: number;
}

/**
 * 检查点赞状态的响应
 */
export interface CheckLikeResponse {
  is_liked: boolean;
}

/**
 * 获取点赞列表的响应（分页格式）
 */
export interface GetLikesResponse {
  results: Like[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * 获取点赞数量的响应
 */
export interface GetLikeCountResponse {
  catfood_id: number;
  like_count: number;
}
