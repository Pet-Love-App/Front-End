// 主色 - 温暖桃色系
export const primaryScale = {
  primary1: '#FFF8F5',
  primary2: '#FFF1EB',
  primary3: '#FFE4D9',
  primary4: '#FFD5C4',
  primary5: '#FFC5AE',
  primary6: '#FFB398',
  primary7: '#FEBE98', // 品牌主色
  primary8: '#F5A67D',
  primary9: '#E8936A',
  primary10: '#D88058',
  primary11: '#C66D45',
  primary12: '#8C4A2F',
} as const;

// 中性色 - 莫兰迪风格
export const neutralScale = {
  neutral1: '#FAFAF9',
  neutral2: '#F5F4F2',
  neutral3: '#EFEEED',
  neutral4: '#E8E6E4',
  neutral5: '#DFDCDA',
  neutral6: '#C9C5C2',
  neutral7: '#A8A4A0',
  neutral8: '#8A8682',
  neutral9: '#6B6864',
  neutral10: '#4D4A47',
  neutral11: '#2F2D2B',
  neutral12: '#1A1918',
} as const;

// 成功色
export const successScale = {
  success1: '#F0FDF4',
  success2: '#DCFCE7',
  success3: '#BBF7D0',
  success4: '#86EFAC',
  success5: '#4ADE80',
  success6: '#22C55E',
  success7: '#16A34A',
  success8: '#15803D',
  success9: '#166534',
  success10: '#14532D',
  success11: '#0D3D20',
  success12: '#052E16',
} as const;

// 警告色
export const warningScale = {
  warning1: '#FFFBEB',
  warning2: '#FEF3C7',
  warning3: '#FDE68A',
  warning4: '#FCD34D',
  warning5: '#FBBF24',
  warning6: '#F59E0B',
  warning7: '#D97706',
  warning8: '#B45309',
  warning9: '#92400E',
  warning10: '#78350F',
  warning11: '#5C2A0E',
  warning12: '#451A03',
} as const;

// 错误色
export const errorScale = {
  error1: '#FEF2F2',
  error2: '#FEE2E2',
  error3: '#FECACA',
  error4: '#FCA5A5',
  error5: '#F87171',
  error6: '#EF4444',
  error7: '#DC2626',
  error8: '#B91C1C',
  error9: '#991B1B',
  error10: '#7F1D1D',
  error11: '#5C1414',
  error12: '#450A0A',
} as const;

// 信息色
export const infoScale = {
  info1: '#EFF6FF',
  info2: '#DBEAFE',
  info3: '#BFDBFE',
  info4: '#93C5FD',
  info5: '#60A5FA',
  info6: '#3B82F6',
  info7: '#2563EB',
  info8: '#1D4ED8',
  info9: '#1E40AF',
  info10: '#1E3A8A',
  info11: '#172554',
  info12: '#0F172A',
} as const;

// 亮色主题语义颜色
export const lightSemanticColors = {
  background: '#FFFFFF',
  backgroundSubtle: neutralScale.neutral1,
  backgroundMuted: neutralScale.neutral2,
  backgroundElevated: '#FFFFFF',

  foreground: neutralScale.neutral12,
  foregroundMuted: neutralScale.neutral9,
  foregroundSubtle: neutralScale.neutral7,
  foregroundDisabled: neutralScale.neutral5,

  border: neutralScale.neutral4,
  borderMuted: neutralScale.neutral3,
  borderFocus: primaryScale.primary7,

  brand: primaryScale.primary7,
  brandMuted: primaryScale.primary3,
  brandSubtle: primaryScale.primary1,

  hover: neutralScale.neutral2,
  active: neutralScale.neutral3,
  selected: primaryScale.primary2,

  success: successScale.success7,
  successMuted: successScale.success2,
  warning: warningScale.warning7,
  warningMuted: warningScale.warning2,
  error: errorScale.error7,
  errorMuted: errorScale.error2,
  info: infoScale.info7,
  infoMuted: infoScale.info2,

  overlay: 'rgba(0, 0, 0, 0.5)',
  overlaySubtle: 'rgba(0, 0, 0, 0.3)',
} as const;

// 暗色主题语义颜色
export const darkSemanticColors = {
  background: '#0A0A0A',
  backgroundSubtle: '#141414',
  backgroundMuted: '#1F1F1F',
  backgroundElevated: '#252525',

  foreground: '#FAFAFA',
  foregroundMuted: '#A1A1A1',
  foregroundSubtle: '#737373',
  foregroundDisabled: '#525252',

  border: '#2E2E2E',
  borderMuted: '#262626',
  borderFocus: primaryScale.primary6,

  brand: primaryScale.primary6,
  brandMuted: '#3D2A1F',
  brandSubtle: '#1F1714',

  hover: '#1F1F1F',
  active: '#2A2A2A',
  selected: '#2D1F1A',

  success: successScale.success5,
  successMuted: '#0D2818',
  warning: warningScale.warning5,
  warningMuted: '#2D1F0A',
  error: errorScale.error5,
  errorMuted: '#2D0F0F',
  info: infoScale.info5,
  infoMuted: '#0F1A2D',

  overlay: 'rgba(0, 0, 0, 0.7)',
  overlaySubtle: 'rgba(0, 0, 0, 0.5)',
} as const;

// 排名徽章渐变色
export const rankColors = {
  gold: ['#FFD700', '#FFA500'] as const,
  silver: ['#E8E8E8', '#C0C0C0'] as const,
  bronze: ['#CD7F32', '#B8860B'] as const,
  normal: ['#E0E0E0', '#BDBDBD'] as const,
} as const;

// 标签配色
export const tagColors = [
  '#E6D5C3',
  '#D7CCC8',
  '#C5CAE9',
  '#B3E5FC',
  '#FFCCBC',
  '#CFD8DC',
  '#F8BBD0',
  '#DCEDC8',
  '#FFE0B2',
  '#D1C4E9',
  '#CA848A',
  '#DE8286',
] as const;

export type PrimaryScale = typeof primaryScale;
export type NeutralScale = typeof neutralScale;
export type SemanticColors = typeof lightSemanticColors;
