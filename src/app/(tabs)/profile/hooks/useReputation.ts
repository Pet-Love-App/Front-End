/**
 * 信誉分和勋章管理 Hook
 *
 * 处理信誉分查询、勋章管理等功能
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getUserReputation, type ReputationSummary } from '@/src/lib/supabase/services/reputation';
import { supabase } from '@/src/lib/supabase/client';
import { convertKeysToCamel } from '@/src/lib/supabase/helpers';
import type { DbUserBadge } from '@/src/lib/supabase/types/database';

export function useReputation(userId?: string) {
  const [reputation, setReputation] = useState<ReputationSummary | null>(null);
  const [badges, setBadges] = useState<DbUserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载信誉分数据
  const loadReputation = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: reputationError } = await getUserReputation(userId);

      if (reputationError) {
        throw new Error(reputationError.message);
      }

      setReputation(data);
    } catch (err) {
      console.error('加载信誉分失败:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 加载勋章数据
  const loadBadges = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error: badgeError } = await supabase
        .from('user_badges')
        .select(
          `
          *,
          badge:badges(*)
        `
        )
        .eq('user_id', userId)
        .order('acquired_at', { ascending: false });

      if (badgeError) {
        throw new Error(badgeError.message);
      }

      const convertedBadges = data.map((item) => convertKeysToCamel(item)) as DbUserBadge[];
      setBadges(convertedBadges);
    } catch (err) {
      console.error('加载勋章失败:', err);
    }
  }, [userId]);

  // 装备勋章
  const equipBadge = useCallback(
    async (badgeId: number) => {
      if (!userId) return;

      try {
        // 先取消所有已装备的勋章
        await supabase
          .from('user_badges')
          .update({ is_equipped: false })
          .eq('user_id', userId)
          .eq('is_equipped', true);

        // 装备新勋章
        const { error } = await supabase
          .from('user_badges')
          .update({ is_equipped: true })
          .eq('user_id', userId)
          .eq('badge_id', badgeId);

        if (error) {
          throw new Error(error.message);
        }

        Alert.alert('成功', '勋章已装备');
        await loadBadges();
      } catch (err) {
        console.error('装备勋章失败:', err);
        Alert.alert('失败', '装备勋章失败，请稍后再试');
      }
    },
    [userId, loadBadges]
  );

  // 取消装备勋章
  const unequipBadge = useCallback(
    async (badgeId: number) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from('user_badges')
          .update({ is_equipped: false })
          .eq('user_id', userId)
          .eq('badge_id', badgeId);

        if (error) {
          throw new Error(error.message);
        }

        Alert.alert('成功', '已取消装备');
        await loadBadges();
      } catch (err) {
        console.error('取消装备失败:', err);
        Alert.alert('失败', '取消装备失败，请稍后再试');
      }
    },
    [userId, loadBadges]
  );

  // 刷新数据
  const refresh = useCallback(async () => {
    await Promise.all([loadReputation(), loadBadges()]);
  }, [loadReputation, loadBadges]);

  useEffect(() => {
    if (userId) {
      loadReputation();
      loadBadges();
    }
  }, [userId, loadReputation, loadBadges]);

  return {
    reputation,
    badges,
    loading,
    error,
    refresh,
    equipBadge,
    unequipBadge,
  };
}
