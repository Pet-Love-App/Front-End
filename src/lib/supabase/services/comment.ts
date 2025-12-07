/**
 * Supabase 评论服务
 */

import { supabase } from '../client';
import { convertKeysToCamel, logger, wrapResponse, type SupabaseResponse } from '../helpers';

import type { DbComment } from '../types/database';

// ==================== 类型定义 ====================

/**
 * 评论数据库 Schema
 */
export interface CommentDB {
  id: number;
  content: string;
  author_id: string;
  target_type: 'post' | 'catfood' | 'report';
  target_id: number;
  parent_id: number | null;
  likes: number;
  created_at: string;
  updated_at: string;
}

/**
 * 评论作者信息
 */
export interface CommentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * 评论信息（前端使用，含作者信息）
 */
export interface Comment {
  id: number;
  content: string;
  authorId: string;
  author: CommentAuthor;
  targetType: 'post' | 'catfood' | 'report';
  targetId: number;
  parentId: number | null;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建评论参数
 */
export interface CreateCommentParams {
  content: string;
  targetType: 'post' | 'catfood' | 'report';
  targetId: number;
  parentId?: number;
}

/**
 * 获取评论参数
 */
export interface GetCommentsParams {
  targetType: 'post' | 'catfood' | 'report';
  targetId: number;
  parentId?: number | null;
  orderBy?: 'created_at' | 'likes';
  limit?: number;
  offset?: number;
}

// ==================== Comment 服务 ====================

class SupabaseCommentService {
  /**
   * 获取评论列表
   */
  async getComments(params: GetCommentsParams): Promise<SupabaseResponse<Comment[]>> {
    logger.query('comments', 'getComments', params);

    try {
      const {
        targetType,
        targetId,
        parentId,
        orderBy = 'created_at',
        limit = 50,
        offset = 0,
      } = params;

      let query = supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles!author_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      // 过滤父评论
      if (parentId !== undefined) {
        if (parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', parentId);
        }
      }

      // 排序
      query = query.order(orderBy, { ascending: orderBy === 'created_at' });

      // 分页
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        logger.error('comments', 'getComments', error);
        return wrapResponse<Comment[]>(null, error);
      }

      // 转换数据
      const comments: Comment[] = data
        ? data.map((comment: DbComment) => {
            return convertKeysToCamel({
              ...comment,
              author: comment.author
                ? {
                    id: comment.author.id,
                    username: comment.author.username,
                    avatarUrl: comment.author.avatar_url,
                  }
                : null,
            }) as Comment;
          })
        : [];

      logger.success('comments', 'getComments', comments.length);
      return { data: comments, error: null, success: true };
    } catch (err) {
      logger.error('comments', 'getComments', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 创建评论
   */
  async createComment(params: CreateCommentParams): Promise<SupabaseResponse<Comment>> {
    logger.query('comments', 'createComment', params);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: params.content,
          author_id: user.id,
          target_type: params.targetType,
          target_id: params.targetId,
          parent_id: params.parentId || null,
        })
        .select(
          `
          *,
          author:profiles!author_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        logger.error('comments', 'createComment', error);
        return wrapResponse<Comment>(null, error);
      }

      const comment = convertKeysToCamel({
        ...data,
        author: data.author
          ? {
              id: data.author.id,
              username: data.author.username,
              avatarUrl: data.author.avatar_url,
            }
          : null,
      }) as Comment;

      logger.success('comments', 'createComment');
      return { data: comment, error: null, success: true };
    } catch (err) {
      logger.error('comments', 'createComment', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 更新评论
   */
  async updateComment(commentId: number, content: string): Promise<SupabaseResponse<Comment>> {
    logger.query('comments', 'updateComment', { commentId, content });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('author_id', user.id) // 只能更新自己的评论
        .select(
          `
          *,
          author:profiles!author_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        logger.error('comments', 'updateComment', error);
        return wrapResponse<Comment>(null, error);
      }

      const comment = convertKeysToCamel({
        ...data,
        author: data.author
          ? {
              id: data.author.id,
              username: data.author.username,
              avatarUrl: data.author.avatar_url,
            }
          : null,
      }) as Comment;

      logger.success('comments', 'updateComment');
      return { data: comment, error: null, success: true };
    } catch (err) {
      logger.error('comments', 'updateComment', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: number): Promise<SupabaseResponse<void>> {
    logger.query('comments', 'deleteComment', { commentId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id); // 只能删除自己的评论

      if (error) {
        logger.error('comments', 'deleteComment', error);
        return wrapResponse<void>(null, error);
      }

      logger.success('comments', 'deleteComment');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('comments', 'deleteComment', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 点赞/取消点赞评论
   */
  async toggleCommentLike(
    commentId: number
  ): Promise<SupabaseResponse<{ liked: boolean; likes: number }>> {
    logger.query('comments', 'toggleCommentLike', { commentId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 检查是否已点赞
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      let liked: boolean;

      if (existingLike) {
        // 取消点赞
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        // 减少点赞数
        await supabase.rpc('decrement_comment_likes', { comment_id: commentId });

        liked = false;
      } else {
        // 添加点赞
        await supabase.from('comment_likes').insert({
          comment_id: commentId,
          user_id: user.id,
        });

        // 增加点赞数
        await supabase.rpc('increment_comment_likes', { comment_id: commentId });

        liked = true;
      }

      // 获取最新的点赞数
      const { data: comment } = await supabase
        .from('comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      logger.success('comments', 'toggleCommentLike');
      return {
        data: { liked, likes: comment?.likes || 0 },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('comments', 'toggleCommentLike', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取我的评论列表
   */
  async getMyComments(limit = 50, offset = 0): Promise<SupabaseResponse<Comment[]>> {
    logger.query('comments', 'getMyComments', { limit, offset });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles!author_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('comments', 'getMyComments', error);
        return wrapResponse<Comment[]>(null, error);
      }

      const comments: Comment[] = data
        ? data.map((comment: DbComment) => {
            return convertKeysToCamel({
              ...comment,
              author: comment.author
                ? {
                    id: comment.author.id,
                    username: comment.author.username,
                    avatarUrl: comment.author.avatar_url,
                  }
                : null,
            }) as Comment;
          })
        : [];

      logger.success('comments', 'getMyComments', comments.length);
      return { data: comments, error: null, success: true };
    } catch (err) {
      logger.error('comments', 'getMyComments', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

// 导出单例
export const supabaseCommentService = new SupabaseCommentService();

export default supabaseCommentService;
