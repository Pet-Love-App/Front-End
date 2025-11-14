/**
 * 收藏相关 API
 */

import { apiClient } from '../BaseApi';
import type { CheckFavoriteResponse, Favorite, ToggleFavoriteResponse } from './types';

class CollectApi {
  /**
   * 获取当前用户的收藏列表
   */
  async getFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<Favorite[]>('/api/catfood/favorites/');
    return response;
  }

  /**
   * 收藏猫粮
   */
  async createFavorite(catfoodId: number): Promise<Favorite> {
    const response = await apiClient.post<Favorite>('/api/catfood/favorites/', {
      catfood_id: catfoodId,
    });
    return response;
  }

  /**
   * 取消收藏
   */
  async deleteFavorite(favoriteId: number): Promise<void> {
    await apiClient.delete(`/api/catfood/favorites/${favoriteId}/`);
  }

  /**
   * 切换收藏状态（收藏/取消收藏）
   */
  async toggleFavorite(catfoodId: number): Promise<ToggleFavoriteResponse> {
    const response = await apiClient.post<ToggleFavoriteResponse>(
      '/api/catfood/favorites/toggle/',
      {
        catfood_id: catfoodId,
      }
    );
    return response;
  }

  /**
   * 检查是否已收藏
   */
  async checkFavorite(catfoodId: number): Promise<boolean> {
    const response = await apiClient.post<CheckFavoriteResponse>('/api/catfood/favorites/check/', {
      catfood_id: catfoodId,
    });
    return response.is_favorited;
  }
}

export const collectApi = new CollectApi();
