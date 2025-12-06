/**
 * OCR API 服务
 */

import { logger } from '@/src/utils/logger';
import { API_BASE_URL } from '@/src/config/env';

import { apiClient } from '../core/httpClient';

// ========== 类型定义 ==========

export interface OcrTextItem {
  text: string;
  confidence: number;
  position?: number[][];
}

export interface OcrRecognizeResponse {
  result: OcrTextItem[];
}

export interface OcrResult {
  text: string;
  confidence: number;
}

// ========== 服务实现 ==========

class OcrService {
  /**
   * 识别图片中的文字
   */
  async recognize(imageUri: string): Promise<OcrResult> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        type,
        name: filename,
      } as unknown as Blob);

      const response = await apiClient.upload<OcrRecognizeResponse>(
        '/api/ocr/recognize/',
        formData
      );
      const results: OcrTextItem[] = response.result || [];

      const text = results.map((r) => r.text).join('\n');
      const avgConfidence =
        results.length > 0
          ? results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
          : 0;

      return { text, confidence: avgConfidence };
    } catch (error) {
      logger.error('OCR 识别失败', error as Error);
      throw new Error('识别失败，请重试');
    }
  }

  /**
   * 使用 fetch 直接上传（备用方法）
   */
  async recognizeWithFetch(imageUri: string): Promise<OcrResult> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        type,
        name: filename,
      } as unknown as Blob);

      const response = await fetch(`${API_BASE_URL}/api/ocr/recognize/`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OcrRecognizeResponse = await response.json();
      const results: OcrTextItem[] = data.result || [];

      const text = results.map((r) => r.text).join('\n');
      const avgConfidence =
        results.length > 0
          ? results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
          : 0;

      return { text, confidence: avgConfidence };
    } catch (error) {
      logger.error('OCR 识别失败', error as Error);
      throw new Error('识别失败，请重试');
    }
  }
}

// 导出单例
export const ocrService = new OcrService();

// 便捷方法
export const recognizeImage = (imageUri: string) => ocrService.recognize(imageUri);
