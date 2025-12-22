/**
 * 响应式设计工具集
 *
 * 基于设计稿尺寸的响应式缩放系统
 * - 设计稿基准宽度: 375px (iPhone X/11/12 等标准设计尺寸)
 * - 支持所有尺寸的屏幕自适应
 */

import { Dimensions, PixelRatio, Platform, ScaledSize } from 'react-native';

// ==================== 常量定义 ====================

/** 设计稿基准宽度 (iPhone X) */
const DESIGN_WIDTH = 375;

/** 设计稿基准高度 (iPhone X) */
const DESIGN_HEIGHT = 812;

/** 最小缩放比例 (防止在超小屏上过小) */
const MIN_SCALE = 0.8;

/** 最大缩放比例 (防止在平板上过大) */
const MAX_SCALE = 1.4;

/** 屏幕尺寸断点 */
export const BREAKPOINTS = {
  /** 超小屏幕 (iPhone SE 1st gen) */
  xs: 320,
  /** 小屏幕 (iPhone SE 2nd gen, iPhone 12 mini) */
  sm: 375,
  /** 中等屏幕 (iPhone 12/13/14) */
  md: 390,
  /** 大屏幕 (iPhone 12/13/14 Pro Max) */
  lg: 428,
  /** 超大屏幕/平板 */
  xl: 768,
  /** 桌面/大平板 */
  xxl: 1024,
} as const;

// ==================== 屏幕尺寸获取 ====================

/**
 * 获取当前屏幕尺寸
 */
function getScreenDimensions(): ScaledSize {
  return Dimensions.get('window');
}

/**
 * 获取屏幕宽度
 */
export function getScreenWidth(): number {
  return getScreenDimensions().width;
}

/**
 * 获取屏幕高度
 */
export function getScreenHeight(): number {
  return getScreenDimensions().height;
}

// ==================== 缩放计算 ====================

/**
 * 获取宽度缩放比例
 */
export function getWidthScale(): number {
  const { width } = getScreenDimensions();
  const scale = width / DESIGN_WIDTH;
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
}

/**
 * 获取高度缩放比例
 */
export function getHeightScale(): number {
  const { height } = getScreenDimensions();
  const scale = height / DESIGN_HEIGHT;
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
}

/**
 * 获取较小的缩放比例 (适用于需要保持比例的元素)
 */
export function getMinScale(): number {
  return Math.min(getWidthScale(), getHeightScale());
}

// ==================== 尺寸转换函数 ====================

/**
 * 水平方向缩放 (基于宽度)
 *
 * @param size 设计稿上的尺寸
 * @returns 缩放后的尺寸
 *
 * @example
 * // 设计稿上 16px 的元素
 * const width = scaleWidth(16); // 在不同屏幕上自适应
 */
export function scaleWidth(size: number): number {
  return Math.round(size * getWidthScale());
}

/**
 * 垂直方向缩放 (基于高度)
 *
 * @param size 设计稿上的尺寸
 * @returns 缩放后的尺寸
 */
export function scaleHeight(size: number): number {
  return Math.round(size * getHeightScale());
}

/**
 * 等比缩放 (使用较小的比例,确保不会溢出)
 *
 * @param size 设计稿上的尺寸
 * @returns 缩放后的尺寸
 */
export function scale(size: number): number {
  return Math.round(size * getMinScale());
}

/**
 * 字体缩放 (考虑系统字体缩放设置)
 *
 * @param size 设计稿上的字体大小
 * @param factor 额外缩放因子 (可选)
 * @returns 缩放后的字体大小
 *
 * @example
 * const fontSize = scaleFont(14); // 响应式字体
 */
export function scaleFont(size: number, factor: number = 1): number {
  const scaledSize = size * getWidthScale() * factor;
  // 限制字体缩放范围,确保可读性
  const minSize = size * 0.85;
  const maxSize = size * 1.3;
  const clampedSize = Math.min(Math.max(scaledSize, minSize), maxSize);
  // 使用 PixelRatio 确保清晰显示
  return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
}

/**
 * 中等强度缩放 (介于完全缩放和不缩放之间)
 *
 * 适用于不需要完全缩放的元素,如按钮、图标等
 *
 * @param size 设计稿上的尺寸
 * @param factor 缩放强度 (0-1, 默认0.5)
 * @returns 缩放后的尺寸
 *
 * @example
 * // 50% 强度缩放
 * const buttonHeight = moderateScale(48);
 * // 30% 强度缩放
 * const iconSize = moderateScale(24, 0.3);
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  const scaleDiff = getWidthScale() - 1;
  return Math.round(size + scaleDiff * size * factor);
}

/**
 * 百分比宽度
 *
 * @param percent 百分比 (0-100)
 * @returns 对应的像素值
 */
export function widthPercent(percent: number): number {
  return Math.round((getScreenWidth() * percent) / 100);
}

/**
 * 百分比高度
 *
 * @param percent 百分比 (0-100)
 * @returns 对应的像素值
 */
export function heightPercent(percent: number): number {
  return Math.round((getScreenHeight() * percent) / 100);
}

// ==================== 设备类型判断 ====================

export type DeviceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * 获取当前设备尺寸类型
 */
export function getDeviceSize(): DeviceSize {
  const width = getScreenWidth();
  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS.xxl) return 'xl';
  return 'xxl';
}

/**
 * 是否为小屏设备
 */
export function isSmallScreen(): boolean {
  return getScreenWidth() < BREAKPOINTS.md;
}

/**
 * 是否为超小屏设备
 */
export function isExtraSmallScreen(): boolean {
  return getScreenWidth() < BREAKPOINTS.sm;
}

/**
 * 是否为平板或更大设备
 */
export function isTablet(): boolean {
  return getScreenWidth() >= BREAKPOINTS.xl;
}

/**
 * 是否为 iOS 设备
 */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/**
 * 是否为 Android 设备
 */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

// ==================== 响应式值选择器 ====================

/**
 * 根据设备尺寸选择值
 *
 * @param values 不同尺寸的值
 * @returns 当前设备对应的值
 *
 * @example
 * const padding = selectByDevice({
 *   xs: 8,
 *   sm: 12,
 *   md: 16,
 *   default: 16,
 * });
 */
export function selectByDevice<T>(values: Partial<Record<DeviceSize, T>> & { default: T }): T {
  const deviceSize = getDeviceSize();
  return values[deviceSize] ?? values.default;
}

/**
 * 根据屏幕宽度判断返回值
 *
 * @param threshold 阈值宽度
 * @param belowValue 低于阈值时的值
 * @param aboveValue 高于或等于阈值时的值
 */
export function selectByWidth<T>(threshold: number, belowValue: T, aboveValue: T): T {
  return getScreenWidth() < threshold ? belowValue : aboveValue;
}

// ==================== 间距系统 ====================

/**
 * 响应式间距
 * 基于 4px 网格系统
 */
export const spacing = {
  /** 2px */
  xxs: scaleWidth(2),
  /** 4px */
  xs: scaleWidth(4),
  /** 8px */
  sm: scaleWidth(8),
  /** 12px */
  md: scaleWidth(12),
  /** 16px */
  lg: scaleWidth(16),
  /** 20px */
  xl: scaleWidth(20),
  /** 24px */
  xxl: scaleWidth(24),
  /** 32px */
  xxxl: scaleWidth(32),
} as const;

/**
 * 获取响应式间距 (动态计算)
 */
export function getSpacing(base: number): number {
  return scaleWidth(base);
}

// ==================== 字体系统 ====================

/**
 * 响应式字体大小
 */
export const fontSize = {
  /** 10px - 辅助文字 */
  xs: scaleFont(10),
  /** 12px - 小标签 */
  sm: scaleFont(12),
  /** 14px - 正文 */
  md: scaleFont(14),
  /** 16px - 大正文 */
  lg: scaleFont(16),
  /** 18px - 小标题 */
  xl: scaleFont(18),
  /** 20px - 标题 */
  xxl: scaleFont(20),
  /** 24px - 大标题 */
  xxxl: scaleFont(24),
  /** 28px - 超大标题 */
  display: scaleFont(28),
} as const;

/**
 * 获取响应式字体大小 (动态计算)
 */
export function getFontSize(base: number): number {
  return scaleFont(base);
}

// ==================== 圆角系统 ====================

/**
 * 响应式圆角
 */
export const borderRadius = {
  /** 4px */
  xs: scaleWidth(4),
  /** 8px */
  sm: scaleWidth(8),
  /** 12px */
  md: scaleWidth(12),
  /** 16px */
  lg: scaleWidth(16),
  /** 20px */
  xl: scaleWidth(20),
  /** 24px */
  xxl: scaleWidth(24),
  /** 圆形 */
  full: 9999,
} as const;

// ==================== 图标尺寸 ====================

/**
 * 响应式图标尺寸
 */
export const iconSize = {
  /** 12px */
  xs: moderateScale(12, 0.3),
  /** 16px */
  sm: moderateScale(16, 0.3),
  /** 20px */
  md: moderateScale(20, 0.3),
  /** 24px */
  lg: moderateScale(24, 0.3),
  /** 28px */
  xl: moderateScale(28, 0.3),
  /** 32px */
  xxl: moderateScale(32, 0.3),
} as const;

// ==================== 布局工具 ====================

/**
 * 计算网格列数
 *
 * @param minItemWidth 单个项目的最小宽度
 * @param gap 项目间距
 * @param padding 容器水平内边距
 */
export function getGridColumns(
  minItemWidth: number,
  gap: number = 16,
  padding: number = 16
): number {
  const availableWidth = getScreenWidth() - padding * 2;
  const columns = Math.floor((availableWidth + gap) / (minItemWidth + gap));
  return Math.max(1, columns);
}

/**
 * 计算网格项目宽度
 *
 * @param columns 列数
 * @param gap 项目间距
 * @param padding 容器水平内边距
 */
export function getGridItemWidth(columns: number, gap: number = 16, padding: number = 16): number {
  const availableWidth = getScreenWidth() - padding * 2;
  const totalGap = gap * (columns - 1);
  return Math.floor((availableWidth - totalGap) / columns);
}

/**
 * 获取安全的水平内边距
 */
export function getSafeHorizontalPadding(): number {
  const deviceSize = getDeviceSize();
  switch (deviceSize) {
    case 'xs':
      return 12;
    case 'sm':
      return 16;
    case 'md':
    case 'lg':
      return 16;
    case 'xl':
      return 24;
    case 'xxl':
      return 32;
    default:
      return 16;
  }
}

/**
 * 获取内容最大宽度 (用于大屏居中)
 */
export function getMaxContentWidth(): number {
  if (isTablet()) {
    return Math.min(getScreenWidth() - 64, 768);
  }
  return getScreenWidth();
}

// ==================== 导出常用工具 ====================

export const responsive = {
  // 尺寸获取
  screenWidth: getScreenWidth,
  screenHeight: getScreenHeight,

  // 缩放函数
  scale,
  scaleWidth,
  scaleHeight,
  scaleFont,
  moderateScale,

  // 百分比
  widthPercent,
  heightPercent,

  // 设备判断
  deviceSize: getDeviceSize,
  isSmallScreen,
  isExtraSmallScreen,
  isTablet,
  isIOS,
  isAndroid,

  // 值选择
  selectByDevice,
  selectByWidth,

  // 布局
  getGridColumns,
  getGridItemWidth,
  getSafeHorizontalPadding,
  getMaxContentWidth,

  // 预设值
  spacing,
  fontSize,
  borderRadius,
  iconSize,
  BREAKPOINTS,
} as const;

export default responsive;
