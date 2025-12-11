/**
 * CommentSection - 评论区组件
 *
 * 显示评论列表和评论输入框
 * 注意：不使用 FlatList，因为该组件被嵌套在 ScrollView 中
 */

import React, { memo, useMemo } from 'react';
import { MessageCircle, MessageSquare } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Spinner } from 'tamagui';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

import type { Comment } from '@/src/lib/supabase';

import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';

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
  /** 点击作者头像 */
  onAuthorPress?: (author: { id: string; username: string; avatar?: string }) => void;

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
  backgroundColor: 'white',
});

const HeaderContainer = styled(XStack, {
  name: 'CommentHeader',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 16,
  paddingVertical: 16,
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderBottomColor: neutralScale.neutral3,
});

const HeaderIcon = styled(YStack, {
  name: 'HeaderIcon',
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: primaryScale.primary2,
  alignItems: 'center',
  justifyContent: 'center',
});

const HeaderTitle = styled(Text, {
  name: 'CommentHeaderTitle',
  fontSize: 17,
  fontWeight: '700',
  color: neutralScale.neutral12,
});

const CommentCount = styled(Text, {
  name: 'CommentCount',
  fontSize: 15,
  color: neutralScale.neutral7,
  marginLeft: 4,
});

const ListContainer = styled(YStack, {
  name: 'CommentList',
  backgroundColor: 'white',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyComments',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 48,
  gap: 16,
  backgroundColor: 'white',
});

const EmptyIconContainer = styled(YStack, {
  name: 'EmptyIcon',
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: neutralScale.neutral2,
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyTitle = styled(Text, {
  name: 'EmptyTitle',
  fontSize: 16,
  fontWeight: '600',
  color: neutralScale.neutral10,
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: 14,
  color: neutralScale.neutral7,
  textAlign: 'center',
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 48,
  backgroundColor: 'white',
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
  onAuthorPress,
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
        <EmptyIconContainer>
          <MessageSquare size={32} color={neutralScale.neutral5} />
        </EmptyIconContainer>
        <EmptyTitle>还没有评论</EmptyTitle>
        <EmptyText>快来发表第一条评论吧~</EmptyText>
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
          <HeaderIcon>
            <MessageCircle size={18} color={primaryScale.primary8} />
          </HeaderIcon>
          <HeaderTitle>评论</HeaderTitle>
        </HeaderContainer>
        <LoadingContainer>
          <Spinner size="large" color={primaryScale.primary7} />
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
        <HeaderIcon>
          <MessageCircle size={18} color={primaryScale.primary8} />
        </HeaderIcon>
        <HeaderTitle>评论</HeaderTitle>
        <CommentCount>{comments.length}</CommentCount>
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
