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

  /**
   * 通用请求方法
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    // 构建请求头
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // 检查是否需要跳过 Content-Type（FormData 请求）
    const skipContentType = headers['X-Skip-Content-Type'] === 'true';
    if (skipContentType) {
      delete headers['X-Skip-Content-Type'];
    }

    // 只在有 body 的请求中添加 Content-Type
    // GET 和 DELETE 请求通常不需要 Content-Type
    const method = options.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH'].includes(method) && !skipContentType) {
      // 只有在不是 FormData 的情况下才添加 application/json
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

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
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new Error(errorData.detail || errorData.message || '请求失败');
            }

            return retryResponse.json();
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
        const errorData = await response.json().catch(() => ({}));

        // 提取详细的错误信息
        let errorMessage = `请求失败: ${response.status}`;

        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        // 只在非预期的错误时打印详细日志
        // 404 可能是正常的业务逻辑（如"尚未评分"），由调用者决定是否记录
        if (response.status !== 404) {
          console.error('API 错误详情:', JSON.stringify(errorData, null, 2));
        }

        // 创建一个包含状态码的错误对象
        const error: any = new Error(errorMessage);
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      // 成功响应
      const data = await response.json();
      return data;
    } catch (error: any) {
      // 只在非预期的错误时打印日志
      // 404 等业务逻辑错误由调用者决定是否记录
      if (!error.response || error.response.status !== 404) {
        console.error('API 请求错误:', error);
      }
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
    const hasData = data !== undefined && data !== null;

    // 如果是 FormData 或没有数据，设置特殊标记
    const customHeaders: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (isFormData || !hasData) {
      // 明确标记不要添加 Content-Type
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
        method: options.method || 'POST', // 允许自定义方法，默认 POST
        headers,
        body: formData,
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.detail || '上传失败');
      }

      return response.json();
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  }
}

// 导出单例
export const apiClient = new BaseApi(API_BASE_URL);
