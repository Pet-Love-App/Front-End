/**
 * API 端点常量定义
 * 统一管理所有 API 路径
 * 注意：后端已迁移到 Supabase，API 路径已更新
 */
export const API_ENDPOINTS = {
  // ==================== 认证相关 (Supabase Auth) ====================
  AUTH: {
    REGISTER: `/api/auth/register/`, // 用户注册
    LOGIN: `/api/auth/login/`, // 登录获取 token
    LOGOUT: `/api/auth/logout/`, // 登出
    REFRESH_TOKEN: `/api/auth/refresh/`, // 刷新 access token
    GET_PROFILE: `/api/auth/profile/`, // 获取用户资料
    UPDATE_PROFILE: `/api/auth/profile/update/`, // 更新用户资料
    UPLOAD_AVATAR: `/api/auth/avatar/`, // 上传头像
    DELETE_AVATAR: `/api/auth/avatar/delete/`, // 删除头像
    CHANGE_PASSWORD: `/api/auth/password/change/`, // 修改密码
    RESET_PASSWORD: `/api/auth/password/reset/`, // 重置密码
  },

  // ==================== 用户相关 ====================
  USER: {
    ME: `/api/auth/profile/`, // 获取当前用户完整信息（含头像、宠物）
    DETAIL: (userId: string) => `/api/auth/profile/`, // 获取指定用户信息（Supabase 使用 UUID）
    AVATAR: `/api/auth/avatar/`, // 上传/更新/删除头像
    UPDATE_PROFILE: `/api/auth/profile/update/`, // 更新用户资料
  },

  // ==================== 宠物相关 ====================
  PET: {
    LIST: `/api/pets/`, // 获取宠物列表
    CREATE: `/api/pets/create/`, // 创建宠物 (POST)
    DETAIL: (petId: number) => `/api/pets/${petId}/`, // 获取宠物详情
    UPDATE: (petId: number) => `/api/pets/${petId}/`, // 更新宠物 (PUT)
    DELETE: (petId: number) => `/api/pets/${petId}/delete/`, // 删除宠物
    UPLOAD_PHOTO: (petId: number) => `/api/pets/${petId}/photo/`, // 上传宠物照片
    DELETE_PHOTO: (petId: number) => `/api/pets/${petId}/photo/delete/`, // 删除宠物照片
    MY_PETS: `/api/pets/`, // 获取我的宠物列表
  },

  // ==================== 猫粮相关 ====================
  CATFOOD: {
    LIST: `/api/catfoods/`, // 获取猫粮列表
    CREATE: `/api/catfoods/create/`, // 创建猫粮
    DETAIL: (id: number) => `/api/catfoods/${id}/`, // 获取猫粮详情
    UPDATE: (id: number) => `/api/catfoods/${id}/update/`, // 更新猫粮
    DELETE: (id: number) => `/api/catfoods/${id}/delete/`, // 删除猫粮
    RATE: (id: number) => `/api/catfoods/${id}/rate/`, // 评分猫粮
    FAVORITE: (id: number) => `/api/catfoods/${id}/favorite/`, // 收藏/取消收藏猫粮
    FAVORITES: `/api/catfoods/favorites/`, // 获取用户收藏的猫粮列表
    RATINGS: (id: number) => `/api/catfoods/${id}/ratings/`, // 获取猫粮评分列表
    COMMENTS: (id: number) => `/api/catfood/${id}/comments/`, // 获取猫粮的评论列表
    // 猫粮点赞相关
    LIKES: `/api/catfood/likes/`, // 获取/创建点赞 (GET/POST)
    UNLIKE: (likeId: number) => `/api/catfood/likes/${likeId}/`, // 取消点赞
    TOGGLE_LIKE: `/api/catfood/likes/toggle/`, // 切换点赞状态
    CHECK_LIKE: `/api/catfood/likes/check/`, // 检查点赞状态
    LIKES_COUNT: (id: number) => `/api/catfood/likes/count/${id}/`, // 获取点赞数量
    // 条形码相关
    BY_BARCODE: `/api/catfood/by-barcode/`, // 通过条形码查询猫粮
    SCAN_BARCODE: `/api/catfood/scan-barcode/`, // 扫描条形码图片识别
  },

  // ==================== 评论相关 ====================
  COMMENT: {
    LIST: `/api/comments/`, // 获取评论列表（可按 target_type 和 target_id 过滤）
    CREATE: `/api/comments/create/`, // 创建评论
    DELETE: (id: number) => `/api/comments/${id}/delete/`, // 删除评论
    LIKE: (id: number) => `/api/comments/${id}/like/`, // 点赞评论
  },

  // ==================== 添加剂相关 ====================
  ADDITIVE: {
    SEARCH_INGREDIENT: `/api/additive/search-ingredient/`, // 搜索营养成分
    SEARCH_ADDITIVE: `/api/additive/search-additive/`, // 搜索添加剂
    ADD_INGREDIENT: `/api/additive/add-ingredient/`, // 添加营养成分
    ADD_ADDITIVE: `/api/additive/add-additive/`, // 添加添加剂
    INGREDIENT_INFO: `/api/search/ingredient/info`, // 获取成分信息（Baidu API）
  },

  // ==================== AI 报告相关 ====================
  AI_REPORT: {
    LLM_CHAT: `/api/ai/llm/chat/`, // LLM 聊天生成报告
    SAVE: `/api/ai/save/`, // 保存报告
    GET: (catfoodId: number) => `/api/ai/${catfoodId}/`, // 获取报告
    DELETE: (catfoodId: number) => `/api/ai/${catfoodId}/delete/`, // 删除报告
    EXISTS: (catfoodId: number) => `/api/ai/${catfoodId}/exists/`, // 检查报告是否存在
    // 报告收藏相关
    FAVORITES: `/api/ai/favorites/`, // 获取收藏的报告列表
    TOGGLE_FAVORITE: `/api/ai/favorites/toggle/`, // 切换收藏状态
    DELETE_FAVORITE: (catfoodId: number) => `/api/ai/favorites/${catfoodId}/delete/`, // 删除收藏
  },

  // ==================== OCR 相关 ====================
  OCR: {
    RECOGNIZE: `/api/ocr/recognize/`, // OCR 识别
  },

  // ==================== 论坛相关 ====================
  FORUM: {
    POSTS: `/api/posts/`, // 获取帖子列表
    CREATE_POST: `/api/posts/create/`, // 创建帖子
    POST_DETAIL: (postId: number) => `/api/posts/${postId}/`, // 获取帖子详情
    DELETE_POST: (postId: number) => `/api/posts/${postId}/delete/`, // 删除帖子
    // 帖子收藏相关
    FAVORITE_POST: (postId: number) => `/api/posts/${postId}/favorite/`, // 收藏/取消收藏帖子
  },

  // ==================== 通知相关 ====================
  NOTIFICATION: {
    LIST: `/api/notifications/`, // 获取通知列表
    UNREAD_COUNT: `/api/notifications/unread-count/`, // 获取未读通知数量
    MARK_READ: (notificationId: number) => `/api/notifications/${notificationId}/read/`, // 标记为已读
    MARK_ALL_READ: `/api/notifications/mark-all-read/`, // 标记所有为已读
    DELETE: (notificationId: number) => `/api/notifications/${notificationId}/delete/`, // 删除通知
  },

  // ==================== 声誉相关 ====================
  REPUTATION: {
    ME: `/api/reputation/me/`, // 获取当前用户声誉
    USER: (userId: string) => `/api/reputation/users/${userId}/`, // 获取指定用户声誉
    MY_BADGES: `/api/reputation/my-badges/`, // 获取我的徽章
    BADGES: `/api/reputation/badges/`, // 获取所有徽章
    EQUIP_BADGE: (badgeCode: string) => `/api/reputation/badges/${badgeCode}/equip/`, // 装备徽章
    UNEQUIP_BADGE: (badgeCode: string) => `/api/reputation/badges/${badgeCode}/unequip/`, // 卸下徽章
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
