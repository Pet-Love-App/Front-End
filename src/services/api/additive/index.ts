import { apiClient } from '../BaseApi';
import type {
  AdditiveSearchResponse,
  Ingredient,
  IngredientAddResponse,
  IngredientSearchResponse,
} from './types';

/**
 * 添加剂 API 服务类
 */
class AdditiveService {
  /**
   * 搜索添加剂
   * 优先用 name 参数，请求 400 时回退到 keyword 参数
   * @param query 搜索关键词
   * @returns 搜索结果
   */
  async searchAdditive(query: string): Promise<AdditiveSearchResponse> {
    try {
      // 尝试使用 name 参数
      return await apiClient.get<AdditiveSearchResponse>(
        `/additive/search-additive/?name=${encodeURIComponent(query)}`
      );
    } catch (error: any) {
      // 如果是 400 错误，尝试使用 keyword 参数
      if (error?.message?.includes('400')) {
        return await apiClient.get<AdditiveSearchResponse>(
          `/additive/search-additive/?keyword=${encodeURIComponent(query)}`
        );
      }
      throw error;
    }
  }

  /**
   * 搜索营养成分/原料
   * 优先用 name 参数，请求 400 时回退到 keyword 参数
   * @param query 搜索关键词
   * @returns 搜索结果
   */
  async searchIngredient(query: string): Promise<IngredientSearchResponse> {
    try {
      // 尝试使用 name 参数
      return await apiClient.get<IngredientSearchResponse>(
        `/additive/search-ingredient/?name=${encodeURIComponent(query)}`
      );
    } catch (error: any) {
      // 如果是 400 错误，尝试使用 keyword 参数
      if (error?.message?.includes('400')) {
        return await apiClient.get<IngredientSearchResponse>(
          `/additive/search-ingredient/?keyword=${encodeURIComponent(query)}`
        );
      }
      throw error;
    }
  }

  /**
   * 添加营养成分/原料
   * @param Ingredient 要添加的原料
   * @returns 添加操作结果
   */
  async addIngredient(ingredient: Ingredient): Promise<IngredientAddResponse> {}
}

// 导出单例
export const additiveService = new AdditiveService();

// 导出便捷方法（保持与原来的使用方式一致）
export const searchAdditive = (query: string) => additiveService.searchAdditive(query);
export const searchIngredient = (query: string) => additiveService.searchIngredient(query);

// 重新导出类型
export type {
  Additive,
  AdditiveSearchResponse,
  Ingredient,
  IngredientSearchResponse,
} from './types';
