/**
 * Catfood Realtime Hook - 猫粮数据实时同步
 *
 * 功能：
 * - 监听 catfoods 表的 UPDATE 事件（评分、点赞等统计数据变化）
 * - 监听 catfood_ratings 表的 INSERT/UPDATE/DELETE 事件
 * - 监听 catfood_likes 表的 INSERT/DELETE 事件
 * - 自动更新 catFoodStore 中的数据
 * - 支持按需订阅特定猫粮
 */

import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase/client';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { logger } from '@/src/utils/logger';
import type { CatFood } from '@/src/types/catFood';

interface UseCatfoodRealtimeOptions {
  /**
   * 是否启用实时订阅（默认 true）
   */
  enabled?: boolean;

  /**
   * 订阅特定的猫粮 ID（如果不指定则订阅所有）
   */
  catfoodId?: number;

  /**
   * 数据变化回调
   */
  onUpdate?: (catfood: CatFood) => void;
}

/**
 * Catfood 实时同步 Hook
 *
 * @example
 * ```tsx
 * // 在排行榜页面订阅所有猫粮变化
 * useCatfoodRealtime({ enabled: true });
 *
 * // 在详情页订阅特定猫粮
 * useCatfoodRealtime({
 *   enabled: true,
 *   catfoodId: 123,
 *   onUpdate: (catfood) => console.log('Updated:', catfood)
 * });
 * ```
 */
export function useCatfoodRealtime(options: UseCatfoodRealtimeOptions = {}) {
  const { enabled = true, catfoodId, onUpdate } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const updateCatFood = useCatFoodStore((state) => state.updateCatFood);

  useEffect(() => {
    if (!enabled) {
      logger.debug('Realtime 订阅未启用');
      return;
    }

    // 创建唯一的频道名称
    const channelName = catfoodId ? `catfood-realtime-${catfoodId}` : 'catfood-realtime-all';

    logger.info('🔌 启动 Catfood Realtime 订阅', { channelName, catfoodId });

    // 创建 Realtime 频道
    const channel = supabase.channel(channelName);

    // 订阅 catfoods 表的更新（评分、点赞统计等）
    const catfoodsFilter = catfoodId ? `id=eq.${catfoodId}` : undefined;

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'catfoods',
        filter: catfoodsFilter,
      },
      (payload) => {
        logger.info('📊 Catfood 更新', payload);

        const updatedCatfood = payload.new as any;

        // 更新 store
        updateCatFood(updatedCatfood.id, {
          score: updatedCatfood.score,
          countNum: updatedCatfood.count_num,
        });

        // 触发回调
        if (onUpdate) {
          onUpdate(updatedCatfood);
        }
      }
    );

    // 📝 注意：不需要订阅 catfood_ratings 和 catfood_likes 表
    // 因为数据库触发器会自动更新 catfoods 表，我们只需监听 catfoods 的 UPDATE 事件
    // 这样可以避免重复刷新和页面重新加载

    // 订阅频道
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        logger.info('✅ Realtime 订阅成功', { channelName });
      } else if (status === 'CHANNEL_ERROR') {
        // WebSocket 连接错误是正常的，通常是网络波动或热重载导致
        // Supabase 会自动重连，不需要特别处理
        logger.warn('⚠️ Realtime 连接中断，正在重连...', { channelName });
      } else if (status === 'TIMED_OUT') {
        logger.error('❌ Realtime 订阅超时', new Error(status));
      } else if (status === 'CLOSED') {
        logger.info('🔌 Realtime 连接已关闭', { channelName });
      }
    });

    channelRef.current = channel;

    // 清理函数
    return () => {
      logger.info('🔌 关闭 Catfood Realtime 订阅', { channelName });

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, catfoodId, updateCatFood, onUpdate]);

  return {
    channel: channelRef.current,
  };
}

/**
 * 监听评论数量变化（用于详情页）
 */
export function useCommentsRealtime(options: {
  targetType: 'catfood' | 'post' | 'report';
  targetId: number;
  enabled?: boolean;
  onUpdate?: () => void;
}) {
  const { targetType, targetId, enabled = true, onUpdate } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `comments-${targetType}-${targetId}`;
    logger.info('🔌 启动 Comments Realtime 订阅', { channelName });

    const channel = supabase.channel(channelName);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `target_type=eq.${targetType},target_id=eq.${targetId}`,
      },
      (payload) => {
        logger.info('💬 评论变化', payload);
        onUpdate?.();
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        logger.info('✅ Comments Realtime 订阅成功');
      }
    });

    channelRef.current = channel;

    return () => {
      logger.info('🔌 关闭 Comments Realtime 订阅');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, targetType, targetId, onUpdate]);

  return { channel: channelRef.current };
}
