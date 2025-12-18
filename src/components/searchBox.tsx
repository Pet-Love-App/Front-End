import { useState, useCallback } from 'react';
import { Input, XStack, type SizeTokens } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface SearchBoxProps {
  size?: SizeTokens;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void; // 点击搜索按钮或按回车时触发
  onClear?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  showSearchButton?: boolean; // 是否显示搜索按钮
}

export default function SearchBox({
  size = '$4',
  value = '',
  placeholder = '搜索...',
  onChangeText,
  onSearch,
  onClear,
  autoFocus = false,
  disabled = false,
  showSearchButton = true,
}: SearchBoxProps) {
  // 内部状态管理输入值（如果没有外部控制）
  const [internalValue, setInternalValue] = useState(value);
  const currentValue = value !== undefined ? value : internalValue;

  const handleTextChange = useCallback(
    (text: string) => {
      setInternalValue(text);
      onChangeText?.(text);
    },
    [onChangeText]
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChangeText?.('');
    onClear?.();
    onSearch?.(''); // 清空时也触发搜索
  }, [onChangeText, onClear, onSearch]);

  const handleSearch = useCallback(() => {
    onSearch?.(currentValue);
  }, [onSearch, currentValue]);

  const handleSubmitEditing = useCallback(() => {
    onSearch?.(currentValue);
  }, [onSearch, currentValue]);

  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingLeft="$3"
      paddingRight="$2"
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
        value={currentValue}
        onChangeText={handleTextChange}
        onSubmitEditing={handleSubmitEditing}
        autoFocus={autoFocus}
        disabled={disabled}
        backgroundColor="transparent"
        borderWidth={0}
        color="$foreground"
        focusStyle={{ borderWidth: 0, outlineWidth: 0 }}
        paddingHorizontal="$2"
        paddingVertical={0}
        height={36}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />

      {/* 清除按钮 */}
      {currentValue && currentValue.length > 0 && (
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

      {/* 搜索按钮 */}
      {showSearchButton && (
        <XStack
          onPress={handleSearch}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          backgroundColor="#FEBE98"
          pressStyle={{ backgroundColor: '#E5A882', scale: 0.98 }}
          cursor="pointer"
        >
          <IconSymbol name="magnifyingglass" size={18} color="white" />
        </XStack>
      )}
    </XStack>
  );
}

export type { SearchBoxProps };
