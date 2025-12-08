import { Input, XStack, type SizeTokens } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface SearchBoxProps {
  size?: SizeTokens;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function SearchBox({
  size = '$4',
  value = '',
  placeholder = '搜索...',
  onChangeText,
  onClear,
  autoFocus = false,
  disabled = false,
}: SearchBoxProps) {
  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      backgroundColor="$background"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      focusStyle={{ borderColor: '$borderColorFocus' }}
    >
      <IconSymbol name="magnifyingglass" size={20} color="$foregroundSubtle" />

      <Input
        flex={1}
        size={size}
        placeholder={placeholder}
        placeholderTextColor="$placeholderColor"
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        disabled={disabled}
        backgroundColor="transparent"
        borderWidth={0}
        color="$foreground"
        focusStyle={{ borderWidth: 0, outlineWidth: 0 }}
        paddingHorizontal="$2"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />

      {value && value.length > 0 && (
        <XStack
          onPress={handleClear}
          padding="$1"
          borderRadius="$full"
          backgroundColor="$backgroundMuted"
          pressStyle={{ backgroundColor: '$backgroundPress', scale: 0.95 }}
          cursor="pointer"
        >
          <IconSymbol name="xmark.circle.fill" size={18} color="$foregroundMuted" />
        </XStack>
      )}
    </XStack>
  );
}

export type { SearchBoxProps };
