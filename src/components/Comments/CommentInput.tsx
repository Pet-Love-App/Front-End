/**
 * 评论输入组件
 * 职责：处理评论输入和提交
 */
import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { Button, Text as TamaguiText, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';

interface CommentInputProps {
  isAuthenticated: boolean;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export const CommentInput = memo(function CommentInput({
  isAuthenticated,
  onSubmit,
  placeholder = '说点什么...',
}: CommentInputProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(text.trim());
      setText(''); // 清空输入框
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isAuthenticated && !isSubmitting && text.trim().length > 0;

  return (
    <YStack gap="$2">
      <TextInput
        placeholder={isAuthenticated ? placeholder : '登录后可以发表评论'}
        placeholderTextColor={colors.icon}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        editable={isAuthenticated}
        maxLength={500}
        style={[
          styles.textInput,
          {
            color: colors.text,
            borderColor: colors.icon + '30',
            backgroundColor: colors.icon + '05',
          },
        ]}
      />

      <XStack justifyContent="space-between" alignItems="center">
        <YStack opacity={text.length > 0 ? 1 : 0}>
          {text.length > 0 && (
            <TamaguiText
              fontSize="$2"
              color={text.length > 500 ? '$red10' : colors.icon}
              opacity={text.length > 450 ? 1 : 0.5}
            >
              {text.length}/500
            </TamaguiText>
          )}
        </YStack>

        <Button
          size="$3"
          backgroundColor={colors.tint}
          color="white"
          onPress={handleSubmit}
          disabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.5}
          icon={
            isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="paperplane.fill" size={16} color="white" />
            )
          }
        >
          {isSubmitting ? '发送中...' : '发表'}
        </Button>
      </XStack>
    </YStack>
  );
});

const styles = StyleSheet.create({
  textInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
});
