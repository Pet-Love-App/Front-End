/**
 * CommentInput - 评论输入框组件
 *
 * 支持：普通评论、回复评论
 */

import React, { memo, useCallback, useRef } from 'react';
import { TextInput as RNTextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, X, AtSign } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Text, Input } from 'tamagui';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

import type { Comment } from '@/src/lib/supabase';

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
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 16,
  backgroundColor: 'white',
  borderTopWidth: 1,
  borderTopColor: neutralScale.neutral3,
  gap: 10,
});

const ReplyBanner = styled(XStack, {
  name: 'ReplyBanner',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: primaryScale.primary2,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  gap: 8,
});

const ReplyInfo = styled(XStack, {
  name: 'ReplyInfo',
  alignItems: 'center',
  gap: 6,
  flex: 1,
});

const ReplyText = styled(Text, {
  name: 'ReplyText',
  fontSize: 13,
  color: primaryScale.primary9,
  flex: 1,
});

const InputRow = styled(XStack, {
  name: 'InputRow',
  alignItems: 'center',
  gap: 10,
});

const StyledInput = styled(Input, {
  name: 'CommentTextInput',
  flex: 1,
  height: 48,
  backgroundColor: neutralScale.neutral2,
  borderRadius: 24,
  paddingHorizontal: 18,
  paddingVertical: 12,
  fontSize: 15,
  borderWidth: 1.5,
  borderColor: neutralScale.neutral3,
  color: neutralScale.neutral12,
  focusStyle: {
    borderColor: primaryScale.primary6,
    backgroundColor: 'white',
  },
});

const SendButtonContainer = styled(YStack, {
  name: 'SendButton',
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: primaryScale.primary7,
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    disabled: {
      true: {
        backgroundColor: neutralScale.neutral3,
      },
    },
  } as const,
});

const CancelButtonContainer = styled(YStack, {
  name: 'CancelReplyBtn',
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: primaryScale.primary3,
  alignItems: 'center',
  justifyContent: 'center',
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
          <ReplyInfo>
            <AtSign size={14} color={primaryScale.primary8} />
            <ReplyText numberOfLines={1}>回复 {replyTarget.author?.username || '用户'}</ReplyText>
          </ReplyInfo>
          <Pressable onPress={onCancelReply}>
            <CancelButtonContainer>
              <X size={14} color={primaryScale.primary8} />
            </CancelButtonContainer>
          </Pressable>
        </ReplyBanner>
      )}

      {/* 输入区域 */}
      <InputRow>
        <StyledInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={replyTarget ? '写下你的回复...' : '写下你的评论...'}
          placeholderTextColor={neutralScale.neutral6}
          editable={!disabled}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <Pressable onPress={handleSubmit} disabled={!canSubmit}>
          <SendButtonContainer disabled={!canSubmit}>
            <Send size={20} color={canSubmit ? 'white' : neutralScale.neutral5} />
          </SendButtonContainer>
        </Pressable>
      </InputRow>
    </Container>
  );
}

export const CommentInput = memo(CommentInputComponent);
