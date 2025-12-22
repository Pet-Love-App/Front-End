/**
 * GlassSearchBar - 毛玻璃搜索栏组件
 *
 * 带有毛玻璃效果的搜索输入框
 */

import React, { memo, useState, useCallback } from 'react';
import { Pressable, Platform } from 'react-native';
import { Search, X } from '@tamagui/lucide-icons';
import { styled, XStack, Input, Stack } from 'tamagui';

export interface GlassSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  height: 44,
  borderRadius: '$6',
  alignItems: 'center',
  paddingHorizontal: '$3',
  gap: '$2',
  overflow: 'hidden',
});

const SearchInput = styled(Input, {
  name: 'SearchInput',
  flex: 1,
  height: '100%',
  fontSize: '$3',
  backgroundColor: 'transparent',
  borderWidth: 0,
  placeholderTextColor: '$colorMuted',
  color: '$color',
  paddingHorizontal: 0,
});

const IconButton = styled(Stack, {
  name: 'IconButton',
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
});

function GlassSearchBarComponent({
  placeholder = '搜索话题、品种...',
  value = '',
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
}: GlassSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);
      onChangeText?.(text);
    },
    [onChangeText]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText?.('');
  }, [onChangeText]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(localValue);
  }, [localValue, onSubmit]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const content = (
    <SearchContainer
      backgroundColor={Platform.OS === 'ios' ? 'transparent' : '$backgroundMuted'}
      borderWidth={isFocused ? 1 : 0}
      borderColor={isFocused ? '$primary' : 'transparent'}
    >
      <Search size={18} color="$color6" />
      <SearchInput
        value={localValue}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        returnKeyType="search"
      />
      {localValue.length > 0 && (
        <Pressable onPress={handleClear}>
          <IconButton backgroundColor="$color5">
            <X size={14} color="$background" />
          </IconButton>
        </Pressable>
      )}
    </SearchContainer>
  );

  return content;
}

export const GlassSearchBar = memo(GlassSearchBarComponent);
