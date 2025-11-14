import { API_BASE_URL } from '@/src/config/env';

/**
 * API 端点常量定义
 * 统一管理所有 API 路径
 */
export const API_ENDPOINTS = {
  // ==================== 认证相关 (Djoser + JWT) ====================
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/users/`, // 用户注册
    LOGIN: `${API_BASE_URL}/api/auth/jwt/create/`, // 登录获取 token
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/jwt/refresh/`, // 刷新 access token
    VERIFY_TOKEN: `${API_BASE_URL}/api/auth/jwt/verify/`, // 验证 token 有效性
    SET_PASSWORD: `${API_BASE_URL}/api/auth/users/set_password/`, // 修改密码
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/users/reset_password/`, // 重置密码
    RESET_PASSWORD_CONFIRM: `${API_BASE_URL}/api/auth/users/reset_password_confirm/`, // 确认重置密码
    ACTIVATION: `${API_BASE_URL}/api/auth/users/activation/`, // 激活账户
  },

  // ==================== 用户相关 ====================
  USER: {
    ME: '/api/user/me/', // 获取当前用户完整信息（含头像、宠物）
    DETAIL: (userId: number) => `/api/user/${userId}/`, // 获取指定用户信息
    AVATAR: '/api/user/avatar/', // 上传/更新/删除头像
    UPDATE_PROFILE: '/api/user/me/', // 更新用户资料
  },

  // ==================== 宠物相关 ====================
  PET: {
    LIST: '/api/user/pets/', // 获取宠物列表
    CREATE: '/api/user/pets/', // 创建宠物
    DETAIL: (petId: number) => `/api/user/pets/${petId}/`, // 获取/更新/删除宠物
    MY_PETS: '/api/user/pets/my_pets/', // 获取我的宠物列表
  },

  // ==================== 猫粮相关 ====================
  CATFOOD: {
    LIST: '/api/catfood/', // 获取猫粮列表
    CREATE: '/api/catfood/', // 创建猫粮
    DETAIL: (id: number) => `/api/catfood/${id}/`, // 获取/更新/删除猫粮
    SEARCH: '/api/catfood/search/', // 搜索猫粮（按名称或品牌）
    COMMENTS: (id: number) => `/api/catfood/${id}/comments/`, // 获取猫粮的评论列表
  },

  // ==================== 评论相关 ====================
  COMMENT: {
    LIST: '/api/comments/', // 获取评论列表（可按 target_type 和 target_id 过滤）
    CREATE: '/api/comments/', // 创建评论
    DETAIL: (id: number) => `/api/comments/${id}/`, // 获取/更新/删除评论
    LIKE: (id: number) => `/api/comments/${id}/like/`, // 点赞/取消点赞评论
  },

  // ==================== 添加剂相关 ====================
  ADDITIVE: {
    SEARCH_INGREDIENT: '/additive/search_ingredient/', // 搜索营养成分
    SEARCH_ADDITIVE: '/additive/search_additive/', // 搜索添加剂
    INGREDIENT_DETAIL: (id: number) => `/additive/ingredient/${id}/`, // 获取营养成分详情
    ADDITIVE_DETAIL: (id: number) => `/additive/additive/${id}/`, // 获取添加剂详情
  },

  // ==================== AI 报告相关 ====================
  AI_REPORT: {
    LIST: '/api/ai/reports/', // 获取报告列表
    CREATE: '/api/ai/reports/', // 创建报告
    DETAIL: (id: number) => `/api/ai/reports/${id}/`, // 获取/更新/删除报告
    GENERATE: '/api/ai/generate/', // 生成 AI 报告
  },
};

/**
 * 构建带查询参数的 URL
 * @param baseUrl 基础 URL
 * @param params 查询参数对象
 * @returns 完整的 URL 字符串
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/**
 * 通用搜索参数接口
 */
export interface SearchParams extends PaginationParams {
  q?: string; // 搜索关键词
  ordering?: string; // 排序字段
}

export default API_ENDPOINTS;
