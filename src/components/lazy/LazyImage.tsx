import { useCallback, useState } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp, DimensionValue } from 'react-native';
import { YStack } from 'tamagui';

import { neutralScale } from '@/src/design-system/tokens';

import { Skeleton } from './Skeleton';

interface LazyImageProps {
  source: ImageSourcePropType;
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholder?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  showSkeleton?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  testID?: string;
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
  testID,
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
          style={[
            { width, height, borderRadius },
            style,
          ]}
          resizeMode={resizeMode}
          testID={testID}
        />
      );
    }
    return (
      <YStack
        width={width}
        height={height}
        backgroundColor={neutralScale.neutral2}
        borderRadius={borderRadius}
        alignItems="center"
        justifyContent="center"
        testID={testID}
      >
        {/* Optionally, you can add an error icon or text here */}
      </YStack>
    );
  }

  return (
    <YStack width={width as any} height={height as any} borderRadius={borderRadius} overflow="hidden" testID="lazy-image-container">
      {showSkeleton && isLoading && <Skeleton width={width as any} height={height as any} borderRadius={borderRadius} />}
      <Image
        source={source}
        style={[
          { width, height, borderRadius },
          isLoading ? { opacity: 0 } : { opacity: 1 },
          style,
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        testID={testID}
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
