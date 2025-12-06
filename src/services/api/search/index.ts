/**
 * 搜索 API 服务
 * 提供百度百科等外部搜索功能
 */

import { devError, devLog } from '../core';
import { apiClient } from '../core/httpClient';

// ========== 类型定义 ==========

export interface BaikeSearchRequest {
  ingredient: string;
}

export interface BaikeSearchResponse {
  /** 请求是否成功 */
  ok: boolean;
  /** 百科标题 */
  title?: string;
  /** 百科摘要/提取内容 */
  extract?: string;
  /** 百科 URL */
  url?: string;
  /** 错误信息 */
  error?: string;
}

// ========== 服务实现 ==========

class SearchService {
  /**
   * 搜索百度百科成分信息
   */
  async searchBaike(request: BaikeSearchRequest): Promise<BaikeSearchResponse> {
    try {
      devLog('百度百科搜索', request.ingredient);

      const response = await apiClient.post<BaikeSearchResponse>(
        '/api/search/ingredient/info',
        request
      );

      devLog('百度百科搜索结果', response);
      return response;
    } catch (error) {
      devError('百度百科搜索失败', error);
      throw error;
    }
  }
}

// 导出单例
export const searchService = new SearchService();
