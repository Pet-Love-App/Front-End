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
    const response = await apiClient.post<RatingResponse>(`/api/catfoods/${catfoodId}/rate/`, {
      score,
      comment: comment || '',
    });
    return response.rating || response;
  }

  /**
   * 获取指定猫粮的所有评分
   */
  async getRatings(
    catfoodId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ ratings: Rating[]; total: number }> {
    const response = await apiClient.get<any>(
      `/api/catfoods/${catfoodId}/ratings/?page=${page}&per_page=${perPage}`
    );
    return {
      ratings: response.ratings || response.results || response,
      total: response.total || response.count || 0,
    };
  }

  /**
   * 获取当前用户对指定猫粮的评分
   */
  async getMyRating(catfoodId: number): Promise<Rating | null> {
    try {
      const response = await apiClient.get<{ rating: Rating | null }>(
        `/api/catfoods/${catfoodId}/my-rating/`
      );
      return response.rating;
    } catch (error) {
      console.warn('⚠️ 加载用户评分失败:', error);
      return null;
    }
  }

  /**
   * 删除评分
   */
  async deleteRating(ratingId: number): Promise<void> {
    await apiClient.delete(`/api/catfoods/ratings/${ratingId}/`);
  }
}

export const ratingApi = new RatingApi();

// 导出类型
export type { CreateRatingRequest, Rating, RatingResponse } from './types';
