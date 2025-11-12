/**
 * 评论 API 相关的类型定义
 */

import type { Comment, CommentAuthor } from '@/src/types/comment';

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  /** 评论内容 */
  content: string;
  /** 关联的对象 ID */
  targetId: number;
  /** 关联的对象类型 */
  targetType: 'post' | 'catfood' | 'report';
}

/**
 * 获取评论列表响应（DRF分页格式）
 */
export interface GetCommentsResponse {
  results: Comment[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * 更新评论请求
 */
export interface UpdateCommentRequest {
  content: string;
}

/**
 * 删除评论响应
 */
export interface DeleteCommentResponse {
  message: string;
}

// 重新导出
export type { Comment, CommentAuthor };
