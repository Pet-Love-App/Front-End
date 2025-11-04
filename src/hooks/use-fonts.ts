import { useFonts } from 'expo-font';

/**
 * 自定义 Hook：加载 Google Fonts
 *
 * 使用的字体：
 * - MaoKen: 猫啃字体，适合标题（iOS/Android 兼容）
 *
 * @returns {boolean} fontsLoaded - 字体是否加载完成
 */
export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    // 使用小写和连字符，Android 兼容
    maoKen: require('@/assets/fonts/MaoKen.ttf'),
  });

  return fontsLoaded;
}

/**
 * 字体配置常量
 * 方便在整个应用中统一使用
 */
export const FontFamily = {
  title: {
    light: 'Poppins-Light',
    bold: 'Poppins-Bold',
  },
  body: {
    regular: 'Nunito-Regular',
    bold: 'Nunito-Bold',
  },
} as const;
