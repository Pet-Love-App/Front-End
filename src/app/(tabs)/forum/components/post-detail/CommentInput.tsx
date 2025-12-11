/**
 * CommentInput - 评论输入框组件
 *
 * 支持：普通评论、回复评论
 */

import React, { memo, useCallback, useRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, X } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Text, Button, Input } from 'tamagui';

import type { Comment } from '@/src/lib/supabase';

import { ForumColors } from '../../constants';

export interface CommentInputProps {
  /** 输入内容 */
  value: string;
  /** 内容变更 */
  onChangeText: (text: string) => void;
  /** 提交评论 */
  onSubmit: () => void;
  /** 回复目标（为空表示普通评论） */
  replyTarget?: Comment | null;
  /** 取消回复 */
  onCancelReply?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
}

// 样式组件
const Container = styled(YStack, {
  name: 'CommentInput',
  padding: '$3',
  paddingBottom: '$4',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  gap: '$2',
});

const ReplyBanner = styled(XStack, {
  name: 'ReplyBanner',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: ForumColors.sand,
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: 8,
});

const ReplyText = styled(Text, {
  name: 'ReplyText',
  fontSize: 13,
  color: ForumColors.clay,
  flex: 1,
});

const InputRow = styled(XStack, {
  name: 'InputRow',
  alignItems: 'center',
  gap: '$2',
});

const StyledInput = styled(Input, {
  name: 'CommentTextInput',
  flex: 1,
  backgroundColor: '$backgroundSubtle',
  borderRadius: 20,
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  fontSize: 14,
  borderWidth: 1,
  borderColor: '$borderColor',
  color: '$color',
});

const SendButton = styled(Button, {
  name: 'SendButton',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: ForumColors.clay,
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: {
    opacity: 0.8,
  },
  variants: {
    disabled: {
      true: {
        backgroundColor: '$backgroundSubtle',
        opacity: 0.5,
      },
    },
  } as const,
});

const CancelButton = styled(Button, {
  name: 'CancelReplyBtn',
  size: '$2',
  circular: true,
  backgroundColor: 'transparent',
  pressStyle: {
    opacity: 0.7,
  },
});

/**
 * 评论输入框组件
 */
function CommentInputComponent({
  value,
  onChangeText,
  onSubmit,
  replyTarget,
  onCancelReply,
  disabled = false,
}: CommentInputProps) {
  const inputRef = useRef<RNTextInput>(null);
  const insets = useSafeAreaInsets();

  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  }, [value, disabled, onSubmit]);

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <Container style={{ paddingBottom: Math.max(16, insets.bottom) }}>
      {/* 回复提示条 */}
      {replyTarget && (
        <ReplyBanner>
          <ReplyText numberOfLines={1}>回复 @{replyTarget.author?.username || '用户'}</ReplyText>
          <CancelButton onPress={onCancelReply}>
            <X size={16} color={ForumColors.clay} />
          </CancelButton>
        </ReplyBanner>
      )}

      {/* 输入区域 */}
      <InputRow>
        <StyledInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={replyTarget ? '写下你的回复...' : '写下你的评论...'}
          placeholderTextColor="$colorSubtle"
          editable={!disabled}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <SendButton onPress={handleSubmit} disabled={!canSubmit}>
          <Send size={18} color={canSubmit ? 'white' : '$colorMuted'} />
        </SendButton>
      </InputRow>
    </Container>
  );
}

export const CommentInput = memo(CommentInputComponent);
