import { supabase } from '../client';

/**
 * 分析信用分分布
 */
export const analyzeReputationDistribution = async () => {
  const { data } = await supabase.from('reputation_summaries').select('score, level, created_at');

  if (!data) return { data: null, error: { message: '无数据' } };

  // 计算各分数段用户占比
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };

  data.forEach((item) => {
    if (item.score <= 20) distribution['0-20']++;
    else if (item.score <= 40) distribution['21-40']++;
    else if (item.score <= 60) distribution['41-60']++;
    else if (item.score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });

  // 检测异常分布
  const total = Object.values(distribution).reduce((sum, v) => sum + v, 0);
  const highScoreRatio = (distribution['81-100'] / total) * 100;

  if (highScoreRatio > 30 || highScoreRatio < 5) {
    // 触发警报（可集成到消息通知系统）
    console.warn('信用分分布异常：高分用户占比', highScoreRatio + '%');
  }

  return { data: distribution, error: null };
};
