import { Additive, Ingredient } from '../services/api';

/**
 * 标签
 */
export interface CatFoodTag {
  id: number;
  name: string;
  description?: string;
}

/**
 * 百分比数据
 */
export interface PercentData {
  crude_protein: number | null;
  crude_fat: number | null;
  carbohydrates: number | null;
  crude_fiber: number | null;
  crude_ash: number | null;
  others: number | null;
}

/**
 * 猫粮（GET 请求返回的完整数据）
 */
export interface CatFood {
  /** 唯一标识 */
  id: number;
  /** 猫粮名称 */
  name: string;
  /** 品牌名称 */
  brand: string;
  /** 用户总分（只读） */
  score: number;
  /** 打分人数（只读） */
  countNum: number;
  /** 猫粮图片URL */
  imageUrl: string | null;
  /** 标签列表 - 字符串数组 */
  tags: string[];
  /** 营养成分列表 - 完整对象数组 */
  ingredient: Ingredient[];
  /** 添加剂列表 - 完整对象数组 */
  additive: Additive[];
  /** 安全性分析 */
  safety: string;
  /** 营养分析 */
  nutrient: string;
  /** 能否生成图表作定量分析 */
  percentage: boolean;
  /** 百分比数据 */
  percentData: PercentData;
  /** 创建时间（只读） */
  created_at: string;
  /** 更新时间（只读） */
  updated_at: string;
}

/**
 * 猫粮创建/更新请求（POST/PUT 请求发送的数据）
 */
export interface CatFoodCreateUpdate {
  /** 猫粮名称 */
  name: string;
  /** 品牌名称 */
  brand: string;
  /** 猫粮图片URL */
  imageUrl?: string;
  /** 标签名称数组（字符串数组，后端会自动创建标签） */
  tags?: string[];
  /** 营养成分ID数组 */
  ingredient?: number[];
  /** 添加剂ID数组 */
  additive?: number[];
  /** 安全性分析 */
  safety?: string;
  /** 营养分析 */
  nutrient?: string;
  /** 能否生成图表作定量分析 */
  percentage?: boolean;
  /** 百分比数据 */
  percentData?: PercentData;
}
