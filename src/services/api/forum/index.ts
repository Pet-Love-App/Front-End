import { apiClient } from '../BaseApi';
import type { CreatePostRequest, NotificationItem, Post, ToggleActionResponse } from './types';

class ForumService {
  private readonly basePath = '/api/comments';

  // 发帖：multipart/form-data，字段名 media（可多个）
  async createPost(data: CreatePostRequest, files?: { uri: string; name: string; type: string }[]) {
    const form = new FormData();
    if (data.content) form.append('content', data.content);
    if (data.category) form.append('category', data.category);
    if (data.tags && data.tags.length) {
      // 后端常见处理：tags[]=a&tags[]=b
      data.tags.forEach((t) => form.append('tags[]', t));
    }
    if (files && files.length) {
      for (const f of files) form.append('media', f as any);
    }
    return apiClient.upload<Post>(`${this.basePath}/posts/`, form);
  }

  // 编辑帖子（改为 multipart/form-data）
  async updatePost(postId: number, data: Partial<CreatePostRequest>) {
    const form = new FormData();
    if (typeof data.content === 'string') form.append('content', data.content);
    if (data.category) form.append('category', data.category);
    if (Array.isArray(data.tags)) {
      data.tags.forEach((t) => form.append('tags[]', t));
    }
    // 使用 PATCH 发送 multipart/form-data（BaseApi.patch 已支持 FormData）
    return apiClient.patch<Post>(`${this.basePath}/posts/${postId}/`, form as any);
  }

  // 删除帖子
  async deletePost(postId: number) {
    return apiClient.delete(`${this.basePath}/posts/${postId}/`);
  }

  // 将后端返回的帖子对象标准化，便于前端展示
  private normalizePost(raw: any): Post {
    const tags: string[] = Array.isArray(raw.tags)
      ? raw.tags
      : Array.isArray(raw.tag_list)
      ? raw.tag_list
      : typeof raw.tags === 'string'
      ? String(raw.tags)
          .split(/[，,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : typeof raw.tag_list === 'string'
      ? String(raw.tag_list)
          .split(/[，,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const comments_count =
      raw.comments_count ?? raw.comment_count ?? raw.replies_count ?? raw.reply_count ?? 0;

    const category = raw.category ?? raw.post_category ?? raw.topic ?? undefined;

    return {
      ...raw,
      tags,
      comments_count,
      category,
    } as Post;
  }

  // 广场列表：支持按 latest / most_replied / featured 排序；兼容分页
  async getSquareList(order: 'latest' | 'most_replied' | 'featured' | 'random' = 'latest') {
    const res: any = await apiClient.get(`${this.basePath}/posts/?order=${order}`);
    const list: any[] = Array.isArray(res) ? res : res?.results || [];
    return list.map((x) => this.normalizePost(x)) as Post[];
  }

  // 帖子详情
  async getPostDetail(id: number) {
    const raw = await apiClient.get<any>(`${this.basePath}/posts/${id}/`);
    return this.normalizePost(raw);
  }

  // 收藏/取消收藏帖子
  async toggleFavorite(postId: number) {
    return apiClient.post<ToggleActionResponse>(`${this.basePath}/posts/${postId}/favorite/`, {});
  }

  // 我的收藏
  async getMyFavorites() {
    const res: any = await apiClient.get(`${this.basePath}/posts/favorites/`);
    const list: any[] = Array.isArray(res) ? res : res?.results || [];
    return list.map((x) => this.normalizePost(x)) as Post[];
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

  // 发表评论或回复评论（统一入口）——将字段转换为后端常见的 snake_case
  async createComment(params: {
    targetType: 'post' | 'catfood' | 'report';
    targetId: number;
    content: string;
    parentId?: number;
  }) {
    const payload: any = {
      content: params.content,
      target_type: params.targetType,
      target_id: params.targetId,
    };
    if (typeof params.parentId === 'number') {
      payload.parent_id = params.parentId;
    }
    // 同时兼容后端可能接受的 camelCase（若启用了 camelCase 解析中间件）
    payload.targetType = params.targetType;
    payload.targetId = params.targetId;
    if (typeof params.parentId === 'number') payload.parentId = params.parentId;

    return apiClient.post(`${this.basePath}/comments/`, payload);
  }

  // 编辑评论
  async updateComment(commentId: number, content: string) {
    return apiClient.patch(`${this.basePath}/comments/${commentId}/`, { content });
  }

  // 删除评论
  async deleteComment(commentId: number) {
    return apiClient.delete(`${this.basePath}/comments/${commentId}/`);
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

