/**
 * 搜索 API 相关类型定义
 */

/**
 * 百度百科搜索请求
 */
export interface BaikeSearchRequest {
  /** 成分或添加剂名称 */
  ingredient: string;
}

/**
 * 百度百科搜索响应
 */
export interface BaikeSearchResponse {
  /** 是否成功 */
  ok: boolean;
  /** 标题 */
  title?: string;
  /** 摘要内容 */
  extract?: string;
  /** 错误信息（当ok为false时） */
  error?: {
    code: string;
    message: string;
    detail?: string;
  };
}
