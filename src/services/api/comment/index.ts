import { apiClient } from '../BaseApi';
import type {
  Comment,
  CreateCommentRequest,
  GetCommentsResponse,
  UpdateCommentRequest,
} from './types';

/**
 * 评论 API 服务类
 */
class CommentService {
  private readonly basePath = '/api/comments';

  /**
   * 创建评论
   * @param params 评论参数
   * @returns 创建的评论
   */
  async createComment(params: CreateCommentRequest): Promise<Comment> {
    return await apiClient.post<Comment>(`${this.basePath}/`, params);
  }

  /**
   * 获取评论列表
   * @param targetType 目标类型
   * @param targetId 目标 ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 评论列表
   */
  async getComments(
    targetType: string,
    targetId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<GetCommentsResponse> {
    return await apiClient.get<GetCommentsResponse>(
      `${this.basePath}/?target_type=${targetType}&target_id=${targetId}&page=${page}&page_size=${pageSize}`
    );
  }

  /**
   * 获取单个评论详情
   * @param commentId 评论 ID
   * @returns 评论详情
   */
  async getComment(commentId: number): Promise<Comment> {
    return await apiClient.get<Comment>(`${this.basePath}/${commentId}/`);
  }

  /**
   * 更新评论（完整更新）
   * @param commentId 评论 ID
   * @param params 更新参数
   * @returns 更新后的评论
   */
  async updateComment(commentId: number, params: UpdateCommentRequest): Promise<Comment> {
    return await apiClient.put<Comment>(`${this.basePath}/${commentId}/`, params);
  }

  /**
   * 部分更新评论
   * @param commentId 评论 ID
   * @param params 更新参数
   * @returns 更新后的评论
   */
  async patchComment(commentId: number, params: UpdateCommentRequest): Promise<Comment> {
    return await apiClient.patch<Comment>(`${this.basePath}/${commentId}/`, params);
  }

  /**
   * 删除评论
   * @param commentId 评论 ID
   */
  async deleteComment(commentId: number): Promise<void> {
    return await apiClient.delete<void>(`${this.basePath}/${commentId}/`);
  }

  /**
   * 获取当前用户的所有评论
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 用户评论列表
   */
  async getMyComments(page: number = 1, pageSize: number = 20): Promise<GetCommentsResponse> {
    return await apiClient.get<GetCommentsResponse>(
      `${this.basePath}/?my=true&page=${page}&page_size=${pageSize}`
    );
  }

  /**
   * 点赞/取消点赞评论
   * @param commentId 评论 ID
   * @returns 点赞结果
   */
  async toggleLike(commentId: number): Promise<{
    action: 'liked' | 'unliked';
    likes: number;
    comment: Comment;
  }> {
    return await apiClient.post<{
      action: 'liked' | 'unliked';
      likes: number;
      comment: Comment;
    }>(`${this.basePath}/${commentId}/like/`);
  }
}

// 导出单例
export const commentService = new CommentService();

// 导出便捷方法
export const createComment = (params: CreateCommentRequest) => commentService.createComment(params);
export const getComments = (
  targetType: string,
  targetId: number,
  page?: number,
  pageSize?: number
) => commentService.getComments(targetType, targetId, page, pageSize);
export const getMyComments = (page?: number, pageSize?: number) =>
  commentService.getMyComments(page, pageSize);
export const getComment = (commentId: number) => commentService.getComment(commentId);
export const updateComment = (commentId: number, params: UpdateCommentRequest) =>
  commentService.updateComment(commentId, params);
export const patchComment = (commentId: number, params: UpdateCommentRequest) =>
  commentService.patchComment(commentId, params);
export const deleteComment = (commentId: number) => commentService.deleteComment(commentId);
export const toggleCommentLike = (commentId: number) => commentService.toggleLike(commentId);

// 重新导出类型
export type {
  Comment,
  CommentAuthor,
  CreateCommentRequest,
  DeleteCommentResponse,
  GetCommentsResponse,
  UpdateCommentRequest,
} from './types';
