/**
 * AI 报告 API 服务
 */

import { apiClient } from '../BaseApi';
import type {
  AIReportData,
  BackendReportResponse,
  CheckReportExistsResponse,
  GenerateReportRequest,
  GenerateReportResponse,
  IngredientInfoRequest,
  IngredientInfoResponse,
  SaveReportRequest,
  SaveReportResponse,
} from './types';

class AiReportService {
  /**
   * 检查指定猫粮是否已有 AI 分析报告
   * @param catfoodId 猫粮 ID
   * @returns 报告存在性检查结果
   */
  async checkReportExists(catfoodId: number): Promise<CheckReportExistsResponse> {
    try {
      console.log(`🔍 检查猫粮 ${catfoodId} 的报告是否存在...`);
      const response = await apiClient.get<CheckReportExistsResponse>(
        `/api/ai/${catfoodId}/exists/`
      );
      console.log('✅ 检查结果:', response);
      return response;
    } catch (error) {
      console.error('❌ 检查报告存在性失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定猫粮的 AI 分析报告
   * @param catfoodId 猫粮 ID
   * @returns AI 分析报告数据
   */
  async getReport(catfoodId: number): Promise<AIReportData> {
    try {
      console.log(`📥 获取猫粮 ${catfoodId} 的 AI 报告...`);
      const response = await apiClient.get<AIReportData>(`/api/ai/${catfoodId}/`);
      console.log('✅ 报告获取成功:', response);
      return response;
    } catch (error) {
      console.error('❌ 获取报告失败:', error);
      throw error;
    }
  }

  /**
   * 保存 AI 分析报告到数据库
   * @param request 报告保存请求
   * @returns 保存后的报告数据
   */
  async saveReport(request: SaveReportRequest): Promise<SaveReportResponse> {
    try {
      console.log('\n========== 💾 保存 AI 报告到数据库 ==========');
      console.log('📤 请求参数:');
      console.log(JSON.stringify(request, null, 2));

      const response = await apiClient.post<SaveReportResponse>('/api/ai/save/', request);

      console.log('✅ 报告保存成功:');
      console.log(JSON.stringify(response, null, 2));
      console.log('========================================\n');

      return response;
    } catch (error) {
      console.error('❌ 保存报告失败:', error);
      throw error;
    }
  }

  /**
   * 删除指定猫粮的 AI 分析报告（用于重新生成）
   * @param catfoodId 猫粮 ID
   * @returns 删除结果
   */
  async deleteReport(catfoodId: number): Promise<{ message: string }> {
    try {
      console.log(`🗑️ 删除猫粮 ${catfoodId} 的报告...`);
      const response = await apiClient.delete<{ message: string }>(`/api/ai/${catfoodId}/delete/`);
      console.log('✅ 删除成功:', response);
      return response;
    } catch (error) {
      console.error('❌ 删除报告失败:', error);
      throw error;
    }
  }

  /**
   * 生成AI报告
   * @param request 报告生成请求
   * @returns AI生成的报告数据
   */
  async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse> {
    try {
      console.log('\n========== 🚀 AI报告生成请求 ==========');
      console.log('📤 完整请求参数:');
      console.log(JSON.stringify(request, null, 2));
      console.log('========================================\n');

      // 后端返回的数据结构
      const backendResponse = await apiClient.post<BackendReportResponse>(
        '/api/ai/llm/chat',
        request
      );

      console.log('\n========== 📥 后端完整响应数据 ==========');
      console.log(JSON.stringify(backendResponse, null, 2));
      console.log('========================================\n');

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

      console.log('✅ 数据转换完成\n');

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
  type AIReportData,
  type CheckReportExistsResponse,
  type GenerateReportRequest,
  type GenerateReportResponse,
  type IngredientInfoRequest,
  type IngredientInfoResponse,
  type SaveReportRequest,
  type SaveReportResponse,
};
