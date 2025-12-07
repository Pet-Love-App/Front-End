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
 * 后端返回的原始数据结构
 */
interface BackendReportResponse {
  /** 是否成功 */
  ok: boolean;
  /** 提示消息 */
  message: string;
  /** 报告数据 */
  data: {
    /** 识别到的添加剂列表 */
    additive: string[];
    /** 识别到的营养成分名称列表 */
    ingredient: string[];
    /** 安全性分析（约50字） */
    safety: string;
    /** 营养分析（约300字） */
    nutrient: string;
    /** 是否包含百分比数据 */
    percentage: boolean;
    /** 百分比数据（动态字段，如 protein, fat, fiber, ash, moisture, carbohydrates, others 等） */
    percent_data: Record<string, number | null>;
    /** 标签 */
    tags?: string[];
  };
}

/**
 * AI 生成报告的响应（前端使用的格式）
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
  /** 百分比数据（动态字段，如 protein, fat, fiber, ash, moisture, carbohydrates, others 等） */
  percent_data: Record<string, number | null>;
  /** 标签（可选） */
  tags?: string[];
}

// 导出后端类型供内部使用
export type { BackendReportResponse };

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
  /** 提示消息 */
  message?: string;
  /** 百科数据 */
  data?: {
    /** 标题 */
    title?: string;
    /** 摘要 */
    extract?: string;
    /** Wikipedia URL */
    url?: string;
    /** 语言 */
    lang?: string;
  };
  /** 错误信息（当ok为false时） */
  error?: {
    code: string;
    message: string;
    detail?: string;
  };
}

/**
 * 保存 AI 分析报告的请求参数
 */
export interface SaveReportRequest {
  /** 猫粮 ID */
  catfood_id: number;
  /** 原始配料表文本 */
  ingredients_text: string;
  /** 产品标签列表 */
  tags: string[];
  /** 识别到的添加剂列表 */
  additives: string[];
  /** 识别到的营养成分列表 */
  ingredients: string[];
  /** 安全性分析文本 */
  safety: string;
  /** 营养分析文本 */
  nutrient: string;
  /** 是否支持百分比分析 */
  percentage: boolean;
  /** 百分比数据（动态字段） */
  percent_data?: Record<string, number | null>;
}

/**
 * 保存 AI 分析报告的响应
 */
export interface SaveReportResponse {
  /** 是否成功 */
  ok: boolean;
  /** 提示消息 */
  message: string;
  /** 保存的报告数据 */
  data: AIReportData;
}

/**
 * AI 分析报告数据（从数据库获取）
 */
export interface AIReportData {
  /** 报告 ID */
  id: number;
  /** 猫粮 ID */
  catfood_id: number;
  /** 原始配料表文本 */
  ingredients_text: string;
  /** 产品标签列表 */
  tags: string[];
  /** 识别到的添加剂列表 */
  additives: string[];
  /** 识别到的营养成分列表 */
  ingredients: string[];
  /** 安全性分析文本 */
  safety: string;
  /** 营养分析文本 */
  nutrient: string;
  /** 是否支持百分比分析 */
  percentage: boolean;
  /** 百分比数据（动态字段，如 protein, fat, fiber, ash, moisture, carbohydrates, others 等） */
  percent_data: Record<string, number | null>;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * 检查报告是否存在的响应
 */
export interface CheckReportExistsResponse {
  /** 是否存在报告 */
  exists: boolean;
  /** 猫粮 ID */
  catfood_id: number;
  /** 猫粮名称（如果存在） */
  catfood_name?: string;
  /** 报告 ID（如果存在） */
  report_id?: number;
  /** 更新时间（如果存在） */
  updated_at?: string;
  /** 错误信息（如果猫粮不存在） */
  error?: string;
}

/**
 * 收藏的猫粮数据（简化版）
 */
export interface Favorite {
  id: number;
  catfoodId: string;
  catfood: {
    id: string;
    name: string;
    brand: string;
    imageUrl?: string;
    score?: number;
    barcode?: string;
    crudeProtein?: number;
    crudeFat?: number;
    carbohydrates?: number;
    crudeFiber?: number;
    crudeAsh?: number;
    others?: number;
    percentData?: {
      protein?: number;
      fat?: number;
      carbohydrates?: number;
      fiber?: number;
      ash?: number;
      others?: number;
    };
  };
  createdAt: string;
  favoriteId?: number;
  favoritedAt?: string;
}

/**
 * 收藏的 AI 报告数据
 */
export interface FavoriteReport {
  id: number;
  reportId: number;
  catfoodId?: number;
  report: Partial<AIReportData> & {
    id: number;
    catfood_id?: number;
    catfood_name?: string;
    catfoodName?: string;
    createdAt?: string;
    [key: string]: any;
  };
  createdAt: string;
}
