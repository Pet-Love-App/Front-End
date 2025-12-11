import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import {
  primaryScale,
  neutralScale,
  errorScale,
  spacing,
  radius,
} from '@/src/design-system/tokens';

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
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(text.trim());
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isAuthenticated && !isSubmitting && text.trim().length > 0;

  return (
    <YStack gap="$2">
      <TextInput
        placeholder={isAuthenticated ? placeholder : '登录后可以发表评论'}
        placeholderTextColor={neutralScale.neutral6}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        editable={isAuthenticated}
        maxLength={500}
        style={styles.textInput}
      />

      <XStack justifyContent="space-between" alignItems="center">
        <YStack opacity={text.length > 0 ? 1 : 0}>
          {text.length > 0 && (
            <Text
              fontSize="$2"
              color={text.length > 500 ? errorScale.error7 : neutralScale.neutral7}
              opacity={text.length > 450 ? 1 : 0.5}
            >
              {text.length}/500
            </Text>
          )}
        </YStack>

        <Button
          size="$3"
          backgroundColor={primaryScale.primary7}
          color="white"
          onPress={handleSubmit}
          disabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.5}
          pressStyle={{ backgroundColor: primaryScale.primary9 }}
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
    borderColor: neutralScale.neutral4,
    borderRadius: radius[6],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: neutralScale.neutral12,
    backgroundColor: neutralScale.neutral1,
  },
});
