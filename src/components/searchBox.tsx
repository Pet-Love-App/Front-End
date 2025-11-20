import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import { Input, XStack, type SizeTokens } from 'tamagui';

interface SearchBoxProps {
  /** 输入框大小 */
  size?: SizeTokens;
  /** 当前搜索值 */
  value?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 输入变化回调 */
  onChangeText?: (text: string) => void;
  /** 清除回调 */
  onClear?: () => void;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * SearchBox - 企业级搜索框组件
 *
 * 特性：
 * - 实时搜索支持
 * - 清除按钮
 * - 搜索图标
 * - 可配置大小和样式
 * - 支持键盘配置
 * - 无障碍访问支持
 */
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
    >
      {/* 搜索图标 */}
      <IconSymbol name="magnifyingglass" size={20} color="$gray10" />

      {/* 输入框 */}
      <Input
        flex={1}
        size={size}
        placeholder={placeholder}
        placeholderTextColor="$gray10"
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        disabled={disabled}
        backgroundColor="transparent"
        borderWidth={0}
        focusStyle={{
          borderWidth: 0,
          outlineWidth: 0,
        }}
        paddingHorizontal="$2"
        // 键盘配置
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never" // 使用自定义清除按钮
      />

      {/* 清除按钮 */}
      {value && value.length > 0 && (
        <XStack
          onPress={handleClear}
          padding="$1"
          borderRadius="$10"
          backgroundColor="$gray8"
          pressStyle={{
            backgroundColor: '$gray9',
            scale: 0.95,
          }}
          cursor="pointer"
        >
          <IconSymbol name="xmark.circle.fill" size={18} color="$gray11" />
        </XStack>
      )}
    </XStack>
  );
}

// 导出类型供其他组件使用
export type { SearchBoxProps };
