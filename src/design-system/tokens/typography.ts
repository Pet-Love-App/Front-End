// 字体族
export const fontFamily = {
  sans: 'System',
  serif: 'Georgia',
  mono: 'Menlo',
  brand: 'MaoKen', // 品牌字体
} as const;

// 字重
export const fontWeight = {
  thin: '100' as const,
  extralight: '200' as const,
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

// 字号 (px)
export const fontSize = {
  1: 10,
  2: 11,
  3: 12,
  4: 13,
  5: 14,
  6: 15,
  7: 16,
  8: 18,
  9: 20,
  10: 24,
  11: 28,
  12: 32,
  13: 40,
  14: 48,
  15: 64,
} as const;

// 行高比例
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// 字间距 (px)
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;

// 预设文本样式
export const textStyles = {
  display: {
    fontSize: fontSize[13],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontSize: fontSize[11],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize[10],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  h3: {
    fontSize: fontSize[9],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize[8],
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodyLg: {
    fontSize: fontSize[7],
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: fontSize[6],
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  bodySm: {
    fontSize: fontSize[5],
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: fontSize[4],
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  captionSm: {
    fontSize: fontSize[3],
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  label: {
    fontSize: fontSize[4],
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontSize: fontSize[6],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  code: {
    fontSize: fontSize[5],
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
} as const;

export type FontFamily = typeof fontFamily;
export type FontWeight = typeof fontWeight;
export type FontSize = typeof fontSize;
export type TextStyle = keyof typeof textStyles;
