/**
 * Pet Love 设计系统 - 主题配置
 *
 * 基于 "Scientific Warmth" 设计理念
 */

import {
  sageScale,
  coralScale,
  slateScale,
  healthScale,
  lightBackgrounds,
  darkBackgrounds,
} from '../tokens/brand-colors';

// ============================================================================
// 亮色主题 (Light Theme)
// ============================================================================
export const petLoveLightTheme = {
  // --- 背景色 ---
  background: lightBackgrounds.primary,
  backgroundSubtle: lightBackgrounds.subtle,
  backgroundMuted: lightBackgrounds.muted,
  backgroundElevated: lightBackgrounds.elevated,
  backgroundHover: slateScale.slate2,
  backgroundPress: slateScale.slate3,
  backgroundFocus: sageScale.sage2,
  backgroundStrong: lightBackgrounds.subtle,
  backgroundTransparent: 'transparent',

  // --- 前景色/文字 ---
  color: slateScale.slate12, // 主文字 - 温暖深灰而非纯黑
  colorHover: slateScale.slate11,
  colorPress: slateScale.slate12,
  colorFocus: slateScale.slate11,
  colorMuted: slateScale.slate9,
  colorSubtle: slateScale.slate7,
  colorDisabled: slateScale.slate5,
  colorTransparent: 'transparent',

  // --- 边框 ---
  borderColor: slateScale.slate4,
  borderColorHover: slateScale.slate5,
  borderColorFocus: sageScale.sage7,
  borderColorPress: slateScale.slate6,
  borderColorMuted: slateScale.slate3,

  // --- 占位符 & 阴影 ---
  placeholderColor: slateScale.slate6,
  shadowColor: 'rgba(37, 36, 34, 0.08)', // 使用 slate12 的透明版本

  // --- 色阶 (用于细粒度控制) ---
  color1: slateScale.slate1,
  color2: slateScale.slate2,
  color3: slateScale.slate3,
  color4: slateScale.slate4,
  color5: slateScale.slate5,
  color6: slateScale.slate6,
  color7: slateScale.slate7,
  color8: slateScale.slate8,
  color9: slateScale.slate9,
  color10: slateScale.slate10,
  color11: slateScale.slate11,
  color12: slateScale.slate12,

  // --- 品牌主色 (Sage Green) ---
  primary: sageScale.sage7,
  primaryLight: sageScale.sage3,
  primaryLighter: sageScale.sage2,
  primaryDark: sageScale.sage9,
  primaryContrast: '#FFFFFF',

  // --- 品牌副色 (Coral) ---
  secondary: coralScale.coral7,
  secondaryLight: coralScale.coral3,
  secondaryLighter: coralScale.coral2,
  secondaryDark: coralScale.coral9,
  secondaryContrast: '#FFFFFF',

  // --- 语义色 - 健康指示器 ---
  // 安全/好成分
  safe: healthScale.safe6,
  safeLight: healthScale.safe2,
  safeLighter: healthScale.safe1,
  safeDark: healthScale.safe7,
  safeText: healthScale.safe7,

  // 警告/需注意
  caution: healthScale.caution6,
  cautionLight: healthScale.caution2,
  cautionLighter: healthScale.caution1,
  cautionDark: healthScale.caution7,
  cautionText: healthScale.caution7,

  // 风险/不好成分
  risk: healthScale.risk6,
  riskLight: healthScale.risk2,
  riskLighter: healthScale.risk1,
  riskDark: healthScale.risk7,
  riskText: healthScale.risk7,

  // 传统语义色别名
  green: healthScale.safe6,
  greenLight: healthScale.safe3,
  yellow: healthScale.caution6,
  yellowLight: healthScale.caution3,
  red: healthScale.risk6,
  redLight: healthScale.risk3,
  blue: '#3B82F6',
  blueLight: '#DBEAFE',

  // --- 特殊用途 ---
  overlay: 'rgba(15, 20, 25, 0.5)',
  overlaySubtle: 'rgba(15, 20, 25, 0.3)',
  accentBackground: sageScale.sage1,
  cardBackground: '#FFFFFF',
  cardBackgroundElevated: '#FFFFFF',
} as const;

// ============================================================================
// 暗色主题 (Dark Theme)
// ============================================================================
export const petLoveDarkTheme = {
  // --- 背景色 (深午夜蓝) ---
  background: darkBackgrounds.primary,
  backgroundSubtle: darkBackgrounds.subtle,
  backgroundMuted: darkBackgrounds.muted,
  backgroundElevated: darkBackgrounds.elevated,
  backgroundHover: '#1E262F',
  backgroundPress: '#252F3A',
  backgroundFocus: '#1A2A22', // 带绿调的聚焦色
  backgroundStrong: darkBackgrounds.primary,
  backgroundTransparent: 'transparent',

  // --- 前景色/文字 ---
  color: '#F5F4F2', // 温暖的白色
  colorHover: '#E6E5E3',
  colorPress: '#F5F4F2',
  colorFocus: '#E6E5E3',
  colorMuted: '#9CA3AF',
  colorSubtle: '#6B7280',
  colorDisabled: '#4B5563',
  colorTransparent: 'transparent',

  // --- 边框 ---
  borderColor: '#2D3748',
  borderColorHover: '#3D4A5C',
  borderColorFocus: sageScale.sage6,
  borderColorPress: '#4A5568',
  borderColorMuted: '#252F3A',

  // --- 占位符 & 阴影 ---
  placeholderColor: '#6B7280',
  shadowColor: 'rgba(0, 0, 0, 0.4)',

  // --- 色阶 ---
  color1: darkBackgrounds.primary,
  color2: darkBackgrounds.subtle,
  color3: darkBackgrounds.muted,
  color4: '#252F3A',
  color5: '#2D3748',
  color6: '#3D4A5C',
  color7: '#4A5568',
  color8: '#6B7280',
  color9: '#9CA3AF',
  color10: '#D1D5DB',
  color11: '#E5E7EB',
  color12: '#F5F4F2',

  // --- 品牌主色 ---
  primary: sageScale.sage6,
  primaryLight: '#1E3528',
  primaryLighter: '#162820',
  primaryDark: sageScale.sage5,
  primaryContrast: '#FFFFFF',

  // --- 品牌副色 ---
  secondary: coralScale.coral6,
  secondaryLight: '#3D2A26',
  secondaryLighter: '#2D1F1D',
  secondaryDark: coralScale.coral5,
  secondaryContrast: '#FFFFFF',

  // --- 语义色 - 健康指示器 (暗色模式稍微降低饱和度) ---
  safe: healthScale.safe5,
  safeLight: '#0D2818',
  safeLighter: '#081A10',
  safeDark: healthScale.safe4,
  safeText: healthScale.safe4,

  caution: healthScale.caution5,
  cautionLight: '#2D1F0A',
  cautionLighter: '#1F1508',
  cautionDark: healthScale.caution4,
  cautionText: healthScale.caution4,

  risk: healthScale.risk5,
  riskLight: '#2D0F14',
  riskLighter: '#1F0A0E',
  riskDark: healthScale.risk4,
  riskText: healthScale.risk4,

  green: healthScale.safe5,
  greenLight: '#0D2818',
  yellow: healthScale.caution5,
  yellowLight: '#2D1F0A',
  red: healthScale.risk5,
  redLight: '#2D0F14',
  blue: '#60A5FA',
  blueLight: '#0F1A2D',

  // --- 特殊用途 ---
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlaySubtle: 'rgba(0, 0, 0, 0.5)',
  accentBackground: '#162820',
  cardBackground: darkBackgrounds.subtle,
  cardBackgroundElevated: darkBackgrounds.muted,
} as const;

export type PetLoveTheme = typeof petLoveLightTheme;
