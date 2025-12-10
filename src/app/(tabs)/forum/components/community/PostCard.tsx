/**
 * PostCard - 社区帖子卡片组件
 *
 * Pinterest/小红书风格的瀑布流卡片
 */

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Heart, Play, Award } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Stack, Image, Avatar } from 'tamagui';

// 帖子数据类型
export interface PostCardData {
  id: number;
  title: string;
  imageUrl: string;
  imageHeight?: number;
  isVideo?: boolean;
  author: {
    id: number;
    name: string;
    avatar?: string;
    hasReputationBadge?: boolean;
  };
  likeCount: number;
  isLiked?: boolean;
}

export interface PostCardProps {
  data: PostCardData;
  onPress?: (post: PostCardData) => void;
  onLikePress?: (post: PostCardData) => void;
  columnWidth: number;
}

// 样式组件
const CardContainer = styled(YStack, {
  name: 'PostCard',
  backgroundColor: '$background',
  borderRadius: '$6',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 3,
});

const ImageContainer = styled(Stack, {
  name: 'PostCardImage',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
});

const VideoOverlay = styled(Stack, {
  name: 'VideoOverlay',
  position: 'absolute',
  top: '$2',
  right: '$2',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: '$4',
  padding: '$1.5',
});

const ContentContainer = styled(YStack, {
  name: 'PostCardContent',
  padding: '$3',
  gap: '$2',
});

const TitleText = styled(Text, {
  name: 'PostCardTitle',
  fontSize: '$3',
  fontWeight: '600',
  color: '$color',
  numberOfLines: 2,
});

const FooterContainer = styled(XStack, {
  name: 'PostCardFooter',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const AuthorContainer = styled(XStack, {
  name: 'PostCardAuthor',
  alignItems: 'center',
  gap: '$2',
  flex: 1,
  overflow: 'hidden',
});

const AuthorName = styled(Text, {
  name: 'AuthorName',
  fontSize: '$2',
  color: '$colorMuted',
  numberOfLines: 1,
  flexShrink: 1,
});

const BadgeIcon = styled(Stack, {
  name: 'BadgeIcon',
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: '$secondary',
  alignItems: 'center',
  justifyContent: 'center',
});

const LikeContainer = styled(XStack, {
  name: 'LikeContainer',
  alignItems: 'center',
  gap: '$1',
  paddingLeft: '$2',
});

const LikeCount = styled(Text, {
  name: 'LikeCount',
  fontSize: '$2',
  color: '$colorMuted',
});

// 动画心形按钮
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function LikeButton({
  isLiked,
  count,
  onPress,
}: {
  isLiked?: boolean;
  count: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.8, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={animatedStyle}
    >
      <LikeContainer>
        <Heart
          size={16}
          color={isLiked ? '#F43F5E' : '#ADABA6'}
          fill={isLiked ? '#F43F5E' : 'transparent'}
        />
        <LikeCount>{count > 0 ? count : ''}</LikeCount>
      </LikeContainer>
    </AnimatedPressable>
  );
}

// 主组件
function PostCardComponent({ data, onPress, onLikePress, columnWidth }: PostCardProps) {
  const imageHeight = data.imageHeight || columnWidth * 1.2;

  const handlePress = useCallback(() => {
    onPress?.(data);
  }, [data, onPress]);

  const handleLikePress = useCallback(() => {
    onLikePress?.(data);
  }, [data, onLikePress]);

  return (
    <Pressable onPress={handlePress}>
      <CardContainer width={columnWidth}>
        <ImageContainer height={imageHeight}>
          <Image source={{ uri: data.imageUrl }} width="100%" height="100%" resizeMode="cover" />
          {data.isVideo && (
            <VideoOverlay>
              <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
            </VideoOverlay>
          )}
        </ImageContainer>

        <ContentContainer>
          <TitleText>{data.title}</TitleText>

          <FooterContainer>
            <AuthorContainer>
              <Avatar circular size="$1.5">
                <Avatar.Image
                  source={{
                    uri: data.author.avatar || 'https://placekitten.com/100/100',
                  }}
                />
                <Avatar.Fallback backgroundColor="$color5" />
              </Avatar>
              <AuthorName>{data.author.name}</AuthorName>
              {data.author.hasReputationBadge && (
                <BadgeIcon>
                  <Award size={10} color="#FFFFFF" />
                </BadgeIcon>
              )}
            </AuthorContainer>

            <LikeButton isLiked={data.isLiked} count={data.likeCount} onPress={handleLikePress} />
          </FooterContainer>
        </ContentContainer>
      </CardContainer>
    </Pressable>
  );
}

export const PostCard = memo(PostCardComponent);
