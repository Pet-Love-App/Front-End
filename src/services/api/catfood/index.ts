import { apiClient } from '../BaseApi';
import type {
  CatFood,
  CatFoodCommentsResponse,
  CatFoodCreateUpdate,
  GetCatFoodsResponse,
  ScanBarcodeResponse,
  SearchCatFoodParams,
} from './types';

/**
 * 猫粮 API 服务类（适配新的 Supabase API）
 */
class CatFoodService {
  /**
   * 获取猫粮列表
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 猫粮列表
   */
  async getCatFoods(page: number = 1, pageSize: number = 20): Promise<GetCatFoodsResponse> {
    const data = await apiClient.get<GetCatFoodsResponse>(
      `/api/catfood/?page=${page}&per_page=${pageSize}`
    );
    return data;
  }

  /**
   * 获取单个猫粮详情
   * @param id 猫粮ID
   * @returns 猫粮详情
   */
  async getCatFood(id: number): Promise<CatFood> {
    const data = await apiClient.get<any>(`/api/catfood/${id}/`);
    return data.catfood || data;
  }

  /**
   * 创建猫粮
   * @param data 猫粮数据
   * @returns 创建的猫粮
   */
  async createCatFood(data: CatFoodCreateUpdate): Promise<CatFood> {
    const result = await apiClient.post<any>(`/api/catfood/create/`, data);
    return result.catfood || result;
  }

  /**
   * 完整更新猫粮
   * @param id 猫粮ID
   * @param data 猫粮数据
   * @returns 更新后的猫粮
   */
  async updateCatFood(id: number, data: CatFoodCreateUpdate): Promise<CatFood> {
    const result = await apiClient.put<any>(`/api/catfood/${id}/update/`, data);
    return result.catfood || result;
  }

  /**
   * 部分更新猫粮
   * @param id 猫粮ID
   * @param data 要更新的字段
   * @returns 更新后的猫粮
   */
  async patchCatFood(id: number, data: Partial<CatFoodCreateUpdate>): Promise<CatFood> {
    const result = await apiClient.patch<any>(`/api/catfood/${id}/update/`, data);
    return result.catfood || result;
  }

  /**
   * 删除猫粮
   * @param id 猫粮ID
   */
  async deleteCatFood(id: number): Promise<void> {
    await apiClient.delete<void>(`/api/catfood/${id}/delete/`);
  }

  /**
   * 上传猫粮图片
   * @param id 猫粮ID
   * @param imageUri 图片本地 URI
   * @returns 更新后的猫粮
   */
  async uploadCatFoodImage(id: number, imageUri: string): Promise<CatFood> {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri: imageUri,
      name: `catfood_image.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const result = await apiClient.upload<any>(`/api/catfood/${id}/image/`, formData);
    return result.catfood || result;
  }

  /**
   * 删除猫粮图片
   * @param id 猫粮ID
   */
  async deleteCatFoodImage(id: number): Promise<void> {
    await apiClient.delete<void>(`/api/catfood/${id}/image/delete/`);
  }

  /**
   * 搜索猫粮（按名称或品牌）
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async searchCatFood(params: SearchCatFoodParams): Promise<GetCatFoodsResponse> {
    const { name, page = 1, page_size = 20 } = params;
    return await apiClient.get<GetCatFoodsResponse>(
      `/api/catfood/search/?q=${encodeURIComponent(name)}&page=${page}&per_page=${page_size}`
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
      `/api/catfood/${id}/comments/?page=${page}&per_page=${pageSize}`
    );
  }

  /**
   * 通过条形码查询猫粮
   * @param barcode 条形码
   * @returns 猫粮详情
   */
  async getCatFoodByBarcode(barcode: string): Promise<CatFood> {
    const data = await apiClient.get<any>(
      `/api/catfood/by-barcode/?barcode=${encodeURIComponent(barcode)}`
    );
    return data.catfood || data;
  }

  /**
   * 扫描条形码图片识别
   * @param imageUri 图片本地 URI
   * @returns 扫描结果
   */
  async scanBarcodeImage(imageUri: string): Promise<ScanBarcodeResponse> {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri: imageUri,
      name: `barcode.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    return await apiClient.upload<ScanBarcodeResponse>(`/api/catfood/scan-barcode/`, formData);
  }

  // ==================== 猫粮点赞相关 ====================

  /**
   * 获取用户点赞的猫粮列表
   */
  async getLikedCatFoods(): Promise<any[]> {
    const data = await apiClient.get<any>(`/api/catfood/likes/`);
    return data.likes || data;
  }

  /**
   * 点赞猫粮
   * @param catfoodId 猫粮ID
   */
  async likeCatFood(catfoodId: number): Promise<any> {
    return await apiClient.post<any>(`/api/catfood/likes/`, { catfood_id: catfoodId });
  }

  /**
   * 取消点赞猫粮
   * @param likeId 点赞记录ID
   */
  async unlikeCatFood(likeId: number): Promise<void> {
    await apiClient.delete<void>(`/api/catfood/likes/${likeId}/`);
  }

  /**
   * 切换点赞状态
   * @param catfoodId 猫粮ID
   */
  async toggleLikeCatFood(catfoodId: number): Promise<{ liked: boolean; message: string }> {
    return await apiClient.post<{ liked: boolean; message: string }>(`/api/catfood/likes/toggle/`, {
      catfood_id: catfoodId,
    });
  }

  /**
   * 检查点赞状态
   * @param catfoodId 猫粮ID
   */
  async checkLikeStatus(catfoodId: number): Promise<{ liked: boolean }> {
    return await apiClient.get<{ liked: boolean }>(
      `/api/catfood/likes/check/?catfood_id=${catfoodId}`
    );
  }

  /**
   * 获取猫粮点赞数量
   * @param catfoodId 猫粮ID
   */
  async getLikesCount(catfoodId: number): Promise<{ catfood_id: number; likes_count: number }> {
    return await apiClient.get<{ catfood_id: number; likes_count: number }>(
      `/api/catfood/likes/count/${catfoodId}/`
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
export const uploadCatFoodImage = (id: number, imageUri: string) =>
  catFoodService.uploadCatFoodImage(id, imageUri);
export const deleteCatFoodImage = (id: number) => catFoodService.deleteCatFoodImage(id);
export const searchCatFood = (params: SearchCatFoodParams) => catFoodService.searchCatFood(params);
export const getCatFoodComments = (id: number, page?: number, pageSize?: number) =>
  catFoodService.getCatFoodComments(id, page, pageSize);
export const getCatFoodByBarcode = (barcode: string) => catFoodService.getCatFoodByBarcode(barcode);
export const scanBarcodeImage = (imageUri: string) => catFoodService.scanBarcodeImage(imageUri);
export const getLikedCatFoods = () => catFoodService.getLikedCatFoods();
export const likeCatFood = (catfoodId: number) => catFoodService.likeCatFood(catfoodId);
export const unlikeCatFood = (likeId: number) => catFoodService.unlikeCatFood(likeId);
export const toggleLikeCatFood = (catfoodId: number) => catFoodService.toggleLikeCatFood(catfoodId);
export const checkLikeStatus = (catfoodId: number) => catFoodService.checkLikeStatus(catfoodId);
export const getLikesCount = (catfoodId: number) => catFoodService.getLikesCount(catfoodId);

// 重新导出类型
export type {
  CatFood,
  CatFoodCommentsResponse,
  CatFoodCreateUpdate,
  GetCatFoodsResponse,
  ScanBarcodeRequest,
  ScanBarcodeResponse,
  SearchCatFoodParams,
} from './types';
