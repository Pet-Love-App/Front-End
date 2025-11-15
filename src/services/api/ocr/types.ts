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
 * OCR 识别响应
 */
export interface OcrRecognizeResponse {
  /** 消息 */
  message: string;
  /** 识别的文本 */
  text: string;
  /** 置信度 */
  confidence: number;
}
