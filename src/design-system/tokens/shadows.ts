import { Platform } from 'react-native';

interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  opacity: number;
  elevation: number;
  color: string;
}

// 阴影预设
export const shadowPresets: Record<string, ShadowConfig> = {
  none: { offsetX: 0, offsetY: 0, blur: 0, opacity: 0, elevation: 0, color: '#000' },
  xs: { offsetX: 0, offsetY: 1, blur: 2, opacity: 0.05, elevation: 1, color: '#000' },
  sm: { offsetX: 0, offsetY: 1, blur: 3, opacity: 0.1, elevation: 2, color: '#000' },
  md: { offsetX: 0, offsetY: 4, blur: 6, opacity: 0.1, elevation: 4, color: '#000' },
  lg: { offsetX: 0, offsetY: 10, blur: 15, opacity: 0.1, elevation: 8, color: '#000' },
  xl: { offsetX: 0, offsetY: 20, blur: 25, opacity: 0.1, elevation: 12, color: '#000' },
  xxl: { offsetX: 0, offsetY: 25, blur: 50, opacity: 0.15, elevation: 16, color: '#000' },
};

// 生成跨平台阴影样式
export function createShadow(preset: keyof typeof shadowPresets, customColor?: string) {
  const config = shadowPresets[preset];
  const shadowColor = customColor || config.color;

  if (Platform.OS === 'android') {
    return { elevation: config.elevation, shadowColor };
  }

  return {
    shadowColor,
    shadowOffset: { width: config.offsetX, height: config.offsetY },
    shadowOpacity: config.opacity,
    shadowRadius: config.blur,
  };
}

// 预生成阴影样式
export const shadows = {
  none: createShadow('none'),
  xs: createShadow('xs'),
  sm: createShadow('sm'),
  md: createShadow('md'),
  lg: createShadow('lg'),
  xl: createShadow('xl'),
  xxl: createShadow('xxl'),
} as const;

// 组件阴影
export const componentShadows = {
  card: shadows.sm,
  cardHover: shadows.md,
  cardActive: shadows.xs,
  button: shadows.sm,
  buttonHover: shadows.md,
  buttonPressed: shadows.xs,
  modal: shadows.xxl,
  sheet: shadows.xl,
  dropdown: shadows.lg,
  tooltip: shadows.md,
  fab: shadows.lg,
  fabPressed: shadows.md,
  header: shadows.sm,
  tabBar: { ...createShadow('md'), shadowOffset: { width: 0, height: -4 } },
} as const;

// 品牌色阴影
export const brandShadows = {
  primary: createShadow('md', 'rgba(254, 190, 152, 0.4)'),
  success: createShadow('md', 'rgba(34, 197, 94, 0.3)'),
  warning: createShadow('md', 'rgba(245, 158, 11, 0.3)'),
  error: createShadow('md', 'rgba(239, 68, 68, 0.3)'),
  info: createShadow('md', 'rgba(59, 130, 246, 0.3)'),
} as const;

export type ShadowPreset = keyof typeof shadowPresets;
export type Shadow = typeof shadows;
