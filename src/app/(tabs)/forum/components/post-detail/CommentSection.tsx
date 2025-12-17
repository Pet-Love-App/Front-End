/**
 * CommentSection - 评论区组件
 *
 * 优雅的空状态设计，精致插画与行动号召
 * 注意：不使用 FlatList，因为该组件被嵌套在 ScrollView 中
 */

import React, { memo, useMemo } from 'react';
import { MessageCircle, Sparkles } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, Spinner } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import type { Comment } from '@/src/lib/supabase';

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
  backgroundColor: '#fff',
});

const HeaderContainer = styled(XStack, {
  name: 'CommentHeader',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: '#fff',
});

const HeaderTitle = styled(Text, {
  name: 'CommentHeaderTitle',
  fontSize: 17,
  fontWeight: '700',
  color: '#1a1a1a',
  letterSpacing: -0.3,
});

const CommentCount = styled(Text, {
  name: 'CommentCount',
  fontSize: 15,
  color: '#8e8e93',
  fontWeight: '500',
});

const ListContainer = styled(YStack, {
  name: 'CommentList',
  backgroundColor: '#fff',
});

// 精致的空状态设计
const EmptyContainer = styled(YStack, {
  name: 'EmptyComments',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 56,
  paddingHorizontal: 32,
  gap: 20,
  backgroundColor: '#fff',
});

const EmptyIllustration = styled(YStack, {
  name: 'EmptyIllustration',
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#f8f9fa',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

const BubbleDecor = styled(YStack, {
  name: 'BubbleDecor',
  position: 'absolute',
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#e8f4fd',
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyTextContainer = styled(YStack, {
  name: 'EmptyTextContainer',
  alignItems: 'center',
  gap: 8,
});

const EmptyTitle = styled(Text, {
  name: 'EmptyTitle',
  fontSize: 18,
  fontWeight: '600',
  color: '#1a1a1a',
  letterSpacing: -0.3,
});

const EmptySubtitle = styled(Text, {
  name: 'EmptySubtitle',
  fontSize: 14,
  color: '#8e8e93',
  textAlign: 'center',
  lineHeight: 20,
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 48,
  backgroundColor: '#fff',
});

const AnimatedBubble = Animated.createAnimatedComponent(BubbleDecor);

/**
 * 空状态组件 - 精致动画插画
 */
const EmptyState = memo(function EmptyState() {
  // 气泡浮动动画
  const floatStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
              withTiming(4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  return (
    <EmptyContainer>
      <EmptyIllustration>
        <MessageCircle size={42} color="#007aff" strokeWidth={1.5} />
        {/* 装饰性小气泡 */}
        <AnimatedBubble style={[{ top: -8, right: -4 }, floatStyle]}>
          <Sparkles size={12} color="#007aff" />
        </AnimatedBubble>
        <BubbleDecor style={{ bottom: -4, left: -8, backgroundColor: '#fff0f0' }}>
          <Text fontSize={10}>💬</Text>
        </BubbleDecor>
      </EmptyIllustration>

      <EmptyTextContainer>
        <EmptyTitle>还没有评论</EmptyTitle>
        <EmptySubtitle>期待你的独到见解！{'\n'}成为第一个留言的人吧</EmptySubtitle>
      </EmptyTextContainer>
    </EmptyContainer>
  );
});

/**
 * 评论区组件
 */
function CommentSectionComponent({
  comments,
  isLoading,
  currentUserId,
  editingComment,
  onToggleLike,
  onSetReplyTarget,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onDeleteComment,
}: CommentSectionProps) {
  /**
   * 加载状态
   */
  if (isLoading && comments.length === 0) {
    return (
      <Container>
        <HeaderContainer>
          <HeaderTitle>评论</HeaderTitle>
        </HeaderContainer>
        <LoadingContainer>
          <Spinner size="large" color="#007aff" />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* 评论区标题 */}
      <HeaderContainer>
        <HeaderTitle>评论</HeaderTitle>
        {comments.length > 0 && <CommentCount>{comments.length}</CommentCount>}
      </HeaderContainer>

      {/* 评论列表 - 使用 map 渲染避免嵌套 VirtualizedList */}
      <ListContainer>
        {comments.length === 0 ? (
          <EmptyState />
        ) : (
          comments.map((comment) => {
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
          })
        )}
      </ListContainer>
    </Container>
  );
}

export const CommentSection = memo(CommentSectionComponent);
