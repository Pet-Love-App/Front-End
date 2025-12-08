// 圆角值 (px)
export const radius = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 20,
  10: 24,
  11: 28,
  12: 32,
  full: 9999,
} as const;

// 语义化圆角
export const semanticRadius = {
  none: radius[0],
  xs: radius[1],
  sm: radius[2],
  md: radius[4],
  lg: radius[6],
  xl: radius[8],
  xxl: radius[10],
  full: radius.full,
} as const;

// 组件圆角
export const componentRadius = {
  button: { sm: radius[2], md: radius[4], lg: radius[6], pill: radius.full },
  input: radius[4],
  card: { sm: radius[4], md: radius[6], lg: radius[8] },
  avatar: { sm: radius[4], md: radius[6], full: radius.full },
  badge: radius[3],
  tag: radius.full,
  modal: radius[8],
  sheet: { top: radius[10], content: radius[4] },
  image: { sm: radius[2], md: radius[4], lg: radius[6] },
  progress: radius.full,
  switch: radius.full,
  skeleton: radius[3],
} as const;

export type Radius = typeof radius;
export type SemanticRadius = typeof semanticRadius;
