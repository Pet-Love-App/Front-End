/**
 * 安全性分析卡片 - 显示猫粮安全性评估结果
 */
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { successScale, neutralScale } from '@/src/design-system/tokens';

interface SafetyAnalysisSectionProps {
  safety: string;
}

export function SafetyAnalysisSection({ safety }: SafetyAnalysisSectionProps) {
  if (!safety) return null;

  return (
    <YStack
      marginHorizontal="$3"
      marginBottom="$3"
      borderRadius={20}
      backgroundColor="white"
      overflow="hidden"
      borderWidth={1}
      borderColor={neutralScale.neutral3}
    >
      {/* 标题栏 */}
      <XStack
        padding="$4"
        alignItems="center"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor={neutralScale.neutral2}
      >
        <YStack
          width={44}
          height={44}
          borderRadius={22}
          backgroundColor={successScale.success2}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="checkmark.shield.fill" size={22} color={successScale.success7} />
        </YStack>
        <YStack flex={1}>
          <Text fontSize="$5" fontWeight="700" color={neutralScale.neutral12}>
            安全性分析
          </Text>
          <Text fontSize={11} color={neutralScale.neutral8} marginTop={2}>
            Safety Analysis
          </Text>
        </YStack>
        <YStack
          backgroundColor={successScale.success2}
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
          borderRadius={12}
        >
          <Text fontSize={11} fontWeight="700" color={successScale.success8}>
            安全
          </Text>
        </YStack>
      </XStack>

      {/* 内容区域 */}
      <YStack padding="$4">
        <YStack padding="$4" backgroundColor={successScale.success1} borderRadius={12}>
          <Text fontSize="$3" lineHeight={24} color={neutralScale.neutral11} fontWeight="500">
            {safety}
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
