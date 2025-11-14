import { apiClient } from '../BaseApi';
import type {
  CatFood,
  CatFoodCommentsResponse,
  CatFoodCreateUpdate,
  GetCatFoodsResponse,
  SearchCatFoodParams,
} from './types';

/**
 * 猫粮 API 服务类
 */
class CatFoodService {
  private readonly basePath = '/api/catfood';

  /**
   * 获取猫粮列表
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 猫粮列表
   */
  async getCatFoods(page: number = 1, pageSize: number = 20): Promise<GetCatFoodsResponse> {
    return await apiClient.get<GetCatFoodsResponse>(
      `${this.basePath}/?page=${page}&page_size=${pageSize}`
    );
  }

  /**
   * 获取单个猫粮详情
   * @param id 猫粮ID
   * @returns 猫粮详情
   */
  async getCatFood(id: number): Promise<CatFood> {
    return await apiClient.get<CatFood>(`${this.basePath}/${id}/`);
  }

  /**
   * 创建猫粮
   * @param data 猫粮数据
   * @returns 创建的猫粮
   */
  async createCatFood(data: CatFoodCreateUpdate): Promise<CatFood> {
    return await apiClient.post<CatFood>(`${this.basePath}/`, data);
  }

  /**
   * 完整更新猫粮
   * @param id 猫粮ID
   * @param data 猫粮数据
   * @returns 更新后的猫粮
   */
  async updateCatFood(id: number, data: CatFoodCreateUpdate): Promise<CatFood> {
    return await apiClient.put<CatFood>(`${this.basePath}/${id}/`, data);
  }

  /**
   * 部分更新猫粮
   * @param id 猫粮ID
   * @param data 要更新的字段
   * @returns 更新后的猫粮
   */
  async patchCatFood(id: number, data: Partial<CatFoodCreateUpdate>): Promise<CatFood> {
    return await apiClient.patch<CatFood>(`${this.basePath}/${id}/`, data);
  }

  /**
   * 删除猫粮
   * @param id 猫粮ID
   */
  async deleteCatFood(id: number): Promise<void> {
    return await apiClient.delete<void>(`${this.basePath}/${id}/`);
  }

  /**
   * 搜索猫粮（按名称或品牌）
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async searchCatFood(params: SearchCatFoodParams): Promise<GetCatFoodsResponse> {
    const { name, page = 1, page_size = 20 } = params;
    return await apiClient.get<GetCatFoodsResponse>(
      `${this.basePath}/search/?name=${encodeURIComponent(name)}&page=${page}&page_size=${page_size}`
    );
  }

  /**
   * 获取猫粮的评论列表
   * @param id 猫粮ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 评论列表
   */
  async getCatFoodComments(
    id: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<CatFoodCommentsResponse> {
    return await apiClient.get<CatFoodCommentsResponse>(
      `${this.basePath}/${id}/comments/?page=${page}&page_size=${pageSize}`
    );
  }
}

// 导出单例
export const catFoodService = new CatFoodService();

// 导出便捷方法
export const getCatFoods = (page?: number, pageSize?: number) =>
  catFoodService.getCatFoods(page, pageSize);
export const getCatFood = (id: number) => catFoodService.getCatFood(id);
export const createCatFood = (data: CatFoodCreateUpdate) => catFoodService.createCatFood(data);
export const updateCatFood = (id: number, data: CatFoodCreateUpdate) =>
  catFoodService.updateCatFood(id, data);
export const patchCatFood = (id: number, data: Partial<CatFoodCreateUpdate>) =>
  catFoodService.patchCatFood(id, data);
export const deleteCatFood = (id: number) => catFoodService.deleteCatFood(id);
export const searchCatFood = (params: SearchCatFoodParams) => catFoodService.searchCatFood(params);
export const getCatFoodComments = (id: number, page?: number, pageSize?: number) =>
  catFoodService.getCatFoodComments(id, page, pageSize);

// 重新导出类型
export type {
  CatFood,
  CatFoodCommentsResponse,
  CatFoodCreateUpdate,
  GetCatFoodsResponse,
  SearchCatFoodParams,
} from './types';
