/**
 * CommentItem - 单条评论组件
 *
 * 显示评论内容、作者、点赞、回复等
 * 支持：编辑、删除（作者权限）
 */

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Heart, Reply, Edit3, Trash2, MoreHorizontal, User } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Avatar, Button, TextArea } from 'tamagui';
import { primaryScale, neutralScale, errorScale } from '@/src/design-system/tokens';

import type { Comment } from '@/src/lib/supabase';

export interface CommentItemProps {
  /** 评论数据 */
  comment: Comment;
  /** 是否为当前用户的评论 */
  isOwner: boolean;
  /** 是否正在编辑 */
  isEditing: boolean;
  /** 编辑中的内容 */
  editingContent?: string;
  /** 点赞 */
  onLike: (commentId: number) => void;
  /** 回复 */
  onReply: (comment: Comment) => void;
  /** 点击作者头像 */
  onAuthorPress?: (author: { id: string; username: string; avatar?: string }) => void;
  /** 开始编辑 */
  onStartEdit: (comment: Comment) => void;
  /** 保存编辑 */
  onSaveEdit: () => void;
  /** 取消编辑 */
  onCancelEdit: () => void;
  /** 编辑内容变更 */
  onEditChange: (content: string) => void;
  /** 删除 */
  onDelete: (commentId: number) => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'CommentItem',
  paddingVertical: 16,
  paddingHorizontal: 16,
  backgroundColor: 'white',
  gap: 12,
  borderBottomWidth: 1,
  borderBottomColor: neutralScale.neutral3,
});

const HeaderRow = styled(XStack, {
  name: 'CommentHeader',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
});

const AuthorSection = styled(XStack, {
  name: 'AuthorSection',
  alignItems: 'center',
  gap: 10,
  flex: 1,
});

const AvatarContainer = styled(YStack, {
  name: 'AvatarContainer',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: primaryScale.primary2,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

const AuthorInfo = styled(YStack, {
  name: 'AuthorInfo',
  flex: 1,
  gap: 2,
});

const AuthorName = styled(Text, {
  name: 'CommentAuthorName',
  fontSize: 14,
  fontWeight: '600',
  color: neutralScale.neutral12,
});

const CommentTime = styled(Text, {
  name: 'CommentTime',
  fontSize: 12,
  color: neutralScale.neutral7,
});

const ContentText = styled(Text, {
  name: 'CommentContent',
  fontSize: 15,
  lineHeight: 24,
  color: neutralScale.neutral11,
});

const ActionsRow = styled(XStack, {
  name: 'CommentActions',
  alignItems: 'center',
  gap: 16,
  marginTop: 4,
  flexWrap: 'wrap',
});

const ActionButton = styled(XStack, {
  name: 'CommentActionBtn',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 16,
});

const ActionText = styled(Text, {
  name: 'ActionText',
  fontSize: 12,
  color: neutralScale.neutral7,
});

const EditContainer = styled(YStack, {
  name: 'EditContainer',
  gap: 12,
});

const EditActionsRow = styled(XStack, {
  name: 'EditActions',
  justifyContent: 'flex-end',
  gap: 8,
});

const OwnerBadge = styled(XStack, {
  name: 'OwnerBadge',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 10,
  backgroundColor: primaryScale.primary2,
});

const OwnerBadgeText = styled(Text, {
  name: 'OwnerBadgeText',
  fontSize: 10,
  fontWeight: '600',
  color: primaryScale.primary8,
});

const AnimatedActionButton = Animated.createAnimatedComponent(ActionButton);

/**
 * 格式化评论时间
 */
function formatCommentTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * 单条评论组件
 */
function CommentItemComponent({
  comment,
  isOwner,
  isEditing,
  editingContent = '',
  onLike,
  onReply,
  onAuthorPress,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onDelete,
}: CommentItemProps) {
  const likeScale = useSharedValue(1);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const handleLike = useCallback(() => {
    likeScale.value = withSequence(withSpring(1.3), withSpring(1));
    onLike(comment.id);
  }, [comment.id, onLike, likeScale]);

  const handleAuthorPress = useCallback(() => {
    if (comment.author && onAuthorPress) {
      onAuthorPress({
        id: comment.author.id,
        username: comment.author.username || '匿名用户',
        avatar: comment.author.avatarUrl || undefined,
      });
    }
  }, [comment.author, onAuthorPress]);

  const authorInitial = comment.author?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <Container>
      {/* 头部：头像、用户名、时间 */}
      <HeaderRow>
        <AuthorSection>
          <AvatarContainer>
            {comment.author?.avatarUrl ? (
              <Avatar circular size={40}>
                <Avatar.Image
                  source={{ uri: comment.author.avatarUrl }}
                  accessibilityLabel={comment.author?.username || '用户'}
                />
                <Avatar.Fallback backgroundColor={primaryScale.primary3} delayMs={0}>
                  <Text fontSize={16} fontWeight="600" color={primaryScale.primary8}>
                    {authorInitial}
                  </Text>
                </Avatar.Fallback>
              </Avatar>
            ) : (
              <Text fontSize={16} fontWeight="600" color={primaryScale.primary8}>
                {authorInitial}
              </Text>
            )}
          </AvatarContainer>
          <AuthorInfo>
            <XStack alignItems="center" gap={8}>
              <AuthorName>{comment.author?.username || '匿名用户'}</AuthorName>
              {isOwner && (
                <OwnerBadge>
                  <OwnerBadgeText>作者</OwnerBadgeText>
                </OwnerBadge>
              )}
            </XStack>
            <CommentTime>{formatCommentTime(comment.createdAt)}</CommentTime>
          </AuthorInfo>
        </AuthorSection>
      </HeaderRow>

      {/* 内容区域 */}
      {isEditing ? (
        <EditContainer>
          <TextArea
            value={editingContent}
            onChangeText={onEditChange}
            backgroundColor={neutralScale.neutral2}
            borderColor={neutralScale.neutral4}
            borderWidth={1}
            borderRadius={12}
            minHeight={100}
            color={neutralScale.neutral12}
            padding={12}
            fontSize={15}
          />
          <EditActionsRow>
            <Pressable onPress={onCancelEdit}>
              <XStack
                paddingHorizontal={16}
                paddingVertical={8}
                borderRadius={20}
                backgroundColor={neutralScale.neutral2}
              >
                <Text fontSize={14} color={neutralScale.neutral8}>
                  取消
                </Text>
              </XStack>
            </Pressable>
            <Pressable onPress={onSaveEdit}>
              <XStack
                paddingHorizontal={16}
                paddingVertical={8}
                borderRadius={20}
                backgroundColor={primaryScale.primary7}
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  保存
                </Text>
              </XStack>
            </Pressable>
          </EditActionsRow>
        </EditContainer>
      ) : (
        <ContentText>{comment.content}</ContentText>
      )}

      {/* 操作栏 */}
      {!isEditing && (
        <ActionsRow>
          {/* 点赞 */}
          <Pressable onPress={handleLike}>
            <Animated.View style={likeAnimatedStyle}>
              <ActionButton backgroundColor={comment.isLiked ? errorScale.error2 : 'transparent'}>
                <Heart
                  size={16}
                  color={comment.isLiked ? errorScale.error9 : neutralScale.neutral7}
                  fill={comment.isLiked ? errorScale.error9 : 'transparent'}
                />
                <ActionText color={comment.isLiked ? errorScale.error9 : neutralScale.neutral7}>
                  {comment.likes || 0}
                </ActionText>
              </ActionButton>
            </Animated.View>
          </Pressable>

          {/* 回复 */}
          <Pressable onPress={() => onReply(comment)}>
            <ActionButton>
              <Reply size={16} color={neutralScale.neutral7} />
              <ActionText>回复</ActionText>
            </ActionButton>
          </Pressable>

          {/* 作者专属操作 */}
          {isOwner && (
            <>
              <Pressable onPress={() => onStartEdit(comment)}>
                <ActionButton>
                  <Edit3 size={16} color={neutralScale.neutral7} />
                  <ActionText>编辑</ActionText>
                </ActionButton>
              </Pressable>
              <Pressable onPress={() => onDelete(comment.id)}>
                <ActionButton>
                  <Trash2 size={16} color={errorScale.error9} />
                  <ActionText color={errorScale.error9}>删除</ActionText>
                </ActionButton>
              </Pressable>
            </>
          )}
        </ActionsRow>
      )}
    </Container>
  );
}

export const CommentItem = memo(CommentItemComponent);
