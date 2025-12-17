/**
 * PostContent - 帖子内容组件
 *
 * 显示帖子作者信息、发布时间、正文内容和标签
 */

import React, { memo } from 'react';
import { styled, YStack, XStack, Text, Avatar } from 'tamagui';
import Tag from '@/src/components/ui/Tag';
import type { Post } from '@/src/lib/supabase';

export interface PostContentProps {
  /** 帖子数据 */
  post: Post;
  /** 点击作者头像 */
  onAuthorPress?: (authorId: string) => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'PostContent',
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 16,
  gap: 16,
  backgroundColor: '#fff',
});

const AuthorRow = styled(XStack, {
  name: 'AuthorRow',
  alignItems: 'center',
  gap: 12,
});

const AuthorAvatar = styled(Avatar, {
  name: 'AuthorAvatar',
  borderWidth: 2,
  borderColor: 'rgba(0, 0, 0, 0.04)',
});

const AuthorInfo = styled(YStack, {
  name: 'AuthorInfo',
  flex: 1,
  gap: 2,
});

const AuthorName = styled(Text, {
  name: 'AuthorName',
  fontSize: 15,
  fontWeight: '600',
  color: '#1a1a1a',
  letterSpacing: -0.2,
});

const PostMeta = styled(XStack, {
  name: 'PostMeta',
  alignItems: 'center',
  gap: 6,
});

const MetaDot = styled(YStack, {
  name: 'MetaDot',
  width: 3,
  height: 3,
  borderRadius: 1.5,
  backgroundColor: '#c4c4c4',
});

const PostTime = styled(Text, {
  name: 'PostTime',
  fontSize: 13,
  color: '#8e8e93',
  letterSpacing: -0.1,
});

// 正文样式 - 杂志级排版
const ContentText = styled(Text, {
  name: 'ContentText',
  fontSize: 16,
  lineHeight: 26,
  color: '#262626',
  letterSpacing: 0.2,
  fontWeight: '400',
});

const TagsContainer = styled(XStack, {
  name: 'TagsContainer',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 4,
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
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
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
        <AuthorAvatar
          circular
          size="$4"
          onPress={handleAuthorPress}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
        >
          <Avatar.Image
            source={{ uri: post.author?.avatar || undefined }}
            accessibilityLabel={post.author?.username || '用户'}
          />
          <Avatar.Fallback backgroundColor="#f5f5f5" delayMs={200}>
            <Text fontSize={14} fontWeight="600" color="#8e8e93">
              {post.author?.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </Avatar.Fallback>
        </AuthorAvatar>

        <AuthorInfo>
          <AuthorName onPress={handleAuthorPress}>{post.author?.username || '匿名用户'}</AuthorName>
          <PostMeta>
            <PostTime>{formatPostTime(post.createdAt)}</PostTime>
            {post.category && (
              <>
                <MetaDot />
                <PostTime>{getCategoryLabel(post.category)}</PostTime>
              </>
            )}
          </PostMeta>
        </AuthorInfo>
      </AuthorRow>

      {/* 帖子正文 - 高质量排版 */}
      <ContentText selectable>{post.content}</ContentText>

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

/**
 * 获取分类标签
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    help: '求助',
    share: '分享',
    science: '科普',
    warning: '避雷',
  };
  return labels[category] || category;
}

export const PostContent = memo(PostContentComponent);
