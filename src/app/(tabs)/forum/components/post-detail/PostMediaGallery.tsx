/**
 * PostMediaGallery - 帖子媒体画廊
 *
 * 全宽无边框沉浸式设计
 * 支持：图片预览、视频标识、轮播指示器
 */

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Pressable, Dimensions, FlatList, ViewToken, Image } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Play } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Stack, Text } from 'tamagui';
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';
import { VideoPreview } from '../VideoPreview';
import type { PostMedia } from '@/src/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 图片显示配置
const GALLERY_PADDING = 16; // 画廊内边距
const IMAGE_WIDTH = SCREEN_WIDTH - GALLERY_PADDING * 2; // 图片宽度
const MAX_IMAGE_HEIGHT = SCREEN_WIDTH * 0.85; // 最大高度限制
const MIN_IMAGE_HEIGHT = 180; // 最小高度

export interface PostMediaGalleryProps {
  /** 媒体列表 */
  media: PostMedia[];
  /** 点击媒体 */
  onMediaPress?: (media: PostMedia, index: number) => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'MediaGallery',
  width: '100%',
  backgroundColor: '#f8f9fa',
  paddingVertical: 12,
});

const MediaItem = styled(Stack, {
  name: 'MediaItem',
  width: IMAGE_WIDTH,
  minHeight: MIN_IMAGE_HEIGHT,
  maxHeight: MAX_IMAGE_HEIGHT,
  backgroundColor: '#f8f8f8',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
  overflow: 'hidden',
});

const VideoOverlay = styled(Stack, {
  name: 'VideoOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: 'center',
  justifyContent: 'center',
});

const PlayButton = styled(Stack, {
  name: 'PlayButton',
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
});

// 指示器样式
const IndicatorContainer = styled(XStack, {
  name: 'IndicatorContainer',
  marginTop: 12,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6,
});

const AnimatedDot = Animated.createAnimatedComponent(Stack);

interface DotProps {
  index: number;
  currentIndex: number;
}

const Dot = memo(function Dot({ index, currentIndex }: DotProps) {
  const isActive = index === currentIndex;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 20 : 6, { damping: 15 }),
      backgroundColor: isActive ? '#FEBE98' : 'rgba(0, 0, 0, 0.15)',
    };
  });

  return (
    <AnimatedDot
      style={[
        {
          height: 6,
          borderRadius: 3,
        },
        animatedStyle,
      ]}
    />
  );
});

/**
 * 单个媒体项组件
 */
interface MediaItemComponentProps {
  media: PostMedia;
  onPress?: () => void;
}

const MediaItemComponent = memo(function MediaItemComponent({
  media,
  onPress,
}: MediaItemComponentProps) {
  const isVideo = media.mediaType === 'video';
  const [imageHeight, setImageHeight] = useState(IMAGE_WIDTH * 0.75);

  // 根据图片实际比例计算高度
  useEffect(() => {
    if (media.fileUrl && !isVideo) {
      Image.getSize(
        media.fileUrl,
        (width, height) => {
          const aspectRatio = height / width;
          const calculatedHeight = Math.min(
            Math.max(IMAGE_WIDTH * aspectRatio, MIN_IMAGE_HEIGHT),
            MAX_IMAGE_HEIGHT
          );
          setImageHeight(calculatedHeight);
        },
        () => {
          setImageHeight(IMAGE_WIDTH * 0.75);
        }
      );
    } else if (isVideo) {
      // 视频使用 16:9 比例
      setImageHeight(IMAGE_WIDTH * 0.5625);
    }
  }, [media.fileUrl, isVideo]);

  return (
    <Pressable onPress={onPress}>
      <Stack
        width={IMAGE_WIDTH}
        height={imageHeight}
        backgroundColor="#000000"
        justifyContent="center"
        alignItems="center"
        borderRadius={12}
        overflow="hidden"
      >
        {isVideo ? (
          // 视频预览：使用 VideoPreview 组件显示第一帧缩略图
          <VideoPreview
            videoUri={media.fileUrl}
            width={IMAGE_WIDTH}
            height={imageHeight}
            showPlayButton={true}
          />
        ) : (
          <OptimizedImage
            source={media.fileUrl}
            style={{ width: IMAGE_WIDTH, height: imageHeight }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}
      </Stack>
    </Pressable>
  );
});

/**
 * 帖子媒体画廊组件 - 沉浸式全宽设计
 */
function PostMediaGalleryComponent({ media, onMediaPress }: PostMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePress = useCallback(
    (item: PostMedia, index: number) => {
      onMediaPress?.(item, index);
    },
    [onMediaPress]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (!media || media.length === 0) {
    return null;
  }

  // 单张图片直接展示（居中显示）
  if (media.length === 1) {
    return (
      <Container alignItems="center">
        <MediaItemComponent media={media[0]} onPress={() => handlePress(media[0], 0)} />
      </Container>
    );
  }

  // 多张图片轮播
  return (
    <Container>
      <FlatList
        data={media}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: GALLERY_PADDING }}
        renderItem={({ item, index }) => (
          <Stack marginRight={index < media.length - 1 ? 8 : 0}>
            <MediaItemComponent media={item} onPress={() => handlePress(item, index)} />
          </Stack>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={IMAGE_WIDTH + 8}
        snapToAlignment="start"
      />
      {/* 精细指示器 */}
      <IndicatorContainer>
        {media.map((item, index) => (
          <Dot key={item.id} index={index} currentIndex={currentIndex} />
        ))}
      </IndicatorContainer>
    </Container>
  );
}

export const PostMediaGallery = memo(PostMediaGalleryComponent);
