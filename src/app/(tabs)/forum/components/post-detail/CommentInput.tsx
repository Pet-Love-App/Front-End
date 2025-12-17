/**
 * CommentInput - 评论输入框组件
 *
 * 支持：普通评论、回复评论
 */

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { TextInput as RNTextInput, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, X, AtSign } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Text, Input } from 'tamagui';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

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
  backgroundColor: '#fff',
  borderTopWidth: 0.5,
  borderTopColor: 'rgba(0, 0, 0, 0.06)',
  gap: 10,
});

const ReplyBanner = styled(XStack, {
  name: 'ReplyBanner',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#f0f7ff',
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
  color: '#007aff',
  flex: 1,
  fontWeight: '500',
});

const InputRow = styled(XStack, {
  name: 'InputRow',
  alignItems: 'center',
  gap: 10,
});

const InputWrapper = styled(XStack, {
  name: 'InputWrapper',
  flex: 1,
  height: 44,
  backgroundColor: '#f5f5f7',
  borderRadius: 22,
  paddingHorizontal: 16,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'transparent',
});

const StyledInput = styled(Input, {
  name: 'CommentTextInput',
  flex: 1,
  height: 44,
  backgroundColor: 'transparent',
  fontSize: 15,
  color: '#1a1a1a',
  borderWidth: 0,
  paddingHorizontal: 0,
});

const SendButton = styled(YStack, {
  name: 'SendButton',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
});

const CancelButton = styled(YStack, {
  name: 'CancelReplyBtn',
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: 'rgba(0, 122, 255, 0.15)',
  alignItems: 'center',
  justifyContent: 'center',
});

const AnimatedSendButton = Animated.createAnimatedComponent(SendButton);

/**
 * 评论输入框组件 - 现代感设计
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
  const sendButtonScale = useSharedValue(1);
  const sendButtonBg = useSharedValue(0);

  const canSubmit = value.trim().length > 0 && !disabled;

  // 发送按钮动画
  useEffect(() => {
    sendButtonBg.value = withSpring(canSubmit ? 1 : 0, { damping: 15 });
  }, [canSubmit, sendButtonBg]);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    backgroundColor: canSubmit ? '#007aff' : '#e5e5ea',
  }));

  const handleSubmit = useCallback(() => {
    if (canSubmit) {
      sendButtonScale.value = withSpring(0.9, { damping: 15 });
      setTimeout(() => {
        sendButtonScale.value = withSpring(1, { damping: 15 });
      }, 100);
      onSubmit();
      Keyboard.dismiss();
    }
  }, [canSubmit, onSubmit, sendButtonScale]);

  // 当有回复目标时自动聚焦
  useEffect(() => {
    if (replyTarget) {
      inputRef.current?.focus();
    }
  }, [replyTarget]);

  return (
    <Container style={{ paddingBottom: Math.max(16, insets.bottom) }}>
      {/* 回复提示条 */}
      {replyTarget && (
        <ReplyBanner>
          <ReplyInfo>
            <AtSign size={14} color="#007aff" />
            <ReplyText numberOfLines={1}>回复 {replyTarget.author?.username || '用户'}</ReplyText>
          </ReplyInfo>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <CancelButton>
              <X size={14} color="#007aff" />
            </CancelButton>
          </Pressable>
        </ReplyBanner>
      )}

      {/* 输入区域 */}
      <InputRow>
        <InputWrapper
          style={{
            borderColor: value.length > 0 ? '#007aff' : 'transparent',
            backgroundColor: value.length > 0 ? '#fff' : '#f5f5f7',
          }}
        >
          <StyledInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={replyTarget ? '写下你的回复...' : '写下你的评论...'}
            placeholderTextColor="#8e8e93"
            editable={!disabled}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            multiline={false}
          />
        </InputWrapper>

        <Pressable onPress={handleSubmit} disabled={!canSubmit}>
          <AnimatedSendButton style={sendButtonStyle}>
            <Send size={20} color={canSubmit ? '#fff' : '#c7c7cc'} style={{ marginLeft: 2 }} />
          </AnimatedSendButton>
        </Pressable>
      </InputRow>
    </Container>
  );
}

export const CommentInput = memo(CommentInputComponent);
