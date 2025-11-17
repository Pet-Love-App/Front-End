/**
 * 添加剂相关的类型定义
 */

/**
 * 添加剂类型
 */
export interface Additive {
  id?: number;
  /** 添加剂名称 */
  name: string;
  /** 添加剂英文名 */
  en_name: string;
  /** 添加剂类型 */
  type: string;
  /** 添加剂适用范围 */
  applicable_range: string;
  [property: string]: any;
}

/**
 * 添加添加剂的请求参数
 */
export interface AddAdditiveParams {
  /** 添加剂名称 */
  name: string;
  /** 添加剂英文名 */
  en_name: string;
  /** 添加剂类型 */
  type: string;
  /** 添加剂适用范围 */
  applicable_range: string;
}

/**
 * 营养成分类型
 */
export interface Ingredient {
  id?: number;
  /** 营养成分名称 */
  name: string;
  /** 营养成分类型 */
  type: string;
  /** 营养成分标签 */
  label: string;
  /** 营养成分详细描述 */
  desc: string;
}

/**
 * 添加营养成分的请求参数
 */
export interface AddIngredientParams {
  /** 营养成分名称 */
  name: string;
  /** 营养成分类型 */
  type: string;
  /** 营养成分标签 */
  label: string;
  /** 营养成分详细描述 */
  desc: string;
}

/**
 * 添加剂搜索响应类型
 */
export interface AdditiveSearchResponse {
  /** 命中的添加剂 */
  additive: Additive;
  /** 搜索字段 */
  query: string;
  [property: string]: any;
}

/**
 * 营养成分搜索响应类型
 */
export interface IngredientSearchResponse {
  /** 命中的营养成分 */
  ingredient: Ingredient;
  /** 搜索字段 */
  query: string;
  [property: string]: any;
}

/**
 * 营养成分添加响应类型
 */
export interface IngredientAddResponse {
  ingredient: Ingredient;
  message: string;
}

/**
 * 添加剂添加响应类型
 */
export interface AdditiveAddResponse {
  additive: Additive;
  message: string;
}
