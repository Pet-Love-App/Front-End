/**
 * 响应式设计 Hook
 *
 * 提供响应式布局所需的所有工具和值
 * 自动响应屏幕尺寸变化
 */

import { useMemo } from 'react';
import { useWindowDimensions, PixelRatio } from 'react-native';

import {
  BREAKPOINTS,
  type DeviceSize,
  scaleWidth,
  scaleHeight,
  scale,
  scaleFont,
  moderateScale,
  widthPercent,
  heightPercent,
  getGridColumns,
  getGridItemWidth,
} from '@/src/utils/responsive';

/**
 * 响应式 Hook 返回值类型
 */
export interface ResponsiveValues {
  // 屏幕尺寸
  width: number;
  height: number;

  // 设备类型
  deviceSize: DeviceSize;
  isExtraSmall: boolean;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;

  // 缩放函数
  sw: (size: number) => number;
  sh: (size: number) => number;
  s: (size: number) => number;
  sf: (size: number, factor?: number) => number;
  ms: (size: number, factor?: number) => number;
  wp: (percent: number) => number;
  hp: (percent: number) => number;

  // 布局工具
  horizontalPadding: number;
  maxContentWidth: number;
  gridColumns: (minItemWidth: number, gap?: number) => number;
  gridItemWidth: (columns: number, gap?: number) => number;

  // 预设尺寸
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    display: number;
  };
  iconSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
}

/**
 * 响应式设计 Hook
 *
 * @returns 响应式工具和值
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { sw, sf, spacing, isSmall, deviceSize } = useResponsive();
 *
 *   return (
 *     <View style={{
 *       padding: spacing.md,
 *       width: sw(300),
 *     }}>
 *       <Text style={{ fontSize: sf(16) }}>
 *         {isSmall ? '小屏模式' : '正常模式'}
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // 设计稿基准宽度
    const DESIGN_WIDTH = 375;
    const DESIGN_HEIGHT = 812;
    const MIN_SCALE = 0.8;
    const MAX_SCALE = 1.4;

    // 计算缩放比例
    const widthScale = Math.min(Math.max(width / DESIGN_WIDTH, MIN_SCALE), MAX_SCALE);
    const heightScale = Math.min(Math.max(height / DESIGN_HEIGHT, MIN_SCALE), MAX_SCALE);
    const minScale = Math.min(widthScale, heightScale);

    // 缩放函数
    const sw = (size: number) => Math.round(size * widthScale);
    const sh = (size: number) => Math.round(size * heightScale);
    const s = (size: number) => Math.round(size * minScale);
    const sf = (size: number, factor: number = 1) => {
      const scaledSize = size * widthScale * factor;
      const minSize = size * 0.85;
      const maxSize = size * 1.3;
      const clampedSize = Math.min(Math.max(scaledSize, minSize), maxSize);
      return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
    };
    const ms = (size: number, factor: number = 0.5) => {
      const scaleDiff = widthScale - 1;
      return Math.round(size + scaleDiff * size * factor);
    };
    const wp = (percent: number) => Math.round((width * percent) / 100);
    const hp = (percent: number) => Math.round((height * percent) / 100);

    // 设备类型判断
    const deviceSize: DeviceSize = (() => {
      if (width < BREAKPOINTS.xs) return 'xs';
      if (width < BREAKPOINTS.sm) return 'xs';
      if (width < BREAKPOINTS.md) return 'sm';
      if (width < BREAKPOINTS.lg) return 'md';
      if (width < BREAKPOINTS.xl) return 'lg';
      if (width < BREAKPOINTS.xxl) return 'xl';
      return 'xxl';
    })();

    const isExtraSmall = width < BREAKPOINTS.sm;
    const isSmall = width < BREAKPOINTS.md;
    const isMedium = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isLarge = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    const isTablet = width >= BREAKPOINTS.xl;

    // 水平内边距
    const horizontalPadding = (() => {
      if (isExtraSmall) return 12;
      if (isSmall) return 16;
      if (isTablet) return 24;
      return 16;
    })();

    // 最大内容宽度
    const maxContentWidth = isTablet ? Math.min(width - 64, 768) : width;

    // 网格计算
    const gridColumns = (minItemWidth: number, gap: number = 16) => {
      const availableWidth = width - horizontalPadding * 2;
      const columns = Math.floor((availableWidth + gap) / (minItemWidth + gap));
      return Math.max(1, columns);
    };

    const gridItemWidth = (columns: number, gap: number = 16) => {
      const availableWidth = width - horizontalPadding * 2;
      const totalGap = gap * (columns - 1);
      return Math.floor((availableWidth - totalGap) / columns);
    };

    // 预设间距
    const spacing = {
      xxs: sw(2),
      xs: sw(4),
      sm: sw(8),
      md: sw(12),
      lg: sw(16),
      xl: sw(20),
      xxl: sw(24),
      xxxl: sw(32),
    };

    // 预设字体大小
    const fontSize = {
      xs: sf(10),
      sm: sf(12),
      md: sf(14),
      lg: sf(16),
      xl: sf(18),
      xxl: sf(20),
      xxxl: sf(24),
      display: sf(28),
    };

    // 预设图标大小
    const iconSize = {
      xs: ms(12, 0.3),
      sm: ms(16, 0.3),
      md: ms(20, 0.3),
      lg: ms(24, 0.3),
      xl: ms(28, 0.3),
      xxl: ms(32, 0.3),
    };

    // 预设圆角
    const borderRadius = {
      xs: sw(4),
      sm: sw(8),
      md: sw(12),
      lg: sw(16),
      xl: sw(20),
      xxl: sw(24),
      full: 9999,
    };

    return {
      width,
      height,
      deviceSize,
      isExtraSmall,
      isSmall,
      isMedium,
      isLarge,
      isTablet,
      sw,
      sh,
      s,
      sf,
      ms,
      wp,
      hp,
      horizontalPadding,
      maxContentWidth,
      gridColumns,
      gridItemWidth,
      spacing,
      fontSize,
      iconSize,
      borderRadius,
    };
  }, [width, height]);
}

/**
 * 响应式值选择器 Hook
 *
 * @param values 不同设备尺寸的值
 * @returns 当前设备对应的值
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const columns = useResponsiveValue({
 *     xs: 1,
 *     sm: 2,
 *     md: 3,
 *     lg: 4,
 *     default: 2,
 *   });
 *
 *   return <Grid columns={columns} />;
 * }
 * ```
 */
export function useResponsiveValue<T>(values: Partial<Record<DeviceSize, T>> & { default: T }): T {
  const { deviceSize } = useResponsive();
  return values[deviceSize] ?? values.default;
}

/**
 * 响应式样式 Hook
 *
 * 根据设备尺寸返回不同的样式对象
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const styles = useResponsiveStyles({
 *     container: {
 *       xs: { padding: 8, flexDirection: 'column' },
 *       md: { padding: 16, flexDirection: 'row' },
 *       default: { padding: 12 },
 *     },
 *   });
 *
 *   return <View style={styles.container} />;
 * }
 * ```
 */
export function useResponsiveStyles<
  T extends Record<string, Record<string, unknown>>,
>(styleDefinitions: {
  [K in keyof T]: Partial<Record<DeviceSize, T[K]>> & { default: T[K] };
}): T {
  const { deviceSize } = useResponsive();

  return useMemo(() => {
    const result = {} as T;
    for (const key in styleDefinitions) {
      const definition = styleDefinitions[key];
      result[key] = (definition[deviceSize] ?? definition.default) as T[typeof key];
    }
    return result;
  }, [deviceSize, styleDefinitions]);
}

export default useResponsive;
