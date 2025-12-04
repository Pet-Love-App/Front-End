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
 * 转换后端数据格式为前端格式
 * 将 image_url 转换为 imageUrl
 */
function transformCatFoodData(data: any): CatFood {
  if (!data) return data;

  const { image_url, ...rest } = data;
  return {
    ...rest,
    imageUrl: image_url || null,
  } as CatFood;
}

/**
 * 批量转换猫粮数据
 */
function transformCatFoodList(list: any[]): CatFood[] {
  if (!Array.isArray(list)) return [];
  return list.map(transformCatFoodData);
}

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
    const data = await apiClient.get<any>(`/api/catfoods/?page=${page}&per_page=${pageSize}`);

    // 适配后端返回格式: { catfoods, page, per_page, total }
    // 转换为前端期望的格式: { results, count, next, previous }
    return {
      results: transformCatFoodList(data.catfoods || []),
      count: data.total || 0,
      next: data.page * data.per_page < data.total ? 'has_more' : null,
      previous: data.page > 1 ? 'has_previous' : null,
    };
  }

  /**
   * 获取单个猫粮详情
   * @param id 猫粮ID
   * @returns 猫粮详情
   */
  async getCatFood(id: number): Promise<CatFood> {
    const data = await apiClient.get<any>(`/api/catfoods/${id}/`);
    return transformCatFoodData(data.catfood || data);
  }

  /**
   * 创建猫粮
   * @param data 猫粮数据
   * @returns 创建的猫粮
   */
  async createCatFood(data: CatFoodCreateUpdate): Promise<CatFood> {
    const result = await apiClient.post<any>(`/api/catfoods/create/`, data);
    return transformCatFoodData(result.catfood || result);
  }

  /**
   * 完整更新猫粮
   * @param id 猫粮ID
   * @param data 猫粮数据
   * @returns 更新后的猫粮
   */
  async updateCatFood(id: number, data: CatFoodCreateUpdate): Promise<CatFood> {
    const result = await apiClient.put<any>(`/api/catfoods/${id}/update/`, data);
    return transformCatFoodData(result.catfood || result);
  }

  /**
   * 部分更新猫粮
   * @param id 猫粮ID
   * @param data 要更新的字段
   * @returns 更新后的猫粮
   */
  async patchCatFood(id: number, data: Partial<CatFoodCreateUpdate>): Promise<CatFood> {
    const result = await apiClient.patch<any>(`/api/catfoods/${id}/update/`, data);
    return transformCatFoodData(result.catfood || result);
  }

  /**
   * 删除猫粮
   * @param id 猫粮ID
   */
  async deleteCatFood(id: number): Promise<void> {
    await apiClient.delete<void>(`/api/catfoods/${id}/delete/`);
  }

  /**
   * 评分猫粮
   * @param id 猫粮ID
   * @param score 评分 (1-5)
   * @param comment 评论（可选）
   * @returns 评分结果
   */
  async rateCatFood(id: number, score: number, comment?: string): Promise<any> {
    return await apiClient.post<any>(`/api/catfoods/${id}/rate/`, { score, comment });
  }

  /**
   * 收藏/取消收藏猫粮
   * @param id 猫粮ID
   * @returns 收藏结果
   */
  async toggleFavorite(id: number): Promise<{ favorited: boolean; message: string }> {
    return await apiClient.post<{ favorited: boolean; message: string }>(
      `/api/catfoods/${id}/favorite/`
    );
  }

  /**
   * 获取用户收藏的猫粮列表
   * @returns 收藏列表
   */
  async getFavorites(): Promise<CatFood[]> {
    const data = await apiClient.get<any>(`/api/catfoods/favorites/`);
    return transformCatFoodList(data.catfoods || data);
  }

  /**
   * 获取猫粮评分列表
   * @param id 猫粮ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 评分列表
   */
  async getCatFoodRatings(id: number, page: number = 1, pageSize: number = 20): Promise<any> {
    return await apiClient.get<any>(
      `/api/catfoods/${id}/ratings/?page=${page}&per_page=${pageSize}`
    );
  }

  /**
   * 搜索猫粮（按名称或品牌）
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async searchCatFood(params: SearchCatFoodParams): Promise<GetCatFoodsResponse> {
    const { name, brand, tag, page = 1, page_size = 20 } = params;
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('search', name);
    if (brand) queryParams.append('brand', brand);
    if (tag) queryParams.append('tag', tag);
    queryParams.append('page', page.toString());
    queryParams.append('per_page', page_size.toString());

    const data = await apiClient.get<any>(`/api/catfoods/?${queryParams.toString()}`);

    // 适配后端返回格式
    return {
      results: transformCatFoodList(data.catfoods || []),
      count: data.total || 0,
      next: data.page * data.per_page < data.total ? 'has_more' : null,
      previous: data.page > 1 ? 'has_previous' : null,
    };
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
   * 扫描条形码（检查是否存在对应猫粮）
   * @param barcode 条形码
   * @returns 扫描结果
   */
  async scanBarcode(barcode: string): Promise<{ exists: boolean; catfood?: CatFood }> {
    try {
      const catfood = await this.getCatFoodByBarcode(barcode);
      return {
        exists: true,
        catfood,
      };
    } catch (error: any) {
      // 如果是404错误，表示不存在
      if (error.statusCode === 404 || error.status === 404) {
        return {
          exists: false,
        };
      }
      // 其他错误继续抛出
      throw error;
    }
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
export const searchCatFood = (params: SearchCatFoodParams) => catFoodService.searchCatFood(params);
export const getCatFoodComments = (id: number, page?: number, pageSize?: number) =>
  catFoodService.getCatFoodComments(id, page, pageSize);
export const getCatFoodByBarcode = (barcode: string) => catFoodService.getCatFoodByBarcode(barcode);
export const scanBarcode = (barcode: string) => catFoodService.scanBarcode(barcode);
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
