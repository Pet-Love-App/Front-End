/**
 * Supabase 聊天系统服务
 *
 * 提供会话和消息管理功能
 */

import { supabase } from '../client';
import { logger, wrapResponse, type SupabaseResponse } from '../helpers';

// ==================== 类型定义 ====================

export interface Conversation {
  id: number;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: string;
  createdAt: string;
  // 从视图获取的额外字段
  participant1Username?: string;
  participant1Avatar?: string;
  participant2Username?: string;
  participant2Avatar?: string;
  lastMessage?: string;
  lastSenderId?: string;
  unreadCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  // 从视图获取的额外字段
  senderUsername?: string;
  senderAvatar?: string;
}

export interface UnreadCount {
  userId: string;
  conversationId: number;
  count: number;
}

// ==================== 服务类 ====================

class SupabaseChatService {
  /**
   * 获取或创建会话
   */
  async getOrCreateConversation(otherUserId: string): Promise<SupabaseResponse<Conversation>> {
    logger.query('conversations', 'getOrCreateConversation', { otherUserId });

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

      // 检查是否已存在会话
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`
        )
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        logger.error('conversations', 'getOrCreateConversation fetch', fetchError);
        return wrapResponse(null, fetchError) as unknown as SupabaseResponse<Conversation>;
      }

      if (existingConversation) {
        logger.success('conversations', 'getOrCreateConversation existing');
        return {
          data: {
            id: existingConversation.id,
            participant1Id: existingConversation.participant1_id,
            participant2Id: existingConversation.participant2_id,
            lastMessageAt: existingConversation.last_message_at,
            createdAt: existingConversation.created_at,
          },
          error: null,
          success: true,
        };
      }

      // 创建新会话
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId,
        })
        .select()
        .single();

      if (createError) {
        logger.error('conversations', 'getOrCreateConversation create', createError);
        return wrapResponse(null, createError) as unknown as SupabaseResponse<Conversation>;
      }

      logger.success('conversations', 'getOrCreateConversation created');
      return {
        data: {
          id: newConversation.id,
          participant1Id: newConversation.participant1_id,
          participant2Id: newConversation.participant2_id,
          lastMessageAt: newConversation.last_message_at,
          createdAt: newConversation.created_at,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('conversations', 'getOrCreateConversation', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取我的所有会话列表
   */
  async getMyConversations(): Promise<SupabaseResponse<Conversation[]>> {
    logger.query('conversations_with_participants', 'getMyConversations', {});

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
        .from('conversations_with_participants')
        .select('*')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        logger.error('conversations_with_participants', 'getMyConversations', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Conversation[]>;
      }

      // 获取未读计数
      const { data: unreadData } = await supabase
        .from('unread_counts')
        .select('conversation_id, count')
        .eq('user_id', user.id);

      const unreadMap = new Map(unreadData?.map((u) => [u.conversation_id, u.count]) || []);

      const conversations: Conversation[] = data.map((item: any) => ({
        id: item.id,
        participant1Id: item.participant1_id,
        participant2Id: item.participant2_id,
        lastMessageAt: item.last_message_at,
        createdAt: item.created_at,
        participant1Username: item.participant1_username,
        participant1Avatar: item.participant1_avatar,
        participant2Username: item.participant2_username,
        participant2Avatar: item.participant2_avatar,
        lastMessage: item.last_message,
        lastSenderId: item.last_sender_id,
        unreadCount: unreadMap.get(item.id) || 0,
      }));

      logger.success('conversations_with_participants', 'getMyConversations', conversations.length);
      return { data: conversations, error: null, success: true };
    } catch (err) {
      logger.error('conversations_with_participants', 'getMyConversations', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 获取会话的消息列表
   */
  async getMessages(conversationId: number, limit = 50): Promise<SupabaseResponse<Message[]>> {
    logger.query('messages_with_sender', 'getMessages', { conversationId, limit });

    try {
      const { data, error } = await supabase
        .from('messages_with_sender')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('messages_with_sender', 'getMessages', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Message[]>;
      }

      const messages: Message[] = data
        .map((item: any) => ({
          id: item.id,
          conversationId: item.conversation_id,
          senderId: item.sender_id,
          content: item.content,
          messageType: item.message_type,
          mediaUrl: item.media_url,
          isRead: item.is_read,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          senderUsername: item.sender_username,
          senderAvatar: item.sender_avatar,
        }))
        .reverse(); // 反转数组，使最新消息在底部

      logger.success('messages_with_sender', 'getMessages', messages.length);
      return { data: messages, error: null, success: true };
    } catch (err) {
      logger.error('messages_with_sender', 'getMessages', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(
    conversationId: number,
    content: string,
    messageType: 'text' | 'image' | 'video' | 'audio' = 'text',
    mediaUrl?: string
  ): Promise<SupabaseResponse<Message>> {
    logger.query('messages', 'sendMessage', { conversationId, messageType });

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
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          media_url: mediaUrl,
        })
        .select()
        .single();

      if (error) {
        logger.error('messages', 'sendMessage', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Message>;
      }

      logger.success('messages', 'sendMessage');
      return {
        data: {
          id: data.id,
          conversationId: data.conversation_id,
          senderId: data.sender_id,
          content: data.content,
          messageType: data.message_type,
          mediaUrl: data.media_url,
          isRead: data.is_read,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('messages', 'sendMessage', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 标记消息为已读
   * 优化版本：使用数据库函数、索引优化、超时控制
   */
  async markMessagesAsRead(conversationId: number): Promise<SupabaseResponse<boolean>> {
    logger.query('messages', 'markMessagesAsRead', { conversationId });

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

      // 使用数据库函数处理，性能最优
      const { data, error } = await supabase.rpc('mark_conversation_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
      });

      if (error) {
        logger.error('messages', 'markMessagesAsRead', error);

        // 如果是超时错误（57014），静默处理
        if (error.code === '57014' || error.message?.includes('timeout')) {
          logger.info('messages: markMessagesAsRead timeout - silent fail');
          // 返回成功，避免阻塞 UI
          return { data: true, error: null, success: true };
        }

        return wrapResponse(null, error) as unknown as SupabaseResponse<boolean>;
      }

      logger.success('messages', 'markMessagesAsRead', data || 0);
      return { data: true, error: null, success: true };
    } catch (err) {
      logger.error('messages', 'markMessagesAsRead', err);

      // 静默处理错误，避免阻塞聊天功能
      // 即使标记失败，也不应该影响用户查看消息
      return {
        data: true, // 返回 true 避免影响用户体验
        error: null,
        success: true,
      };
    }
  }

  /**
   * 获取总未读消息数
   */
  async getTotalUnreadCount(): Promise<SupabaseResponse<number>> {
    logger.query('unread_counts', 'getTotalUnreadCount', {});

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: 0, error: null, success: true };
      }

      const { data, error } = await supabase
        .from('unread_counts')
        .select('count')
        .eq('user_id', user.id);

      if (error) {
        logger.error('unread_counts', 'getTotalUnreadCount', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<number>;
      }

      const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

      logger.success('unread_counts', 'getTotalUnreadCount', total);
      return { data: total, error: null, success: true };
    } catch (err) {
      logger.error('unread_counts', 'getTotalUnreadCount', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 订阅新消息（实时）
   */
  subscribeToMessages(conversationId: number, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // 获取发送者信息
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const message: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            messageType: payload.new.message_type,
            mediaUrl: payload.new.media_url,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
            senderUsername: sender?.username,
            senderAvatar: sender?.avatar_url,
          };

          callback(message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * 订阅会话更新（实时）
   */
  subscribeToConversations(callback: () => void) {
    const channel = supabase
      .channel('conversations:all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const supabaseChatService = new SupabaseChatService();
