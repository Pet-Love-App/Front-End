import { API_BASE_URL } from '@/src/config/env';

/**
 * API 端点常量定义
 * 统一管理所有 API 路径
 * 注意：后端已迁移到 Supabase，API 路径已更新
 */
export const API_ENDPOINTS = {
  // ==================== 认证相关 (Supabase Auth) ====================
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register/`, // 用户注册
    LOGIN: `${API_BASE_URL}/api/auth/login/`, // 登录获取 token
    LOGOUT: `${API_BASE_URL}/api/auth/logout/`, // 登出
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh/`, // 刷新 access token
    GET_PROFILE: `${API_BASE_URL}/api/auth/profile/`, // 获取用户资料
    UPDATE_PROFILE: `${API_BASE_URL}/api/auth/profile/update/`, // 更新用户资料
    UPLOAD_AVATAR: `${API_BASE_URL}/api/auth/avatar/`, // 上传头像
    DELETE_AVATAR: `${API_BASE_URL}/api/auth/avatar/delete/`, // 删除头像
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/password/change/`, // 修改密码
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/password/reset/`, // 重置密码
  },

  // ==================== 用户相关 ====================
  USER: {
    ME: `${API_BASE_URL}/api/auth/profile/`, // 获取当前用户完整信息（含头像、宠物）
    DETAIL: (userId: string) => `${API_BASE_URL}/api/auth/profile/`, // 获取指定用户信息（Supabase 使用 UUID）
    AVATAR: `${API_BASE_URL}/api/auth/avatar/`, // 上传/更新/删除头像
    UPDATE_PROFILE: `${API_BASE_URL}/api/auth/profile/update/`, // 更新用户资料
  },

  // ==================== 宠物相关 ====================
  PET: {
    LIST: `${API_BASE_URL}/api/pets/`, // 获取宠物列表
    CREATE: `${API_BASE_URL}/api/pets/create/`, // 创建宠物
    DETAIL: (petId: number) => `${API_BASE_URL}/api/pets/${petId}/`, // 获取宠物详情
    UPDATE: (petId: number) => `${API_BASE_URL}/api/pets/${petId}/update/`, // 更新宠物
    DELETE: (petId: number) => `${API_BASE_URL}/api/pets/${petId}/delete/`, // 删除宠物
    UPLOAD_PHOTO: (petId: number) => `${API_BASE_URL}/api/pets/${petId}/photo/`, // 上传宠物照片
    DELETE_PHOTO: (petId: number) => `${API_BASE_URL}/api/pets/${petId}/photo/delete/`, // 删除宠物照片
    MY_PETS: `${API_BASE_URL}/api/pets/`, // 获取我的宠物列表
  },

  // ==================== 猫粮相关 ====================
  CATFOOD: {
    LIST: `${API_BASE_URL}/api/catfood/`, // 获取猫粮列表
    CREATE: `${API_BASE_URL}/api/catfood/create/`, // 创建猫粮
    DETAIL: (id: number) => `${API_BASE_URL}/api/catfood/${id}/`, // 获取猫粮详情
    UPDATE: (id: number) => `${API_BASE_URL}/api/catfood/${id}/update/`, // 更新猫粮
    DELETE: (id: number) => `${API_BASE_URL}/api/catfood/${id}/delete/`, // 删除猫粮
    UPLOAD_IMAGE: (id: number) => `${API_BASE_URL}/api/catfood/${id}/image/`, // 上传猫粮图片
    DELETE_IMAGE: (id: number) => `${API_BASE_URL}/api/catfood/${id}/image/delete/`, // 删除猫粮图片
    SEARCH: `${API_BASE_URL}/api/catfood/search/`, // 搜索猫粮（按名称或品牌）
    COMMENTS: (id: number) => `${API_BASE_URL}/api/catfood/${id}/comments/`, // 获取猫粮的评论列表
    // 猫粮点赞相关
    LIKES: `${API_BASE_URL}/api/catfood/likes/`, // 获取用户点赞的猫粮列表
    LIKE: `${API_BASE_URL}/api/catfood/likes/`, // 点赞猫粮
    UNLIKE: (likeId: number) => `${API_BASE_URL}/api/catfood/likes/${likeId}/`, // 取消点赞
    TOGGLE_LIKE: `${API_BASE_URL}/api/catfood/likes/toggle/`, // 切换点赞状态
    CHECK_LIKE: `${API_BASE_URL}/api/catfood/likes/check/`, // 检查点赞状态
    LIKES_COUNT: (id: number) => `${API_BASE_URL}/api/catfood/likes/count/${id}/`, // 获取点赞数量
    // 条形码相关
    BY_BARCODE: `${API_BASE_URL}/api/catfood/by-barcode/`, // 通过条形码查询猫粮
    SCAN_BARCODE: `${API_BASE_URL}/api/catfood/scan-barcode/`, // 扫描条形码图片识别
  },

  // ==================== 评论相关 ====================
  COMMENT: {
    LIST: `${API_BASE_URL}/api/comments/`, // 获取评论列表（可按 target_type 和 target_id 过滤）
    CREATE: `${API_BASE_URL}/api/comments/create/`, // 创建评论
    DETAIL: (id: number) => `${API_BASE_URL}/api/comments/${id}/`, // 获取评论详情
    UPDATE: (id: number) => `${API_BASE_URL}/api/comments/${id}/update/`, // 更新评论
    DELETE: (id: number) => `${API_BASE_URL}/api/comments/${id}/delete/`, // 删除评论
    // 评论点赞相关
    LIKES: `${API_BASE_URL}/api/comments/likes/`, // 获取用户点赞的评论列表
    LIKE: `${API_BASE_URL}/api/comments/likes/`, // 点赞评论
    UNLIKE: (likeId: number) => `${API_BASE_URL}/api/comments/likes/${likeId}/`, // 取消点赞
    TOGGLE_LIKE: `${API_BASE_URL}/api/comments/likes/toggle/`, // 切换点赞状态
    CHECK_LIKE: `${API_BASE_URL}/api/comments/likes/check/`, // 检查点赞状态
  },

  // ==================== 添加剂相关 ====================
  ADDITIVE: {
    SEARCH_INGREDIENT: `${API_BASE_URL}/api/additive/search-ingredient/`, // 搜索营养成分
    SEARCH_ADDITIVE: `${API_BASE_URL}/api/additive/search-additive/`, // 搜索添加剂
    ADD_INGREDIENT: `${API_BASE_URL}/api/additive/add-ingredient/`, // 添加营养成分
    ADD_ADDITIVE: `${API_BASE_URL}/api/additive/add-additive/`, // 添加添加剂
    INGREDIENT_INFO: `${API_BASE_URL}/api/additive/ingredient-info/`, // 获取成分信息（Baidu API）
  },

  // ==================== AI 报告相关 ====================
  AI_REPORT: {
    LLM_CHAT: `${API_BASE_URL}/api/ai/llm/chat/`, // LLM 聊天生成报告
    SAVE: `${API_BASE_URL}/api/ai/save/`, // 保存报告
    GET: (catfoodId: number) => `${API_BASE_URL}/api/ai/${catfoodId}/`, // 获取报告
    DELETE: (catfoodId: number) => `${API_BASE_URL}/api/ai/${catfoodId}/delete/`, // 删除报告
    EXISTS: (catfoodId: number) => `${API_BASE_URL}/api/ai/${catfoodId}/exists/`, // 检查报告是否存在
    // 报告收藏相关
    FAVORITES: `${API_BASE_URL}/api/ai/favorites/`, // 获取收藏的报告列表
    TOGGLE_FAVORITE: `${API_BASE_URL}/api/ai/favorites/toggle/`, // 切换收藏状态
    CHECK_FAVORITE: `${API_BASE_URL}/api/ai/favorites/check/`, // 检查收藏状态
  },

  // ==================== OCR 相关 ====================
  OCR: {
    RECOGNIZE: `${API_BASE_URL}/api/ocr/recognize/`, // OCR 识别
  },

  // ==================== 论坛相关 ====================
  FORUM: {
    POSTS: `${API_BASE_URL}/api/forum/posts/`, // 获取帖子列表
    CREATE_POST: `${API_BASE_URL}/api/forum/posts/create/`, // 创建帖子
    POST_DETAIL: (postId: number) => `${API_BASE_URL}/api/forum/posts/${postId}/`, // 获取帖子详情
    UPDATE_POST: (postId: number) => `${API_BASE_URL}/api/forum/posts/${postId}/update/`, // 更新帖子
    DELETE_POST: (postId: number) => `${API_BASE_URL}/api/forum/posts/${postId}/delete/`, // 删除帖子
    UPLOAD_MEDIA: (postId: number) => `${API_BASE_URL}/api/forum/posts/${postId}/media/`, // 上传帖子媒体
    // 帖子收藏相关
    FAVORITES: `${API_BASE_URL}/api/forum/favorites/`, // 获取收藏的帖子列表
    TOGGLE_FAVORITE: `${API_BASE_URL}/api/forum/favorites/toggle/`, // 切换收藏状态
    CHECK_FAVORITE: `${API_BASE_URL}/api/forum/favorites/check/`, // 检查收藏状态
  },

  // ==================== 通知相关 ====================
  NOTIFICATION: {
    LIST: `${API_BASE_URL}/api/notifications/`, // 获取通知列表
    UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count/`, // 获取未读通知数量
    MARK_READ: (notificationId: number) =>
      `${API_BASE_URL}/api/notifications/${notificationId}/read/`, // 标记为已读
    MARK_ALL_READ: `${API_BASE_URL}/api/notifications/mark-all-read/`, // 标记所有为已读
    DELETE: (notificationId: number) =>
      `${API_BASE_URL}/api/notifications/${notificationId}/delete/`, // 删除通知
  },

  // ==================== 声誉相关 ====================
  REPUTATION: {
    SUMMARY: `${API_BASE_URL}/api/reputation/summary/`, // 获取用户声誉摘要
    BADGES: `${API_BASE_URL}/api/reputation/badges/`, // 获取所有徽章
    USER_BADGES: `${API_BASE_URL}/api/reputation/user-badges/`, // 获取用户徽章
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
