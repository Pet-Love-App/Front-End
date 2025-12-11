/**
 * PostContent - 帖子内容组件
 *
 * 显示帖子作者信息、发布时间、正文内容和标签
 */

import React, { memo } from 'react';
import { styled, YStack, XStack, Text, Avatar } from 'tamagui';
import Tag from '@/src/components/ui/Tag';
import type { Post } from '@/src/lib/supabase';

import { ForumColors } from '../../constants';

export interface PostContentProps {
  /** 帖子数据 */
  post: Post;
  /** 点击作者头像 */
  onAuthorPress?: (authorId: string) => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'PostContent',
  padding: '$4',
  gap: '$3',
  backgroundColor: '$background',
});

const AuthorRow = styled(XStack, {
  name: 'AuthorRow',
  alignItems: 'center',
  gap: '$3',
});

const AuthorInfo = styled(YStack, {
  name: 'AuthorInfo',
  flex: 1,
  gap: '$1',
});

const AuthorName = styled(Text, {
  name: 'AuthorName',
  fontSize: 15,
  fontWeight: '600',
  color: ForumColors.clay,
});

const PostTime = styled(Text, {
  name: 'PostTime',
  fontSize: 12,
  color: '$colorSubtle',
});

const ContentText = styled(Text, {
  name: 'ContentText',
  fontSize: 15,
  lineHeight: 24,
  color: ForumColors.text,
});

const TagsContainer = styled(XStack, {
  name: 'TagsContainer',
  flexWrap: 'wrap',
  gap: '$2',
  marginTop: '$1',
});

/**
 * 格式化发布时间为相对时间
 */
function formatPostTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  } catch {
    return '';
  }
}

/**
 * 帖子内容组件
 */
function PostContentComponent({ post, onAuthorPress }: PostContentProps) {
  const handleAuthorPress = () => {
    if (post.author?.id) {
      onAuthorPress?.(post.author.id);
    }
  };

  return (
    <Container>
      {/* 作者信息行 */}
      <AuthorRow>
        <Avatar circular size="$4" onPress={handleAuthorPress} pressStyle={{ opacity: 0.8 }}>
          <Avatar.Image
            source={{ uri: post.author?.avatar || undefined }}
            accessibilityLabel={post.author?.username || '用户'}
          />
          <Avatar.Fallback backgroundColor="$backgroundSubtle">
            <Text fontSize={14} color="$colorMuted">
              {post.author?.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </Avatar.Fallback>
        </Avatar>

        <AuthorInfo>
          <AuthorName onPress={handleAuthorPress}>{post.author?.username || '匿名用户'}</AuthorName>
          <PostTime>{formatPostTime(post.createdAt)}</PostTime>
        </AuthorInfo>
      </AuthorRow>

      {/* 帖子正文 */}
      <ContentText>{post.content}</ContentText>

      {/* 标签列表 */}
      {post.tags && post.tags.length > 0 && (
        <TagsContainer>
          {post.tags.map((tag, index) => (
            <Tag key={`${post.id}-tag-${tag}`} name={tag} index={index} />
          ))}
        </TagsContainer>
      )}
    </Container>
  );
}

export const PostContent = memo(PostContentComponent);
