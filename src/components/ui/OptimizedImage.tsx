/**
 * 优化的图片组件 - 基于 expo-image
 *
 * 特性:
 * - 自动缓存（内存 + 磁盘）
 * - 平滑过渡动画
 * - Blurhash 占位符支持
 * - 统一的加载状态
 * - 错误处理
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   source={user.avatarUrl}
 *   style={{ width: 50, height: 50, borderRadius: 25 }}
 *   blurhash="LGF5]+Yk^6#M@-5c,1J5@[or[Q6."
 * />
 * ```
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Image, type ImageProps, type ImageSource } from 'expo-image';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  /** 图片源: URL 字符串或本地 require */
  source: string | ImageSource;
  /** Blurhash 字符串（用于占位符） */
  blurhash?: string;
  /** 缓存策略，默认为 'memory-disk' */
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  /** 过渡动画时长（毫秒），默认 200ms */
  transitionDuration?: number;
}

/**
 * 优化的图片组件
 */
export function OptimizedImage({
  source,
  blurhash,
  style,
  cachePolicy = 'memory-disk',
  transitionDuration = 200,
  contentFit = 'cover',
  ...props
}: OptimizedImageProps) {
  // 规范化图片源
  const imageSource: ImageSource = typeof source === 'string' ? { uri: source } : source;

  // 占位符配置
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

/**
 * 头像专用组件（圆形）
 */
export function AvatarImage({
  source,
  size = 50,
  style,
  ...props
}: Omit<OptimizedImageProps, 'style'> & {
  size?: number;
  style?: any;
}) {
  return (
    <OptimizedImage
      source={source}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      contentFit="cover"
      {...props}
    />
  );
}

/**
 * 商品/猫粮图片组件（带圆角）
 */
export function ProductImage({
  source,
  aspectRatio = 1,
  borderRadius = 12,
  style,
  ...props
}: Omit<OptimizedImageProps, 'style'> & {
  aspectRatio?: number;
  borderRadius?: number;
  style?: any;
}) {
  return (
    <OptimizedImage
      source={source}
      style={[
        {
          aspectRatio,
          borderRadius,
        },
        style,
      ]}
      contentFit="cover"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f5f5f5', // 浅灰色背景（加载时显示）
  },
});
