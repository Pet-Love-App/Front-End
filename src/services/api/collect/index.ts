/**
 * 收藏相关 API
 */

import { apiClient } from '../BaseApi';
import type {
  Favorite,
  FavoriteReport,
  ToggleFavoriteReportResponse,
  ToggleFavoriteResponse,
} from './types';

class CollectApi {
  /**
   * 获取当前用户的收藏列表
   */
  async getFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<any>('/api/catfoods/favorites/');

    // 适配后端返回格式: { favorites: [...] }
    if (response && typeof response === 'object') {
      if ('favorites' in response) {
        return response.favorites || [];
      }
      if ('results' in response) {
        return response.results || [];
      }
    }

    // 如果是数组，直接返回
    return Array.isArray(response) ? response : [];
  }

  /**
   * 切换收藏状态（收藏/取消收藏）
   */
  async toggleFavorite(catfoodId: number): Promise<ToggleFavoriteResponse> {
    const response = await apiClient.post<ToggleFavoriteResponse>(
      `/api/catfoods/${catfoodId}/favorite/`
    );
    return response;
  }

  // ========== 报告收藏相关 ==========

  /**
   * 获取用户收藏的AI报告列表
   */
  async getFavoriteReports(): Promise<FavoriteReport[]> {
    const response = await apiClient.get<any>('/api/ai/favorites/');
    // 适配后端返回格式: { favorites: [...] }
    return response.favorites || response.results || [];
  }

  /**
   * 切换AI报告收藏状态（收藏/取消收藏）
   */
  async toggleFavoriteReport(catfoodId: number): Promise<ToggleFavoriteReportResponse> {
    const response = await apiClient.post<ToggleFavoriteReportResponse>(
      '/api/ai/favorites/toggle/',
      {
        catfood_id: catfoodId,
      }
    );
    return response;
  }

  /**
   * 删除AI报告收藏
   */
  async deleteFavoriteReport(catfoodId: number): Promise<void> {
    await apiClient.delete(`/api/ai/favorites/${catfoodId}/delete/`);
  }
}

export const collectApi = new CollectApi();

// 导出类型
export type {
  CheckFavoriteReportResponse,
  CheckFavoriteResponse,
  Favorite,
  FavoriteReport,
  GetFavoriteReportsResponse,
  GetFavoritesResponse,
  ToggleFavoriteReportResponse,
  ToggleFavoriteResponse,
} from './types';
