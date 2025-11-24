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
      console.log('\n========== 🔍 百度百科搜索请求 ==========');
      console.log('📤 搜索关键词:', request.ingredient);

      const response = await apiClient.post<BaikeSearchResponse>(
        '/api/search/ingredient/info',
        request
      );

      console.log('📥 百度百科搜索响应:');
      console.log(JSON.stringify(response, null, 2));
      console.log('========================================\n');

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
