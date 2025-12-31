/**
 * 声望系统服务
 *
 * 功能：
 * - 查询用户声望
 * - 获取声望排行榜
 * - 手动触发声望重算（仅用于数据修复）
 *
 * 注意：
 * 声望由 Supabase Database Functions 自动计算
 * 当用户档案、评论、宠物等数据变更时，自动触发更新
 */

import { supabase } from '../client';
import { convertKeysToCamel, logger, wrapResponse, type SupabaseResponse } from '../helpers';

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * 声望等级
 */
export type ReputationLevel = 'novice' | 'intermediate' | 'advanced' | 'expert';

/**
 * 声望等级中文名称
 */
export const REPUTATION_LEVEL_NAMES: Record<ReputationLevel, string> = {
  novice: '新手',
  intermediate: '进阶',
  advanced: '高级',
  expert: '专家',
};

/**
 * 声望等级颜色
 */
export const REPUTATION_LEVEL_COLORS: Record<ReputationLevel, string> = {
  novice: '#94A3B8', // 灰色
  intermediate: '#3B82F6', // 蓝色
  advanced: '#8B5CF6', // 紫色
  expert: '#F59E0B', // 金色
};

/**
 * 声望汇总数据
 */
export interface ReputationSummary {
  userId: string;
  profileCompleteness: number; // 档案完整度 (0-20)
  reviewQuality: number; // 评论质量 (0-40)
  communityContribution: number; // 社区贡献 (0-30)
  compliance: number; // 合规性 (0-10)
  score: number; // 总分 (0-100)
  level: ReputationLevel; // 等级
  updatedAt: string;
}

/**
 * 声望详情（包含用户信息）
 */
export interface ReputationDetail extends ReputationSummary {
  user: {
    username: string;
    avatarUrl?: string;
  };
}

/**
 * 获取用户声望
 */
export const getUserReputation = async (
  userId: string
): Promise<SupabaseResponse<ReputationSummary>> => {
  logger.query('reputation', 'get_user', { userId });

  try {
    const { data, error } = await supabase
      .from('reputation_summaries')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      logger.error('reputation', 'get_user', error);
      return wrapResponse<ReputationSummary>(null, error);
    }

    if (!data || data.length === 0) {
      logger.error('reputation', 'get_user', 'not_found');
      return wrapResponse<ReputationSummary>(null, {
        message: '声望数据不存在',
        code: 'NOT_FOUND',
        details: '',
        hint: '',
      } as PostgrestError);
    }

    // 如果有多条记录，取第一条
    const reputationData = data[0];
    const reputation = convertKeysToCamel(reputationData) as ReputationSummary;
    logger.success('reputation', 'get_user', reputationData.score);
    return wrapResponse<ReputationSummary>(reputation, null);
  } catch (err) {
    logger.error('reputation', 'get_user', err);
    return wrapResponse<ReputationSummary>(null, {
      message: String(err),
      code: 'EXCEPTION',
      details: '',
      hint: '',
    } as PostgrestError);
  }
};

/**
 * 获取当前用户声望
 */
export const getMyReputation = async (): Promise<SupabaseResponse<ReputationSummary>> => {
  logger.query('reputation', 'get_my');

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.error('reputation', 'get_my', 'not_authenticated');
      return wrapResponse<ReputationSummary>(null, {
        message: '未登录',
        code: 'UNAUTHENTICATED',
        details: '',
        hint: '',
      } as PostgrestError);
    }

    return await getUserReputation(user.id);
  } catch (err) {
    logger.error('reputation', 'get_my', err);
    return wrapResponse<ReputationSummary>(null, {
      message: String(err),
      code: 'EXCEPTION',
      details: '',
      hint: '',
    } as PostgrestError);
  }
};

/**
 * 获取声望排行榜
 */
export const getReputationLeaderboard = async (
  params: {
    page?: number;
    pageSize?: number;
  } = {}
): Promise<SupabaseResponse<ReputationDetail[]>> => {
  const { page = 1, pageSize = 20 } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  logger.query('reputation', 'leaderboard', params);

  try {
    const { data, error } = await supabase
      .from('reputation_summaries')
      .select(
        `
        *,
        user:profiles(username, avatar_url)
      `
      )
      .order('score', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error('reputation', 'leaderboard', error);
      return wrapResponse<ReputationDetail[]>(null, error);
    }

    const leaderboard = data.map((item: any) => convertKeysToCamel(item)) as ReputationDetail[];

    logger.success('reputation', 'leaderboard', leaderboard.length);
    return wrapResponse<ReputationDetail[]>(leaderboard, null);
  } catch (err) {
    logger.error('reputation', 'leaderboard', err);
    return wrapResponse<ReputationDetail[]>(null, {
      message: String(err),
      code: 'EXCEPTION',
      details: '',
      hint: '',
    } as PostgrestError);
  }
};

/**
 * 获取指定等级的用户数量
 */
export const getReputationLevelCount = async (
  level: ReputationLevel
): Promise<SupabaseResponse<number>> => {
  logger.query('reputation', 'level_count', { level });

  try {
    const { count, error } = await supabase
      .from('reputation_summaries')
      .select('*', { count: 'exact', head: true })
      .eq('level', level);

    if (error) {
      logger.error('reputation', 'level_count', error);
      return wrapResponse<number>(null, error);
    }

    logger.success('reputation', 'level_count', count || 0);
    return wrapResponse<number>(count || 0, null);
  } catch (err) {
    logger.error('reputation', 'level_count', err);
    return wrapResponse<number>(null, {
      message: String(err),
      code: 'EXCEPTION',
      details: '',
      hint: '',
    } as PostgrestError);
  }
};

/**
 * 手动触发声望重算
 *
 * 注意：正常情况下不需要调用此方法
 * 声望会在数据变更时自动更新
 * 此方法仅用于数据修复或调试
 */
export const recalculateReputation = async (userId?: string): Promise<SupabaseResponse<void>> => {
  logger.query('reputation', 'recalculate', { userId });

  try {
    // 如果没有指定 userId，使用当前用户
    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.error('reputation', 'recalculate', 'not_authenticated');
        return wrapResponse(null, {
          message: '未登录',
          code: 'UNAUTHENTICATED',
          details: '',
          hint: '',
        } as PostgrestError);
      }

      targetUserId = user.id;
    }

    // 调用 Supabase RPC
    const { error } = await supabase.rpc('calculate_reputation', {
      user_uuid: targetUserId,
    });

    if (error) {
      logger.error('reputation', 'recalculate', error);
      return wrapResponse(null, error);
    }

    logger.success('reputation', 'recalculate');
    return wrapResponse(null, null);
  } catch (err) {
    logger.error('reputation', 'recalculate', err);
    return wrapResponse(null, {
      message: String(err),
      code: 'EXCEPTION',
      details: '',
      hint: '',
    } as PostgrestError);
  }
};

/**
 * 获取声望进度信息
 *
 * 用于展示距离下一等级还需要多少分
 */
export const getReputationProgress = (
  reputation: ReputationSummary
): {
  currentLevel: ReputationLevel;
  currentLevelName: string;
  nextLevel: ReputationLevel | null;
  nextLevelName: string | null;
  currentScore: number;
  nextLevelScore: number;
  progress: number; // 0-100
} => {
  const { score, level } = reputation;

  const levelThresholds: Record<ReputationLevel, number> = {
    novice: 0,
    intermediate: 40,
    advanced: 60,
    expert: 80,
  };

  const levels: ReputationLevel[] = ['novice', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(level);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

  const currentLevelScore = levelThresholds[level];
  const nextLevelScore = nextLevel ? levelThresholds[nextLevel] : 100;

  const progress = nextLevel
    ? Math.round(((score - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100)
    : 100;

  return {
    currentLevel: level,
    currentLevelName: REPUTATION_LEVEL_NAMES[level],
    nextLevel,
    nextLevelName: nextLevel ? REPUTATION_LEVEL_NAMES[nextLevel] : null,
    currentScore: score,
    nextLevelScore,
    progress,
  };
};

/**
 * 导出声望服务
 */
export const supabaseReputationService = {
  getUserReputation,
  getMyReputation,
  getReputationLeaderboard,
  getReputationLevelCount,
  recalculateReputation,
  getReputationProgress,
};
