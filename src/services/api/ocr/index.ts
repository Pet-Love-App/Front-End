/**
 * OCR API 服务
 * 集成 Sentry 错误追踪
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '@/src/utils/logger';
import { API_BASE_URL } from '@/src/config/env';
import { captureException, addSentryBreadcrumb, Sentry } from '@/src/lib/sentry';

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
    // 添加 Sentry 面包屑记录操作开始
    addSentryBreadcrumb({
      category: 'ocr',
      message: 'OCR recognize started (FormData method)',
      level: 'info',
      data: { platform: Platform.OS, method: 'formdata' },
    });

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

      // 记录成功
      addSentryBreadcrumb({
        category: 'ocr',
        message: 'OCR recognize succeeded',
        level: 'info',
        data: { textLength: text.length, confidence },
      });

      return { text, confidence };
    } catch (error) {
      logger.error('OCR 识别失败', error as Error, {
        imageUri,
        platform: Platform.OS,
      });

      // 🔴 发送到 Sentry 进行错误追踪
      captureException(error as Error, {
        tags: { service: 'ocr', method: 'formdata' },
        extra: {
          imageUri: imageUri.substring(0, 100), // 截断避免敏感信息
          platform: Platform.OS,
          filename: imageUri.split('/').pop(),
        },
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
    addSentryBreadcrumb({
      category: 'ocr',
      message: 'OCR recognize started (Base64 method)',
      level: 'info',
      data: { platform: Platform.OS, method: 'base64' },
    });

    try {
      logger.info('OCR 使用 base64 方法', { imageUri });

      // 读取文件为 base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      addSentryBreadcrumb({
        category: 'ocr',
        message: 'Base64 encoding completed',
        level: 'info',
        data: { base64Length: base64.length },
      });

      // 使用 JSON 格式发送
      const response = await apiClient.post<any>('/api/ocr/recognize/', {
        image: `data:image/jpeg;base64,${base64}`,
      });

      const data = response.data || response;
      const text = data.text || '';
      const confidence = data.confidence || 0.95;

      logger.info('OCR 识别成功 (base64)', { textLength: text.length, confidence });

      addSentryBreadcrumb({
        category: 'ocr',
        message: 'OCR recognize succeeded (base64)',
        level: 'info',
        data: { textLength: text.length, confidence },
      });

      return { text, confidence };
    } catch (error) {
      logger.error('OCR 识别失败 (base64)', error as Error);

      // 🔴 发送到 Sentry
      captureException(error as Error, {
        tags: { service: 'ocr', method: 'base64' },
        extra: {
          imageUri: imageUri.substring(0, 100),
          platform: Platform.OS,
        },
      });

      throw new Error('识别失败，请重试');
    }
  }

  /**
   * 使用 fetch 直接上传（备用方法）
   * 修复独立应用中的文件上传问题
   */
  async recognizeWithFetch(imageUri: string): Promise<OcrResult> {
    addSentryBreadcrumb({
      category: 'ocr',
      message: 'OCR recognize started (Fetch method)',
      level: 'info',
      data: { platform: Platform.OS, method: 'fetch' },
    });

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
        const httpError = new Error(`HTTP ${response.status}: ${response.statusText}`);

        logger.error('OCR HTTP 错误', httpError, {
          status: response.status,
          statusText: response.statusText,
          responseBody: errorText.substring(0, 500), // 截断
        });

        // 🔴 发送 HTTP 错误到 Sentry
        captureException(httpError, {
          tags: { service: 'ocr', method: 'fetch', httpStatus: String(response.status) },
          extra: {
            status: response.status,
            statusText: response.statusText,
            responseBody: errorText.substring(0, 500),
            platform: Platform.OS,
          },
        });

        throw httpError;
      }

      const responseData = await response.json();

      // 后端返回格式: { ok: true, data: { text: "...", length: 100 } }
      const data = responseData.data || responseData;
      const text = data.text || '';
      const confidence = data.confidence || 0.95; // 默认置信度

      logger.info('OCR 识别成功 (fetch)', { textLength: text.length, confidence });

      addSentryBreadcrumb({
        category: 'ocr',
        message: 'OCR recognize succeeded (fetch)',
        level: 'info',
        data: { textLength: text.length, confidence },
      });

      return { text, confidence };
    } catch (error) {
      logger.error('OCR 识别失败 (fetch)', error as Error, {
        imageUri,
        platform: Platform.OS,
      });

      // 🔴 发送到 Sentry（如果还没发送过）
      if (!(error instanceof Error && error.message.startsWith('HTTP'))) {
        captureException(error as Error, {
          tags: { service: 'ocr', method: 'fetch' },
          extra: {
            imageUri: imageUri.substring(0, 100),
            platform: Platform.OS,
          },
        });
      }

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
  // 开始 Sentry 性能追踪
  const transaction = Sentry.startSpan(
    {
      name: 'OCR Recognition',
      op: 'ocr.recognize',
    },
    () => null
  );

  addSentryBreadcrumb({
    category: 'ocr',
    message: 'OCR smart recognition started',
    level: 'info',
    data: { platform: Platform.OS },
  });

  logger.info('OCR 开始识别（智能模式）', {
    imageUri: imageUri.substring(0, 50) + '...',
    platform: Platform.OS,
  });

  const errors: { method: string; error: string }[] = [];

  // 方法 1: 尝试标准 FormData 上传
  try {
    logger.debug('OCR 尝试方法 1: FormData');
    const result = await ocrService.recognize(imageUri);
    return result;
  } catch (error1) {
    errors.push({ method: 'formdata', error: String(error1) });
    logger.warn('OCR 方法 1 失败，尝试方法 2', { error: String(error1) });

    // 方法 2: 尝试 fetch 方法
    try {
      logger.debug('OCR 尝试方法 2: Fetch');
      const result = await ocrService.recognizeWithFetch(imageUri);
      return result;
    } catch (error2) {
      errors.push({ method: 'fetch', error: String(error2) });
      logger.warn('OCR 方法 2 失败，尝试方法 3', { error: String(error2) });

      // 方法 3: 尝试 base64 方法（最兼容）
      try {
        logger.debug('OCR 尝试方法 3: Base64');
        const result = await ocrService.recognizeWithBase64(imageUri);
        return result;
      } catch (error3) {
        errors.push({ method: 'base64', error: String(error3) });
        logger.error('OCR 所有方法都失败', error3 as Error, {
          error1: String(error1),
          error2: String(error2),
          error3: String(error3),
        });

        // 🔴 所有方法失败时发送汇总报告到 Sentry
        const allFailedError = new Error('OCR 所有方法都失败');
        captureException(allFailedError, {
          tags: { service: 'ocr', severity: 'critical' },
          extra: {
            platform: Platform.OS,
            imageUri: imageUri.substring(0, 100),
            attemptedMethods: errors,
            error1: String(error1),
            error2: String(error2),
            error3: String(error3),
          },
        });

        throw new Error('识别失败，请检查网络连接后重试');
      }
    }
  }
};
