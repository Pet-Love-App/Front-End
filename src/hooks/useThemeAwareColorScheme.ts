/**
 * 主题感知的颜色方案 Hook
 *
 * 根据用户设置返回当前应该使用的主题模式：
 * - 'light': 强制使用亮色主题
 * - 'dark': 强制使用暗色主题
 * - 'system': 跟随系统主题
 */

import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemeStore } from '@/src/store/themeStore';

export function useThemeAwareColorScheme() {
  const { themeMode, _hasHydrated } = useThemeStore();
  const systemColorScheme = useRNColorScheme();

  // 在水化完成前，默认使用亮色主题
  if (!_hasHydrated) {
    return 'light';
  }

  // 如果用户选择跟随系统，返回系统主题；否则返回用户选择的主题
  if (themeMode === 'system') {
    return systemColorScheme ?? 'light';
  }

  return themeMode;
}
