import { API_BASE_URL } from '@/src/config/env';
import { AppError, ErrorCodes, logError } from '@/src/utils/errorHandler';

/**
 * API 客户端基类
 * 自动从 Zustand store 获取 token 并添加到请求头
 * 统一错误处理
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
   * 创建标准化的错误对象
   */
  private createError(message: string, status: number, data?: any): AppError {
    let errorCode: string = ErrorCodes.UNKNOWN_ERROR;

    // 根据状态码确定错误类型
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

    // 记录错误日志
    logError(error, 'API Request');

    return error;
  }

  // 从 HTML（例如 Django Debug 页面）中提取简短错误标题
  private extractErrorFromHtml(html: string): string {
    try {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) return titleMatch[1].trim();
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match && h1Match[1]) return h1Match[1].trim();
      // Django debug 页面常见的提示
      const disallowed = html.match(/DisallowedHost/i);
      if (disallowed) return 'DisallowedHost（后端 ALLOWED_HOSTS 配置不允许该 Host）';
      return '服务器返回了 HTML 错误页面';
    } catch {
      return '服务器错误';
    }
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
      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`🌐 API请求: ${config.method || 'GET'} ${fullUrl}`);

      const response = await fetch(fullUrl, config);

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
              let message = (errorData &&
                (errorData.detail || (errorData as any).message || (errorData as any).error)) as
                | string
                | undefined;
              if (!message && typeof errorData === 'string' && errorData.length) {
                message = /<html/i.test(errorData)
                  ? this.extractErrorFromHtml(errorData)
                  : errorData;
              }
              throw this.createError(
                message || `请求失败: ${retryResponse.status}`,
                retryResponse.status,
                errorData
              );
            }

            return (await this.safeParseResponse(retryResponse)) as T;
          }
        } catch (error) {
          // 刷新失败，需要重新登录
          console.error('❌ Token 刷新失败，需要重新登录');
          // 延迟导入避免循环依赖
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().logout();
          throw new AppError('认证失败，请重新登录', ErrorCodes.AUTH_EXPIRED, 401);
        }
      }

      // 处理其他错误响应
      if (!response.ok) {
        const errorData = await this.safeParseResponse(response).catch(() => ({}));

        // 提取详细的错误信息（避免把整段 HTML 抛出去）
        let errorMessage = `请求失败: ${response.status}`;

        if (errorData && typeof errorData === 'object') {
          if ((errorData as any).detail) errorMessage = (errorData as any).detail;
          else if ((errorData as any).message) errorMessage = (errorData as any).message;
          else if ((errorData as any).error) errorMessage = (errorData as any).error;
          else if ((errorData as any).errors) {
            // 处理字段级错误
            const fieldErrors = Object.entries((errorData as any).errors)
              .map(
                ([field, errors]) =>
                  `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
              )
              .join('\n');
            errorMessage = fieldErrors || '输入数据有误';
          }
        } else if (typeof errorData === 'string' && errorData.length) {
          errorMessage = /<html/i.test(errorData)
            ? this.extractErrorFromHtml(errorData)
            : errorData;
        }

        // 检查是否是 token 无效错误（即使不是 401）
        // 确保 errorMessage 是字符串类型
        const messageStr =
          typeof errorMessage === 'string' ? errorMessage : String(errorMessage || '');
        const isTokenInvalid =
          messageStr.includes('Invalid token') ||
          messageStr.includes('invalid JWT') ||
          messageStr.includes('signature is invalid') ||
          messageStr.includes('token expired');

        if (isTokenInvalid && token) {
          console.error('❌ Token 无效，自动登出');
          // 延迟导入避免循环依赖
          const { useUserStore } = require('@/src/store/userStore');
          await useUserStore.getState().logout();
          throw new AppError('认证失败，请重新登录', ErrorCodes.AUTH_EXPIRED, 401);
        }

        // 创建标准化的错误对象
        throw this.createError(errorMessage, response.status, errorData);
      }

      // 成功响应：安全解析
      const parsed = await this.safeParseResponse(response);
      return parsed as T;
    } catch (error: any) {
      // 如果已经是 AppError，直接抛出
      if (error instanceof AppError) {
        throw error;
      }

      // 网络错误处理
      if (error.message && error.message.includes('Network request failed')) {
        throw new AppError('网络连接失败，请检查网络设置', ErrorCodes.NETWORK_ERROR);
      }

      if (error.message && error.message.includes('timeout')) {
        throw new AppError('请求超时，请稍后重试', ErrorCodes.TIMEOUT_ERROR);
      }

      // 其他未知错误
      logError(error, 'API Request');
      throw new AppError(error.message || '请求失败', ErrorCodes.UNKNOWN_ERROR);
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
        const errorData = await this.safeParseResponse(response).catch(() => ({}));
        let message = (errorData && ((errorData as any).message || (errorData as any).detail)) as
          | string
          | undefined;
        if (!message && typeof errorData === 'string' && errorData.length) {
          message = /<html/i.test(errorData) ? this.extractErrorFromHtml(errorData) : errorData;
        }
        throw this.createError(
          message || `请求失败: ${response.status}`,
          response.status,
          errorData
        );
      }

      return (await this.safeParseResponse(response)) as T;
    } catch (error: any) {
      // 如果已经是 AppError，直接抛出
      if (error instanceof AppError) {
        throw error;
      }

      // 网络错误处理
      if (error.message && error.message.includes('Network request failed')) {
        throw new AppError('网络连接失败，请检查网络设置', ErrorCodes.NETWORK_ERROR);
      }

      // 其他错误
      logError(error, 'Custom Headers Request');
      throw new AppError(error.message || '请求失败', ErrorCodes.UNKNOWN_ERROR);
    }
  }

  /**
   * PUT 请求
   */
  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;

    const requestOptions: RequestInit = {
      ...options,
      method: 'PUT',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    };

    if (isFormData) {
      const token = this.getToken();
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };
      if (headers['Content-Type']) delete headers['Content-Type'];
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return this.requestWithCustomHeaders<T>(endpoint, requestOptions, headers);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = data instanceof FormData;

    const requestOptions: RequestInit = {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    };

    if (isFormData) {
      const token = this.getToken();
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };
      if (headers['Content-Type']) delete headers['Content-Type'];
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return this.requestWithCustomHeaders<T>(endpoint, requestOptions, headers);
    }

    return this.request<T>(endpoint, requestOptions);
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
      Accept: 'application/json',
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
        const errorPayload = await this.safeParseResponse(response).catch(() => ({}));
        let message = (errorPayload &&
          ((errorPayload as any).message || (errorPayload as any).detail)) as string | undefined;
        if (!message && typeof errorPayload === 'string' && errorPayload.length) {
          message = /<html/i.test(errorPayload)
            ? this.extractErrorFromHtml(errorPayload)
            : errorPayload;
        }

        // 针对 500 错误给出更明确的指导
        if (response.status === 500) {
          const serverErrorMessage =
            '后端服务器错误 (500)。这不是前端代码问题，请检查服务器日志获取详细错误栈。';
          throw this.createError(serverErrorMessage, 500, errorPayload);
        }

        const statusInfo = `上传失败: ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;
        throw this.createError(message || statusInfo, response.status, errorPayload);
      }

      return (await this.safeParseResponse(response)) as T;
    } catch (error: any) {
      // 如果已经是 AppError，直接抛出
      if (error instanceof AppError) {
        throw error;
      }

      // 网络错误
      if (error.message && error.message.includes('Network request failed')) {
        throw new AppError('网络连接失败，无法上传文件', ErrorCodes.NETWORK_ERROR);
      }

      // 其他错误
      logError(error, 'File Upload');
      throw new AppError(error.message || '文件上传失败', ErrorCodes.UNKNOWN_ERROR);
    }
  }
}

// 导出单例
export const apiClient = new BaseApi(API_BASE_URL);
