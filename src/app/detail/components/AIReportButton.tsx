/**
 * AIReportButton Component
 */

import React from 'react';
import { Feather } from '@expo/vector-icons';
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
    return null; // 没有报告时不显示按钮
  }

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
