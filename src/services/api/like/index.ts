/**
 * 点赞相关 API
 */

import { apiClient } from '../BaseApi';
import type {
  CheckLikeResponse,
  GetLikeCountResponse,
  GetLikesResponse,
  Like,
  ToggleLikeResponse,
} from './types';

class LikeApi {
  /**
   * 获取当前用户的点赞列表
   */
  async getLikes(): Promise<Like[]> {
    const response = await apiClient.get<GetLikesResponse | Like[]>('/api/catfood/likes/');

    // 处理分页响应或直接数组响应
    if (response && typeof response === 'object' && 'results' in response) {
      return response.results || [];
    }

    // 如果是数组，直接返回
    return Array.isArray(response) ? response : [];
  }

  /**
   * 点赞猫粮
   */
  async createLike(catfoodId: number): Promise<Like> {
    const response = await apiClient.post<Like>('/api/catfood/likes/', {
      catfood_id: catfoodId,
    });
    return response;
  }

  /**
   * 取消点赞
   */
  async deleteLike(likeId: number): Promise<void> {
    await apiClient.delete(`/api/catfood/likes/${likeId}/`);
  }

  /**
   * 切换点赞状态（点赞/取消点赞）
   */
  async toggleLike(catfoodId: number): Promise<ToggleLikeResponse> {
    const response = await apiClient.post<ToggleLikeResponse>('/api/catfood/likes/toggle/', {
      catfood_id: catfoodId,
    });
    return response;
  }

  /**
   * 检查是否已点赞
   */
  async checkLike(catfoodId: number): Promise<boolean> {
    const response = await apiClient.post<CheckLikeResponse>('/api/catfood/likes/check/', {
      catfood_id: catfoodId,
    });
    return response.is_liked;
  }

  /**
   * 获取某个猫粮的点赞总数
   */
  async getLikeCount(catfoodId: number): Promise<number> {
    const response = await apiClient.get<GetLikeCountResponse>(
      `/api/catfood/likes/count/${catfoodId}/`
    );
    return response.like_count;
  }
}

export const likeApi = new LikeApi();

// 导出类型
export type { CheckLikeResponse, GetLikeCountResponse, Like, ToggleLikeResponse } from './types';
