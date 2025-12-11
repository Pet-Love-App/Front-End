/**
 * Supabase 论坛服务
 *
 * - 管理 `posts` 表中的帖子数据
 * - 支持帖子的 CRUD 操作
 * - 收藏和通知功能
 * - 使用 RLS (Row Level Security) 保护数据
 */

import { decode } from 'base64-arraybuffer';
// 使用 legacy API，因为新 API (File/Directory) 在 SDK 54 中仍需迁移
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../client';
import {
  calculatePagination,
  convertKeysToCamel,
  logger,
  wrapResponse,
  type PaginationParams,
  type SupabaseResponse,
} from '../helpers';

import type { DbNotification, DbPost, DbPostFavorite, DbPostMedia } from '../types/database';

// ==================== 类型定义 ====================

/**
 * 帖子分类
 */
export type PostCategory = 'help' | 'share' | 'science' | 'warning';

/**
 * 帖子媒体
 */
export interface PostMedia {
  id: number;
  mediaType: 'image' | 'video';
  fileUrl: string;
  createdAt: string;
}

/**
 * 帖子作者
 */
export interface PostAuthor {
  id: string;
  username: string;
  avatar?: string | null;
}

/**
 * 帖子（前端使用）
 */
export interface Post {
  id: number;
  author: PostAuthor;
  content: string;
  media?: PostMedia[];
  favoritesCount: number;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
  category?: PostCategory;
  tags?: string[];
  commentsCount?: number;
  likesCount?: number;
}

/**
 * 通知项
 */
export interface NotificationItem {
  id: number;
  actor: { id: string; username: string };
  verb: 'comment_post' | 'reply_comment';
  post?: Pick<Post, 'id' | 'content'>;
  comment?: { id: number; content: string };
  unread: boolean;
  createdAt: string;
}

/**
 * 媒体文件（用于上传）
 */
export interface MediaFileInput {
  uri: string;
  name: string;
  type: string;
}

/**
 * 创建帖子参数
 */
export interface CreatePostParams {
  content: string;
  category?: PostCategory;
  tags?: string[];
  /** 媒体文件列表（图片/视频） */
  mediaFiles?: MediaFileInput[];
}

/**
 * 更新帖子参数
 */
export interface UpdatePostParams {
  content?: string;
  category?: PostCategory;
  tags?: string[];
}

/**
 * 获取帖子列表参数
 */
export interface GetPostsParams extends PaginationParams {
  order?: 'latest' | 'most_replied' | 'featured';
  tag?: string;
  tags?: string[];
  category?: PostCategory;
}

/**
 * 切换操作响应
 */
export interface ToggleActionResponse {
  action: 'favorited' | 'unfavorited';
  favoritesCount?: number;
}

// ==================== Forum 服务 ====================

class SupabaseForumService {
  /**
   * 获取帖子列表
   */
  async getPosts(params: GetPostsParams = {}): Promise<SupabaseResponse<Post[]>> {
    logger.query('posts', 'list', params);

    try {
      const { page = 1, pageSize = 20, order: _order = 'latest', tag, tags, category } = params;
      const { from, to } = calculatePagination({ page, pageSize });

      let query = supabase
        .from('posts')
        .select(
          `
          *,
          author:profiles!author_id (
            id,
            username,
            avatar_url
          ),
          post_media (
            id,
            media_type,
            file_url,
            created_at
          )
        `
        )
        .range(from, to);

      // 排序（注意：posts 表只有 created_at 和 updated_at 字段，无法按评论数排序）
      // 如需按评论数排序，需要创建数据库视图或使用 RPC
      query = query.order('created_at', { ascending: false });

      // 注意：posts 表没有 category 和 tags 字段
      // 如需支持分类和标签过滤，需要先在数据库添加这些字段
      void category; // 暂时忽略分类参数
      void tag; // 暂时忽略标签参数
      void tags; // 暂时忽略标签数组参数

      const { data, error } = await query;

      if (error) {
        logger.error('posts', 'list', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Post[]>;
      }

      // 转换数据
      const posts: Post[] = data
        ? data.map((post: DbPost): Post => {
            return convertKeysToCamel({
              ...post,
              author: post.author
                ? {
                    id: post.author.id,
                    username: post.author.username,
                    avatar: post.author.avatar_url,
                  }
                : null,
              media: post.post_media
                ? post.post_media.map((m: DbPostMedia) => convertKeysToCamel(m))
                : [],
            }) as Post;
          })
        : [];

      logger.success('posts', 'list', posts.length);
      return { data: posts, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'list', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取帖子详情
   */
  async getPostDetail(postId: number): Promise<SupabaseResponse<Post>> {
    logger.query('posts', 'detail', { postId });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          author:profiles!author_id (
            id,
            username,
            avatar_url
          ),
          post_media (
            id,
            media_type,
            file_url,
            created_at
          )
        `
        )
        .eq('id', postId)
        .single();

      if (error) {
        logger.error('posts', 'detail', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Post>;
      }

      const post = convertKeysToCamel({
        ...data,
        author: data.author
          ? {
              id: data.author.id,
              username: data.author.username,
              avatar: data.author.avatar_url,
            }
          : null,
        media: data.post_media
          ? data.post_media.map((m: DbPostMedia) => convertKeysToCamel(m))
          : [],
      }) as Post;

      logger.success('posts', 'detail');
      return { data: post, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'detail', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 创建帖子（支持媒体上传）
   */
  async createPost(params: CreatePostParams): Promise<SupabaseResponse<Post>> {
    logger.query('posts', 'create', params);
    console.log('[ForumService] createPost called with:', {
      ...params,
      mediaFiles: params.mediaFiles?.length || 0,
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log('[ForumService] current user:', user?.id);

      if (!user) {
        console.error('[ForumService] No authenticated user');
        return {
          data: null,
          error: { message: '未登录', code: 'NOT_AUTHENTICATED', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 1. 创建帖子记录
      console.log('[ForumService] Inserting post with author_id:', user.id);
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: params.content,
          category: params.category || null,
          tags: params.tags || [],
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

      console.log('[ForumService] Insert result:', { data, error });

      if (error) {
        logger.error('posts', 'create', error);
        console.error('[ForumService] Insert error:', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Post>;
      }

      const postId = data.id;

      // 2. 上传媒体文件（如果有）
      const uploadedMedia: PostMedia[] = [];
      if (params.mediaFiles && params.mediaFiles.length > 0) {
        console.log('[ForumService] Uploading', params.mediaFiles.length, 'media files...');

        for (let i = 0; i < params.mediaFiles.length; i++) {
          const file = params.mediaFiles[i];
          try {
            const mediaResult = await this.uploadPostMedia(postId, file, user.id);
            if (mediaResult.data) {
              uploadedMedia.push(mediaResult.data);
              console.log('[ForumService] Uploaded media', i + 1, ':', mediaResult.data.fileUrl);
            } else {
              console.error('[ForumService] Failed to upload media', i + 1, ':', mediaResult.error);
            }
          } catch (uploadErr) {
            console.error('[ForumService] Media upload error:', uploadErr);
          }
        }
      }

      const post = convertKeysToCamel({
        ...data,
        author: data.author
          ? {
              id: data.author.id,
              username: data.author.username,
              avatar: data.author.avatar_url,
            }
          : null,
        media: uploadedMedia,
      }) as Post;

      logger.success('posts', 'create');
      return { data: post, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'create', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 上传帖子媒体文件
   * 使用 base64 解码方式上传，解决 React Native blob 兼容性问题
   */
  private async uploadPostMedia(
    postId: number,
    file: MediaFileInput,
    userId: string
  ): Promise<SupabaseResponse<PostMedia>> {
    try {
      // 生成文件名
      const ext = file.name.split('.').pop() || (file.type.includes('video') ? 'mp4' : 'jpg');
      const fileName = `${userId}/${postId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

      console.log('[ForumService] Uploading file:', {
        fileName,
        mediaType,
        fileUri: file.uri.substring(0, 100),
        contentType: file.type,
      });

      // 使用 expo-file-system 读取文件为 base64
      console.log('[ForumService] Reading file as base64 using FileSystem...');

      // 处理 file:// URI
      let fileUri = file.uri;
      if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }

      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64', // 直接使用字符串值
      });

      console.log('[ForumService] Base64 data length:', base64Data.length); // 检查文件大小（base64 大约是原始大小的 1.37 倍，所以 50MB 原始 ≈ 68MB base64）
      if (base64Data.length > 68 * 1024 * 1024) {
        throw new Error('文件大小超过 50MB 限制');
      }

      // 将 base64 转换为 ArrayBuffer
      const arrayBuffer = decode(base64Data);
      console.log('[ForumService] ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');

      // 上传到 Storage
      console.log('[ForumService] Uploading to Supabase Storage...');
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[ForumService] Storage upload error:', uploadError);
        console.error('[ForumService] Error details:', JSON.stringify(uploadError, null, 2));
        return {
          data: null,
          error: uploadError as any,
          success: false,
        };
      }

      console.log('[ForumService] Upload successful!');

      // 获取公开 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('post-media').getPublicUrl(fileName);

      console.log('[ForumService] Public URL:', publicUrl);

      // 插入 post_media 记录
      const { data: mediaData, error: mediaError } = await supabase
        .from('post_media')
        .insert({
          post_id: postId,
          media_type: mediaType,
          file_url: publicUrl,
        })
        .select()
        .single();

      if (mediaError) {
        console.error('[ForumService] Insert post_media error:', mediaError);
        return {
          data: null,
          error: mediaError as any,
          success: false,
        };
      }

      return {
        data: convertKeysToCamel(mediaData) as PostMedia,
        error: null,
        success: true,
      };
    } catch (err) {
      console.error('[ForumService] uploadPostMedia error:', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 更新帖子
   */
  async updatePost(postId: number, params: UpdatePostParams): Promise<SupabaseResponse<Post>> {
    logger.query('posts', 'update', { postId, ...params });

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

      const updateData: Record<string, string | string[] | PostCategory | null> = {
        updated_at: new Date().toISOString(),
      };

      if (params.content !== undefined) updateData.content = params.content;
      if (params.category !== undefined) updateData.category = params.category;
      if (params.tags !== undefined) updateData.tags = params.tags;

      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .eq('author_id', user.id) // 只能更新自己的帖子
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
        logger.error('posts', 'update', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Post>;
      }

      const post = convertKeysToCamel({
        ...data,
        author: data.author
          ? {
              id: data.author.id,
              username: data.author.username,
              avatar: data.author.avatar_url,
            }
          : null,
      }) as Post;

      logger.success('posts', 'update');
      return { data: post, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'update', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 删除帖子
   */
  async deletePost(postId: number): Promise<SupabaseResponse<void>> {
    logger.query('posts', 'delete', { postId });

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
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id); // 只能删除自己的帖子

      if (error) {
        logger.error('posts', 'delete', error);
        return wrapResponse(null, error);
      }

      logger.success('posts', 'delete');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'delete', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(postId: number): Promise<SupabaseResponse<ToggleActionResponse>> {
    logger.query('posts', 'toggleFavorite', { postId });

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

      // 检查是否已收藏
      const { data: existingFavorite } = await supabase
        .from('post_favorites')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      let action: 'favorited' | 'unfavorited';

      if (existingFavorite) {
        // 取消收藏
        await supabase.from('post_favorites').delete().eq('post_id', postId).eq('user_id', user.id);

        action = 'unfavorited';
      } else {
        // 添加收藏
        await supabase.from('post_favorites').insert({
          post_id: postId,
          user_id: user.id,
        });

        action = 'favorited';
      }

      // 获取最新的收藏数
      const { count } = await supabase
        .from('post_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      logger.success('posts', 'toggleFavorite');
      return {
        data: {
          action,
          favoritesCount: count || 0,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('posts', 'toggleFavorite', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取我的收藏列表
   */
  async getMyFavorites(params: PaginationParams = {}): Promise<SupabaseResponse<Post[]>> {
    logger.query('posts', 'myFavorites', params);

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

      const { page = 1, pageSize = 20 } = params;
      const { from, to } = calculatePagination({ page, pageSize });

      const { data, error } = await supabase
        .from('post_favorites')
        .select(
          `
          created_at,
          post:posts (
            *,
            author:profiles!author_id (
              id,
              username,
              avatar_url
            ),
            post_media (
              id,
              media_type,
              file_url,
              created_at
            )
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        logger.error('posts', 'myFavorites', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Post[]>;
      }

      const posts: Post[] = data
        ? (data as unknown as DbPostFavorite[])
            .filter((fav) => fav.post) // 过滤掉已删除的帖子
            .map((fav) => {
              const post = fav.post!;
              const convertedPost = convertKeysToCamel({
                ...post,
                author: post.author
                  ? {
                      id: post.author.id,
                      username: post.author.username,
                      avatar: post.author.avatar_url,
                    }
                  : null,
              }) as Post;
              return {
                ...convertedPost,
                media: post.post_media
                  ? post.post_media.map((m: DbPostMedia) => convertKeysToCamel(m))
                  : [],
              } as Post;
            })
        : [];

      logger.success('posts', 'myFavorites', posts.length);
      return { data: posts, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'myFavorites', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取通知列表
   */
  async getNotifications(unread?: boolean): Promise<SupabaseResponse<NotificationItem[]>> {
    logger.query('notifications', 'list', { unread });

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

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (typeof unread === 'boolean') {
        query = query.eq('unread', unread);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('notifications', 'list', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<NotificationItem[]>;
      }

      const notifications: NotificationItem[] = data
        ? data.map((item: DbNotification) => convertKeysToCamel(item) as NotificationItem)
        : [];

      logger.success('notifications', 'list', notifications.length);
      return { data: notifications, error: null, success: true };
    } catch (err) {
      logger.error('notifications', 'list', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 标记通知已读
   */
  async markNotificationRead(notificationId: number): Promise<SupabaseResponse<void>> {
    logger.query('notifications', 'markRead', { notificationId });

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ unread: false })
        .eq('id', notificationId);

      if (error) {
        logger.error('notifications', 'markRead', error);
        return wrapResponse(null, error);
      }

      logger.success('notifications', 'markRead');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('notifications', 'markRead', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 标记所有通知已读
   */
  async markAllNotificationsRead(): Promise<SupabaseResponse<void>> {
    logger.query('notifications', 'markAllRead');

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
        .from('notifications')
        .update({ unread: false })
        .eq('recipient_id', user.id)
        .eq('unread', true);

      if (error) {
        logger.error('notifications', 'markAllRead', error);
        return wrapResponse(null, error);
      }

      logger.success('notifications', 'markAllRead');
      return { data: undefined, error: null, success: true };
    } catch (err) {
      logger.error('notifications', 'markAllRead', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取所有唯一标签
   * 从 posts 表的 tags 字段中提取所有唯一值
   */
  async getAllTags(): Promise<SupabaseResponse<string[]>> {
    logger.query('posts', 'getAllTags');

    try {
      // 查询所有帖子的 tags 字段
      const { data, error } = await supabase.from('posts').select('tags').not('tags', 'is', null);

      if (error) {
        logger.error('posts', 'getAllTags', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<string[]>;
      }

      // 提取所有唯一标签
      const allTags = new Set<string>();
      if (data) {
        for (const post of data) {
          if (Array.isArray(post.tags)) {
            for (const tag of post.tags) {
              if (tag && typeof tag === 'string') {
                allTags.add(tag.trim());
              }
            }
          }
        }
      }

      const uniqueTags = Array.from(allTags).sort();
      logger.success('posts', 'getAllTags', uniqueTags.length);
      return { data: uniqueTags, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'getAllTags', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取热门标签（按使用频率排序）
   */
  async getPopularTags(limit = 20): Promise<SupabaseResponse<{ tag: string; count: number }[]>> {
    logger.query('posts', 'getPopularTags', { limit });

    try {
      const { data, error } = await supabase.from('posts').select('tags').not('tags', 'is', null);

      if (error) {
        logger.error('posts', 'getPopularTags', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<
          { tag: string; count: number }[]
        >;
      }

      // 统计每个标签的使用次数
      const tagCount = new Map<string, number>();
      if (data) {
        for (const post of data) {
          if (Array.isArray(post.tags)) {
            for (const tag of post.tags) {
              if (tag && typeof tag === 'string') {
                const trimmedTag = tag.trim();
                tagCount.set(trimmedTag, (tagCount.get(trimmedTag) || 0) + 1);
              }
            }
          }
        }
      }

      // 转换为数组并按使用次数排序
      const popularTags = Array.from(tagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      logger.success('posts', 'getPopularTags', popularTags.length);
      return { data: popularTags, error: null, success: true };
    } catch (err) {
      logger.error('posts', 'getPopularTags', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(): Promise<SupabaseResponse<{ count: number }>> {
    logger.query('notifications', 'unreadCount');

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

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('unread', true);

      if (error) {
        logger.error('notifications', 'unreadCount', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<{ count: number }>;
      }

      const finalCount = count !== null ? count : 0;
      logger.success('notifications', 'unreadCount', finalCount);
      return { data: { count: finalCount }, error: null, success: true };
    } catch (err) {
      logger.error('notifications', 'unreadCount', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

// 导出单例
export const supabaseForumService = new SupabaseForumService();

export default supabaseForumService;
