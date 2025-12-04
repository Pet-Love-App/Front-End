import { apiClient } from '../BaseApi';
import type { NotificationItem, Post, ToggleActionResponse } from './types';

class ForumService {
  private readonly forumBase = '/api';
  private readonly commentsBase = '/api/comments';

  // 将后端返回的帖子对象标准化
  private normalizePost(raw: any): Post {
    // 标准化 tags（string[] | object[] | string）
    let tags: string[] = [];
    if (Array.isArray(raw?.tags)) {
      tags = raw.tags
        .map((t: any) =>
          typeof t === 'string' ? t : t?.name || t?.title || t?.label || String(t?.id ?? '')
        )
        .filter(Boolean);
    } else if (typeof raw?.tags === 'string') {
      tags = String(raw.tags)
        .split(/[，,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const comments_count =
      raw?.comments_count ?? raw?.comment_count ?? raw?.replies_count ?? raw?.reply_count ?? 0;
    const favorites_count = raw?.favorites_count ?? raw?.favorite_count ?? 0;

    return {
      ...raw,
      tags,
      comments_count,
      favorites_count,
    } as Post;
  }

  // 帖子列表（支持标签与时间筛选）
  async getSquareList(
    params: {
      order?: 'latest' | 'most_replied' | 'featured' | 'random';
      tag?: string;
      tags?: string[];
      tag_id?: number;
      tag_ids?: number[];
      start?: string; // 日期/ISO
      end?: string; // 日期/ISO
    } = {}
  ) {
    const qs = new URLSearchParams();
    if ((params as any).order && typeof (params as any) === 'string') {
      // 兼容旧调用方式：getSquareList('latest')
      qs.append('ordering', (params as any) === 'most_replied' ? '-comments_count' : '-created_at');
    } else {
      if (params.tag) qs.append('tag', params.tag);
      if (params.tags && params.tags.length) qs.append('tags', params.tags.join(','));
      if (typeof params.tag_id === 'number') qs.append('tag_id', String(params.tag_id));
      if (params.tag_ids && params.tag_ids.length) qs.append('tag_ids', params.tag_ids.join(','));
      if (params.start) qs.append('start', params.start);
      if (params.end) qs.append('end', params.end);

      // 排序映射（如后端支持 ordering，可在此追加）
      if (params.order === 'latest') qs.append('ordering', '-created_at');
      else if (params.order === 'most_replied') qs.append('ordering', '-comments_count');
    }

    const url = qs.toString()
      ? `${this.forumBase}/posts/?${qs.toString()}`
      : `${this.forumBase}/posts/`;
    const res: any = await apiClient.get(url);
    // 适配后端返回格式: { posts: [...], page, per_page }
    const list: any[] = Array.isArray(res) ? res : res?.posts || res?.results || [];
    return list.map((x) => this.normalizePost(x)) as Post[];
  }

  // 帖子详情
  async getPostDetail(id: number) {
    const raw = await apiClient.get<any>(`${this.forumBase}/posts/${id}/`);
    return this.normalizePost(raw);
  }

  // 创建帖子（仅提交 content/tags/media）
  async createPost(
    data: { content: string; tags?: string[] | string },
    files?: { uri: string; name: string; type: string; size?: number }[]
  ) {
    const form = new FormData();

    // 内容
    const content = typeof data.content === 'string' ? data.content : '';
    if (content) form.append('content', content);

    // 标签处理：严格按照 API 文档要求
    // 1. 将 tags 数组转换为逗号分隔的字符串
    // 2. 如果没有标签，则提交一个空字符串 `tags=""`
    let tagList: string[] = [];
    if (Array.isArray(data.tags)) {
      tagList = data.tags;
    } else if (typeof data.tags === 'string' && data.tags.trim()) {
      tagList = data.tags
        .split(/[，,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const uniqTags = Array.from(new Set(tagList.map((t) => t.trim()).filter(Boolean)));
    const tagsAsString = uniqTags.join(',');
    form.append('tags', tagsAsString);

    // 文件校验与追加，仅使用 key "media"
    const MAX_FILES = 9;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const safeFiles: { uri: string; name: string; type: string; size?: number }[] = [];
    if (files && files.length) {
      for (const f of files.slice(0, MAX_FILES)) {
        const reason: string[] = [];
        if (!f.uri || !f.uri.startsWith('file://')) reason.push('uri 非 file://');
        if (!f.type || !(f.type.startsWith('image/') || f.type.startsWith('video/')))
          reason.push('type 非 image/* 或 video/*');
        if (typeof f.size === 'number' && f.size > MAX_SIZE) reason.push('size > 10MB');
        if (reason.length) {
          console.warn('文件被跳过:', {
            name: f.name,
            type: f.type,
            size: f.size,
            uri: f.uri,
            reason,
          });
          continue;
        }
        const file = {
          uri: f.uri,
          name: f.name || `upload_${Date.now()}`,
          type: f.type,
        } as any;
        form.append('media', file);
        safeFiles.push({ uri: f.uri, name: file.name, type: f.type, size: f.size });
      }
    }

    // 临时调试日志：打印将要上传的内容
    try {
      // 延迟导入避免循环依赖，检查 token
      const { useUserStore } = require('@/src/store/userStore');
      const token = useUserStore.getState().accessToken;
      console.group('[ForumService.createPost] 上传调试');
      console.log('endpoint:', `${this.forumBase}/posts/`);
      console.log('hasToken:', Boolean(token));
      console.log('content.length:', content.length);
      console.log('tags(submitted as comma-separated string):', `"${tagsAsString}"`);
      console.log(
        'files(to submit):',
        safeFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          uriPrefix: f.uri.slice(0, 10),
        }))
      );
      console.log('files.count:', safeFiles.length);
      console.groupEnd();
    } catch (e) {
      // 忽略日志失败
    }

    return apiClient.upload<Post>(`${this.forumBase}/posts/`, form);
  }

  // 更新帖子（不提交 category）
  async updatePost(postId: number, data: { content?: string; tags?: string[] | string }) {
    const form = new FormData();
    if (typeof data.content === 'string') form.append('content', data.content);
    let tagsValue: string | undefined;
    if (Array.isArray(data.tags)) tagsValue = data.tags.join(',');
    else if (typeof data.tags === 'string') tagsValue = data.tags;
    if (tagsValue !== undefined) form.append('tags', tagsValue);
    return apiClient.patch<Post>(`${this.forumBase}/posts/${postId}/`, form as any);
  }

  // 删除帖子
  async deletePost(postId: number) {
    return apiClient.delete(`${this.forumBase}/posts/${postId}/`);
  }

  // 收藏/取消收藏
  async toggleFavorite(postId: number) {
    return apiClient.post<ToggleActionResponse>(`${this.forumBase}/posts/${postId}/favorite/`);
  }

  // 标签
  async getTags() {
    return apiClient.get<{ id: number; name: string }[]>(`${this.forumBase}/tags/`);
  }
  async getTagDetail(id: number) {
    return apiClient.get<{ id: number; name: string }>(`${this.forumBase}/tags/${id}/`);
  }

  // 评论（保持原有 /api/comments 路径，后端未提供新路径）
  async getCommentsForTarget(params: {
    targetType: 'post' | 'catfood' | 'report';
    targetId: number;
    orderBy?: 'likes';
    includeReplies?: boolean;
  }) {
    const { targetType, targetId, orderBy, includeReplies } = params;
    const orderParam = orderBy === 'likes' ? '&order_by=likes' : '';
    const repliesParam = includeReplies ? '&include_replies=true' : '';
    return apiClient.get(
      `${this.commentsBase}/comments/?target_type=${targetType}&target_id=${targetId}${orderParam}${repliesParam}`
    );
  }
  async createComment(params: {
    targetType: 'post' | 'catfood' | 'report';
    targetId: number;
    content: string;
    parentId?: number;
  }) {
    const payload: any = {
      content: params.content,
      targetType: params.targetType, // FIX: 后端需要 camelCase
      targetId: params.targetId, // FIX: 后端需要 camelCase
    };
    if (typeof params.parentId === 'number') {
      payload.parentId = params.parentId; // FIX: 后端需要 camelCase
    }
    // 调试日志
    console.log('[ForumService.createComment] 发送评论/回复:', {
      endpoint: `${this.commentsBase}/comments/`,
      payload,
    });
    return apiClient.post(`${this.commentsBase}/comments/`, payload);
  }
  async updateComment(commentId: number, content: string) {
    return apiClient.patch(`${this.commentsBase}/comments/${commentId}/`, { content });
  }
  async deleteComment(commentId: number) {
    return apiClient.delete(`${this.commentsBase}/comments/${commentId}/`);
  }
  async toggleCommentLike(commentId: number) {
    return apiClient.post<ToggleActionResponse>(
      `${this.commentsBase}/comments/${commentId}/like/`,
      {}
    );
  }

  // 通知
  async getNotifications(unread?: boolean) {
    const suffix = typeof unread === 'boolean' ? `?unread=${unread}` : '';
    return apiClient.get<NotificationItem[]>(`${this.forumBase}/notifications/${suffix}`);
  }
  async getNotificationDetail(id: number) {
    return apiClient.get(`${this.forumBase}/notifications/${id}/`);
  }
  async markNotificationRead(id: number) {
    return apiClient.post(`${this.forumBase}/notifications/${id}/mark_read/`);
  }
  async markAllNotificationsRead() {
    return apiClient.post(`${this.forumBase}/notifications/mark_all_read/`);
  }
  async getUnreadCount() {
    return apiClient.get<{ count: number }>(`${this.forumBase}/notifications/unread_count/`);
  }
}

export const forumService = new ForumService();
export type { NotificationItem, Post } from './types';
