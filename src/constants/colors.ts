/**
 * 统一颜色系统
 *
 * 设计原则：
 * 1. 基于 #FEBE98 (温暖的桃色) 作为主色调
 * 2. 支持亮色和暗色两种主题模式
 * 3. 提供语义化的颜色命名
 * 4. 所有模块使用统一的颜色系统
 */

// ==================== 基础色板 ====================

/**
 * 主色系 - 温暖的桃色系
 */
export const PRIMARY_PALETTE = {
  /** 主色 - 桃色 */
  main: '#FEBE98',
  /** 主色 - 浅桃色 */
  light: '#FFCCBC',
  /** 主色 - 深桃色 */
  dark: '#E8A47E',
  /** 主色 - 更深的陶土色 */
  darker: '#D89574',
} as const;

/**
 * 中性色系 - 莫兰迪风格
 */
export const NEUTRAL_PALETTE = {
  /** 沙色背景 */
  sand: '#F2E8DA',
  /** 温暖灰 */
  warmGray: '#D7CCC8',
  /** 边框色 */
  border: '#D8C8BD',
  /** 浅灰 */
  lightGray: '#E6D5C3',
  /** 中灰 */
  mediumGray: '#A78C7B',
} as const;

/**
 * 语义色系
 */
export const SEMANTIC_COLORS = {
  /** 成功 - 柔和绿 */
  success: '#DCEDC8',
  successDark: '#18794e',
  /** 警告 - 柔和橙 */
  warning: '#FFE0B2',
  warningDark: '#c85a15',
  /** 错误 - 柔和红 */
  error: '#ffebe9',
  errorDark: '#ae2e24',
  /** 信息 - 柔和蓝 */
  info: '#B3E5FC',
  infoDark: '#0c5fbf',
} as const;

/**
 * 功能色系 - 用于分类标签等
 */
export const FUNCTIONAL_COLORS = {
  /** 求助 */
  help: '#f97316',
  /** 分享 */
  share: '#06b6d4',
  /** 科普 */
  science: '#8b5cf6',
  /** 避雷/警告 */
  warning: '#ef4444',
} as const;

/**
 * 排名徽章色系
 */
export const RANK_COLORS = {
  /** 金色 (第1名) */
  gold: ['#FFD700', '#FFA500'] as const,
  /** 银色 (第2名) */
  silver: ['#C0C0C0', '#A8A8A8'] as const,
  /** 铜色 (第3名) */
  bronze: ['#CD7F32', '#B8860B'] as const,
  /** 普通 (其他) */
  normal: ['#E0E0E0', '#BDBDBD'] as const,
} as const;

/**
 * 莫兰迪标签色系 - 用于标签、徽章等
 */
export const TAG_COLORS = [
  '#E6D5C3', // sand
  '#D7CCC8', // warm gray
  '#C5CAE9', // soft blue
  '#B3E5FC', // pale sky
  '#FFCCBC', // peach
  '#CFD8DC', // slate
  '#F8BBD0', // rose
  '#DCEDC8', // green tea
  '#FFE0B2', // apricot
  '#D1C4E9', // lavender
  '#CA848A', // dusty rose
  '#DE8286', // coral
  '#A78C7B', // taupe
  '#D8C8BD', // beige
] as const;

// ==================== 主题颜色 ====================

/**
 * 亮色主题
 */
export const LIGHT_THEME = {
  // 基础颜色
  text: '#11181C',
  textSecondary: '#687076',
  textTertiary: '#9BA1A6',
  background: '#fff',
  backgroundSecondary: '#FAFAFA',
  backgroundTertiary: NEUTRAL_PALETTE.sand,

  // 主题色
  tint: PRIMARY_PALETTE.main, // 兼容旧版
  primary: PRIMARY_PALETTE.main,
  primaryLight: PRIMARY_PALETTE.light,
  primaryDark: PRIMARY_PALETTE.dark,

  // 边框和分隔线
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: NEUTRAL_PALETTE.border,

  // 图标
  icon: '#687076',
  iconSecondary: '#9BA1A6',

  // 按钮
  buttonPrimary: PRIMARY_PALETTE.main,
  buttonPrimaryText: '#fff',
  buttonSecondary: '#0a7ea4',
  buttonSecondaryText: '#fff',

  // Tab
  tabIconDefault: '#687076',
  tabIconSelected: PRIMARY_PALETTE.main,
  tabBackground: '#fff',

  // 卡片
  cardBackground: '#fff',
  cardBorder: '#E5E7EB',

  // 输入框
  inputBackground: '#fff',
  inputBorder: '#E5E7EB',
  inputPlaceholder: '#9BA1A6',

  // 语义色
  success: SEMANTIC_COLORS.success,
  successText: SEMANTIC_COLORS.successDark,
  warning: SEMANTIC_COLORS.warning,
  warningText: SEMANTIC_COLORS.warningDark,
  error: SEMANTIC_COLORS.error,
  errorText: SEMANTIC_COLORS.errorDark,
  info: SEMANTIC_COLORS.info,
  infoText: SEMANTIC_COLORS.infoDark,

  // 相机相关
  cameraBorder: PRIMARY_PALETTE.main,
  cameraIconBackground: 'rgba(0, 0, 0, 0.3)',
  cameraIcon: '#fff',
  captureButton: '#fff',
  captureButtonBorder: 'rgba(255, 255, 255, 0.3)',

  // 扫描按钮
  scanButtonBackground: PRIMARY_PALETTE.main,
  scanButtonBorder: '#fff',
  scanButtonIcon: '#fff',

  // 游戏相关
  game: {
    ground: '#9CA3AF',
    obstacle: '#EF4444',
    score: '#9CA3AF',
    overlay: 'rgba(255,255,255,0.8)',
    finishedOverlay: 'rgba(255,255,255,0.9)',
    closeButton: '#3B82F6',
  },

  // 带透明度的颜色变体
  tintAlpha10: withAlpha(PRIMARY_PALETTE.main, 0.1),
  tintAlpha20: withAlpha(PRIMARY_PALETTE.main, 0.2),
  tintAlpha30: withAlpha(PRIMARY_PALETTE.main, 0.3),
  tintAlpha40: withAlpha(PRIMARY_PALETTE.main, 0.4),
  tintAlpha50: withAlpha(PRIMARY_PALETTE.main, 0.5),
  iconAlpha05: withAlpha('#687076', 0.05),
  iconAlpha10: withAlpha('#687076', 0.1),
  iconAlpha15: withAlpha('#687076', 0.15),
  iconAlpha20: withAlpha('#687076', 0.2),
  iconAlpha30: withAlpha('#687076', 0.3),
  iconAlpha40: withAlpha('#687076', 0.4),
  iconAlpha60: withAlpha('#687076', 0.6),
  bg: '#fff',
} as const;

/**
 * 暗色主题
 */
export const DARK_THEME = {
  // 基础颜色
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  textTertiary: '#687076',
  background: '#151718',
  backgroundSecondary: '#1F2123',
  backgroundTertiary: '#2A2C2E',

  // 主题色
  tint: '#fff', // 兼容旧版
  primary: '#fff',
  primaryLight: '#ECEDEE',
  primaryDark: '#D1D5DB',

  // 边框和分隔线
  border: '#2A2C2E',
  borderLight: '#1F2123',
  borderDark: '#3A3C3E',

  // 图标
  icon: '#9BA1A6',
  iconSecondary: '#687076',

  // 按钮
  buttonPrimary: '#fff',
  buttonPrimaryText: '#000',
  buttonSecondary: '#1a8cbb',
  buttonSecondaryText: '#000',

  // Tab
  tabIconDefault: '#9BA1A6',
  tabIconSelected: '#fff',
  tabBackground: '#151718',

  // 卡片
  cardBackground: '#1F2123',
  cardBorder: '#2A2C2E',

  // 输入框
  inputBackground: '#1F2123',
  inputBorder: '#2A2C2E',
  inputPlaceholder: '#687076',

  // 语义色 (暗色模式下使用深色版本)
  success: '#2D5016',
  successText: SEMANTIC_COLORS.success,
  warning: '#7C2D12',
  warningText: SEMANTIC_COLORS.warning,
  error: '#7F1D1D',
  errorText: SEMANTIC_COLORS.error,
  info: '#1E3A8A',
  infoText: SEMANTIC_COLORS.info,

  // 相机相关
  cameraBorder: '#fff',
  cameraIconBackground: 'rgba(255, 255, 255, 0.2)',
  cameraIcon: '#000',
  captureButton: '#ECEDEE',
  captureButtonBorder: 'rgba(0, 0, 0, 0.3)',

  // 扫描按钮
  scanButtonBackground: '#fff',
  scanButtonBorder: '#151718',
  scanButtonIcon: '#000',

  // 游戏相关
  game: {
    ground: '#9CA3AF',
    obstacle: '#EF4444',
    score: '#9CA3AF',
    overlay: 'rgba(255,255,255,0.8)',
    finishedOverlay: 'rgba(255,255,255,0.9)',
    closeButton: '#3B82F6',
  },

  // 带透明度的颜色变体
  tintAlpha10: withAlpha('#fff', 0.1),
  tintAlpha20: withAlpha('#fff', 0.2),
  tintAlpha30: withAlpha('#fff', 0.3),
  tintAlpha40: withAlpha('#fff', 0.4),
  tintAlpha50: withAlpha('#fff', 0.5),
  iconAlpha05: withAlpha('#9BA1A6', 0.05),
  iconAlpha10: withAlpha('#9BA1A6', 0.1),
  iconAlpha15: withAlpha('#9BA1A6', 0.15),
  iconAlpha20: withAlpha('#9BA1A6', 0.2),
  iconAlpha30: withAlpha('#9BA1A6', 0.3),
  iconAlpha40: withAlpha('#9BA1A6', 0.4),
  iconAlpha60: withAlpha('#9BA1A6', 0.6),
  bg: '#151718',
} as const;

// ==================== 主题系统 ====================

/**
 * 统一的颜色系统
 * 兼容现有的 Colors 导出
 */
export const Colors = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
} as const;

/**
 * 论坛模块颜色 (基于统一色系)
 */
export const ForumColors = {
  sand: NEUTRAL_PALETTE.sand,
  peach: PRIMARY_PALETTE.main,
  clay: PRIMARY_PALETTE.dark,
  borderTop: NEUTRAL_PALETTE.border,
  text: '#3c2e20',
  darkText: '#603e1f',
  red: SEMANTIC_COLORS.errorDark,
  lightRed: SEMANTIC_COLORS.error,
} as const;

// ==================== 工具函数 ====================

/**
 * 将十六进制颜色转换为带透明度的 rgba 字符串
 * @param color 十六进制颜色 (如 '#FFFFFF')
 * @param alpha 透明度 (0-1)
 * @returns rgba 字符串
 */
export function withAlpha(color: string, alpha: number): string {
  if (!color || typeof color !== 'string') return color;

  const hex = color.trim();
  if (!hex.startsWith('#')) return color;

  // 处理简写形式 (#RGB -> #RRGGBB)
  const normalize = (h: string) =>
    h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;

  const normalized = normalize(hex);
  if (normalized.length !== 7) return color;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 计算颜色亮度，返回对比度最高的文本颜色
 * @param hexColor 十六进制颜色
 * @returns 'black' 或 'white'
 */
export function getContrastTextColor(hexColor: string): 'black' | 'white' {
  if (!hexColor) return 'black';

  const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // W3C 亮度计算公式
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * 根据索引获取标签颜色
 * @param index 索引
 * @returns 十六进制颜色
 */
export function getTagColor(index: number): string {
  return TAG_COLORS[index % TAG_COLORS.length];
}

// ==================== 默认导出 ====================

export default Colors;
