/**
 * API 端点常量定义
 * 统一管理所有 API 路径
 *
 * 📌 迁移状态说明：
 * - ✅ 仍在使用：OCR、AI_REPORT、ADDITIVE.INGREDIENT_INFO（Django 后端）
 * - ❌ 已弃用：其他所有端点均已迁移到 Supabase（见 src/lib/supabase/services/）
 */
export const API_ENDPOINTS = {
  // ==================== 🚀 仍在使用（Django 后端） ====================

  /**
   * AI 报告相关
   * 使用 LLM 生成猫粮成分分析报告
   */
  AI_REPORT: {
    /** 调用 LLM 生成报告 */
    LLM_CHAT: `/api/ai/llm/chat/`,
    /** 保存报告到数据库 */
    SAVE: `/api/ai/save/`,
    /** 获取报告详情 */
    GET: (catfoodId: number) => `/api/ai/${catfoodId}/`,
    /** 删除报告 */
    DELETE: (catfoodId: number) => `/api/ai/${catfoodId}/delete/`,
    /** 检查报告是否存在 */
    EXISTS: (catfoodId: number) => `/api/ai/${catfoodId}/exists/`,
    /** 获取收藏的报告列表 */
    FAVORITES: `/api/ai/favorites/`,
    /** 切换收藏状态 */
    TOGGLE_FAVORITE: `/api/ai/favorites/toggle/`,
    /** 删除收藏 */
    DELETE_FAVORITE: (catfoodId: number) => `/api/ai/favorites/${catfoodId}/delete/`,
  },

  /**
   * OCR 相关
   * 图片文字识别
   */
  OCR: {
    /** OCR 识别配料表 */
    RECOGNIZE: `/api/ocr/recognize/`,
  },

  /**
   * 添加剂/成分信息查询
   * 使用百度 API 查询成分详细信息
   */
  ADDITIVE: {
    /** 获取成分信息（百度 API） */
    INGREDIENT_INFO: `/api/search/ingredient/info`,
  },

  // ==================== ⚠️ 已弃用（已迁移到 Supabase）====================
  // 以下端点已不再使用，保留仅为兼容性考虑
  // 新功能请使用 src/lib/supabase/services/ 下的对应服务

  /**
   * @deprecated 使用 src/lib/supabase/services/auth.ts 中的 supabaseAuthService
   */
  AUTH: {
    /** @deprecated */
    REGISTER: `/api/auth/register/`,
    /** @deprecated */
    LOGIN: `/api/auth/login/`,
    /** @deprecated */
    LOGOUT: `/api/auth/logout/`,
    /** @deprecated */
    REFRESH_TOKEN: `/api/auth/refresh/`,
    /** @deprecated */
    GET_PROFILE: `/api/auth/profile/`,
    /** @deprecated */
    UPDATE_PROFILE: `/api/auth/profile/update/`,
    /** @deprecated */
    UPLOAD_AVATAR: `/api/auth/avatar/`,
    /** @deprecated */
    DELETE_AVATAR: `/api/auth/avatar/delete/`,
    /** @deprecated */
    CHANGE_PASSWORD: `/api/auth/password/change/`,
    /** @deprecated */
    RESET_PASSWORD: `/api/auth/password/reset/`,
  },

  /**
   * @deprecated 使用 src/lib/supabase/services/profile.ts 中的 supabaseProfileService
   */
  USER: {
    /** @deprecated */
    ME: `/api/auth/profile/`,
    /** @deprecated */
    DETAIL: (userId: string) => `/api/auth/profile/`,
    /** @deprecated */
    AVATAR: `/api/auth/avatar/`,
    /** @deprecated */
    UPDATE_PROFILE: `/api/auth/profile/update/`,
  },

  /**
   * @deprecated 使用 src/lib/supabase/services/pet.ts 中的 supabasePetService
   */
  PET: {
    /** @deprecated */
    LIST: `/api/pets/`,
    /** @deprecated */
    CREATE: `/api/pets/create/`,
    /** @deprecated */
    DETAIL: (petId: number) => `/api/pets/${petId}/`,
    /** @deprecated */
    UPDATE: (petId: number) => `/api/pets/${petId}/`,
    /** @deprecated */
    DELETE: (petId: number) => `/api/pets/${petId}/delete/`,
    /** @deprecated */
    UPLOAD_PHOTO: (petId: number) => `/api/pets/${petId}/photo/`,
    /** @deprecated */
    DELETE_PHOTO: (petId: number) => `/api/pets/${petId}/photo/delete/`,
    /** @deprecated */
    MY_PETS: `/api/pets/`,
  },

  /**
   * @deprecated 使用 src/lib/supabase/services/catfood.ts 中的 supabaseCatfoodService
   */
  CATFOOD: {
    /** @deprecated */
    LIST: `/api/catfoods/`,
    /** @deprecated */
    CREATE: `/api/catfoods/create/`,
    /** @deprecated */
    DETAIL: (id: number) => `/api/catfoods/${id}/`,
    /** @deprecated */
    UPDATE: (id: number) => `/api/catfoods/${id}/update/`,
    /** @deprecated */
    DELETE: (id: number) => `/api/catfoods/${id}/delete/`,
    /** @deprecated */
    RATE: (id: number) => `/api/catfoods/${id}/rate/`,
    /** @deprecated */
    FAVORITE: (id: number) => `/api/catfoods/${id}/favorite/`,
    /** @deprecated */
    FAVORITES: `/api/catfoods/favorites/`,
    /** @deprecated */
    RATINGS: (id: number) => `/api/catfoods/${id}/ratings/`,
    /** @deprecated */
    COMMENTS: (id: number) => `/api/catfood/${id}/comments/`,
    /** @deprecated */
    LIKES: `/api/catfood/likes/`,
    /** @deprecated */
    UNLIKE: (likeId: number) => `/api/catfood/likes/${likeId}/`,
    /** @deprecated */
    TOGGLE_LIKE: `/api/catfood/likes/toggle/`,
    /** @deprecated */
    CHECK_LIKE: `/api/catfood/likes/check/`,
    /** @deprecated */
    LIKES_COUNT: (id: number) => `/api/catfood/likes/count/${id}/`,
    /** @deprecated */
    BY_BARCODE: `/api/catfood/by-barcode/`,
    /** @deprecated */
    SCAN_BARCODE: `/api/catfood/scan-barcode/`,
  },

  /**
   * @deprecated 使用 src/lib/supabase/services/comment.ts 中的 supabaseCommentService
   */
  COMMENT: {
    /** @deprecated */
    LIST: `/api/comments/`,
    /** @deprecated */
    CREATE: `/api/comments/create/`,
    /** @deprecated */
    DELETE: (id: number) => `/api/comments/${id}/delete/`,
    /** @deprecated */
    LIKE: (id: number) => `/api/comments/${id}/like/`,
  },

  /**
   * @deprecated 使用 src/lib/supabase/services/forum.ts 中的 supabaseForumService
   */
  FORUM: {
    /** @deprecated */
    POSTS: `/api/posts/`,
    /** @deprecated */
    CREATE_POST: `/api/posts/create/`,
    /** @deprecated */
    POST_DETAIL: (postId: number) => `/api/posts/${postId}/`,
    /** @deprecated */
    DELETE_POST: (postId: number) => `/api/posts/${postId}/delete/`,
    /** @deprecated */
    FAVORITE_POST: (postId: number) => `/api/posts/${postId}/favorite/`,
  },

  /**
   * @deprecated 通知功能暂未实现
   */
  NOTIFICATION: {
    /** @deprecated */
    LIST: `/api/notifications/`,
    /** @deprecated */
    UNREAD_COUNT: `/api/notifications/unread-count/`,
    /** @deprecated */
    MARK_READ: (notificationId: number) => `/api/notifications/${notificationId}/read/`,
    /** @deprecated */
    MARK_ALL_READ: `/api/notifications/read-all/`,
    /** @deprecated */
    DELETE: (notificationId: number) => `/api/notifications/${notificationId}/delete/`,
  },

  /**
   * @deprecated 使用 src/lib/supabase/services/reputation.ts 中的 supabaseReputationService
   */
  REPUTATION: {
    /** @deprecated */
    ME: `/api/reputation/me/`,
    /** @deprecated */
    USER: (userId: string) => `/api/reputation/users/${userId}/`,
    /** @deprecated */
    MY_BADGES: `/api/reputation/my-badges/`,
    /** @deprecated */
    BADGES: `/api/reputation/badges/`,
    /** @deprecated */
    EQUIP_BADGE: (badgeCode: string) => `/api/reputation/badges/${badgeCode}/equip/`,
    /** @deprecated */
    UNEQUIP_BADGE: (badgeCode: string) => `/api/reputation/badges/${badgeCode}/unequip/`,
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
