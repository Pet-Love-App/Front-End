import {
    Nunito_400Regular,
    Nunito_700Bold
} from '@expo-google-fonts/nunito';
import {
    Poppins_300Light,
    Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';

/**
 * 自定义 Hook：加载 Google Fonts
 * 
 * 使用的字体：
 * - Poppins: 现代、简洁、几何风格，适合标题和按钮
 * - Nunito: 友好、圆润、可读性好，适合正文
 * 
 * @returns {boolean} fontsLoaded - 字体是否加载完成
 */
export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': Poppins_300Light,
    'Poppins-Bold': Poppins_700Bold,
    
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,

    'MaoKen': require('@/assets/fonts/MaoKen.ttf'),
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

