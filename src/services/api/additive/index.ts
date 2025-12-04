import { apiClient } from '../BaseApi';
import type {
  AddAdditiveParams,
  AddIngredientParams,
  AdditiveAddResponse,
  AdditiveSearchResponse,
  IngredientAddResponse,
  IngredientSearchResponse,
} from './types';

/**
 * 添加剂 API 服务类（适配新的 Supabase API）
 */
class AdditiveService {
  /**
   * 搜索添加剂
   * @param query 搜索关键词
   * @returns 搜索结果
   */
  async searchAdditive(query: string): Promise<AdditiveSearchResponse> {
    return await apiClient.get<AdditiveSearchResponse>(
      `/api/additive/search-additive/?name=${encodeURIComponent(query)}`
    );
  }

  /**
   * 搜索营养成分/原料
   * @param query 搜索关键词
   * @returns 搜索结果
   */
  async searchIngredient(query: string): Promise<IngredientSearchResponse> {
    return await apiClient.get<IngredientSearchResponse>(
      `/api/additive/search-ingredient/?name=${encodeURIComponent(query)}`
    );
  }

  /**
   * 添加添加剂
   * @param params 要添加的添加剂参数
   * @returns 添加操作结果
   */
  async addAdditive(params: AddAdditiveParams): Promise<AdditiveAddResponse> {
    return await apiClient.post<AdditiveAddResponse>('/api/additive/add-additive/', params);
  }

  /**
   * 添加营养成分/原料
   * @param params 要添加的原料参数
   * @returns 添加操作结果
   */
  async addIngredient(params: AddIngredientParams): Promise<IngredientAddResponse> {
    return await apiClient.post<IngredientAddResponse>('/api/additive/add-ingredient/', params);
  }

  /**
   * 获取成分信息（Baidu AppBuilder API）
   * @param ingredient 成分名称
   * @returns 成分信息
   */
  async getIngredientInfo(ingredient: string): Promise<any> {
    return await apiClient.post<any>('/api/additive/ingredient-info/', { ingredient });
  }
}

// 导出单例
export const additiveService = new AdditiveService();

// 导出便捷方法（保持与原来的使用方式一致）
export const searchAdditive = (query: string) => additiveService.searchAdditive(query);
export const searchIngredient = (query: string) => additiveService.searchIngredient(query);
export const addAdditive = (params: AddAdditiveParams) => additiveService.addAdditive(params);
export const addIngredient = (params: AddIngredientParams) => additiveService.addIngredient(params);
export const getIngredientInfo = (ingredient: string) =>
  additiveService.getIngredientInfo(ingredient);

// 重新导出类型
export type {
  AddAdditiveParams,
  AddIngredientParams,
  Additive,
  AdditiveAddResponse,
  AdditiveSearchResponse,
  Ingredient,
  IngredientAddResponse,
  IngredientSearchResponse,
} from './types';
