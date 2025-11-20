/**
 * 评分相关 API
 */

import { apiClient } from '../BaseApi';
import type { Rating, RatingResponse } from './types';

class RatingApi {
  /**
   * 创建或更新评分
   */
  async rateCatFood(catfoodId: number, score: number, comment?: string): Promise<Rating> {
    const response = await apiClient.post<RatingResponse>('/api/catfood/ratings/', {
      catfood_id: catfoodId,
      score,
      comment: comment || '',
    });
    return response.rating;
  }

  /**
   * 获取当前用户对指定猫粮的评分
   */
  async getMyRating(catfoodId: number): Promise<Rating | null> {
    try {
      const response = await apiClient.get<Rating>(
        `/api/catfood/ratings/my/?catfood_id=${catfoodId}`
      );
      return response;
    } catch (error: any) {
      // 404表示尚未评分，这是正常情况
      if (error.response?.status === 404 || error.message?.includes('尚未评分')) {
        console.log('ℹ️ 用户尚未对该猫粮评分');
        return null;
      }
      // 其他错误才抛出
      console.error('❌ 获取评分失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定猫粮的所有评分
   */
  async getRatings(catfoodId: number): Promise<Rating[]> {
    const response = await apiClient.get<Rating[]>(`/api/catfood/ratings/?catfood_id=${catfoodId}`);
    return response;
  }

  /**
   * 删除评分
   */
  async deleteRating(ratingId: number): Promise<void> {
    await apiClient.delete(`/api/catfood/ratings/${ratingId}/`);
  }
}

export const ratingApi = new RatingApi();

// 导出类型
export type { CreateRatingRequest, Rating, RatingResponse } from './types';
