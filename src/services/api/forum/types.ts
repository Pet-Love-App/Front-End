// 帖子与消息相关的类型（/api/comments/ 前缀）

export interface PostMedia {
  id: number;
  media_type: 'image' | 'video';
  file: string; // 文件 URL
  created_at: string;
}

export interface PostAuthor {
  id: number;
  username: string;
  avatar?: string | null;
}

export interface Post {
  id: number;
  author: PostAuthor;
  content: string;
  media?: PostMedia[];
  favorites_count: number;
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreatePostRequest {
  content: string;
  // 使用 multipart/form-data 上传，字段名 media，可多文件
}

export interface ToggleActionResponse {
  action: 'favorited' | 'unfavorited' | 'liked' | 'unliked';
  likes?: number;
  favorites_count?: number;
}

export interface NotificationItem {
  id: number;
  actor: { id: number; username: string };
  verb: 'comment_post' | 'reply_comment';
  post?: any;
  comment?: any;
  unread: boolean;
  created_at: string;
}
