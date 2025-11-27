import { apiClient } from '../BaseApi';

export interface Notification {
  id: number;
  verb: string;
  unread: boolean;
  timestamp: string;
  actor: {
    id: number;
    username: string;
    avatar: string | null;
  };
  target: {
    id: number;
    content: string;
  } | null;
  action_object: {
    id: number;
    content: string;
    post: number;
  } | null;
  // 派生字段：便于前端直接显示（@ 用户名 + 片段）
  preview?: string;
}

export const notificationService = {
  async getNotifications(unread?: boolean) {
    const params = unread ? '?unread=true' : '';
    const res = await apiClient.get<Notification[]>(`/api/comments/notifications/${params}`);
    return res.map((n) => ({
      ...n,
      preview:
        (n.verb === 'reply_comment' && n.action_object?.content)
          ? `@${n.actor?.username}: ${n.action_object?.content}`
          : (n.target?.content || n.action_object?.content || ''),
    }));
  },

  async markAsRead(notificationId: number) {
    await apiClient.post(`/api/comments/notifications/${notificationId}/read/`);
    return true; // 204 No Content
  },

  async markAllAsRead() {
    await apiClient.post('/api/comments/notifications/read_all/');
    return true; // 204 No Content
  },
};
