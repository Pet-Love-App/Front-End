/**
 * AI 报告相关的类型定义
 */

/**
 * AI 生成报告的请求参数
 */
export interface GenerateReportRequest {
  /** OCR识别的配料表文本 */
  ingredients: string;
  /** 最大token数（可选） */
  max_tokens?: number;
}

/**
 * AI 生成报告的响应
 */
export interface GenerateReportResponse {
  /** 识别到的添加剂列表 */
  additives: string[];
  /** 识别到的营养成分名称列表 */
  identified_nutrients: string[];
  /** 安全性分析（约50字） */
  safety: string;
  /** 营养分析（约300字） */
  nutrient: string;
  /** 是否包含百分比数据 */
  percentage: boolean | null;
  /** 粗蛋白含量（%） */
  crude_protein: number | null;
  /** 粗脂肪含量（%） */
  crude_fat: number | null;
  /** 碳水化合物含量（%） */
  carbohydrates: number | null;
  /** 粗纤维含量（%） */
  crude_fiber: number | null;
  /** 粗灰分含量（%） */
  crude_ash: number | null;
  /** 其他成分含量（%） */
  others: number | null;
}

/**
 * 成分信息查询请求
 */
export interface IngredientInfoRequest {
  /** 成分名称 */
  ingredient: string;
  /** 语言（默认'zh'） */
  lang?: string;
}

/**
 * 成分信息查询响应
 */
export interface IngredientInfoResponse {
  /** 是否成功 */
  ok: boolean;
  /** 标题 */
  title?: string;
  /** 摘要 */
  extract?: string;
  /** Wikipedia URL */
  url?: string;
  /** 语言 */
  lang?: string;
  /** 错误信息（当ok为false时） */
  error?: {
    code: string;
    message: string;
    detail?: string;
  };
}
