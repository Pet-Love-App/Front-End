import { apiClient } from '../BaseApi';
import type { CreatePostRequest, NotificationItem, Post, ToggleActionResponse } from './types';

class ForumService {
  private readonly basePath = '/api/comments';

  // 发帖：multipart/form-data，字段名 media（可多个）
  async createPost(data: CreatePostRequest, files?: { uri: string; name: string; type: string }[]) {
    const form = new FormData();
    if (data.content) form.append('content', data.content);
    if (files && files.length) {
      for (const f of files) form.append('media', f as any);
    }
    return apiClient.upload<Post>(`${this.basePath}/posts/`, form);
  }

  // 广场列表：兼容分页或数组返回，统一返回 Post[]
  async getSquareList(order: 'random' | 'latest' = 'latest') {
    const res: any = await apiClient.get(`${this.basePath}/posts/?order=${order}`);
    if (Array.isArray(res)) return res as Post[];
    if (res && typeof res === 'object' && Array.isArray(res.results)) return res.results as Post[];
    return [] as Post[];
  }

  // 帖子详情
  async getPostDetail(id: number) {
    return apiClient.get<Post>(`${this.basePath}/posts/${id}/`);
  }

  // 收藏/取消收藏帖子
  async toggleFavorite(postId: number) {
    return apiClient.post<ToggleActionResponse>(`${this.basePath}/posts/${postId}/favorite/`, {});
  }

  // 我的收藏（多数实现返回数组，如为分页亦可在此兼容）
  async getMyFavorites() {
    const res: any = await apiClient.get(`${this.basePath}/posts/favorites/`);
    if (Array.isArray(res)) return res as Post[];
    if (res && typeof res === 'object' && Array.isArray(res.results)) return res.results as Post[];
    return [] as Post[];
  }

  // 评论列表（按目标过滤）可按赞、可返回子回复
  async getCommentsForTarget(params: {
    targetType: 'post' | 'catfood' | 'report';
    targetId: number;
    orderBy?: 'likes';
    includeReplies?: boolean;
  }) {
    const { targetType, targetId, orderBy, includeReplies } = params;
    const orderParam = orderBy === 'likes' ? '&order_by=likes' : '';
    const repliesParam = includeReplies ? '&include_replies=true' : '';
    return apiClient.get(`${this.basePath}/comments/?target_type=${targetType}&target_id=${targetId}${orderParam}${repliesParam}`);
  }

  // 发表评论或回复评论（统一入口）
  async createComment(params: {
    targetType: 'post' | 'catfood' | 'report';
    targetId: number;
    content: string;
    parentId?: number;
  }) {
    return apiClient.post(`${this.basePath}/comments/`, params);
  }

  // 点赞/取消点赞评论
  async toggleCommentLike(commentId: number) {
    return apiClient.post<ToggleActionResponse>(`${this.basePath}/comments/${commentId}/like/`, {});
  }

  // 消息中心（数组）
  async getNotifications(unread?: boolean) {
    const suffix = typeof unread === 'boolean' ? `?unread=${unread}` : '';
    return apiClient.get<NotificationItem[]>(`${this.basePath}/notifications/${suffix}`);
  }

  async markNotificationRead(id: number) {
    return apiClient.post(`${this.basePath}/notifications/${id}/read/`, {});
  }

  async markAllNotificationsRead() {
    return apiClient.post(`${this.basePath}/notifications/read_all/`, {});
  }
}

export const forumService = new ForumService();
export type { NotificationItem, Post } from './types';

