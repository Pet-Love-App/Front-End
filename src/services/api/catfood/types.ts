/**
 * 猫粮 API 相关的类型定义
 */

import type { CatFood, CatFoodCreateUpdate } from '@/src/types/catFood';

/**
 * 获取猫粮列表响应
 */
export interface GetCatFoodsResponse {
  results: CatFood[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * 搜索猫粮参数
 */
export interface SearchCatFoodParams {
  name: string;
  page?: number;
  page_size?: number;
}

/**
 * 猫粮评论列表响应
 */
export interface CatFoodCommentsResponse {
  results: any[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * 扫描条形码响应
 */
export interface ScanBarcodeResponse {
  exists: boolean;
  message: string;
  catfood?: CatFood;
}

/**
 * 扫描条形码请求
 */
export interface ScanBarcodeRequest {
  barcode: string;
}

// 重新导出类型
export type { CatFood, CatFoodCreateUpdate };
