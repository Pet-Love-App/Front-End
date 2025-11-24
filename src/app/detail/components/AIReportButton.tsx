/**
 * AIReportButton Component
 *
 * 企业最佳实践：
 * - 单一职责：只负责渲染 AI 报告按钮
 * - 可复用的 UI 组件
 * - 清晰的 props 接口
 */

import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

interface AIReportButtonProps {
  /** 是否存在报告 */
  hasReport: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 点击事件 */
  onPress: () => void;
}

/**
 * AI 报告按钮组件
 */
export function AIReportButton({ hasReport, isLoading, onPress }: AIReportButtonProps) {
  console.log('🎨 [AIReportButton] 渲染状态:', { hasReport, isLoading });

  if (isLoading) {
    return (
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        backgroundColor="$blue2"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$blue5"
      >
        <XStack gap="$2" alignItems="center" justifyContent="center">
          <Spinner size="small" color="$blue10" />
          <Text fontSize="$4" color="$blue10">
            加载中...
          </Text>
        </XStack>
      </YStack>
    );
  }

  if (!hasReport) {
    console.log('⚠️ [AIReportButton] 没有报告，不显示按钮');
    return null; // 没有报告时不显示按钮
  }

  console.log('✅ [AIReportButton] 显示报告按钮');
  return (
    <Button
      size="$4"
      theme="blue"
      icon={<Feather name="file-text" size={18} />}
      onPress={onPress}
      backgroundColor="$blue5"
      borderColor="$blue7"
      borderWidth={1}
      pressStyle={{
        backgroundColor: '$blue6',
        scale: 0.98,
      }}
      hoverStyle={{
        backgroundColor: '$blue6',
      }}
    >
      <Text fontSize="$4" fontWeight="600" color="$blue11">
        查看 AI 分析报告
      </Text>
    </Button>
  );
}
