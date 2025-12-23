/**
 * OCR API 服务
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
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

      // 在独立应用中，需要特殊处理文件上传
      if (Platform.OS === 'web') {
        // Web 平台：使用 fetch 获取 blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, filename);
      } else {
        // React Native (iOS/Android)
        // 在独立应用中，FormData 需要特定格式
        // 注意：不再使用 getInfoAsync，直接尝试上传

        // 使用正确的格式上传文件
        formData.append('image', {
          uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
          type,
          name: filename,
        } as any);
      }

      logger.debug('OCR FormData 准备完成', { filename, type });

      const response = await apiClient.upload<any>('/api/ocr/recognize/', formData);

      // 后端返回格式: { ok: true, data: { text: "...", length: 100 } }
      const data = response.data || response;
      const text = data.text || '';
      const confidence = data.confidence || 0.95; // 默认置信度

      logger.info('OCR 识别成功', { textLength: text.length, confidence });

      return { text, confidence };
    } catch (error) {
      logger.error('OCR 识别失败', error as Error, {
        imageUri,
        platform: Platform.OS,
      });

      // 提供更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`识别失败: ${errorMessage}`);
    }
  }

  /**
   * 使用 base64 上传（最兼容的方法）
   * 适用于所有平台的独立应用
   */
  async recognizeWithBase64(imageUri: string): Promise<OcrResult> {
    try {
      logger.info('OCR 使用 base64 方法', { imageUri });

      // 读取文件为 base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 使用 JSON 格式发送
      const response = await apiClient.post<any>('/api/ocr/recognize/', {
        image: `data:image/jpeg;base64,${base64}`,
      });

      const data = response.data || response;
      const text = data.text || '';
      const confidence = data.confidence || 0.95;

      logger.info('OCR 识别成功 (base64)', { textLength: text.length, confidence });

      return { text, confidence };
    } catch (error) {
      logger.error('OCR 识别失败 (base64)', error as Error);
      throw new Error('识别失败，请重试');
    }
  }

  /**
   * 使用 fetch 直接上传（备用方法）
   * 修复独立应用中的文件上传问题
   */
  async recognizeWithFetch(imageUri: string): Promise<OcrResult> {
    try {
      logger.info('OCR 使用 fetch 方法', { imageUri, platform: Platform.OS });

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // 在独立应用中使用正确的文件格式
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, filename);
      } else {
        // iOS/Android: 使用正确的 uri 格式
        const normalizedUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

        formData.append('image', {
          uri: normalizedUri,
          type,
          name: filename,
        } as any);
      }

      // 不要手动设置 Content-Type，让浏览器/系统自动设置
      const response = await fetch(`${API_BASE_URL}/api/ocr/recognize/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('OCR HTTP 错误', new Error(errorText), {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // 后端返回格式: { ok: true, data: { text: "...", length: 100 } }
      const data = responseData.data || responseData;
      const text = data.text || '';
      const confidence = data.confidence || 0.95; // 默认置信度

      logger.info('OCR 识别成功 (fetch)', { textLength: text.length, confidence });

      return { text, confidence };
    } catch (error) {
      logger.error('OCR 识别失败 (fetch)', error as Error, {
        imageUri,
        platform: Platform.OS,
      });

      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`识别失败: ${errorMessage}`);
    }
  }
}

// 导出单例
export const ocrService = new OcrService();

/**
 * 便捷方法 - 智能选择最佳上传方式
 *
 * 优先级：
 * 1. 尝试 FormData 上传（标准方法）
 * 2. 失败则尝试 fetch 方法
 * 3. 最后尝试 base64 方法
 */
export const recognizeImage = async (imageUri: string): Promise<OcrResult> => {
  logger.info('OCR 开始识别（智能模式）', {
    imageUri: imageUri.substring(0, 50) + '...',
    platform: Platform.OS,
  });

  // 方法 1: 尝试标准 FormData 上传
  try {
    logger.debug('OCR 尝试方法 1: FormData');
    return await ocrService.recognize(imageUri);
  } catch (error1) {
    logger.warn('OCR 方法 1 失败，尝试方法 2', { error: String(error1) });

    // 方法 2: 尝试 fetch 方法
    try {
      logger.debug('OCR 尝试方法 2: Fetch');
      return await ocrService.recognizeWithFetch(imageUri);
    } catch (error2) {
      logger.warn('OCR 方法 2 失败，尝试方法 3', { error: String(error2) });

      // 方法 3: 尝试 base64 方法（最兼容）
      try {
        logger.debug('OCR 尝试方法 3: Base64');
        return await ocrService.recognizeWithBase64(imageUri);
      } catch (error3) {
        logger.error('OCR 所有方法都失败', error3 as Error, {
          error1: String(error1),
          error2: String(error2),
          error3: String(error3),
        });
        throw new Error('识别失败，请检查网络连接后重试');
      }
    }
  }
};
