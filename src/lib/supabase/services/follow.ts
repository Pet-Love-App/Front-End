/**
 * Supabase 关注系统服务
 *
 * 功能：
 * - 关注/取消关注用户
 * - 获取粉丝列表
 * - 获取关注列表
 * - 检查关注状态
 */

import { supabase, getCurrentUserId } from '../client';
import { handleSupabaseError, logger, wrapResponse, type SupabaseResponse } from '../helpers';

// ==================== 类型定义 ====================

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
  // 关联的用户信息
  followerUsername?: string;
  followerAvatar?: string;
  followingUsername?: string;
  followingAvatar?: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

// ==================== 关注服务类 ====================

class SupabaseFollowService {
  /**
   * 关注用户
   */
  async followUser(targetUserId: string): Promise<SupabaseResponse<boolean>> {
    logger.query('follows', 'follow', { targetUserId });

    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return {
          data: null,
          error: { message: '请先登录', code: 'AUTH_REQUIRED', details: '', hint: '' } as any,
          success: false,
        };
      }

      if (currentUserId === targetUserId) {
        return {
          data: null,
          error: { message: '不能关注自己', code: 'SELF_FOLLOW', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 检查是否已关注
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (existing) {
        return { data: true, error: null, success: true };
      }

      // 创建关注关系
      const { error } = await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      });

      if (error) {
        handleSupabaseError(error, 'followUser');
        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('follows', 'followUser');
      return { data: true, error: null, success: true };
    } catch (err) {
      logger.error('follows', 'followUser', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 取消关注用户
   */
  async unfollowUser(targetUserId: string): Promise<SupabaseResponse<boolean>> {
    logger.query('follows', 'unfollow', { targetUserId });

    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return {
          data: null,
          error: { message: '请先登录', code: 'AUTH_REQUIRED', details: '', hint: '' } as any,
          success: false,
        };
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) {
        handleSupabaseError(error, 'unfollowUser');
        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('follows', 'unfollowUser');
      return { data: true, error: null, success: true };
    } catch (err) {
      logger.error('follows', 'unfollowUser', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 检查是否已关注某用户
   */
  async isFollowing(targetUserId: string): Promise<SupabaseResponse<boolean>> {
    logger.query('follows', 'isFollowing', { targetUserId });

    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return { data: false, error: null, success: true };
      }

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) {
        handleSupabaseError(error, 'isFollowing');
        return { data: false, error: null, success: true };
      }

      return { data: !!data, error: null, success: true };
    } catch (err) {
      logger.error('follows', 'isFollowing', err);
      return { data: false, error: null, success: true };
    }
  }

  /**
   * 获取用户的粉丝列表
   */
  async getFollowers(userId: string): Promise<SupabaseResponse<Follow[]>> {
    logger.query('follows', 'getFollowers', { userId });

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          follower_id,
          following_id,
          created_at,
          follower:profiles!follows_follower_id_fkey(username, avatar_url)
        `
        )
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'getFollowers');
        return wrapResponse(null, error) as unknown as SupabaseResponse<Follow[]>;
      }

      const followers: Follow[] = (data || []).map((item: any) => ({
        followerId: item.follower_id,
        followingId: item.following_id,
        createdAt: item.created_at,
        followerUsername: item.follower?.username,
        followerAvatar: item.follower?.avatar_url,
      }));

      return { data: followers, error: null, success: true };
    } catch (err) {
      logger.error('follows', 'getFollowers', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取用户的关注列表
   */
  async getFollowing(userId: string): Promise<SupabaseResponse<Follow[]>> {
    logger.query('follows', 'getFollowing', { userId });

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          follower_id,
          following_id,
          created_at,
          following:profiles!follows_following_id_fkey(username, avatar_url)
        `
        )
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'getFollowing');
        return wrapResponse(null, error) as unknown as SupabaseResponse<Follow[]>;
      }

      const following: Follow[] = (data || []).map((item: any) => ({
        followerId: item.follower_id,
        followingId: item.following_id,
        createdAt: item.created_at,
        followingUsername: item.following?.username,
        followingAvatar: item.following?.avatar_url,
      }));

      return { data: following, error: null, success: true };
    } catch (err) {
      logger.error('follows', 'getFollowing', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取用户的关注统计
   */
  async getFollowStats(userId: string): Promise<SupabaseResponse<FollowStats>> {
    logger.query('follows', 'getFollowStats', { userId });

    try {
      // 获取粉丝数
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followersError) {
        handleSupabaseError(followersError, 'getFollowStats.followers');
        return wrapResponse(null, followersError) as unknown as SupabaseResponse<FollowStats>;
      }

      // 获取关注数
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) {
        handleSupabaseError(followingError, 'getFollowStats.following');
        return wrapResponse(null, followingError) as unknown as SupabaseResponse<FollowStats>;
      }

      return {
        data: {
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('follows', 'getFollowStats', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 切换关注状态
   */
  async toggleFollow(targetUserId: string): Promise<SupabaseResponse<{ isFollowing: boolean }>> {
    logger.query('follows', 'toggleFollow', { targetUserId });

    try {
      const isFollowingResponse = await this.isFollowing(targetUserId);

      if (isFollowingResponse.data) {
        await this.unfollowUser(targetUserId);
        return { data: { isFollowing: false }, error: null, success: true };
      } else {
        await this.followUser(targetUserId);
        return { data: { isFollowing: true }, error: null, success: true };
      }
    } catch (err) {
      logger.error('follows', 'toggleFollow', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

export const supabaseFollowService = new SupabaseFollowService();
