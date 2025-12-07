/**
 * 懒加载图片组件
 * 支持占位图、加载动画、错误处理
 */

import { useCallback, useState } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { YStack } from 'tamagui';

import { Skeleton } from './Skeleton';

interface LazyImageProps {
  /** 图片源 */
  source: ImageSourcePropType;
  /** 宽度 */
  width: number | string;
  /** 高度 */
  height: number | string;
  /** 圆角 */
  borderRadius?: number;
  /** 填充模式 */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** 占位图 */
  placeholder?: ImageSourcePropType;
  /** 自定义样式 */
  style?: StyleProp<ImageStyle>;
  /** 是否显示加载骨架 */
  showSkeleton?: boolean;
  /** 加载完成回调 */
  onLoad?: () => void;
  /** 加载失败回调 */
  onError?: () => void;
}

export function LazyImage({
  source,
  width,
  height,
  borderRadius = 0,
  resizeMode = 'cover',
  placeholder,
  style,
  showSkeleton = true,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // 错误状态显示占位图或默认占位
  if (hasError) {
    if (placeholder) {
      return (
        <Image
          source={placeholder}
          style={[{ width: width as number, height: height as number, borderRadius }, style]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <YStack
        width={width}
        height={height}
        borderRadius={borderRadius}
        backgroundColor="$gray4"
        alignItems="center"
        justifyContent="center"
      />
    );
  }

  return (
    <YStack width={width} height={height} borderRadius={borderRadius} overflow="hidden">
      {/* 加载骨架 */}
      {isLoading && showSkeleton && (
        <YStack position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1}>
          <Skeleton width="100%" height="100%" borderRadius={borderRadius} />
        </YStack>
      )}

      {/* 实际图片 */}
      <Image
        source={source}
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius,
            opacity: isLoading ? 0 : 1,
          },
          style,
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
      />
    </YStack>
  );
}

// ==================== 预加载工具 ====================

/**
 * 预加载图片
 */
export async function preloadImage(uri: string): Promise<boolean> {
  return new Promise((resolve) => {
    Image.prefetch(uri)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

/**
 * 批量预加载图片
 */
export async function preloadImages(uris: string[]): Promise<boolean[]> {
  return Promise.all(uris.map(preloadImage));
}
