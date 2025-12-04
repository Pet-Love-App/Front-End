/**
 * OCR 相关类型定义
 */

/**
 * OCR 识别结果
 */
export interface OcrResult {
  /** 识别的文本内容 */
  text: string;
  /** 识别置信度 (0-1) */
  confidence: number;
}

/**
 * OCR 识别请求参数
 */
export interface OcrRecognizeRequest {
  /** 图片文件 */
  image: File | Blob;
}

/**
 * OCR 识别的单个文本项
 */
export interface OcrTextItem {
  /** 识别的文本内容 */
  text: string;
  /** 识别置信度 (0-1) */
  confidence: number;
}

/**
 * OCR 识别响应（后端格式）
 */
export interface OcrRecognizeResponse {
  /** 识别结果数组 */
  result: OcrTextItem[];
}
