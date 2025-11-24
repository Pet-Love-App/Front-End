/**
 * 搜索 API 服务
 * 提供百度百科等外部搜索功能
 */

import { apiClient } from '../BaseApi';
import type { BaikeSearchRequest, BaikeSearchResponse } from './types';

class SearchService {
  /**
   * 搜索百度百科成分信息
   * @param request 搜索请求
   * @returns 百度百科信息
   */
  async searchBaike(request: BaikeSearchRequest): Promise<BaikeSearchResponse> {
    try {
      console.log('🔍 开始搜索百度百科:', request.ingredient);

      const response = await apiClient.post<BaikeSearchResponse>(
        '/api/search/ingredient/info',
        request
      );

      if (__DEV__) {
        console.log('📖 百度百科搜索结果:', {
          ok: response.ok,
          title: response.title,
          hasExtract: !!response.extract,
        });
      }

      return response;
    } catch (error) {
      console.error('❌ 百度百科搜索失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const searchService = new SearchService();

// 便捷导出
export { type BaikeSearchRequest, type BaikeSearchResponse };
