/**
 * PageHeader - 统一的页面头部组件
 * - 支持深色/浅色主题适配
 *
 * 使用场景：
 * 1. 基本头部：带图标、标题、副标题
 * 2. 导航头部：带返回按钮
 * 3. 简洁头部：仅标题文字
 * 4. 扩展头部：带自定义右侧元素
 */

import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from './ui/IconSymbol';

/**
 * 头部图标配置
 */
interface HeaderIcon {
  /** SF Symbols 图标名称 */
  name: React.ComponentProps<typeof IconSymbol>['name'];
  /** 图标大小 */
  size?: number;
  /** 图标颜色 */
  color?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 边框颜色 */
  borderColor?: string;
}

/**
 * 页面头部组件 Props
 */
export interface PageHeaderProps {
  /** 主标题 */
  title: string;
  /** 副标题（可选） */
  subtitle?: string;
  /** 头部图标配置（可选） */
  icon?: HeaderIcon;
  /** 是否显示返回按钮 */
  showBackButton?: boolean;
  /** 自定义返回按钮点击事件（默认使用 router.back()） */
  onBackPress?: () => void;
  /** 安全区域边距 */
  insets: EdgeInsets;
  /** 头部背景色（可选，默认白色） */
  backgroundColor?: string;
  /** 边框底部颜色（可选） */
  borderBottomColor?: string;
  /** 是否显示底部边框（默认true） */
  showBorder?: boolean;
  /** 右侧自定义内容（可选） */
  rightElement?: React.ReactNode;
  /** 头部样式变体 */
  variant?: 'default' | 'compact' | 'prominent';
}

/**
 * 统一的页面头部组件
 *
 * @example
 * // 基本用法 - 带图标和副标题
 * <PageHeader
 *   title="智能扫描"
 *   subtitle="AI 成分分析助手"
 *   icon={{
 *     name: "camera.metering.center.weighted",
 *     size: 26,
 *     color: "#FEBE98",
 *     backgroundColor: "#FFF5ED",
 *     borderColor: "#FFE4D1"
 *   }}
 *   insets={insets}
 * />
 *
 * @example
 * // 带返回按钮
 * <PageHeader
 *   title="设置"
 *   showBackButton
 *   insets={insets}
 * />
 *
 * @example
 * // 简洁模式
 * <PageHeader
 *   title="我的宠物"
 *   variant="compact"
 *   insets={insets}
 *   showBorder={false}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = false,
  onBackPress,
  insets,
  backgroundColor = 'white',
  borderBottomColor = '#F3F4F6',
  showBorder = true,
  rightElement,
  variant = 'default',
}: PageHeaderProps) {
  const router = useRouter();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 处理返回按钮点击
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // 根据变体计算样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          paddingBottom: '$2',
          titleSize: 18,
          subtitleSize: 11,
          iconSize: 40,
          iconInnerSize: 20,
        };
      case 'prominent':
        return {
          paddingBottom: '$5',
          titleSize: 28,
          subtitleSize: 15,
          iconSize: 48,
          iconInnerSize: 26,
        };
      default:
        return {
          paddingBottom: '$3',
          titleSize: 20,
          subtitleSize: 12,
          iconSize: 40,
          iconInnerSize: 22,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <YStack
      paddingTop={insets.top}
      paddingHorizontal="$4"
      paddingBottom={variantStyles.paddingBottom}
      backgroundColor={backgroundColor}
      borderBottomWidth={showBorder ? 1 : 0}
      borderBottomColor={borderBottomColor}
    >
      <XStack alignItems="center" gap="$2.5" paddingTop="$2.5">
        {/* 返回按钮 */}
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} activeOpacity={0.7}>
            <Card
              padding="$2"
              borderRadius="$3"
              backgroundColor={colors.background}
              borderWidth={1}
              borderColor={colors.icon + '40'}
            >
              <Ionicons name="chevron-back" size={24} color={colors.icon} />
            </Card>
          </TouchableOpacity>
        )}

        {/* 图标 */}
        {icon && !showBackButton && (
          <YStack
            width={variantStyles.iconSize}
            height={variantStyles.iconSize}
            borderRadius="$10"
            backgroundColor={icon.backgroundColor || '#FFF5ED'}
            alignItems="center"
            justifyContent="center"
            borderWidth={1.5}
            borderColor={icon.borderColor || '#FFE4D1'}
          >
            <IconSymbol
              name={icon.name}
              size={icon.size || variantStyles.iconInnerSize}
              color={icon.color || '#FEBE98'}
            />
          </YStack>
        )}

        {/* 标题和副标题 */}
        <YStack flex={1}>
          <Text
            fontSize={variantStyles.titleSize}
            fontWeight="700"
            color="#111827"
            letterSpacing={0.3}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontSize={variantStyles.subtitleSize}
              color="#6B7280"
              fontWeight="500"
              marginTop="$0.5"
            >
              {subtitle}
            </Text>
          )}
        </YStack>

        {/* 右侧自定义内容 */}
        {rightElement && <YStack>{rightElement}</YStack>}
      </XStack>
    </YStack>
  );
}
