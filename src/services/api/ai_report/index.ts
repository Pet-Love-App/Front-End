/**
 * AI 报告 API 服务
 */

import { apiClient } from '../BaseApi';
import type {
  GenerateReportRequest,
  GenerateReportResponse,
  IngredientInfoRequest,
  IngredientInfoResponse,
} from './types';

class AiReportService {
  /**
   * 生成AI报告
   * @param request 报告生成请求
   * @returns AI生成的报告数据
   */
  async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse> {
    try {
      const response = await apiClient.post<GenerateReportResponse>('/api/ai/llm/chat', request);
      return response;
    } catch (error) {
      console.error('生成AI报告失败:', error);
      throw error;
    }
  }

  /**
   * 查询成分信息（Wikipedia）
   * @param request 成分查询请求
   * @returns 成分信息
   */
  async getIngredientInfo(request: IngredientInfoRequest): Promise<IngredientInfoResponse> {
    try {
      const response = await apiClient.post<IngredientInfoResponse>(
        '/api/ai/ingredient/info',
        request
      );
      return response;
    } catch (error) {
      console.error('查询成分信息失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const aiReportService = new AiReportService();

// 便捷导出
export {
  type GenerateReportRequest,
  type GenerateReportResponse,
  type IngredientInfoRequest,
  type IngredientInfoResponse,
};
