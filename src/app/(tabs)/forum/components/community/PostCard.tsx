/**
 * PostCard - 社区帖子卡片组件
 *
 * Pinterest/小红书风格的瀑布流卡片
 * 支持显示浏览数、点赞数，可点击作者查看资料
 * 设计风格：圆角卡片，轻微阴影，流畅动画
 */

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Heart, Play, Award, Eye } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Stack, Image, Avatar, useTheme } from 'tamagui';

export interface PostCardData {
  id: number;
  title: string;
  imageUrl: string;
  imageHeight?: number;
  isVideo?: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
    hasReputationBadge?: boolean;
  };
  likeCount: number;
  viewCount?: number;
  isLiked?: boolean;
}

export interface PostCardProps {
  data: PostCardData;
  onPress?: (post: PostCardData) => void;
  onLikePress?: (post: PostCardData) => void;
  onAuthorPress?: (author: PostCardData['author']) => void;
  columnWidth: number;
}

// 样式组件
const CardContainer = styled(YStack, {
  name: 'PostCard',
  backgroundColor: '$background',
  borderRadius: 16,
  overflow: 'hidden',
  // 移除阴影，使用简洁的边框样式
  borderWidth: 1,
  borderColor: '$borderColor',
});

const ImageContainer = styled(Stack, {
  name: 'PostCardImage',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '$backgroundSubtle',
});

const VideoOverlay = styled(Stack, {
  name: 'VideoOverlay',
  position: 'absolute',
  top: 10,
  right: 10,
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  alignItems: 'center',
  justifyContent: 'center',
});

const ContentContainer = styled(YStack, {
  name: 'PostCardContent',
  padding: 12,
  paddingTop: 10,
  gap: 10,
});

const TitleText = styled(Text, {
  name: 'PostCardTitle',
  fontSize: 14,
  fontWeight: '600',
  color: '$color',
  lineHeight: 20,
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
  gap: 8,
  flex: 1,
  overflow: 'hidden',
});

const AuthorName = styled(Text, {
  name: 'AuthorName',
  fontSize: 12,
  color: '$colorMuted',
  numberOfLines: 1,
  flexShrink: 1,
});

const BadgeIcon = styled(Stack, {
  name: 'BadgeIcon',
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: '$secondary',
  alignItems: 'center',
  justifyContent: 'center',
});

const LikeContainer = styled(XStack, {
  name: 'LikeContainer',
  alignItems: 'center',
  gap: 4,
});

const StatsContainer = styled(XStack, {
  name: 'StatsContainer',
  alignItems: 'center',
  gap: 12,
});

const StatItem = styled(XStack, {
  name: 'StatItem',
  alignItems: 'center',
  gap: 4,
});

const StatText = styled(Text, {
  name: 'StatText',
  fontSize: 12,
  color: '$colorMuted',
});

const AnimatedCardContainer = Animated.createAnimatedComponent(CardContainer);

function LikeButton({
  isLiked,
  count,
  onPress,
}: {
  isLiked?: boolean;
  count: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const likeProgress = useSharedValue(isLiked ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.75, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 300 });
  };

  const handlePress = () => {
    likeProgress.value = withSpring(isLiked ? 0 : 1);
    onPress();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <LikeContainer>
          <Heart
            size={16}
            color={isLiked ? '#F43F5E' : theme.colorMuted?.val}
            fill={isLiked ? '#F43F5E' : 'transparent'}
          />
          {count > 0 && <StatText>{count}</StatText>}
        </LikeContainer>
      </Animated.View>
    </Pressable>
  );
}

function PostCardComponent({
  data,
  onPress,
  onLikePress,
  onAuthorPress,
  columnWidth,
}: PostCardProps) {
  const imageHeight = data.imageHeight || columnWidth * 1.2;
  const cardScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handlePress = useCallback(() => {
    onPress?.(data);
  }, [data, onPress]);

  const handlePressIn = () => {
    cardScale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const handleLikePress = useCallback(() => {
    onLikePress?.(data);
  }, [data, onLikePress]);

  const handleAuthorPress = useCallback(() => {
    onAuthorPress?.(data.author);
  }, [data.author, onAuthorPress]);

  const formatCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <AnimatedCardContainer width={columnWidth} style={cardAnimatedStyle}>
        <ImageContainer height={imageHeight}>
          <Image source={{ uri: data.imageUrl }} width="100%" height="100%" resizeMode="cover" />
          {data.isVideo && (
            <VideoOverlay>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </VideoOverlay>
          )}
        </ImageContainer>

        <ContentContainer>
          <TitleText>{data.title}</TitleText>

          <FooterContainer>
            <Pressable onPress={handleAuthorPress}>
              <AuthorContainer>
                <Avatar circular size={24}>
                  <Avatar.Image
                    source={{
                      uri: data.author.avatar || 'https://placekitten.com/100/100',
                    }}
                  />
                  <Avatar.Fallback backgroundColor="$backgroundSubtle" />
                </Avatar>
                <AuthorName>{data.author.name}</AuthorName>
                {data.author.hasReputationBadge && (
                  <BadgeIcon>
                    <Award size={10} color="#FFFFFF" />
                  </BadgeIcon>
                )}
              </AuthorContainer>
            </Pressable>

            <StatsContainer>
              {data.viewCount !== undefined && data.viewCount > 0 && (
                <StatItem>
                  <Eye size={14} color="#ADABA6" />
                  <StatText>{formatCount(data.viewCount)}</StatText>
                </StatItem>
              )}
              <LikeButton isLiked={data.isLiked} count={data.likeCount} onPress={handleLikePress} />
            </StatsContainer>
          </FooterContainer>
        </ContentContainer>
      </AnimatedCardContainer>
    </Pressable>
  );
}

export const PostCard = memo(PostCardComponent);
