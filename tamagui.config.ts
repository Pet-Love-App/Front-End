import { createAnimations } from '@tamagui/animations-react-native';
import { createMedia } from '@tamagui/react-native-media-driver';
import { shorthands } from '@tamagui/shorthands';
import { themes as tamaguiThemes, tokens as defaultTokens } from '@tamagui/themes';
import { createTamagui, createTokens } from 'tamagui';

import {
  primaryScale,
  neutralScale,
  successScale,
  warningScale,
  errorScale,
  infoScale,
  spacing,
  fontSize,
  lineHeight,
  radius,
  tamaguiAnimations,
} from './src/design-system/tokens';

// 动画配置
const animations = createAnimations(tamaguiAnimations);

// 亮色主题
const lightTheme = {
  background: '#FFFFFF',
  backgroundSubtle: neutralScale.neutral1,
  backgroundMuted: neutralScale.neutral2,
  backgroundHover: neutralScale.neutral2,
  backgroundPress: neutralScale.neutral3,
  backgroundFocus: neutralScale.neutral2,
  backgroundStrong: neutralScale.neutral1,
  backgroundTransparent: 'transparent',

  color: neutralScale.neutral12,
  colorHover: neutralScale.neutral11,
  colorPress: neutralScale.neutral12,
  colorFocus: neutralScale.neutral11,
  colorTransparent: 'transparent',

  borderColor: neutralScale.neutral4,
  borderColorHover: neutralScale.neutral5,
  borderColorFocus: primaryScale.primary7,
  borderColorPress: neutralScale.neutral6,

  placeholderColor: neutralScale.neutral6,
  shadowColor: 'rgba(0, 0, 0, 0.1)',

  // 色阶
  color1: neutralScale.neutral1,
  color2: neutralScale.neutral2,
  color3: neutralScale.neutral3,
  color4: neutralScale.neutral4,
  color5: neutralScale.neutral5,
  color6: neutralScale.neutral6,
  color7: neutralScale.neutral7,
  color8: neutralScale.neutral8,
  color9: neutralScale.neutral9,
  color10: neutralScale.neutral10,
  color11: neutralScale.neutral11,
  color12: neutralScale.neutral12,

  // 品牌色
  primary: primaryScale.primary7,
  primaryLight: primaryScale.primary3,
  primaryDark: primaryScale.primary9,

  // 语义色
  green: successScale.success7,
  greenLight: successScale.success3,
  yellow: warningScale.warning7,
  yellowLight: warningScale.warning3,
  red: errorScale.error7,
  redLight: errorScale.error3,
  blue: infoScale.info7,
  blueLight: infoScale.info3,
} as const;

// 暗色主题
const darkTheme = {
  background: '#0A0A0A',
  backgroundSubtle: '#141414',
  backgroundMuted: '#1F1F1F',
  backgroundHover: '#1F1F1F',
  backgroundPress: '#282828',
  backgroundFocus: '#1F1F1F',
  backgroundStrong: '#0A0A0A',
  backgroundTransparent: 'transparent',

  color: '#FAFAFA',
  colorHover: '#E5E5E5',
  colorPress: '#FAFAFA',
  colorFocus: '#E5E5E5',
  colorTransparent: 'transparent',

  borderColor: '#2E2E2E',
  borderColorHover: '#424242',
  borderColorFocus: primaryScale.primary6,
  borderColorPress: '#525252',

  placeholderColor: '#525252',
  shadowColor: 'rgba(0, 0, 0, 0.3)',

  color1: '#0A0A0A',
  color2: '#141414',
  color3: '#1F1F1F',
  color4: '#282828',
  color5: '#323232',
  color6: '#424242',
  color7: '#525252',
  color8: '#737373',
  color9: '#A1A1A1',
  color10: '#D4D4D4',
  color11: '#E5E5E5',
  color12: '#FAFAFA',

  primary: primaryScale.primary6,
  primaryLight: '#3D2A1F',
  primaryDark: primaryScale.primary8,

  green: successScale.success5,
  greenLight: '#0D2818',
  yellow: warningScale.warning5,
  yellowLight: '#2D1F0A',
  red: errorScale.error5,
  redLight: '#2D0F0F',
  blue: infoScale.info5,
  blueLight: '#0F1A2D',
} as const;

// 自定义 tokens
const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    ...Object.fromEntries(Object.entries(primaryScale).map(([k, v]) => [k, v])),
    ...Object.fromEntries(Object.entries(neutralScale).map(([k, v]) => [k, v])),
    ...Object.fromEntries(Object.entries(successScale).map(([k, v]) => [k, v])),
    ...Object.fromEntries(Object.entries(warningScale).map(([k, v]) => [k, v])),
    ...Object.fromEntries(Object.entries(errorScale).map(([k, v]) => [k, v])),
    ...Object.fromEntries(Object.entries(infoScale).map(([k, v]) => [k, v])),
  },
  space: {
    ...defaultTokens.space,
    ...Object.fromEntries(Object.entries(spacing).map(([k, v]) => [`$${k}`, v])),
  },
  size: {
    ...defaultTokens.size,
    ...Object.fromEntries(Object.entries(spacing).map(([k, v]) => [`$${k}`, v])),
  },
  radius: {
    ...defaultTokens.radius,
    ...Object.fromEntries(Object.entries(radius).map(([k, v]) => [`$${k}`, v])),
  },
  zIndex: defaultTokens.zIndex,
});

// 媒体查询断点
const media = createMedia({
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  gtXs: { minWidth: 661 },
  gtSm: { minWidth: 801 },
  gtMd: { minWidth: 1021 },
  gtLg: { minWidth: 1281 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
});

// 字体配置
const fonts = {
  heading: {
    family: 'System',
    size: fontSize,
    lineHeight: Object.fromEntries(
      Object.entries(fontSize).map(([k, v]) => [k, Math.round(v * lineHeight.tight)])
    ),
    weight: { 1: '700', 2: '700', 3: '600', 4: '600', 5: '500' },
    letterSpacing: { 1: -0.5, 2: -0.3, 3: 0, 4: 0, 5: 0 },
  },
  body: {
    family: 'System',
    size: fontSize,
    lineHeight: Object.fromEntries(
      Object.entries(fontSize).map(([k, v]) => [k, Math.round(v * lineHeight.normal)])
    ),
    weight: { 1: '400', 2: '400', 3: '400', 4: '400', 5: '400' },
    letterSpacing: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
  mono: {
    family: 'Menlo',
    size: fontSize,
    lineHeight: Object.fromEntries(
      Object.entries(fontSize).map(([k, v]) => [k, Math.round(v * lineHeight.normal)])
    ),
    weight: { 1: '400' },
    letterSpacing: { 1: 0 },
  },
};

// 主题配置
const themes = {
  ...tamaguiThemes,
  light: { ...tamaguiThemes.light, ...lightTheme },
  dark: { ...tamaguiThemes.dark, ...darkTheme },
};

export const tamaguiConfig = createTamagui({
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts,
  themes,
  tokens,
  media,
  settings: {
    // 允许 Sheet 组件使用动画
    allowedStyleValues: 'somewhat-strict-web',
  },
});

export default tamaguiConfig;

type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
