/**
 * AI 报告 API 服务
 */

import { apiClient } from '../BaseApi';
import type {
  BackendReportResponse,
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
      console.log('🚀 开始生成AI报告...');
      console.log('📤 请求参数:', { ingredients: request.ingredients.substring(0, 100) + '...' });

      // 后端返回的数据结构
      const backendResponse = await apiClient.post<BackendReportResponse>(
        '/api/ai/llm/chat',
        request
      );

      // 开发环境下打印后端原始响应
      if (__DEV__) {
        console.log('\n========== 📥 后端原始响应数据 ==========');
        console.log('完整响应:', JSON.stringify(backendResponse, null, 2));
        console.log('========================================\n');
      }

      // 转换为前端期望的数据结构
      const frontendResponse: GenerateReportResponse = {
        additives: backendResponse.additive || [],
        identified_nutrients: backendResponse.ingredient || [],
        safety: backendResponse.safety || '',
        nutrient: backendResponse.nutrient || '',
        percentage: backendResponse.percentage ?? null,
        crude_protein: backendResponse.percent_data?.crude_protein ?? null,
        crude_fat: backendResponse.percent_data?.crude_fat ?? null,
        carbohydrates: backendResponse.percent_data?.carbohydrates ?? null,
        crude_fiber: backendResponse.percent_data?.crude_fiber ?? null,
        crude_ash: backendResponse.percent_data?.crude_ash ?? null,
        others: backendResponse.percent_data?.others ?? null,
        tags: backendResponse.tags || [],
      };

      // 开发环境下打印摘要
      if (__DEV__) {
        console.log('📊 数据摘要:', {
          additives: backendResponse.additive?.length || 0,
          nutrients: backendResponse.ingredient?.length || 0,
          percentage: backendResponse.percentage,
          hasActualNutritionData:
            frontendResponse.crude_protein !== null ||
            frontendResponse.crude_fat !== null ||
            frontendResponse.carbohydrates !== null ||
            frontendResponse.crude_fiber !== null ||
            frontendResponse.crude_ash !== null,
        });
        console.log('📊 营养百分比数据:', backendResponse.percent_data);
      }

      return frontendResponse;
    } catch (error) {
      console.error('❌ 生成AI报告失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
      }
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
