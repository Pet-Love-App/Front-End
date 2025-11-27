import { API_BASE_URL } from '@/src/config/env';

/**
 * API 客户端基类
 * 自动从 Zustand store 获取 token 并添加到请求头
 */
class BaseApi {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * 从 Zustand store 获取 access token
   * 使用延迟导入避免循环依赖
   */
  private getToken(): string | null {
    // 延迟导入避免循环依赖
    const { useUserStore } = require('@/src/store/userStore');
    return useUserStore.getState().accessToken;
  }

  // 辅助：安全解析响应文本为 JSON 或返回原文/ null
  private async safeParseResponse(res: Response): Promise<any> {
    const raw = await res.text().catch(() => '');
    if (!raw) return null;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        // 返回原始文本以便上层处理与调试
        console.warn('解析 JSON 响应失败，返回原始文本', raw.slice(0, 200));
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

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 自动添加 Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // 处理 401 未授权（token 过期）
      if (response.status === 401 && token) {
        console.log('🔄 Token 过期，尝试刷新...');

        // 调用 Zustand 的刷新方法
        try {
          // 延迟导入避免循环依赖
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().refreshAccessToken();

          // 获取新的 token
          const newToken = this.getToken();
          if (newToken) {
            // 用新 token 重试原请求
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
              const message = (errorData && (errorData.detail || errorData.message || errorData.error)) || `请求失败: ${retryResponse.status}`;
              throw new Error(message);
            }

            return (await this.safeParseResponse(retryResponse)) as T;
          }
        } catch (error) {
          // 刷新失败，需要重新登录
          console.error('❌ Token 刷新失败，需要重新登录');
          // 延迟导入避免循环依赖
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().logout();
          throw new Error('认证失败，请重新登录');
        }
      }

      // 处理其他错误响应
      if (!response.ok) {
        const errorData = await this.safeParseResponse(response).catch(() => ({}));

        // 提取详细的错误信息
        let errorMessage = `请求失败: ${response.status}`;

        if (errorData && typeof errorData === 'object') {
          if (errorData.detail) errorMessage = errorData.detail;
          else if (errorData.message) errorMessage = errorData.message;
          else if (errorData.error) errorMessage = errorData.error;
        } else if (typeof errorData === 'string' && errorData.length) {
          errorMessage = errorData;
        }

        const hasPayload =
          typeof errorData === 'string'
            ? errorData.length > 0
            : errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0;
        const payloadForLog =
          typeof errorData === 'string'
            ? errorData
            : hasPayload
            ? JSON.stringify(errorData, null, 2)
            : '无详细错误信息';

        console.error('API 错误详情:', payloadForLog);
        throw new Error(errorMessage || `请求失败: ${response.status}`);
      }

      // 成功响应：安全解析
      const parsed = await this.safeParseResponse(response);
      return parsed as T;
    } catch (error) {
      console.error('API 请求错误:', error);
      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 请求
   * 自动处理 JSON 和 FormData
   */
  async post<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    // 如果 data 是 FormData，直接使用；否则序列化为 JSON
    const isFormData = data instanceof FormData;

    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    };

    // 如果是 FormData，需要移除 Content-Type 让浏览器自动设置
    if (isFormData) {
      const token = this.getToken();
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      // 删除 Content-Type，让浏览器自动添加 multipart/form-data
      if (headers['Content-Type']) {
        delete headers['Content-Type'];
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return this.requestWithCustomHeaders<T>(endpoint, requestOptions, headers);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  /**
   * 使用自定义 headers 的请求（用于 FormData）
   */
  private async requestWithCustomHeaders<T = any>(
    endpoint: string,
    options: RequestInit,
    headers: Record<string, string>
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await this.safeParseResponse(response).catch(() => ({}));
        const message = (error && (error.message || error.detail)) || `请求失败: ${response.status}`;
        throw new Error(message);
      }

      return (await this.safeParseResponse(response)) as T;
    } catch (error) {
      console.error('API 请求错误:', error);
      throw error;
    }
  }

  /**
   * PUT 请求
   */
  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 上传文件（如头像、宠物照片）
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
      ...(options.headers as Record<string, string>),
    };

    // 删除 Content-Type，让浏览器自动添加
    if (headers['Content-Type']) {
      delete headers['Content-Type'];
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        ...options,
      });

      if (!response.ok) {
        const error = await this.safeParseResponse(response).catch(() => ({}));
        throw new Error(error?.message || error?.detail || '上传失败');
      }

      return (await this.safeParseResponse(response)) as T;
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  }
}

// 导出单例
export const apiClient = new BaseApi(API_BASE_URL);
