/**
 * 收藏相关类型定义
 */

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
