/**
 * CommentItem - 单条评论组件
 *
 * 显示评论内容、作者、点赞、回复等
 * 支持：编辑、删除（作者权限）
 */

import React, { memo, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Heart, Reply, Edit3, Trash2 } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Avatar, Button, TextArea } from 'tamagui';

import type { Comment } from '@/src/lib/supabase';

import { ForumColors } from '../../constants';

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
  padding: '$3',
  backgroundColor: '$background',
  borderRadius: 12,
  gap: '$2',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const HeaderRow = styled(XStack, {
  name: 'CommentHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const AuthorSection = styled(XStack, {
  name: 'AuthorSection',
  alignItems: 'center',
  gap: '$2',
  flex: 1,
});

const AuthorName = styled(Text, {
  name: 'CommentAuthorName',
  fontSize: 14,
  fontWeight: '600',
  color: ForumColors.clay,
});

const CommentTime = styled(Text, {
  name: 'CommentTime',
  fontSize: 11,
  color: '$colorSubtle',
});

const ContentText = styled(Text, {
  name: 'CommentContent',
  fontSize: 14,
  lineHeight: 22,
  color: ForumColors.text,
});

const ActionsRow = styled(XStack, {
  name: 'CommentActions',
  alignItems: 'center',
  gap: '$3',
  marginTop: '$1',
});

const ActionButton = styled(Button, {
  name: 'CommentActionBtn',
  size: '$2',
  backgroundColor: 'transparent',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
  pressStyle: {
    opacity: 0.7,
  },
});

const ActionText = styled(Text, {
  name: 'ActionText',
  fontSize: 12,
  color: '$colorMuted',
});

const EditContainer = styled(YStack, {
  name: 'EditContainer',
  gap: '$2',
});

const EditActionsRow = styled(XStack, {
  name: 'EditActions',
  justifyContent: 'flex-end',
  gap: '$2',
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

  return (
    <Container>
      {/* 头部：头像、用户名、时间 */}
      <HeaderRow>
        <AuthorSection>
          <Avatar circular size="$3">
            <Avatar.Image
              source={{ uri: comment.author?.avatarUrl || undefined }}
              accessibilityLabel={comment.author?.username || '用户'}
            />
            <Avatar.Fallback backgroundColor="$backgroundSubtle">
              <Text fontSize={10} color="$colorMuted">
                {comment.author?.username?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </Avatar.Fallback>
          </Avatar>
          <YStack>
            <AuthorName>{comment.author?.username || '匿名用户'}</AuthorName>
            <CommentTime>{formatCommentTime(comment.createdAt)}</CommentTime>
          </YStack>
        </AuthorSection>
      </HeaderRow>

      {/* 内容区域 */}
      {isEditing ? (
        <EditContainer>
          <TextArea
            value={editingContent}
            onChangeText={onEditChange}
            backgroundColor="$backgroundSubtle"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius={8}
            minHeight={80}
            color="$color"
            padding="$2"
          />
          <EditActionsRow>
            <Button size="$2" chromeless onPress={onCancelEdit}>
              <Text fontSize={12} color="$colorMuted">
                取消
              </Text>
            </Button>
            <Button
              size="$2"
              backgroundColor={ForumColors.clay}
              borderRadius={8}
              onPress={onSaveEdit}
            >
              <Text fontSize={12} color="white">
                保存
              </Text>
            </Button>
          </EditActionsRow>
        </EditContainer>
      ) : (
        <ContentText>{comment.content}</ContentText>
      )}

      {/* 操作栏 */}
      {!isEditing && (
        <ActionsRow>
          {/* 点赞 */}
          <AnimatedActionButton onPress={handleLike} style={likeAnimatedStyle}>
            <Heart
              size={14}
              color={comment.isLiked ? '#ef4444' : ForumColors.text}
              fill={comment.isLiked ? '#ef4444' : 'transparent'}
            />
            <ActionText style={{ color: comment.isLiked ? '#ef4444' : ForumColors.text }}>
              {comment.likes || 0}
            </ActionText>
          </AnimatedActionButton>

          {/* 回复 */}
          <ActionButton onPress={() => onReply(comment)}>
            <Reply size={14} color={ForumColors.text} />
            <ActionText>回复</ActionText>
          </ActionButton>

          {/* 作者专属操作 */}
          {isOwner && (
            <>
              <ActionButton onPress={() => onStartEdit(comment)}>
                <Edit3 size={14} color={ForumColors.text} />
                <ActionText>编辑</ActionText>
              </ActionButton>
              <ActionButton onPress={() => onDelete(comment.id)}>
                <Trash2 size={14} color={ForumColors.red} />
                <ActionText style={{ color: ForumColors.red }}>删除</ActionText>
              </ActionButton>
            </>
          )}
        </ActionsRow>
      )}
    </Container>
  );
}

export const CommentItem = memo(CommentItemComponent);
