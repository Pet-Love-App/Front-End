/**
 * 评分相关类型定义
 */

/**
 * 评分记录
 */
export interface Rating {
  id: number;
  catfood_id: number;
  user_name: string;
  score: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

/**
 * 创建评分的请求参数
 */
export interface CreateRatingRequest {
  catfood_id: number;
  score: number;
  comment?: string;
}

/**
 * 评分响应
 */
export interface RatingResponse {
  detail: string;
  rating: Rating;
}
