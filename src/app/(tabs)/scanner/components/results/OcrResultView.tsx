/**
 * OCR 识别结果展示组件
 * 展示识别的文本内容，提供生成 AI 报告的入口
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { OcrResult } from '@/src/services/api';
// @ts-ignore: expo-clipboard may not have type declarations
import * as Clipboard from 'expo-clipboard';
import { memo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';

interface OcrResultViewProps {
  ocrResult: OcrResult;
  photoUri?: string | null;
  isGeneratingReport?: boolean;
  onGenerateReport: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export const OcrResultView = memo(function OcrResultView({
  ocrResult,
  photoUri,
  isGeneratingReport,
  onGenerateReport,
  onRetake,
  onClose,
}: OcrResultViewProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const [isCopying, setIsCopying] = useState(false);

  // 复制文本到剪贴板
  const handleCopyText = async () => {
    try {
      setIsCopying(true);
      await Clipboard.setStringAsync(ocrResult.text);
      Alert.alert('✅ 已复制', '识别文本已复制到剪贴板');
    } catch (error) {
      Alert.alert('❌ 复制失败', '无法复制到剪贴板');
    } finally {
      setIsCopying(false);
    }
  };

  // 计算文本统计信息
  const textLength = ocrResult.text.length;
  const wordCount = ocrResult.text.split(/\s+/).filter(Boolean).length;

  return (
    <YStack flex={1} backgroundColor={colors.background} paddingTop={insets.top}>
      {/* 顶部标题栏 */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor={colors.icon + '20'}
        backgroundColor={colors.background}
      >
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="doc.text.viewfinder" size={24} color={colors.tint} />
          <Text fontSize="$7" fontWeight="bold" color={colors.text}>
            识别结果
          </Text>
        </XStack>
        <Button size="$3" circular chromeless onPress={onClose}>
          <IconSymbol name="xmark" size={20} color={colors.icon} />
        </Button>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          {/* 识别状态卡片 */}
          <Card
            padding="$4"
            backgroundColor={colors.tint + '10'}
            borderRadius="$4"
            borderWidth={1}
            borderColor={colors.tint + '30'}
            bordered
          >
            <XStack alignItems="center" gap="$3">
              <YStack
                width={48}
                height={48}
                borderRadius="$10"
                backgroundColor={colors.tint}
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="checkmark.circle.fill" size={28} color="white" />
              </YStack>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color={colors.text}>
                  识别完成
                </Text>
                <Text fontSize="$3" color={colors.icon}>
                  共识别 {textLength} 个字符，{wordCount} 个词
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* 识别文本内容 */}
          <Card padding="$4" backgroundColor={colors.background} borderRadius="$4" bordered>
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize="$5" fontWeight="600" color={colors.text}>
                  识别文本
                </Text>
                <Button
                  size="$3"
                  chromeless
                  onPress={handleCopyText}
                  disabled={isCopying}
                  icon={
                    isCopying ? (
                      <Spinner size="small" color={colors.tint} />
                    ) : (
                      <IconSymbol name="doc.on.doc" size={18} color={colors.tint} />
                    )
                  }
                >
                  复制
                </Button>
              </XStack>

              <Card
                backgroundColor={colors.icon + '05'}
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor={colors.icon + '20'}
              >
                <Text
                  fontSize="$4"
                  color={colors.text}
                  lineHeight={24}
                  fontFamily="$body"
                  selectable
                >
                  {ocrResult.text || '未识别到文本内容'}
                </Text>
              </Card>
            </YStack>
          </Card>

          {/* 提示信息 */}
          <Card
            padding="$3"
            backgroundColor={colors.icon + '05'}
            borderRadius="$4"
            borderLeftWidth={4}
            borderLeftColor={colors.tint}
          >
            <XStack gap="$2" alignItems="flex-start">
              <IconSymbol name="lightbulb.fill" size={18} color={colors.tint} />
              <YStack flex={1}>
                <Text fontSize="$3" color={colors.text} lineHeight={20}>
                  点击"生成 AI 报告"按钮，系统将智能分析识别的成分，为您提供专业的安全性和营养评估。
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* 操作按钮组 */}
          <YStack gap="$3" marginTop="$2" paddingBottom={insets.bottom || 24}>
            <Button
              size="$5"
              backgroundColor={colors.tint}
              color="white"
              onPress={onGenerateReport}
              disabled={isGeneratingReport}
              icon={
                isGeneratingReport ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <IconSymbol name="sparkles" size={20} color="white" />
                )
              }
            >
              {isGeneratingReport ? '分析中...' : '生成 AI 报告'}
            </Button>

            <XStack gap="$3">
              <Button
                flex={1}
                size="$4"
                variant="outlined"
                onPress={onRetake}
                borderColor={colors.icon + '30'}
                color={colors.text}
                icon={<IconSymbol name="camera.fill" size={18} color={colors.icon} />}
              >
                重新拍照
              </Button>

              <Button
                flex={1}
                size="$4"
                chromeless
                onPress={onClose}
                color={colors.icon}
                icon={<IconSymbol name="arrow.left" size={18} color={colors.icon} />}
              >
                返回首页
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
});

const styles = StyleSheet.create({
  // 预留样式，如果需要特殊处理可以在这里添加
});
