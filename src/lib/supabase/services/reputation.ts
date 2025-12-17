import { supabase } from '../client';
import { Database } from '../types/database';
import { convertKeysToCamel } from '@/src/lib/supabase/helpers';

// 类型别名
export type ReputationSummary = Database['public']['Tables']['reputation_summaries']['Row'];
type AbnormalBehaviorLog = Database['public']['Tables']['abnormal_behavior_logs']['Row'];

/**
 * 日志异常行为
 */
export const logAbnormalBehavior = async (
  userId: string,
  behaviorType: string,
  behaviorDetails: Record<string, any>
): Promise<{ data: AbnormalBehaviorLog | null; error: any }> => {
  const { data, error } = await supabase
    .from('abnormal_behavior_logs')
    .insert({
      user_id: userId,
      behavior_type: behaviorType,
      behavior_details: behaviorDetails,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  return {
    data: data ? (convertKeysToCamel(data) as AbnormalBehaviorLog) : null,
    error,
  };
};

/**
 * 发送分数变动通知
 */
const notifyScoreChange = async (
  userId: string,
  changes: {
    dimension: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }
) => {
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'reputation_change',
    title: '信用分更新',
    content: `您的${changes.dimension}分数从${changes.oldValue}变为${changes.newValue}，原因：${changes.reason}`,
    is_read: false,
    created_at: new Date().toISOString(),
  });
};

/**
 * 计算评分一致性（0-15分）- 包含新用户保护和长尾修正
 */
const calculateRatingConsistency = async (userId: string): Promise<number> => {
  // 获取用户注册时间（新用户保护）
  const { data: user } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  const userAgeDays = user
    ? (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 30;
  const deviationTolerance = userAgeDays < 30 ? 3 : 2; // 新用户容忍度更高

  // 获取用户所有评分
  const { data: userRatings } = await supabase
    .from('catfood_ratings')
    .select('catfood_id, score')
    .eq('user_id', userId);

  if (!userRatings || userRatings.length === 0) return 0;

  let totalDeviation = 0;
  const deviations: number[] = [];

  // 计算每个评分与商品平均分的偏差
  for (const rating of userRatings) {
    const { data: catfoodData } = await supabase
      .from('catfoods')
      .select('avg_rating')
      .eq('id', rating.catfood_id)
      .single();

    if (catfoodData?.avg_rating) {
      const deviation = Math.abs(rating.score - catfoodData.avg_rating);
      deviations.push(deviation);
      // 超过容忍度的偏差才扣分
      if (deviation > deviationTolerance) {
        totalDeviation += deviation - deviationTolerance;
      }
    }
  }

  // 长尾修正：去除超过3倍标准差的异常值
  if (deviations.length > 1) {
    const mean = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const std = Math.sqrt(
      deviations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / deviations.length
    );
    const filteredDeviations = deviations.filter((d) => Math.abs(d - mean) <= 3 * std);
    totalDeviation = filteredDeviations.reduce(
      (sum, d) => sum + (d > deviationTolerance ? d - deviationTolerance : 0),
      0
    );
  }

  // 计算最终分数（扣完为止，最低0分）
  const maxScore = 15;
  const penalty = Math.min(totalDeviation * 0.5, maxScore); // 每单位偏差扣0.5分
  return Math.max(0, maxScore - penalty);
};

/**
 * 计算评价行为健康度（0-15分）
 */
const calculateReviewBehaviorHealth = async (userId: string): Promise<number> => {
  // 获取用户评分时间序列
  const { data: ratingTimes } = await supabase
    .from('catfood_ratings')
    .select('created_at, score')
    .eq('user_id', userId)
    .order('created_at');

  if (!ratingTimes || ratingTimes.length <= 1) return 15; // 评分少默认满分

  let penalty = 0;

  // 1. 检测短时间内大量评分
  const timeDiffs = [];
  for (let i = 1; i < ratingTimes.length; i++) {
    const prevTime = new Date(ratingTimes[i - 1].created_at).getTime();
    const currTime = new Date(ratingTimes[i].created_at).getTime();
    timeDiffs.push((currTime - prevTime) / (1000 * 60)); // 转换为分钟
  }
  const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
  if (avgDiff < 30) {
    penalty += (30 - avgDiff) * 0.1; // 间隔越短，扣分越多
  }

  // 2. 检测极端评分集中
  const extremeRatings = ratingTimes.filter((r) => r.score === 1 || r.score === 5);
  const extremeRatio = extremeRatings.length / ratingTimes.length;
  if (extremeRatio > 0.8 && ratingTimes.length > 3) {
    penalty += 5; // 极端评分占比过高扣5分
  }

  // 计算最终分数
  const maxScore = 15;
  return Math.max(0, maxScore - penalty);
};

/**
 * 计算评价质量（0-10分）
 */
const calculateReviewQuality = async (userId: string): Promise<number> => {
  // 获取用户所有评分
  const { data: allRatings } = await supabase
    .from('catfood_ratings')
    .select('id, comment, image_urls')
    .eq('user_id', userId);

  if (!allRatings || allRatings.length === 0) return 0;

  // 有文字评论的评分占比
  const ratedWithComments = allRatings.filter((r) => r.comment && r.comment.trim() !== '');
  const commentRatio = ratedWithComments.length / allRatings.length;

  // 有图片的评分占比
  const ratedWithImages = allRatings.filter((r) => r.image_urls && r.image_urls.length > 0);
  const imageRatio = ratedWithImages.length / allRatings.length;

  // 计算分数（评论占5分，图片占5分）
  return commentRatio * 5 + imageRatio * 5;
};

/**
 * 计算评价可信度总分（0-40分）
 */
export const calculateReviewCredibility = async (
  userId: string
): Promise<{
  total: number;
  ratingConsistency: number;
  reviewBehaviorHealth: number;
  reviewQuality: number;
}> => {
  const ratingConsistency = await calculateRatingConsistency(userId);
  const reviewBehaviorHealth = await calculateReviewBehaviorHealth(userId);
  const reviewQuality = await calculateReviewQuality(userId);

  return {
    total: ratingConsistency + reviewBehaviorHealth + reviewQuality,
    ratingConsistency,
    reviewBehaviorHealth,
    reviewQuality,
  };
};

/**
 * 计算资料完整度（0-15分）
 */
const calculateProfileCompleteness = async (userId: string): Promise<number> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, pet_info, location')
    .eq('id', userId)
    .single();

  if (!profile) return 0;

  let score = 0;
  // 基础信息（用户名、头像）
  if (profile.username) score += 3;
  if (profile.avatar_url) score += 2;
  // 宠物信息（养宠标识）
  if (profile.pet_info && Object.keys(profile.pet_info).length > 0) score += 6;
  // 地理位置
  if (profile.location) score += 4;

  return Math.min(score, 15); // 封顶15分
};

/**
 * 计算社区贡献（0-25分）
 */
const calculateCommunityContribution = async (userId: string): Promise<number> => {
  // 简化版：可根据评论点赞数、被引用数等扩展
  const { data: ratings } = await supabase
    .from('catfood_ratings')
    .select('id')
    .eq('user_id', userId);

  const ratingCount = ratings ? ratings.length : 0;
  // 最多25分（50条评分满分）
  return Math.min(ratingCount * 0.5, 25);
};

/**
 * 计算合规性（0-20分）
 */
const calculateCompliance = async (userId: string): Promise<number> => {
  // 检查是否有违规记录
  const { data: violations } = await supabase
    .from('moderation_actions')
    .select('id')
    .eq('user_id', userId)
    .eq('action_type', 'warning');

  const violationCount = violations ? violations.length : 0;
  // 每违规一次扣5分，最低0分
  return Math.max(0, 20 - violationCount * 5);
};

/**
 * 计算用户等级
 */
const calculateLevel = (totalScore: number): string => {
  if (totalScore >= 80) return '专家';
  if (totalScore >= 60) return '资深';
  if (totalScore >= 40) return '进阶';
  return '新手';
};

/**
 * 重算用户完整信誉分
 */
export const recalculateReputation = async (
  userId: string
): Promise<{
  data: ReputationSummary | null;
  error: any;
}> => {
  // 获取旧分数（用于对比通知）
  const { data: oldSummary } = await supabase
    .from('reputation_summaries')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 计算各维度分数
  const profileCompleteness = await calculateProfileCompleteness(userId);
  const reviewCredibility = await calculateReviewCredibility(userId);
  const communityContribution = await calculateCommunityContribution(userId);
  const compliance = await calculateCompliance(userId);

  // 计算总分
  const totalScore =
    profileCompleteness + reviewCredibility.total + communityContribution + compliance;

  // 计算等级
  const level = calculateLevel(totalScore);

  // 插入/更新信誉分记录
  const { data, error } = await supabase
    .from('reputation_summaries')
    .upsert({
      user_id: userId,
      score: totalScore,
      profile_completeness: profileCompleteness,
      review_credibility: reviewCredibility.total,
      rating_consistency: reviewCredibility.ratingConsistency,
      review_behavior_health: reviewCredibility.reviewBehaviorHealth,
      review_quality: reviewCredibility.reviewQuality,
      community_contribution: communityContribution,
      compliance: compliance,
      level: level,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  // 发送分数变动通知（仅当分数变化超过1分时）
  if (oldSummary && Math.abs(oldSummary.score - totalScore) > 1) {
    await notifyScoreChange(userId, {
      dimension: '总分',
      oldValue: oldSummary.score,
      newValue: totalScore,
      reason: '系统定期重算信用分',
    });

    // 维度分数变动通知
    if (oldSummary.review_credibility !== reviewCredibility.total) {
      await notifyScoreChange(userId, {
        dimension: '评价可信度',
        oldValue: oldSummary.review_credibility,
        newValue: reviewCredibility.total,
        reason: '评价行为/质量/一致性调整',
      });
    }
  }

  return {
    data: data ? (convertKeysToCamel(data) as ReputationSummary) : null,
    error: null,
  };
};

/**
 * 管理员手动调整信用分
 */
export const adminRecalculateReputation = async (
  adminId: string,
  userId: string,
  overrideData?: Partial<ReputationSummary>
) => {
  // 验证管理员权限
  const { data: admin } = await supabase.from('profiles').select('role').eq('id', adminId).single();

  if (admin?.role !== 'admin') {
    return { error: { message: '无管理员权限' } };
  }

  let result;

  if (overrideData) {
    // 手动调整分数
    result = await supabase
      .from('reputation_summaries')
      .update({
        ...overrideData,
        updated_at: new Date().toISOString(),
        last_manual_adjustment_by: adminId,
      })
      .eq('user_id', userId);
  } else {
    // 自动重算
    result = await recalculateReputation(userId);
  }

  return result;
};

/**
 * 获取用户信誉分详情
 */
export const getUserReputation = async (
  userId: string
): Promise<{
  data: ReputationSummary | null;
  error: any;
}> => {
  const { data, error } = await supabase
    .from('reputation_summaries')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    data: data ? (convertKeysToCamel(data) as ReputationSummary) : null,
    error,
  };
};
