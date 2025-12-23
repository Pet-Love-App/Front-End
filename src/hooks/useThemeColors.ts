/**
 * 主题感知颜色 Hook
 *
 * 根据当前主题模式返回正确的颜色值
 * 解决深色模式和浅色模式颜色不一致的问题
 */

import { useMemo } from 'react';

import { withAlpha } from '@/src/constants/colors';
import {
  primaryScale,
  neutralScale,
  successScale,
  warningScale,
  errorScale,
  infoScale,
  lightSemanticColors,
  darkSemanticColors,
} from '@/src/design-system/tokens/colors';

import { useThemeAwareColorScheme } from './useThemeAwareColorScheme';

/**
 * 主题颜色接口
 */
export interface ThemeColors {
  // 基础颜色
  background: string;
  backgroundSubtle: string;
  backgroundMuted: string;
  backgroundElevated: string;
  cardBackground: string;

  // 文本颜色
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;

  // 边框颜色
  border: string;
  borderMuted: string;
  borderFocus: string;

  // 品牌色
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // 图标颜色
  icon: string;
  iconSecondary: string;

  // 语义色
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;

  // 交互状态
  hover: string;
  active: string;
  selected: string;

  // 遮罩
  overlay: string;
  overlaySubtle: string;

  // 输入框
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // 标签栏
  tabBackground: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // 扫描按钮
  scanButtonBackground: string;
  scanButtonBorder: string;
  scanButtonIcon: string;

  // 原始 scale（用于需要特定阶梯的场景）
  neutralScale: typeof neutralScale;
  primaryScale: typeof primaryScale;

  // 品牌色带透明度的变体
  tint: string;
  tintAlpha10: string;
  tintAlpha20: string;
  tintAlpha30: string;
  tintAlpha40: string;
  tintAlpha50: string;

  // 图标色带透明度的变体
  iconAlpha05: string;
  iconAlpha10: string;
  iconAlpha15: string;
  iconAlpha20: string;
  iconAlpha30: string;
  iconAlpha40: string;
  iconAlpha60: string;

  // 背景变体
  bg: string;

  // 工具函数
  withAlpha: (color: string, alpha: number) => string;
}

/**
 * 浅色主题颜色
 */
const lightColors: ThemeColors = {
  // 基础颜色
  background: '#FFFFFF',
  backgroundSubtle: neutralScale.neutral1,
  backgroundMuted: neutralScale.neutral2,
  backgroundElevated: '#FFFFFF',
  cardBackground: '#FFFFFF',

  // 文本颜色
  text: neutralScale.neutral12,
  textSecondary: neutralScale.neutral9,
  textTertiary: neutralScale.neutral7,
  textMuted: neutralScale.neutral6,

  // 边框颜色
  border: neutralScale.neutral4,
  borderMuted: neutralScale.neutral3,
  borderFocus: primaryScale.primary7,

  // 品牌色
  primary: primaryScale.primary7,
  primaryLight: primaryScale.primary3,
  primaryDark: primaryScale.primary9,

  // 图标颜色
  icon: neutralScale.neutral9,
  iconSecondary: neutralScale.neutral6,

  // 语义色
  success: successScale.success7,
  successMuted: successScale.success2,
  warning: warningScale.warning7,
  warningMuted: warningScale.warning2,
  error: errorScale.error7,
  errorMuted: errorScale.error2,
  info: infoScale.info7,
  infoMuted: infoScale.info2,

  // 交互状态
  hover: neutralScale.neutral2,
  active: neutralScale.neutral3,
  selected: primaryScale.primary2,

  // 遮罩
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlaySubtle: 'rgba(0, 0, 0, 0.3)',

  // 输入框
  inputBackground: '#FFFFFF',
  inputBorder: neutralScale.neutral4,
  inputPlaceholder: neutralScale.neutral6,

  // 标签栏
  tabBackground: '#FFFFFF',
  tabIconDefault: neutralScale.neutral7,
  tabIconSelected: primaryScale.primary7,

  // 扫描按钮
  scanButtonBackground: primaryScale.primary7,
  scanButtonBorder: '#FFFFFF',
  scanButtonIcon: '#FFFFFF',

  // 原始 scale
  neutralScale,
  primaryScale,

  // 品牌色及透明度变体
  tint: primaryScale.primary7,
  tintAlpha10: withAlpha(primaryScale.primary7, 0.1),
  tintAlpha20: withAlpha(primaryScale.primary7, 0.2),
  tintAlpha30: withAlpha(primaryScale.primary7, 0.3),
  tintAlpha40: withAlpha(primaryScale.primary7, 0.4),
  tintAlpha50: withAlpha(primaryScale.primary7, 0.5),

  // 图标色及透明度变体
  iconAlpha05: withAlpha(neutralScale.neutral9, 0.05),
  iconAlpha10: withAlpha(neutralScale.neutral9, 0.1),
  iconAlpha15: withAlpha(neutralScale.neutral9, 0.15),
  iconAlpha20: withAlpha(neutralScale.neutral9, 0.2),
  iconAlpha30: withAlpha(neutralScale.neutral9, 0.3),
  iconAlpha40: withAlpha(neutralScale.neutral9, 0.4),
  iconAlpha60: withAlpha(neutralScale.neutral9, 0.6),

  // 背景变体
  bg: '#FFFFFF',

  // 工具函数
  withAlpha,
};

/**
 * 深色主题颜色
 */
const darkColors: ThemeColors = {
  // 基础颜色
  background: '#0A0A0A',
  backgroundSubtle: '#141414',
  backgroundMuted: '#1F1F1F',
  backgroundElevated: '#252525',
  cardBackground: '#1A1A1A',

  // 文本颜色
  text: '#FAFAFA',
  textSecondary: '#A1A1A1',
  textTertiary: '#737373',
  textMuted: '#525252',

  // 边框颜色
  border: '#2E2E2E',
  borderMuted: '#262626',
  borderFocus: primaryScale.primary6,

  // 品牌色
  primary: primaryScale.primary6,
  primaryLight: primaryScale.primary4,
  primaryDark: primaryScale.primary8,

  // 图标颜色
  icon: '#A1A1A1',
  iconSecondary: '#737373',

  // 语义色
  success: successScale.success5,
  successMuted: '#0D2818',
  warning: warningScale.warning5,
  warningMuted: '#2D1F0A',
  error: errorScale.error5,
  errorMuted: '#2D0F0F',
  info: infoScale.info5,
  infoMuted: '#0F1A2D',

  // 交互状态
  hover: '#1F1F1F',
  active: '#2A2A2A',
  selected: '#2D1F1A',

  // 遮罩
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlaySubtle: 'rgba(0, 0, 0, 0.5)',

  // 输入框
  inputBackground: '#1A1A1A',
  inputBorder: '#2E2E2E',
  inputPlaceholder: '#525252',

  // 标签栏
  tabBackground: '#0A0A0A',
  tabIconDefault: '#737373',
  tabIconSelected: primaryScale.primary6,

  // 扫描按钮
  scanButtonBackground: primaryScale.primary6,
  scanButtonBorder: '#0A0A0A',
  scanButtonIcon: '#0A0A0A',

  // 原始 scale
  neutralScale,
  primaryScale,

  // 品牌色及透明度变体
  tint: primaryScale.primary6,
  tintAlpha10: withAlpha(primaryScale.primary6, 0.1),
  tintAlpha20: withAlpha(primaryScale.primary6, 0.2),
  tintAlpha30: withAlpha(primaryScale.primary6, 0.3),
  tintAlpha40: withAlpha(primaryScale.primary6, 0.4),
  tintAlpha50: withAlpha(primaryScale.primary6, 0.5),

  // 图标色及透明度变体
  iconAlpha05: withAlpha('#A1A1A1', 0.05),
  iconAlpha10: withAlpha('#A1A1A1', 0.1),
  iconAlpha15: withAlpha('#A1A1A1', 0.15),
  iconAlpha20: withAlpha('#A1A1A1', 0.2),
  iconAlpha30: withAlpha('#A1A1A1', 0.3),
  iconAlpha40: withAlpha('#A1A1A1', 0.4),
  iconAlpha60: withAlpha('#A1A1A1', 0.6),

  // 背景变体
  bg: '#1A1A1A',

  // 工具函数
  withAlpha,
};

/**
 * 获取主题感知颜色
 *
 * @returns 当前主题的颜色对象
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const colors = useThemeColors();
 *   return (
 *     <View style={{ backgroundColor: colors.background }}>
 *       <Text style={{ color: colors.text }}>Hello</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useThemeColors(): ThemeColors {
  const colorScheme = useThemeAwareColorScheme();

  return useMemo(() => {
    return colorScheme === 'dark' ? darkColors : lightColors;
  }, [colorScheme]);
}

/**
 * 获取当前主题模式
 */
export function useIsDarkMode(): boolean {
  const colorScheme = useThemeAwareColorScheme();
  return colorScheme === 'dark';
}

/**
 * 导出静态颜色（用于不需要响应式的场景）
 */
export { lightColors, darkColors };
