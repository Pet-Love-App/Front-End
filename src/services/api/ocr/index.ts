/**
 * OCR API 服务
 */

import { API_BASE_URL } from '@/src/config/env';
import { apiClient } from '../BaseApi';
import type { OcrRecognizeResponse, OcrResult } from './types';

/**
 * OCR API 服务类
 */
class OcrService {
  private readonly basePath = '/ocr';

  /**
   * 识别图片中的文字
   * @param imageUri 图片本地 URI
   * @returns OCR 识别结果
   */
  async recognize(imageUri: string): Promise<OcrResult> {
    try {
      // 创建 FormData
      const formData = new FormData();

      // 从 URI 创建文件对象
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // React Native 中使用特殊格式
      formData.append('image', {
        uri: imageUri,
        type,
        name: filename,
      } as any);

      // 调用 API
      const response = await apiClient.upload<OcrRecognizeResponse>(
        `${this.basePath}/recognize/`,
        formData
      );

      return {
        text: response.text,
        confidence: response.confidence,
      };
    } catch (error) {
      console.error('OCR 识别失败:', error);
      throw new Error('识别失败，请重试');
    }
  }

  /**
   * 使用 fetch 直接上传（备用方法）
   * @param imageUri 图片本地 URI
   * @returns OCR 识别结果
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
      } as any);

      const response = await fetch(`${API_BASE_URL}${this.basePath}/recognize/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OcrRecognizeResponse = await response.json();

      return {
        text: data.text,
        confidence: data.confidence,
      };
    } catch (error) {
      console.error('OCR 识别失败:', error);
      throw new Error('识别失败，请重试');
    }
  }
}

// 导出单例
export const ocrService = new OcrService();

// 导出便捷方法
export const recognizeImage = (imageUri: string) => ocrService.recognize(imageUri);

// 重新导出类型
export type { OcrRecognizeResponse, OcrResult } from './types';
