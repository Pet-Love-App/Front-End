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
import { styled, XStack, YStack, Stack } from 'tamagui';
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';
import type { PostMedia } from '@/src/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  backgroundColor: '#000',
});

const MediaItem = styled(Stack, {
  name: 'MediaItem',
  width: SCREEN_WIDTH,
  minHeight: 200,
  maxHeight: SCREEN_WIDTH * 1.5,
  backgroundColor: '#f8f8f8',
  justifyContent: 'center',
  alignItems: 'center',
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
  position: 'absolute',
  bottom: 16,
  left: 0,
  right: 0,
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
      width: withSpring(isActive ? 24 : 8, { damping: 15 }),
      backgroundColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
    };
  });

  return (
    <AnimatedDot
      style={[
        {
          height: 8,
          borderRadius: 4,
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
  const [imageHeight, setImageHeight] = useState(SCREEN_WIDTH);

  // 根据图片实际比例计算高度
  useEffect(() => {
    if (media.fileUrl && !isVideo) {
      Image.getSize(
        media.fileUrl,
        (width, height) => {
          const aspectRatio = height / width;
          const calculatedHeight = Math.min(
            Math.max(SCREEN_WIDTH * aspectRatio, 200),
            SCREEN_WIDTH * 1.5
          );
          setImageHeight(calculatedHeight);
        },
        () => {
          setImageHeight(SCREEN_WIDTH);
        }
      );
    }
  }, [media.fileUrl, isVideo]);

  return (
    <Pressable onPress={onPress}>
      <Stack
        width={SCREEN_WIDTH}
        height={imageHeight}
        backgroundColor="#f8f8f8"
        justifyContent="center"
        alignItems="center"
      >
        <OptimizedImage
          source={media.fileUrl}
          style={{ width: SCREEN_WIDTH, height: imageHeight }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
        {isVideo && (
          <VideoOverlay>
            <PlayButton>
              <Play size={28} color="#1a1a1a" fill="#1a1a1a" />
            </PlayButton>
          </VideoOverlay>
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

  // 单张图片直接展示
  if (media.length === 1) {
    return (
      <Container>
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
        renderItem={({ item, index }) => (
          <MediaItemComponent media={item} onPress={() => handlePress(item, index)} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
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
