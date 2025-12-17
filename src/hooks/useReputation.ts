// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase/client';
// import { BADGE_CONFIGS } from '@/src/constants/badges';

// // 类型定义
// export interface ReputationState {
//   score: number;
//   level: string;
//   profile_completeness: number;
//   review_credibility: number;
//   community_contribution: number;
//   compliance: number;
//   eligibleBadges: any[];
//   currentBadge: any;
// }

// export function useReputation(initialScore = 0) {
//   const [state, setState] = useState<ReputationState>({
//     score: initialScore,
//     level: 'novice',
//     profile_completeness: 0,
//     review_credibility: 0,
//     community_contribution: 0,
//     compliance: 0,
//     eligibleBadges: [],
//     currentBadge: BADGE_CONFIGS.novice
//   });

//   // 1. 自动加载用户信用分
//   useEffect(() => {
//     const loadReputation = async () => {
//       const { data: userData } = await supabase.auth.getUser();
//       if (!userData.user) return;

//       const { data } = await supabase
//         .from('profiles')
//         .select(`
//           reputation_score,
//           reputation_level,
//           profile_completeness,
//           review_credibility,
//           community_contribution,
//           compliance,
//           badges,
//           equipped_badge
//         `)
//         .eq('id', userData.user.id)
//         .single();

//       if (data) {
//         const level = data.reputation_level || 'novice';
//         setState({
//           score: data.reputation_score || 0,
//           level,
//           profile_completeness: data.profile_completeness || 0,
//           review_credibility: data.review_credibility || 0,
//           community_contribution: data.community_contribution || 0,
//           compliance: data.compliance || 0,
//           eligibleBadges: data.badges || [],
//           currentBadge: BADGE_CONFIGS[data.equipped_badge || level]
//         });
//       }
//     };

//     loadReputation();

//     // 2. 监听信用分变化（实时更新）
//     const channel = supabase
//       .channel(`reputation:${supabase.auth.user()?.id}`)
//       .on('postgres_changes', {
//         event: 'UPDATE',
//         schema: 'public',
//         table: 'profiles',
//         filter: `id=eq.${supabase.auth.user()?.id}`
//       }, (payload) => {
//         if (payload.new.reputation_score) {
//           setState(prev => ({
//             ...prev,
//             score: payload.new.reputation_score,
//             level: payload.new.reputation_level || prev.level,
//             profile_completeness: payload.new.profile_completeness || prev.profile_completeness,
//             review_credibility: payload.new.review_credibility || prev.review_credibility,
//             community_contribution: payload.new.community_contribution || prev.community_contribution,
//             compliance: payload.new.compliance || prev.compliance
//           }));
//         }
//       })
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   // 计算徽章进度
//   const getBadgeProgress = (badgeCode: string): number => {
//     switch (badgeCode) {
//       case 'novice': return Math.min(100, (state.score / 24) * 100);
//       case 'intermediate': return state.score < 25 ? 0 : Math.min(100, ((state.score - 25) / 24) * 100);
//       case 'advanced': return state.score < 50 ? 0 : Math.min(100, ((state.score - 50) / 24) * 100);
//       case 'expert': return state.score < 75 ? 0 : Math.min(100, ((state.score - 75) / 25) * 100);
//       case 'reliable_reviewer': return Math.min(100, (state.review_credibility / 35) * 100);
//       default: return 0;
//     }
//   };

//   // 设置分数
//   const setScore = (score: number) => {
//     setState(prev => ({
//       ...prev,
//       score: Math.max(0, Math.min(100, score)),
//       level: getLevelFromScore(score)
//     }));
//   };

//   // 辅助函数：根据分数获取等级
//   const getLevelFromScore = (score: number): string => {
//     if (score >= 75) return 'expert';
//     if (score >= 50) return 'advanced';
//     if (score >= 25) return 'intermediate';
//     return 'novice';
//   };

//   return {
//     state,
//     setScore,
//     getBadgeProgress,
//     setReliabilityScore: (score: number) => setState(prev => ({ ...prev, review_credibility: score })),
//     setConsistentRatings: (isConsistent: boolean) => setState(prev => ({ ...prev, compliance: isConsistent ? 20 : prev.compliance }))
//   };
// }
// src/hooks/useReputation.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import type { Database } from '@/src/lib/supabase/types/database';
import { BADGE_CONFIGS, REPUTATION_LEVEL_MAP, type BadgeConfig } from '@/src/constants/badges';

// 类型定义
type DbReputationSummary = Database['public']['Tables']['reputation_summaries']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];

// 信用分状态类型
interface ReputationState {
  loading: boolean;
  error: string | null;
  reputation: DbReputationSummary | null;
  userBadgeCodes: string[];
  equippedBadgeCode: string | null;
  eligibleBadges: BadgeConfig[];
}

export function useReputation() {
  const [state, setState] = useState<ReputationState>({
    loading: true,
    error: null,
    reputation: null,
    userBadgeCodes: [],
    equippedBadgeCode: null,
    eligibleBadges: [],
  });

  // 1. 加载用户信用分和徽章数据
  const loadReputationData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // 获取当前用户
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('未登录');
      }
      const userId = authData.user.id;

      // 并行加载信用分和用户资料
      const [reputationResult, profileResult] = await Promise.all([
        supabase.from('reputation_summaries').select('*').eq('user_id', userId).single(),
        supabase.from('profiles').select('badges, equipped_badge').eq('id', userId).single(),
      ]);

      const reputationData = reputationResult.data;
      const profileData = profileResult.data;

      // 处理徽章数据
      const userBadgeCodes = (profileData?.badges as string[]) || [];
      const equippedBadgeCode = (profileData?.equipped_badge as string) || null;

      // 计算符合条件的徽章
      const eligibleBadges = calculateEligibleBadges(reputationData || null, userBadgeCodes);

      setState({
        loading: false,
        error: null,
        reputation: reputationData || null,
        userBadgeCodes,
        equippedBadgeCode,
        eligibleBadges,
      });
    } catch (error) {
      console.error('加载信用分数据失败:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      }));
    }
  };

  useEffect(() => {
    loadReputationData();

    // 2. 监听信用分变化（实时更新）
    const setupRealtimeListener = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const channel = supabase
        .channel(`reputation:${authData.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'reputation_summaries',
            filter: `user_id=eq.${authData.user.id}`,
          },
          (payload) => {
            setState((prev) => {
              const newReputation = payload.new as DbReputationSummary;
              const newEligibleBadges = calculateEligibleBadges(newReputation, prev.userBadgeCodes);

              return {
                ...prev,
                reputation: newReputation,
                eligibleBadges: newEligibleBadges,
              };
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeListener();
  }, []);

  // 2. 计算符合条件的徽章
  const calculateEligibleBadges = (
    reputation: DbReputationSummary | null,
    userBadgeCodes: string[]
  ): BadgeConfig[] => {
    if (!reputation) return [];

    const eligible: BadgeConfig[] = [];
    const score = reputation.score;

    // 基础等级徽章
    if (score >= 0) eligible.push(BADGE_CONFIGS.novice);
    if (score >= 25) eligible.push(BADGE_CONFIGS.intermediate);
    if (score >= 50) eligible.push(BADGE_CONFIGS.advanced);
    if (score >= 75) eligible.push(BADGE_CONFIGS.expert);

    // 特殊徽章
    if (reputation.review_credibility >= 35) {
      eligible.push(BADGE_CONFIGS.reliable_reviewer);
    }
    if (reputation.rating_consistency >= 12) {
      eligible.push(BADGE_CONFIGS.consistent_ratings);
    }

    // 过滤用户已拥有的徽章
    return eligible.filter((badge) => userBadgeCodes.includes(badge.code));
  };

  // 3. 装备/卸下徽章
  const equipBadge = async (badgeCode: string): Promise<boolean> => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('未登录');

      // 更新用户佩戴的徽章
      const { error } = await supabase
        .from('profiles')
        .update({
          equipped_badge: badgeCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id);

      if (error) throw error;

      // 更新本地状态
      setState((prev) => ({
        ...prev,
        equippedBadgeCode: badgeCode,
      }));

      return true;
    } catch (error) {
      console.error('装备徽章失败:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '装备徽章失败',
      }));
      return false;
    }
  };

  const unequipBadge = async (): Promise<boolean> => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('未登录');

      // 清空佩戴的徽章
      const { error } = await supabase
        .from('profiles')
        .update({
          equipped_badge: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id);

      if (error) throw error;

      // 更新本地状态
      setState((prev) => ({
        ...prev,
        equippedBadgeCode: null,
      }));

      return true;
    } catch (error) {
      console.error('卸下徽章失败:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '卸下徽章失败',
      }));
      return false;
    }
  };

  // 4. 计算徽章进度
  const getBadgeProgress = (badgeCode: string): number => {
    if (!state.reputation) return 0;
    const { score, review_credibility, rating_consistency } = state.reputation;

    switch (badgeCode) {
      case 'novice':
        return Math.min(100, (score / 24) * 100);
      case 'intermediate':
        return score < 25 ? 0 : Math.min(100, ((score - 25) / 24) * 100);
      case 'advanced':
        return score < 50 ? 0 : Math.min(100, ((score - 50) / 24) * 100);
      case 'expert':
        return score < 75 ? 0 : Math.min(100, ((score - 75) / 25) * 100);
      case 'reliable_reviewer':
        return Math.min(100, (review_credibility / 35) * 100);
      case 'consistent_ratings':
        return Math.min(100, (rating_consistency / 12) * 100);
      default:
        return 0;
    }
  };

  // 5. 辅助计算
  const getLevelText = () => {
    if (!state.reputation) return '未评级';
    const level = state.reputation.level as keyof typeof REPUTATION_LEVEL_MAP;
    return REPUTATION_LEVEL_MAP[level] || state.reputation.level;
  };

  // 获取已装备徽章配置
  const getEquippedBadge = (): BadgeConfig | null => {
    if (!state.equippedBadgeCode) return null;
    return BADGE_CONFIGS[state.equippedBadgeCode] || null;
  };

  // 获取用户拥有的徽章配置
  const getUserBadges = (): BadgeConfig[] => {
    return state.userBadgeCodes.map((code) => BADGE_CONFIGS[code]).filter(Boolean);
  };

  return {
    ...state,
    equippedBadge: getEquippedBadge(),
    userBadges: getUserBadges(),
    getBadgeProgress,
    getLevelText,
    equipBadge,
    unequipBadge,
    refresh: loadReputationData,
  };
}

// 导出类型
export type { ReputationState };
