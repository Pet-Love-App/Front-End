/**
 * PostImage - 论坛帖子图片组件
 *
 * 功能：
 * - 加载状态占位符
 * - 错误处理和后备图片
 * - 图片加载优化
 * - 平滑过渡动画
 */

import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Stack, Text } from 'tamagui';
import { ImageOff } from '@tamagui/lucide-icons';

interface PostImageProps {
  uri: string;
  width: number | string;
  height: number | string;
  resizeMode?: 'cover' | 'contain';
}

export function PostImage({ uri, width, height, resizeMode = 'cover' }: PostImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 检查URL是否有效
  const isValidUrl = uri && uri.trim().length > 0 && !uri.includes('placekitten');

  // 如果URL无效，直接显示占位符
  if (!isValidUrl) {
    return (
      <Stack
        width={typeof width === 'string' ? undefined : width}
        height={typeof height === 'string' ? undefined : height}
        flex={typeof width === 'string' ? 1 : undefined}
        backgroundColor="#f5f5f5"
        alignItems="center"
        justifyContent="center"
      >
        <ImageOff size={32} color="#9ca3af" />
        <Text fontSize={12} color="#9ca3af" marginTop="$2">
          暂无图片
        </Text>
      </Stack>
    );
  }

  // 如果加载失败，显示错误占位符
  if (hasError) {
    return (
      <Stack
        width={typeof width === 'string' ? undefined : width}
        height={typeof height === 'string' ? undefined : height}
        flex={typeof width === 'string' ? 1 : undefined}
        backgroundColor="#f5f5f5"
        alignItems="center"
        justifyContent="center"
      >
        <ImageOff size={32} color="#9ca3af" />
        <Text fontSize={12} color="#9ca3af" marginTop="$2">
          图片加载失败
        </Text>
      </Stack>
    );
  }

  return (
    <Stack
      width={typeof width === 'string' ? undefined : width}
      height={typeof height === 'string' ? undefined : height}
      flex={typeof width === 'string' ? 1 : undefined}
      position="relative"
    >
      {/* 加载占位符 */}
      {isLoading && (
        <Stack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="#f5f5f5"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          <ActivityIndicator size="small" color="#9ca3af" />
        </Stack>
      )}

      {/* 图片 */}
      <Image
        source={{ uri }}
        style={{
          width: typeof width === 'number' ? width : '100%',
          height: typeof height === 'number' ? height : '100%',
        }}
        contentFit={resizeMode}
        cachePolicy="memory-disk"
        transition={300}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        priority="normal"
      />
    </Stack>
  );
}
