/**
 * AI 报告 API 服务
 */

import { logger } from '@/src/utils/logger';
import { API_ENDPOINTS } from '@/src/config/api';

import { apiClient } from '../core/httpClient';

import type {
  AIReportData,
  BackendReportResponse,
  CheckReportExistsResponse,
  Favorite,
  FavoriteReport,
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
      logger.debug('检查猫粮报告是否存在', { catfoodId });
      // 后端返回 { ok: true, message: "...", data: { exists: boolean } }
      const response = await apiClient.get<{
        ok: boolean;
        message: string;
        data: { exists: boolean };
      }>(`/api/ai/${catfoodId}/exists/`);
      logger.info('检查结果', { catfoodId, exists: response.data?.exists });
      return {
        exists: response.data?.exists ?? false,
        catfood_id: catfoodId,
      };
    } catch (error) {
      logger.error('检查报告存在性失败', error as Error, { catfoodId });
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
      logger.debug('获取猫粮 AI 报告', { catfoodId });
      // 后端返回 { ok: true, message: "...", data: {...} }
      const response = await apiClient.get<{ ok: boolean; message: string; data: AIReportData }>(
        `/api/ai/${catfoodId}/`
      );
      logger.info('报告获取成功', { catfoodId, hasData: !!response.data });
      return response.data;
    } catch (error) {
      logger.error('获取报告失败', error as Error, { catfoodId });
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
      logger.debug('保存 AI 报告到数据库', { request });

      const response = await apiClient.post<SaveReportResponse>('/api/ai/save/', request);

      logger.info('报告保存成功', { catfoodId: request.catfood_id });

      return response;
    } catch (error) {
      logger.error('保存报告失败', error as Error, { catfoodId: request.catfood_id });
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
      logger.debug('删除猫粮报告', { catfoodId });
      const response = await apiClient.delete<{ message: string }>(`/api/ai/${catfoodId}/delete/`);
      logger.info('删除成功', { catfoodId });
      return response;
    } catch (error) {
      logger.error('删除报告失败', error as Error, { catfoodId });
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
      logger.debug('AI报告生成请求', { request });

      // 后端返回的数据结构
      const backendResponse = await apiClient.post<BackendReportResponse>(
        API_ENDPOINTS.AI_REPORT.LLM_CHAT,
        request
      );

      logger.debug('后端响应数据', { backendResponse });

      // 提取实际数据（后端返回 { ok, message, data }）
      const reportData = backendResponse.data || backendResponse;

      // 转换为前端期望的数据结构
      const frontendResponse: GenerateReportResponse = {
        additives: reportData.additive || [],
        identified_nutrients: reportData.ingredient || [],
        safety: reportData.safety || '',
        nutrient: reportData.nutrient || '',
        percentage: reportData.percentage ?? null,
        percent_data: reportData.percent_data || {},
        tags: reportData.tags || [],
      };

      logger.info('AI报告生成成功', {
        additivesCount: frontendResponse.additives.length,
        ingredientsCount: frontendResponse.identified_nutrients.length,
      });

      return frontendResponse;
    } catch (error) {
      logger.error('生成AI报告失败', error as Error);
      throw error;
    }
  }

  /**
   * 查询成分信息（Baidu AppBuilder API）
   * @param ingredient 成分名称
   * @returns 成分信息
   */
  async getIngredientInfo(ingredient: string): Promise<IngredientInfoResponse> {
    try {
      const response = await apiClient.post<IngredientInfoResponse>('/api/search/ingredient/info', {
        ingredient,
      });
      return response;
    } catch (error) {
      logger.error('查询成分信息失败', error as Error, { ingredient });
      throw error;
    }
  }

  /**
   * 获取收藏的AI报告列表
   * @returns 收藏的报告列表
   */
  async getFavoriteReports(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/ai/favorites/');
      return response.results || response;
    } catch (error) {
      logger.error('获取收藏报告列表失败', error as Error);
      throw error;
    }
  }

  /**
   * 切换报告收藏状态
   * @param catfoodId 猫粮ID
   * @returns 收藏状态
   */
  async toggleFavoriteReport(catfoodId: number): Promise<{ favorited: boolean; message: string }> {
    try {
      return await apiClient.post<{ favorited: boolean; message: string }>(
        '/api/ai/favorites/toggle/',
        { catfood_id: catfoodId }
      );
    } catch (error) {
      logger.error('切换收藏状态失败', error as Error, { catfoodId });
      throw error;
    }
  }

  /**
   * 删除报告收藏
   * @param catfoodId 猫粮ID
   * @returns 删除结果
   */
  async deleteFavoriteReport(catfoodId: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete<{ message: string }>(`/api/ai/favorites/${catfoodId}/delete/`);
    } catch (error) {
      logger.error('删除收藏失败', error as Error, { catfoodId });
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
  type Favorite,
  type FavoriteReport,
  type GenerateReportRequest,
  type GenerateReportResponse,
  type IngredientInfoRequest,
  type IngredientInfoResponse,
  type SaveReportRequest,
  type SaveReportResponse,
};
