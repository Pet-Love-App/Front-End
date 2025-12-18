/**
 * OCR 识别结果展示组件
 * 展示识别的文本内容，提供生成 AI 报告的入口
 * 支持手动编辑识别文本
 */
import { memo, useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Card, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { OcrResult } from '@/src/services/api';
// @ts-ignore: expo-clipboard may not have type declarations

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(ocrResult.text);

  // 复制文本到剪贴板
  const handleCopyText = async () => {
    try {
      setIsCopying(true);
      const textToCopy = isEditing ? editedText : ocrResult.text;
      await Clipboard.setStringAsync(textToCopy);
      Alert.alert('✅ 已复制', '识别文本已复制到剪贴板');
    } catch (error) {
      Alert.alert('❌ 复制失败', '无法复制到剪贴板');
    } finally {
      setIsCopying(false);
    }
  };

  // 开启编辑模式
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedText(ocrResult.text);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(ocrResult.text);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editedText.trim() === '') {
      Alert.alert('提示', '文本内容不能为空');
      return;
    }
    // 更新 ocrResult
    ocrResult.text = editedText;
    setIsEditing(false);
    Alert.alert('✅ 已保存', '识别文本已更新');
  };

  // 计算文本统计信息
  const currentText = isEditing ? editedText : ocrResult.text;
  const textLength = currentText.length;
  const wordCount = currentText.split(/\s+/).filter(Boolean).length;

  return (
    <YStack flex={1} backgroundColor={colors.background} paddingTop={insets.top}>
      {/* 顶部标题栏 */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor={(colors.icon + '20') as any}
        backgroundColor={colors.background}
      >
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="doc.text.viewfinder" size={24} color={colors.tint} />
          <Text fontSize="$7" fontWeight="bold" color={colors.text}>
            识别结果
          </Text>
        </XStack>
        <Button size="sm" variant="ghost" rounded onPress={onClose}>
          <IconSymbol name="xmark" size={20} color={colors.icon} />
        </Button>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          {/* 识别状态卡片 */}
          <Card
            padding="$4"
            backgroundColor={(colors.tint + '10') as any}
            borderRadius="$4"
            borderWidth={1}
            borderColor={(colors.tint + '30') as any}
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
                <XStack gap="$2.5">
                  {!isEditing ? (
                    <>
                      <Button
                        size="$4"
                        height={38}
                        paddingHorizontal="$3.5"
                        chromeless
                        onPress={handleStartEdit}
                        icon={<IconSymbol name="pencil" size={18} color={colors.tint} />}
                      >
                        <Text fontSize={15} fontWeight="600" color={colors.tint}>
                          编辑
                        </Text>
                      </Button>
                      <Button
                        size="$4"
                        height={38}
                        paddingHorizontal="$3.5"
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
                        <Text fontSize={15} fontWeight="600" color={colors.tint}>
                          复制
                        </Text>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="$4"
                        height={38}
                        paddingHorizontal="$3.5"
                        chromeless
                        onPress={handleCancelEdit}
                        icon={<IconSymbol name="xmark" size={18} color={colors.icon} />}
                      >
                        <Text fontSize={15} fontWeight="600" color={colors.icon}>
                          取消
                        </Text>
                      </Button>
                      <Button
                        size="$4"
                        height={38}
                        paddingHorizontal="$3.5"
                        backgroundColor={colors.tint}
                        color="white"
                        onPress={handleSaveEdit}
                        icon={<IconSymbol name="checkmark" size={18} color="white" />}
                      >
                        <Text fontSize={15} fontWeight="600" color="white">
                          保存
                        </Text>
                      </Button>
                    </>
                  )}
                </XStack>
              </XStack>

              {/* 文本内容 - 支持编辑 */}
              {isEditing ? (
                <Card
                  backgroundColor={colors.background as any}
                  padding="$3"
                  borderRadius="$3"
                  borderWidth={2}
                  borderColor={colors.tint as any}
                >
                  <TextInput
                    value={editedText}
                    onChangeText={setEditedText}
                    multiline
                    numberOfLines={10}
                    style={{
                      fontSize: 15,
                      color: colors.text,
                      lineHeight: 24,
                      minHeight: 200,
                      textAlignVertical: 'top',
                    }}
                    placeholder="请输入或编辑识别的文本..."
                    placeholderTextColor={colors.icon + '60'}
                  />
                </Card>
              ) : (
                <Card
                  backgroundColor={(colors.icon + '05') as any}
                  padding="$3"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={(colors.icon + '20') as any}
                >
                  <Text
                    fontSize="$4"
                    color={colors.text}
                    lineHeight={24}
                    fontFamily="$body"
                    selectable
                  >
                    {currentText || '未识别到文本内容'}
                  </Text>
                </Card>
              )}
            </YStack>
          </Card>

          {/* 提示信息 */}
          {!isEditing && (
            <Card
              padding="$3.5"
              backgroundColor={(colors.icon + '05') as any}
              borderRadius="$4"
              borderLeftWidth={4}
              borderLeftColor={colors.tint as any}
            >
              <XStack gap="$2.5" alignItems="flex-start">
                <IconSymbol name="lightbulb.fill" size={20} color={colors.tint} />
                <YStack flex={1}>
                  <Text fontSize="$3" color={colors.text} lineHeight={22}>
                    💡 您可以点击"编辑"按钮修改识别结果，然后点击"生成 AI 报告"进行智能分析。
                  </Text>
                </YStack>
              </XStack>
            </Card>
          )}

          {/* 操作按钮组 */}
          <YStack gap="$3" marginTop="$2" paddingBottom={insets.bottom || 24}>
            <Button
              size="$5"
              height={54}
              backgroundColor={colors.tint}
              color="white"
              onPress={onGenerateReport}
              disabled={isGeneratingReport || isEditing}
              opacity={isEditing ? 0.5 : 1}
              icon={
                isGeneratingReport ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <IconSymbol name="sparkles" size={22} color="white" />
                )
              }
            >
              <Text fontSize="$5" fontWeight="700" color="white">
                {isGeneratingReport ? '分析中...' : '生成 AI 报告'}
              </Text>
            </Button>

            <XStack gap="$3">
              <Button
                flex={1}
                size="$4"
                height={44}
                variant="outlined"
                onPress={onRetake}
                borderColor={(colors.icon + '30') as any}
                color={colors.text}
                icon={<IconSymbol name="camera.fill" size={18} color={colors.icon} />}
              >
                <Text fontSize="$4" color={colors.text}>
                  重新拍照
                </Text>
              </Button>

              <Button
                flex={1}
                size="$4"
                height={44}
                chromeless
                onPress={onClose}
                color={colors.icon}
                icon={<IconSymbol name="arrow.left" size={18} color={colors.icon} />}
              >
                <Text fontSize="$4" color={colors.icon}>
                  返回首页
                </Text>
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
