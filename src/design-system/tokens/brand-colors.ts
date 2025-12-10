/**
 * Pet Love 品牌色彩系统
 *
 * 设计理念: "Scientific Warmth" (科学的温暖)
 * - Primary: 柔和鼠尾草绿 (信任、健康、专业)
 * - Secondary: 温暖珊瑚色 (活力、社区、互动)
 * - Neutral: 温暖灰调 (舒适阅读、降低眼疲劳)
 */

// ============================================================================
// 主色 - 柔和鼠尾草绿 (Soft Sage Green)
// 用于: 主要品牌色、健康指标、信任标识
// ============================================================================
export const sageScale = {
  sage1: '#F7FAF8', // 最浅 - 背景底色
  sage2: '#EEF5F1',
  sage3: '#E0EDE5',
  sage4: '#CEE3D5',
  sage5: '#B8D6C3',
  sage6: '#9EC5AB',
  sage7: '#7FB093', // 主色调
  sage8: '#6A9A7E',
  sage9: '#578469',
  sage10: '#466D56',
  sage11: '#365544',
  sage12: '#1E3528', // 最深 - 强调文字
} as const;

// ============================================================================
// 副色 - 温暖珊瑚色 (Warm Coral)
// 用于: CTA按钮、点赞、社区互动、高能量元素
// ============================================================================
export const coralScale = {
  coral1: '#FFF8F6',
  coral2: '#FFF0ED',
  coral3: '#FFE4DD',
  coral4: '#FFD4CA',
  coral5: '#FFC1B3',
  coral6: '#FFAA97',
  coral7: '#FF8F78', // 主色调
  coral8: '#F07560',
  coral9: '#E05A48',
  coral10: '#C94435',
  coral11: '#A63326',
  coral12: '#6B1F18',
} as const;

// ============================================================================
// 中性色 - 温暖灰 (Warm Slate)
// 用于: 文字、边框、分割线
// ============================================================================
export const slateScale = {
  slate1: '#FAFAF9',
  slate2: '#F6F5F4',
  slate3: '#EFEEED',
  slate4: '#E6E5E3',
  slate5: '#DCDBD8',
  slate6: '#CFCDC9',
  slate7: '#ADABA6',
  slate8: '#8A8883',
  slate9: '#6C6A66',
  slate10: '#55534F',
  slate11: '#3D3C39',
  slate12: '#252422', // 主文字色 - 避免纯黑
} as const;

// ============================================================================
// 语义色 - 健康安全指示器
// ============================================================================
export const healthScale = {
  // 安全/好的成分 (柔和绿)
  safe1: '#F0FDF4',
  safe2: '#DCFCE7',
  safe3: '#BBF7D0',
  safe4: '#86EFAC',
  safe5: '#4ADE80',
  safe6: '#22C55E', // 主色
  safe7: '#16A34A',

  // 警告/需注意 (柔和黄)
  caution1: '#FEFCE8',
  caution2: '#FEF9C3',
  caution3: '#FEF08A',
  caution4: '#FDE047',
  caution5: '#FACC15',
  caution6: '#EAB308', // 主色
  caution7: '#CA8A04',

  // 风险/不好的成分 (柔和红)
  risk1: '#FFF1F2',
  risk2: '#FFE4E6',
  risk3: '#FECDD3',
  risk4: '#FDA4AF',
  risk5: '#FB7185',
  risk6: '#F43F5E', // 主色
  risk7: '#E11D48',
} as const;

// ============================================================================
// 评分颜色渐变
// ============================================================================
export const scoreGradients = {
  excellent: ['#22C55E', '#16A34A'] as const, // 90-100
  good: ['#84CC16', '#65A30D'] as const, // 70-89
  average: ['#EAB308', '#CA8A04'] as const, // 50-69
  poor: ['#F97316', '#EA580C'] as const, // 30-49
  bad: ['#F43F5E', '#E11D48'] as const, // 0-29
} as const;

// ============================================================================
// 亮色主题背景
// ============================================================================
export const lightBackgrounds = {
  primary: '#FFFFFF',
  subtle: '#FAFAF9', // 温暖的灰白
  muted: '#F5F4F2',
  elevated: '#FFFFFF',
  // 渐变背景 (用于页面)
  gradient: {
    start: '#FAFAF9',
    middle: '#F7FAF8',
    end: '#FFFFFF',
  },
} as const;

// ============================================================================
// 暗色主题背景 (深午夜蓝, 不是纯黑)
// ============================================================================
export const darkBackgrounds = {
  primary: '#0F1419', // 深午夜蓝
  subtle: '#161D24',
  muted: '#1E262F',
  elevated: '#252F3A',
  // 渐变背景
  gradient: {
    start: '#0F1419',
    middle: '#131A21',
    end: '#161D24',
  },
} as const;

// ============================================================================
// 卡片装饰渐变
// ============================================================================
export const cardGradients = {
  health: ['#E0EDE5', '#F7FAF8'] as const,
  community: ['#FFE4DD', '#FFF8F6'] as const,
  premium: ['#F5E6D3', '#FFF8F5'] as const,
  darkHealth: ['#1E3528', '#0F1419'] as const,
  darkCommunity: ['#3D2A26', '#0F1419'] as const,
} as const;

// ============================================================================
// 头像边框/信誉环颜色
// ============================================================================
export const reputationRings = {
  newbie: '#ADABA6', // 灰色
  active: '#7FB093', // 鼠尾草绿
  trusted: '#60A5FA', // 蓝色
  expert: '#A78BFA', // 紫色
  legend: {
    gradient: ['#FFD700', '#FFA500', '#FF8F78'] as const, // 金色渐变
  },
} as const;

export type SageScale = typeof sageScale;
export type CoralScale = typeof coralScale;
export type SlateScale = typeof slateScale;
export type HealthScale = typeof healthScale;
