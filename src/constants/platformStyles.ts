/**
 * 跨平台样式配置
 *
 * 遵循企业级最佳实践：
 * - 避免使用平台特定的阴影属性（elevation / shadow*）
 * - 使用 border 和 opacity 创建视觉层次
 * - 确保在 iOS 和 Android 上一致的视觉效果
 */

import { Platform } from 'react-native';

/**
 * 卡片样式配置
 * 使用边框和背景色替代阴影，确保跨平台一致性
 */
export const CARD_STYLES = {
  /**
   * 标准卡片样式
   * - 使用 bordered 属性
   * - 避免使用 elevate 属性（会在 Android 上产生阴影）
   */
  default: {
    bordered: true,
    borderWidth: 1,
    borderRadius: '$4',
  },

  /**
   * 浮动效果卡片
   * 使用边框颜色的透明度来创建视觉层次
   */
  elevated: {
    bordered: true,
    borderWidth: 2,
    borderRadius: '$5',
  },

  /**
   * 平面卡片（无边框）
   */
  flat: {
    borderWidth: 0,
    borderRadius: '$4',
  },
} as const;

/**
 * 按钮样式配置
 * 确保触觉反馈在所有平台一致
 */
export const BUTTON_STYLES = {
  pressStyle: {
    scale: 0.97,
    opacity: 0.8,
  },

  hoverStyle: {
    opacity: 0.9,
  },
} as const;

/**
 * 动画配置
 * 确保动画在所有平台流畅运行
 */
export const ANIMATION_CONFIG = {
  quick: 'quick' as const,
  bouncy: 'bouncy' as const,
  lazy: 'lazy' as const,
} as const;

/**
 * 平台检测辅助函数
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/**
 * 获取平台特定值
 * @param ios iOS 平台的值
 * @param android Android 平台的值
 * @param fallback 其他平台的默认值
 */
export function platformSelect<T>(ios: T, android: T, fallback?: T): T {
  return Platform.select({
    ios,
    android,
    default: fallback ?? android,
  });
}

/**
 * 字体配置
 * 确保字体在所有平台正确显示
 */
export const FONT_CONFIG = {
  // 使用系统字体，确保表情符号和特殊字符正确显示
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),

  // 自定义字体
  custom: 'MaoKen',
} as const;

/**
 * 图标配置
 * 使用 IconSymbol 而不是表情符号，确保跨平台一致性
 */
export const ICON_SIZES = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
  xxlarge: 64,
} as const;

/**
 * 间距配置
 * 统一的间距系统
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
