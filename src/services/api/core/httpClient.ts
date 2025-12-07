/**
 * 统一的 HTTP 客户端
 * 提供完整的 API 调用功能：
 * - 自动 token 管理
 * - 请求/响应转换
 * - 错误处理
 * - 文件上传
 */

import { AppError, ErrorCodes, logError } from '@/src/utils/errorHandler';
import { logger } from '@/src/utils/logger';
import { API_BASE_URL } from '@/src/config/env';

import { createErrorDetail, toCamelCase, toSnakeCase, wrapError, wrapSuccess } from './helpers';

import type { ApiResponse } from './types';

// ==================== 请求选项 ====================

export interface RequestOptions {
  /** 是否自动转换请求参数为 snake_case */
  transformRequest?: boolean;
  /** 是否自动转换响应为 camelCase */
  transformResponse?: boolean;
  /** 自定义响应转换函数 */
  responseTransformer?: (data: unknown) => unknown;
  /** 从响应中提取数据的 key */
  extractKey?: string;
}

const defaultOptions: RequestOptions = {
  transformRequest: true,
  transformResponse: true,
};

// ==================== 低级 API 客户端 ====================

/**
 * 低级 API 客户端
 * 提供基础的 HTTP 请求功能，自动处理 token、错误等
 */
class LowLevelApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * 从 Zustand store 获取 access token
   * 使用延迟导入避免循环依赖
   */
  private getToken(): string | null {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useUserStore } = require('@/src/store/userStore');
    return useUserStore.getState().accessToken;
  }

  /**
   * 创建标准化的错误对象
   */
  private createError(message: string, status: number, data?: any): AppError {
    let errorCode: string = ErrorCodes.UNKNOWN_ERROR;

    switch (status) {
      case 400:
        errorCode = ErrorCodes.INVALID_INPUT;
        break;
      case 401:
        errorCode = ErrorCodes.AUTH_REQUIRED;
        break;
      case 403:
        errorCode = ErrorCodes.PERMISSION_DENIED;
        break;
      case 404:
        errorCode = ErrorCodes.NOT_FOUND;
        break;
      case 409:
        errorCode = ErrorCodes.ALREADY_EXISTS;
        break;
      case 422:
        errorCode = ErrorCodes.VALIDATION_ERROR;
        break;
      case 500:
        errorCode = ErrorCodes.SERVER_ERROR;
        break;
      case 503:
        errorCode = ErrorCodes.SERVICE_UNAVAILABLE;
        break;
    }

    const error = new AppError(message, errorCode, status, data);
    logError(error, 'API Request');
    return error;
  }

  /**
   * 从 HTML 中提取错误信息
   */
  private extractErrorFromHtml(html: string): string {
    try {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) return titleMatch[1].trim();
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match && h1Match[1]) return h1Match[1].trim();
      const disallowed = html.match(/DisallowedHost/i);
      if (disallowed) return 'DisallowedHost（后端 ALLOWED_HOSTS 配置不允许该 Host）';
      return '服务器返回了 HTML 错误页面';
    } catch {
      return '服务器错误';
    }
  }

  /**
   * 安全解析响应
   */
  private async safeParseResponse(res: Response): Promise<any> {
    const raw = await res.text().catch(() => '');
    if (!raw) return null;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(raw);
      } catch {
        logger.warn('解析 JSON 响应失败，返回原始文本', { preview: raw.slice(0, 200) });
        return raw;
      }
    }
    return raw;
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const skipContentType = headers['X-Skip-Content-Type'] === 'true';
    if (skipContentType) {
      delete headers['X-Skip-Content-Type'];
    }

    const method = options.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH'].includes(method) && !skipContentType) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const fullUrl = `${this.baseURL}${endpoint}`;
      logger.debug('API请求', {
        method: config.method || 'GET',
        url: fullUrl,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      });

      const response = await fetch(fullUrl, config);

      // 处理 401 (token 过期)
      if (response.status === 401 && token) {
        logger.info('Token 过期，尝试刷新...');
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().refreshAccessToken();

          const newToken = this.getToken();
          if (newToken) {
            const newHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };

            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
              ...config,
              headers: newHeaders,
            });

            if (!retryResponse.ok) {
              const errorData = await this.safeParseResponse(retryResponse).catch(() => ({}));
              let message =
                (errorData && (errorData.detail || errorData.message || errorData.error)) ||
                `请求失败: ${retryResponse.status}`;
              if (typeof errorData === 'string' && errorData.length) {
                message = /<html/i.test(errorData)
                  ? this.extractErrorFromHtml(errorData)
                  : errorData;
              }
              throw this.createError(message, retryResponse.status, errorData);
            }

            return (await this.safeParseResponse(retryResponse)) as T;
          }
        } catch (error) {
          logger.error('Token 刷新失败，需要重新登录', error as Error);
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().logout();
          throw new AppError('认证失败，请重新登录', ErrorCodes.AUTH_EXPIRED, 401);
        }
      }

      // 处理其他错误响应
      if (!response.ok) {
        const errorData = await this.safeParseResponse(response).catch(() => ({}));

        // 记录完整的错误响应以便调试
        logger.debug('API 错误响应', {
          status: response.status,
          url: response.url,
          errorData: errorData,
        });

        let errorMessage = `请求失败: ${response.status}`;

        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.detail && typeof errorData.detail === 'object') {
            // 处理嵌套的 detail 对象
            errorMessage = JSON.stringify(errorData.detail);
          } else if (errorData.message && typeof errorData.message === 'object') {
            // 处理嵌套的 message 对象
            errorMessage = JSON.stringify(errorData.message);
          } else if (errorData.errors) {
            const fieldErrors = Object.entries(errorData.errors)
              .map(
                ([field, errors]) =>
                  `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
              )
              .join('\n');
            errorMessage = fieldErrors || '输入数据有误';
          } else {
            // 如果都没有，尝试序列化整个 errorData
            try {
              errorMessage = JSON.stringify(errorData);
            } catch {
              errorMessage = `请求失败: ${response.status}`;
            }
          }
        } else if (typeof errorData === 'string' && errorData.length) {
          errorMessage = /<html/i.test(errorData)
            ? this.extractErrorFromHtml(errorData)
            : errorData;
        }

        // 确保 errorMessage 是字符串
        const messageStr =
          typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);

        const isTokenInvalid =
          messageStr.includes('Invalid token') ||
          messageStr.includes('invalid JWT') ||
          messageStr.includes('signature is invalid') ||
          messageStr.includes('token expired');

        if (isTokenInvalid && token) {
          logger.error('Token 无效，自动登出', new Error('Token invalid'));
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().logout();
          throw new AppError('认证失败，请重新登录', ErrorCodes.AUTH_EXPIRED, 401);
        }

        throw this.createError(messageStr, response.status, errorData);
      }

      const parsed = await this.safeParseResponse(response);
      return parsed as T;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.message && error.message.includes('Network request failed')) {
        throw new AppError('网络连接失败，请检查网络设置', ErrorCodes.NETWORK_ERROR);
      }

      if (error.message && error.message.includes('timeout')) {
        throw new AppError('请求超时，请稍后重试', ErrorCodes.TIMEOUT_ERROR);
      }

      logError(error, 'API Request');
      throw new AppError(error.message || '请求失败', ErrorCodes.UNKNOWN_ERROR);
    }
  }

  /** GET 请求 */
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /** POST 请求 */
  async post<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    const hasData = data !== undefined && data !== null;

    const customHeaders: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (isFormData || !hasData) {
      customHeaders['X-Skip-Content-Type'] = 'true';
    }

    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
      body: isFormData ? data : hasData ? JSON.stringify(data) : undefined,
      headers: customHeaders,
    };

    return this.request<T>(endpoint, requestOptions);
  }

  /** PUT 请求 */
  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;

    const requestOptions: RequestInit = {
      ...options,
      method: 'PUT',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    };

    return this.request<T>(endpoint, requestOptions);
  }

  /** PATCH 请求 */
  async patch<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;

    const requestOptions: RequestInit = {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    };

    return this.request<T>(endpoint, requestOptions);
  }

  /** DELETE 请求 */
  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /** 文件上传 */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      Accept: 'application/json',
    };

    if (headers['Content-Type']) {
      delete headers['Content-Type'];
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: options.method || 'POST',
        headers,
        body: formData,
        ...options,
      });

      if (!response.ok) {
        const errorPayload = await this.safeParseResponse(response).catch(() => ({}));
        let message =
          (errorPayload && (errorPayload.message || errorPayload.detail)) ||
          `上传失败: ${response.status}`;
        if (typeof errorPayload === 'string' && errorPayload.length) {
          message = /<html/i.test(errorPayload)
            ? this.extractErrorFromHtml(errorPayload)
            : errorPayload;
        }

        if (response.status === 500) {
          throw this.createError('后端服务器错误 (500)。请检查服务器日志。', 500, errorPayload);
        }

        throw this.createError(message, response.status, errorPayload);
      }

      return (await this.safeParseResponse(response)) as T;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.message && error.message.includes('Network request failed')) {
        throw new AppError('网络连接失败，无法上传文件', ErrorCodes.NETWORK_ERROR);
      }

      logError(error, 'File Upload');
      throw new AppError(error.message || '文件上传失败', ErrorCodes.UNKNOWN_ERROR);
    }
  }
}

// ==================== 高级 HTTP 客户端 ====================

/**
 * 高级 HTTP 客户端
 * 提供数据转换、标准化响应等高级功能
 */
class HttpClient {
  private client: LowLevelApiClient;

  constructor(client: LowLevelApiClient) {
    this.client = client;
  }

  /**
   * 处理响应数据
   */
  private processResponse<T>(data: unknown, options: RequestOptions): T {
    let result = data;

    if (options.extractKey && result && typeof result === 'object') {
      const resp = result as Record<string, unknown>;
      if (options.extractKey in resp) {
        result = resp[options.extractKey];
      }
    }

    if (options.responseTransformer) {
      result = options.responseTransformer(result);
    } else if (options.transformResponse) {
      result = toCamelCase(result);
    }

    return result as T;
  }

  /**
   * 处理请求参数
   */
  private processRequest(data: unknown, options: RequestOptions): unknown {
    if (!data || !options.transformRequest) {
      return data;
    }
    return toSnakeCase(data);
  }

  /** GET 请求 */
  async get<T>(
    endpoint: string,
    options: RequestOptions = defaultOptions
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.client.get<unknown>(endpoint);
      const result = this.processResponse<T>(data, options);
      return wrapSuccess(result);
    } catch (error) {
      return wrapError<T>(createErrorDetail(error));
    }
  }

  /** POST 请求 */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = defaultOptions
  ): Promise<ApiResponse<T>> {
    try {
      const requestBody = this.processRequest(body, options);
      const data = await this.client.post<unknown>(endpoint, requestBody);
      const result = this.processResponse<T>(data, options);
      return wrapSuccess(result);
    } catch (error) {
      return wrapError<T>(createErrorDetail(error));
    }
  }

  /** PUT 请求 */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = defaultOptions
  ): Promise<ApiResponse<T>> {
    try {
      const requestBody = this.processRequest(body, options);
      const data = await this.client.put<unknown>(endpoint, requestBody);
      const result = this.processResponse<T>(data, options);
      return wrapSuccess(result);
    } catch (error) {
      return wrapError<T>(createErrorDetail(error));
    }
  }

  /** PATCH 请求 */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = defaultOptions
  ): Promise<ApiResponse<T>> {
    try {
      const requestBody = this.processRequest(body, options);
      const data = await this.client.patch<unknown>(endpoint, requestBody);
      const result = this.processResponse<T>(data, options);
      return wrapSuccess(result);
    } catch (error) {
      return wrapError<T>(createErrorDetail(error));
    }
  }

  /** DELETE 请求 */
  async delete<T>(
    endpoint: string,
    options: RequestOptions = defaultOptions
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.client.delete<unknown>(endpoint);
      const result = this.processResponse<T>(data, options);
      return wrapSuccess(result);
    } catch (error) {
      return wrapError<T>(createErrorDetail(error));
    }
  }
}

// ==================== 导出 ====================

/** 低级 API 客户端实例（用于 Django 后端） */
export const apiClient = new LowLevelApiClient(API_BASE_URL);

/** 高级 HTTP 客户端实例（提供数据转换等功能） */
export const httpClient = new HttpClient(apiClient);
