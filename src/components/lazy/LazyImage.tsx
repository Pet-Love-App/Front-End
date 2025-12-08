import { useCallback, useState } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { YStack } from 'tamagui';

import { neutralScale } from '@/src/design-system/tokens';

import { Skeleton } from './Skeleton';

interface LazyImageProps {
  source: ImageSourcePropType;
  width: number | string;
  height: number | string;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholder?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  showSkeleton?: boolean;
  onLoad?: () => void;
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
        backgroundColor={neutralScale.neutral3}
        alignItems="center"
        justifyContent="center"
      />
    );
  }

  return (
    <YStack width={width} height={height} borderRadius={borderRadius} overflow="hidden">
      {isLoading && showSkeleton && (
        <YStack position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1}>
          <Skeleton width="100%" height="100%" borderRadius={borderRadius} />
        </YStack>
      )}

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

export async function preloadImage(uri: string): Promise<boolean> {
  return new Promise((resolve) => {
    Image.prefetch(uri)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

export async function preloadImages(uris: string[]): Promise<boolean[]> {
  return Promise.all(uris.map(preloadImage));
}
