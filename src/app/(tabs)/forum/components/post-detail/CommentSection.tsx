/**
 * CommentSection - 评论区组件
 *
 * 显示评论列表和评论输入框
 * 注意：不使用 FlatList，因为该组件被嵌套在 ScrollView 中
 */

import React, { memo, useMemo } from 'react';
import { MessageCircle } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Spinner } from 'tamagui';

import type { Comment } from '@/src/lib/supabase';

import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import { ForumColors } from '../../constants';

export interface CommentSectionProps {
  /** 评论列表 */
  comments: Comment[];
  /** 是否加载中 */
  isLoading: boolean;
  /** 当前用户 ID */
  currentUserId: string | null;
  /** 新评论内容 */
  newComment: string;
  /** 回复目标 */
  replyTarget: Comment | null;
  /** 正在编辑的评论 */
  editingComment: { id: number; content: string } | null;

  // 评论操作
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
  onToggleLike: (commentId: number) => void;
  onSetReplyTarget: (comment: Comment | null) => void;

  // 编辑操作
  onStartEdit: (comment: Comment) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (content: string) => void;
  onDeleteComment: (commentId: number) => void;
}

// 样式组件
const Container = styled(YStack, {
  name: 'CommentSection',
  backgroundColor: '$backgroundSubtle',
});

const HeaderContainer = styled(XStack, {
  name: 'CommentHeader',
  alignItems: 'center',
  gap: '$2',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const HeaderTitle = styled(Text, {
  name: 'CommentHeaderTitle',
  fontSize: 16,
  fontWeight: '600',
  color: ForumColors.clay,
});

const CommentCount = styled(Text, {
  name: 'CommentCount',
  fontSize: 14,
  color: '$colorMuted',
});

const ListContainer = styled(YStack, {
  name: 'CommentList',
  paddingHorizontal: '$3',
  paddingTop: '$2',
  paddingBottom: '$2',
  gap: '$2',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyComments',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$8',
  gap: '$3',
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: 14,
  color: '$colorMuted',
  textAlign: 'center',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$8',
});

/**
 * 评论区组件
 */
function CommentSectionComponent({
  comments,
  isLoading,
  currentUserId,
  newComment,
  replyTarget,
  editingComment,
  onCommentChange,
  onSubmitComment,
  onToggleLike,
  onSetReplyTarget,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onDeleteComment,
}: CommentSectionProps) {
  /**
   * 空状态
   */
  const EmptyComponent = useMemo(
    () => (
      <EmptyContainer>
        <MessageCircle size={48} color={ForumColors.clay + '40'} />
        <EmptyText>暂无评论{'\n'}快来发表第一条评论吧~</EmptyText>
      </EmptyContainer>
    ),
    []
  );

  /**
   * 加载状态
   */
  if (isLoading && comments.length === 0) {
    return (
      <Container>
        <HeaderContainer>
          <MessageCircle size={20} color={ForumColors.clay} />
          <HeaderTitle>评论</HeaderTitle>
        </HeaderContainer>
        <LoadingContainer>
          <Spinner size="large" color={ForumColors.clay} />
        </LoadingContainer>
        <CommentInput
          value={newComment}
          onChangeText={onCommentChange}
          onSubmit={onSubmitComment}
          replyTarget={replyTarget}
          onCancelReply={() => onSetReplyTarget(null)}
          disabled
        />
      </Container>
    );
  }

  return (
    <Container>
      {/* 评论区标题 */}
      <HeaderContainer>
        <MessageCircle size={20} color={ForumColors.clay} />
        <HeaderTitle>评论</HeaderTitle>
        <CommentCount>({comments.length})</CommentCount>
      </HeaderContainer>

      {/* 评论列表 - 使用 map 渲染避免嵌套 VirtualizedList */}
      <ListContainer>
        {comments.length === 0
          ? EmptyComponent
          : comments.map((comment) => {
              const isOwner = currentUserId === comment.author?.id;
              const isEditing = editingComment?.id === comment.id;

              return (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isOwner={isOwner}
                  isEditing={isEditing}
                  editingContent={isEditing ? editingComment?.content : undefined}
                  onLike={onToggleLike}
                  onReply={onSetReplyTarget}
                  onStartEdit={onStartEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onEditChange={onEditChange}
                  onDelete={onDeleteComment}
                />
              );
            })}
      </ListContainer>

      {/* 评论输入框 */}
      <CommentInput
        value={newComment}
        onChangeText={onCommentChange}
        onSubmit={onSubmitComment}
        replyTarget={replyTarget}
        onCancelReply={() => onSetReplyTarget(null)}
      />
    </Container>
  );
}

export const CommentSection = memo(CommentSectionComponent);
