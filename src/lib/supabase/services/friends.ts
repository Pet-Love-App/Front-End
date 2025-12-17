/**
 * Supabase 好友系统服务
 *
 * 提供好友关系和好友请求的管理功能
 */

import { supabase } from '../client';
import { logger, wrapResponse, type SupabaseResponse } from '../helpers';

// ==================== 类型定义 ====================

export interface Friend {
  id: number;
  userId: string;
  friendId: string;
  friendUsername: string;
  friendAvatar?: string;
  friendBio?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: number;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  senderUsername: string;
  senderAvatar?: string;
  senderBio?: string;
  receiverUsername?: string;
  receiverAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 服务类 ====================

class SupabaseFriendsService {
  /**
   * 获取我的好友列表
   */
  async getMyFriends(): Promise<SupabaseResponse<Friend[]>> {
    logger.query('friends', 'getMyFriends', {});

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
        .from('friends_with_profile')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('friends', 'getMyFriends', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Friend[]>;
      }

      const friends: Friend[] = data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        friendId: item.friend_id,
        friendUsername: item.friend_username || 'Unknown',
        friendAvatar: item.friend_avatar,
        friendBio: item.friend_bio,
        createdAt: item.created_at,
      }));

      logger.success('friends', 'getMyFriends', friends.length);
      return { data: friends, error: null, success: true };
    } catch (err) {
      logger.error('friends', 'getMyFriends', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取收到的好友请求
   */
  async getReceivedRequests(): Promise<SupabaseResponse<FriendRequest[]>> {
    logger.query('friend_requests', 'getReceivedRequests', {});

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
        .from('friend_requests_with_profile')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('friend_requests', 'getReceivedRequests', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<FriendRequest[]>;
      }

      const requests: FriendRequest[] = data.map((item: any) => ({
        id: item.id,
        senderId: item.sender_id,
        receiverId: item.receiver_id,
        status: item.status,
        message: item.message,
        senderUsername: item.sender_username || 'Unknown',
        senderAvatar: item.sender_avatar,
        senderBio: item.sender_bio,
        receiverUsername: item.receiver_username,
        receiverAvatar: item.receiver_avatar,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      logger.success('friend_requests', 'getReceivedRequests', requests.length);
      return { data: requests, error: null, success: true };
    } catch (err) {
      logger.error('friend_requests', 'getReceivedRequests', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 发送好友请求
   */
  async sendFriendRequest(
    receiverId: string,
    message?: string
  ): Promise<SupabaseResponse<FriendRequest>> {
    logger.query('friend_requests', 'sendFriendRequest', { receiverId, message });

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

      // 检查是否已经是好友
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', receiverId)
        .maybeSingle();

      if (existingFriend) {
        return {
          data: null,
          error: { message: '已经是好友了', code: 'ALREADY_FRIENDS', details: '', hint: '' } as any,
          success: false,
        };
      }

      // 检查是否已经发送过请求
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id, status')
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return {
            data: null,
            error: {
              message: '已发送过好友请求',
              code: 'REQUEST_EXISTS',
              details: '',
              hint: '',
            } as any,
            success: false,
          };
        }
      }

      // 创建好友请求
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          message: message || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        logger.error('friend_requests', 'sendFriendRequest', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<FriendRequest>;
      }

      logger.success('friend_requests', 'sendFriendRequest');
      return {
        data: {
          id: data.id,
          senderId: data.sender_id,
          receiverId: data.receiver_id,
          status: data.status,
          message: data.message,
          senderUsername: '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('friend_requests', 'sendFriendRequest', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 接受好友请求
   */
  async acceptFriendRequest(requestId: number): Promise<SupabaseResponse<boolean>> {
    logger.query('friend_requests', 'acceptFriendRequest', { requestId });

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        logger.error('friend_requests', 'acceptFriendRequest', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('friend_requests', 'acceptFriendRequest');
      return { data: true, error: null, success: true };
    } catch (err) {
      logger.error('friend_requests', 'acceptFriendRequest', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 拒绝好友请求
   */
  async rejectFriendRequest(requestId: number): Promise<SupabaseResponse<boolean>> {
    logger.query('friend_requests', 'rejectFriendRequest', { requestId });

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        logger.error('friend_requests', 'rejectFriendRequest', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('friend_requests', 'rejectFriendRequest');
      return { data: true, error: null, success: true };
    } catch (err) {
      logger.error('friend_requests', 'rejectFriendRequest', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 删除好友
   */
  async removeFriend(friendId: string): Promise<SupabaseResponse<boolean>> {
    logger.query('friends', 'removeFriend', { friendId });

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
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      if (error) {
        logger.error('friends', 'removeFriend', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('friends', 'removeFriend');
      return { data: true, error: null, success: true };
    } catch (err) {
      logger.error('friends', 'removeFriend', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 检查是否是好友
   */
  async isFriend(friendId: string): Promise<SupabaseResponse<boolean>> {
    logger.query('friends', 'isFriend', { friendId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: false, error: null, success: true };
      }

      const { data, error } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .maybeSingle();

      if (error) {
        logger.error('friends', 'isFriend', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('friends', 'isFriend');
      return { data: !!data, error: null, success: true };
    } catch (err) {
      logger.error('friends', 'isFriend', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取好友请求状态
   */
  async getFriendRequestStatus(
    userId: string
  ): Promise<SupabaseResponse<'none' | 'sent' | 'received' | 'friends'>> {
    logger.query('friend_requests', 'getFriendRequestStatus', { userId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: 'none', error: null, success: true };
      }

      // 检查是否已经是好友
      const { data: friendData } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', userId)
        .maybeSingle();

      if (friendData) {
        return { data: 'friends', error: null, success: true };
      }

      // 检查是否发送过请求
      const { data: sentRequest } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (sentRequest) {
        return { data: 'sent', error: null, success: true };
      }

      // 检查是否收到过请求
      const { data: receivedRequest } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (receivedRequest) {
        return { data: 'received', error: null, success: true };
      }

      return { data: 'none', error: null, success: true };
    } catch (err) {
      logger.error('friend_requests', 'getFriendRequestStatus', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

export const supabaseFriendsService = new SupabaseFriendsService();
