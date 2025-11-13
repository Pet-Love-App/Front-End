/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#FEBE98';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // 按钮相关颜色
    buttonBackground: '#0a7ea4',
    buttonText: '#fff',
    // 扫描按钮相关
    scanButtonBackground: tintColorLight,
    scanButtonBorder: '#fff',
    scanButtonIcon: '#fff',
    // 相机相关
    cameraBorder: tintColorLight,
    cameraIconBackground: 'rgba(0, 0, 0, 0.3)',
    cameraIcon: '#fff',
    captureButton: '#fff',
    captureButtonBorder: 'rgba(255, 255, 255, 0.3)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // 按钮相关颜色 - 暗黑模式下使用更柔和的颜色
    buttonBackground: '#1a8cbb',
    buttonText: '#000',
    // 扫描按钮相关 - 暗黑模式下使用主题色
    scanButtonBackground: tintColorDark,
    scanButtonBorder: '#151718',
    scanButtonIcon: '#000',
    // 相机相关 - 暗黑模式下调整对比度
    cameraBorder: tintColorDark,
    cameraIconBackground: 'rgba(255, 255, 255, 0.2)',
    cameraIcon: '#000',
    captureButton: '#ECEDEE',
    captureButtonBorder: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
