/**
 * PostMediaGallery - 帖子媒体画廊
 *
 * 展示帖子中的图片和视频
 * 支持：图片预览、视频标识、网格布局
 */

import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Play } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Stack } from 'tamagui';
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';
import type { PostMedia } from '@/src/lib/supabase';

import { ForumColors } from '../../constants';

export interface PostMediaGalleryProps {
  /** 媒体列表 */
  media: PostMedia[];
  /** 点击媒体 */
  onMediaPress?: (media: PostMedia, index: number) => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'MediaGallery',
  padding: '$4',
  paddingTop: 0,
  gap: '$2',
});

const GridContainer = styled(XStack, {
  name: 'MediaGrid',
  flexWrap: 'wrap',
  gap: '$2',
});

const MediaItemContainer = styled(Stack, {
  name: 'MediaItem',
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: '$backgroundSubtle',
});

const VideoOverlay = styled(Stack, {
  name: 'VideoOverlay',
  ...StyleSheet.absoluteFillObject,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
});

const PlayButton = styled(Stack, {
  name: 'PlayButton',
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * 计算媒体项尺寸
 */
function calculateItemSize(totalCount: number, index: number): { width: number; height: number } {
  // 单图大尺寸
  if (totalCount === 1) {
    return { width: 280, height: 280 };
  }
  // 双图横向排列
  if (totalCount === 2) {
    return { width: 160, height: 160 };
  }
  // 三图及以上，第一张大，其他小
  if (totalCount >= 3 && index === 0) {
    return { width: 200, height: 200 };
  }
  // 普通小图
  return { width: 100, height: 100 };
}

/**
 * 单个媒体项组件
 */
interface MediaItemProps {
  media: PostMedia;
  index: number;
  totalCount: number;
  onPress?: () => void;
}

const MediaItem = memo(function MediaItem({ media, index, totalCount, onPress }: MediaItemProps) {
  const size = calculateItemSize(totalCount, index);
  const isVideo = media.mediaType === 'video';

  return (
    <Pressable onPress={onPress}>
      <MediaItemContainer style={{ width: size.width, height: size.height }}>
        {isVideo ? (
          <>
            {/* 视频缩略图（如果有） */}
            {media.fileUrl && (
              <OptimizedImage
                source={media.fileUrl}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}
            <VideoOverlay>
              <PlayButton>
                <Play size={24} color={ForumColors.clay} fill={ForumColors.clay} />
              </PlayButton>
            </VideoOverlay>
          </>
        ) : (
          <OptimizedImage
            source={media.fileUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}
      </MediaItemContainer>
    </Pressable>
  );
});

/**
 * 帖子媒体画廊组件
 */
function PostMediaGalleryComponent({ media, onMediaPress }: PostMediaGalleryProps) {
  const handlePress = useCallback(
    (item: PostMedia, index: number) => {
      onMediaPress?.(item, index);
    },
    [onMediaPress]
  );

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <Container>
      <GridContainer>
        {media.map((item, index) => (
          <MediaItem
            key={item.id}
            media={item}
            index={index}
            totalCount={media.length}
            onPress={() => handlePress(item, index)}
          />
        ))}
      </GridContainer>
    </Container>
  );
}

export const PostMediaGallery = memo(PostMediaGalleryComponent);
