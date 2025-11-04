/**
 * 添加剂相关的类型定义
 */

/**
 * 添加剂类型
 */
export interface Additive {
  /** 添加剂适用范围 */
  applicable_range: string;
  /** 添加剂英文名 */
  en_name: string;
  /** id */
  id: number;
  /** 添加剂名称 */
  name: string;
  /** 添加剂类型 */
  type: string;
  [property: string]: any;
}

/**
 * 搜索响应类型
 */
export interface SearchResponse {
  /** 命中的添加剂（后端返回字段为 additive） */
  additive: Additive;
  /** 搜索字段（中文需 URL 编码） */
  query: string;
  [property: string]: any;
}
