import { Dimensions, Platform, StatusBar } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ScreenHelper = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,

  // 获取安全区域布局
  getSafeAreaLayout: (insets: EdgeInsets) => {
    return {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
      usableHeight: SCREEN_HEIGHT - insets.top - insets.bottom,
      usableWidth: SCREEN_WIDTH - insets.left - insets.right,
    };
  },

  // 限制坐标在屏幕范围内
  clampPosition: (
    x: number,
    y: number,
    itemWidth: number,
    itemHeight: number,
    insets: EdgeInsets
  ) => {
    const minX = insets.left;
    const maxX = SCREEN_WIDTH - itemWidth - insets.right;
    const minY = insets.top;
    const maxY = SCREEN_HEIGHT - itemHeight - insets.bottom;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  },
};
