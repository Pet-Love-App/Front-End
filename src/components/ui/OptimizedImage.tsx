import { StyleSheet } from 'react-native';
import { Image, type ImageProps, type ImageSource } from 'expo-image';

import { neutralScale } from '@/src/design-system/tokens';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: string | ImageSource;
  blurhash?: string;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  transitionDuration?: number;
}

export function OptimizedImage({
  source,
  blurhash,
  style,
  cachePolicy = 'memory-disk',
  transitionDuration = 200,
  contentFit = 'cover',
  ...props
}: OptimizedImageProps) {
  const imageSource: ImageSource = typeof source === 'string' ? { uri: source } : source;
  const placeholder = blurhash ? { blurhash } : undefined;

  return (
    <Image
      source={imageSource}
      style={[styles.image, style]}
      contentFit={contentFit}
      transition={transitionDuration}
      cachePolicy={cachePolicy}
      placeholder={placeholder}
      placeholderContentFit={contentFit}
      {...props}
    />
  );
}

interface AvatarImageProps extends Omit<OptimizedImageProps, 'style'> {
  size?: number;
  style?: ImageProps['style'];
}

export function AvatarImage({ source, size = 50, style, ...props }: AvatarImageProps) {
  return (
    <OptimizedImage
      source={source}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      contentFit="cover"
      {...props}
    />
  );
}

interface ProductImageProps extends Omit<OptimizedImageProps, 'style'> {
  aspectRatio?: number;
  borderRadius?: number;
  style?: ImageProps['style'];
}

export function ProductImage({
  source,
  aspectRatio = 1,
  borderRadius = 12,
  style,
  ...props
}: ProductImageProps) {
  return (
    <OptimizedImage
      source={source}
      style={[{ aspectRatio, borderRadius }, style]}
      contentFit="cover"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: neutralScale.neutral2,
  },
});
