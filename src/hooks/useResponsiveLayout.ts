/**
 * 响应式布局 Hook
 *
 * 遵循企业级最佳实践：
 * - 基于屏幕宽度动态调整组件大小
 * - 确保在不同设备上的一致体验
 * - 避免固定尺寸导致的溢出问题
 */

import { useWindowDimensions } from 'react-native';

/**
 * 屏幕尺寸断点
 */
export const BREAKPOINTS = {
  xs: 320, // 超小屏幕（旧款 iPhone SE）
  sm: 375, // 小屏幕（iPhone 12 mini）
  md: 414, // 中等屏幕（iPhone 12 Pro Max）
  lg: 768, // 平板
  xl: 1024, // 大平板/桌面
} as const;

/**
 * 设备类型
 */
export type DeviceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 响应式布局 Hook
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  /**
   * 获取当前设备尺寸类型
   */
  const getDeviceSize = (): DeviceSize => {
    if (width < BREAKPOINTS.xs) return 'xs';
    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    return 'xl';
  };

  const deviceSize = getDeviceSize();

  /**
   * 是否为小屏幕设备
   */
  const isSmallScreen = width < BREAKPOINTS.md;

  /**
   * 是否为超小屏幕设备
   */
  const isExtraSmallScreen = width < BREAKPOINTS.sm;

  /**
   * 是否为平板或更大设备
   */
  const isTabletOrLarger = width >= BREAKPOINTS.lg;

  /**
   * 计算响应式尺寸
   * @param baseSize 基础尺寸
   * @param scaleFactor 缩放因子（可选）
   */
  const getResponsiveSize = (baseSize: number, scaleFactor?: number): number => {
    const factor = scaleFactor ?? 1;

    if (isExtraSmallScreen) {
      return Math.floor(baseSize * 0.8 * factor);
    }
    if (isSmallScreen) {
      return Math.floor(baseSize * 0.9 * factor);
    }
    if (isTabletOrLarger) {
      return Math.floor(baseSize * 1.2 * factor);
    }
    return Math.floor(baseSize * factor);
  };

  /**
   * 计算水平内边距（确保内容不会贴边）
   */
  const getHorizontalPadding = (): number => {
    if (isExtraSmallScreen) return 12;
    if (isSmallScreen) return 16;
    if (isTabletOrLarger) return 32;
    return 16;
  };

  /**
   * 计算内容最大宽度（用于大屏幕居中）
   */
  const getMaxContentWidth = (): number => {
    if (isTabletOrLarger) return 768;
    return width;
  };

  /**
   * 计算网格列数
   * @param minItemWidth 单个项目的最小宽度
   * @param gap 间距
   */
  const getGridColumns = (minItemWidth: number, gap: number = 16): number => {
    const availableWidth = width - getHorizontalPadding() * 2;
    const columns = Math.floor((availableWidth + gap) / (minItemWidth + gap));
    return Math.max(1, columns);
  };

  /**
   * 计算项目宽度（基于列数）
   * @param columns 列数
   * @param gap 间距
   */
  const getItemWidth = (columns: number, gap: number = 16): number => {
    const availableWidth = width - getHorizontalPadding() * 2;
    const totalGap = gap * (columns - 1);
    return Math.floor((availableWidth - totalGap) / columns);
  };

  return {
    width,
    height,
    deviceSize,
    isSmallScreen,
    isExtraSmallScreen,
    isTabletOrLarger,
    getResponsiveSize,
    getHorizontalPadding,
    getMaxContentWidth,
    getGridColumns,
    getItemWidth,
  };
}

// 注意：useResponsiveValue 已迁移到 useResponsive.ts
// 请使用 import { useResponsiveValue } from '@/src/hooks/useResponsive';
