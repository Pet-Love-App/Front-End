/**
 * 勋章系统配置
 *
 * 定义所有勋章的图标、颜色、获取条件等
 */

export type BadgeCategory = 'reputation' | 'activity' | 'contribution' | 'special';

export interface BadgeConfig {
  code: string;
  name: string;
  description: string;
  icon: string; // SF Symbol name
  color: string;
  gradient?: [string, string];
  category: BadgeCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement?: string; // 获取条件描述
}

/**
 * 勋章配置列表
 */
export const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  // ==================== 信誉等级勋章 ====================
  novice: {
    code: 'novice',
    name: '新手猫奴',
    description: '刚刚开始探索猫粮的世界',
    icon: 'pawprint.fill',
    color: '#94A3B8',
    gradient: ['#CBD5E1', '#94A3B8'],
    category: 'reputation',
    rarity: 'common',
    requirement: '信誉分达到 0-24 分',
  },
  intermediate: {
    code: 'intermediate',
    name: '进阶猫友',
    description: '对猫粮有了一定的了解',
    icon: 'star.fill',
    color: '#3B82F6',
    gradient: ['#60A5FA', '#3B82F6'],
    category: 'reputation',
    rarity: 'rare',
    requirement: '信誉分达到 25-49 分',
  },
  advanced: {
    code: 'advanced',
    name: '资深铲屎官',
    description: '猫粮选择的行家里手',
    icon: 'sparkles',
    color: '#8B5CF6',
    gradient: ['#A78BFA', '#8B5CF6'],
    category: 'reputation',
    rarity: 'epic',
    requirement: '信誉分达到 50-74 分',
  },
  expert: {
    code: 'expert',
    name: '猫粮专家',
    description: '社区公认的猫粮大师',
    icon: 'crown.fill',
    color: '#F59E0B',
    gradient: ['#FCD34D', '#F59E0B'],
    category: 'reputation',
    rarity: 'legendary',
    requirement: '信誉分达到 75-100 分',
  },

  // ==================== 活跃度勋章 ====================
  first_comment: {
    code: 'first_comment',
    name: '首次发声',
    description: '发表了第一条评论',
    icon: 'message.fill',
    color: '#10B981',
    gradient: ['#34D399', '#10B981'],
    category: 'activity',
    rarity: 'common',
    requirement: '发表第一条评论',
  },
  active_commenter: {
    code: 'active_commenter',
    name: '话痨猫友',
    description: '评论数达到 50 条',
    icon: 'bubble.left.and.bubble.right.fill',
    color: '#06B6D4',
    gradient: ['#22D3EE', '#06B6D4'],
    category: 'activity',
    rarity: 'rare',
    requirement: '累计发表 50 条评论',
  },
  super_commenter: {
    code: 'super_commenter',
    name: '评论达人',
    description: '评论数达到 200 条',
    icon: 'text.bubble.fill',
    color: '#8B5CF6',
    gradient: ['#A78BFA', '#8B5CF6'],
    category: 'activity',
    rarity: 'epic',
    requirement: '累计发表 200 条评论',
  },

  // ==================== 贡献勋章 ====================
  helpful_review: {
    code: 'helpful_review',
    name: '有用评价',
    description: '评论获得 20 个赞',
    icon: 'hand.thumbsup.fill',
    color: '#EF4444',
    gradient: ['#F87171', '#EF4444'],
    category: 'contribution',
    rarity: 'rare',
    requirement: '单条评论获得 20 个赞',
  },
  quality_reviewer: {
    code: 'quality_reviewer',
    name: '优质评论家',
    description: '多条评论获得大量点赞',
    icon: 'heart.text.square.fill',
    color: '#EC4899',
    gradient: ['#F472B6', '#EC4899'],
    category: 'contribution',
    rarity: 'epic',
    requirement: '累计获得 100 个评论赞',
  },
  profile_master: {
    code: 'profile_master',
    name: '资料完善',
    description: '个人资料 100% 完整',
    icon: 'person.crop.circle.badge.checkmark',
    color: '#14B8A6',
    gradient: ['#2DD4BF', '#14B8A6'],
    category: 'contribution',
    rarity: 'rare',
    requirement: '完成所有个人资料填写',
  },

  // ==================== 特殊勋章 ====================
  early_adopter: {
    code: 'early_adopter',
    name: '早期用户',
    description: 'PetLove 的先驱者',
    icon: 'flag.fill',
    color: '#F59E0B',
    gradient: ['#FCD34D', '#F59E0B'],
    category: 'special',
    rarity: 'legendary',
    requirement: '2024 年前注册的用户',
  },
  beta_tester: {
    code: 'beta_tester',
    name: '测试先锋',
    description: '参与内测的勇士',
    icon: 'hammer.fill',
    color: '#6366F1',
    gradient: ['#818CF8', '#6366F1'],
    category: 'special',
    rarity: 'epic',
    requirement: '参与应用测试',
  },
  community_star: {
    code: 'community_star',
    name: '社区之星',
    description: '为社区做出杰出贡献',
    icon: 'star.circle.fill',
    color: '#F59E0B',
    gradient: ['#FBBF24', '#F59E0B'],
    category: 'special',
    rarity: 'legendary',
    requirement: '由官方颁发',
  },
};

/**
 * 稀有度配置
 */
export const RARITY_CONFIGS = {
  common: {
    name: '普通',
    color: '#94A3B8',
    glow: 'rgba(148, 163, 184, 0.3)',
  },
  rare: {
    name: '稀有',
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  epic: {
    name: '史诗',
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.5)',
  },
  legendary: {
    name: '传说',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
};

/**
 * 分类配置
 */
export const CATEGORY_CONFIGS = {
  reputation: {
    name: '信誉等级',
    icon: 'shield.fill',
    color: '#8B5CF6',
  },
  activity: {
    name: '活跃度',
    icon: 'flame.fill',
    color: '#EF4444',
  },
  contribution: {
    name: '贡献',
    icon: 'gift.fill',
    color: '#10B981',
  },
  special: {
    name: '特殊',
    icon: 'sparkles',
    color: '#F59E0B',
  },
};

/**
 * 根据信誉等级获取勋章配置
 */
export function getBadgeByLevel(level: string): BadgeConfig | undefined {
  return BADGE_CONFIGS[level];
}

/**
 * 根据分类获取勋章列表
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeConfig[] {
  return Object.values(BADGE_CONFIGS).filter((badge) => badge.category === category);
}

/**
 * 根据稀有度获取勋章列表
 */
export function getBadgesByRarity(rarity: BadgeConfig['rarity']): BadgeConfig[] {
  return Object.values(BADGE_CONFIGS).filter((badge) => badge.rarity === rarity);
}
