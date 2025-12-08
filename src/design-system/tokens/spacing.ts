// 基础单位 4px
export const SPACING_UNIT = 4;

// 间距比例 (基于 4px 倍数)
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// 语义化间距
export const semanticSpacing = {
  none: spacing[0],
  xxxs: spacing[0.5],
  xxs: spacing[1],
  xs: spacing[1.5],
  sm: spacing[2],
  md: spacing[3],
  lg: spacing[4],
  xl: spacing[5],
  xxl: spacing[6],
  xxxl: spacing[8],
  gutter: spacing[4], // 页面边距
  section: spacing[6], // 区块间距
  page: spacing[8], // 页面间距
} as const;

// 组件间距
export const componentSpacing = {
  buttonPaddingX: { sm: spacing[2], md: spacing[3], lg: spacing[4] },
  buttonPaddingY: { sm: spacing[1], md: spacing[2], lg: spacing[2.5] },
  buttonGap: spacing[2],
  inputPaddingX: spacing[3],
  inputPaddingY: spacing[2],
  cardPadding: { sm: spacing[3], md: spacing[4], lg: spacing[5] },
  listItemPadding: spacing[3],
  listItemGap: spacing[2],
  modalPadding: spacing[5],
  modalGap: spacing[4],
  headerPadding: spacing[4],
  headerHeight: spacing[14],
  tabBarHeight: spacing[16],
  tabBarPadding: spacing[2],
} as const;

export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
