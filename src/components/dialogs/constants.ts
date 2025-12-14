/**
 * 弹窗设计系统常量
 */

import type { DialogType } from './types';

// 主题色配置
export const DIALOG_COLORS = {
  // 主色调
  primary: '#FEBE98',
  primaryLight: '#FEF8F3',
  primaryDark: '#FDB97A',

  // 状态色
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // 中性色
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // 背景和文字
  background: '#FFFFFF',
  backgroundDark: '#1A1A1A',
  text: '#171717',
  textLight: '#737373',
  textDark: '#FFFFFF',
} as const;

// 渐变色
export const DIALOG_GRADIENTS = {
  primary: ['#FEBE98', '#FDB97A'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
} as const;

// 尺寸配置
export const DIALOG_SIZES = {
  small: {
    width: 320,
    maxWidth: '85%',
  },
  medium: {
    width: 420,
    maxWidth: '90%',
  },
  large: {
    width: 560,
    maxWidth: '95%',
  },
  fullscreen: {
    width: '100%',
    maxWidth: '100%',
  },
} as const;

// 圆角
export const BORDER_RADIUS = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  full: 9999,
} as const;

// 间距
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

// 字体大小
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

// 阴影配置
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  quick: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
  },
  smooth: {
    type: 'spring',
    damping: 25,
    stiffness: 250,
  },
  slow: {
    type: 'spring',
    damping: 30,
    stiffness: 200,
  },
} as const;

// 图标映射
export const DIALOG_ICONS: Record<DialogType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  default: '💬',
} as const;

// SF Symbols 图标映射（iOS 风格）
export const SF_SYMBOLS = {
  success: 'checkmark.circle.fill' as const,
  error: 'xmark.circle.fill' as const,
  warning: 'exclamationmark.triangle.fill' as const,
  info: 'info.circle.fill' as const,
  default: 'bubble.left.fill' as const,
} as const;

// 类型对应的颜色
export const TYPE_COLORS: Record<
  DialogType,
  { bg: string; border: string; text: string; icon: string }
> = {
  success: {
    bg: DIALOG_COLORS.successLight,
    border: DIALOG_COLORS.success,
    text: DIALOG_COLORS.successDark,
    icon: DIALOG_COLORS.success,
  },
  error: {
    bg: DIALOG_COLORS.errorLight,
    border: DIALOG_COLORS.error,
    text: DIALOG_COLORS.errorDark,
    icon: DIALOG_COLORS.error,
  },
  warning: {
    bg: DIALOG_COLORS.warningLight,
    border: DIALOG_COLORS.warning,
    text: DIALOG_COLORS.warningDark,
    icon: DIALOG_COLORS.warning,
  },
  info: {
    bg: DIALOG_COLORS.infoLight,
    border: DIALOG_COLORS.info,
    text: DIALOG_COLORS.infoDark,
    icon: DIALOG_COLORS.info,
  },
  default: {
    bg: DIALOG_COLORS.primaryLight,
    border: DIALOG_COLORS.primary,
    text: DIALOG_COLORS.primaryDark,
    icon: DIALOG_COLORS.primary,
  },
} as const;

// Toast 位置配置
export const TOAST_POSITIONS = {
  'top-right': { top: 60, right: 16 },
  'top-left': { top: 60, left: 16 },
  'bottom-right': { bottom: 60, right: 16 },
  'bottom-left': { bottom: 60, left: 16 },
  'top-center': { top: 60, alignSelf: 'center' as const },
  'bottom-center': { bottom: 60, alignSelf: 'center' as const },
} as const;

// Toast 默认持续时间
export const TOAST_DURATION = {
  short: 2000,
  medium: 3000,
  long: 5000,
} as const;
