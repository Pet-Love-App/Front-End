/**
 * 搜索 API 服务
 * 提供百度百科等外部搜索功能
 */

import { API_BASE_URL } from '@/src/config/env';

import { devLog } from '../core';

// ========== 类型定义 ==========

export interface BaikeSearchRequest {
  ingredient: string;
}

export interface BaikeSearchResponse {
  /** 请求是否成功 */
  ok: boolean;
  /** 提示消息 */
  message?: string;
  /** 百科数据 */
  data?: {
    /** 百科标题 */
    title?: string;
    /** 百科摘要/提取内容 */
    extract?: string;
    /** 百科 URL */
    url?: string;
  };
  /** 错误信息 */
  error?: {
    code: string;
    message: string;
  };
}

// ========== 服务实现 ==========

class SearchService {
  /**
   * 搜索百度百科成分信息
   * 未找到时静默返回 { ok: false }，不抛出错误、不打印错误日志
   */
  async searchBaike(request: BaikeSearchRequest): Promise<BaikeSearchResponse> {
    try {
      devLog('百度百科搜索', request.ingredient);

      // 直接使用 fetch，避免 httpClient 自动记录错误
      const response = await fetch(`${API_BASE_URL}/api/search/ingredient/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      // 成功找到
      if (data.ok && data.data) {
        devLog('百度百科搜索成功', data.data.title);
        return data;
      }

      // 未找到是正常情况，静默返回
      devLog('百度百科未找到相关信息', request.ingredient);
      return { ok: false, message: '未找到相关信息' };
    } catch {
      // 网络错误等，静默返回失败
      devLog('百度百科搜索请求失败', request.ingredient);
      return { ok: false, message: '搜索服务不可用' };
    }
  }
}

// 导出单例
export const searchService = new SearchService();
