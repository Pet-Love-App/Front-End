/**
 * 安全性分析卡片 - 显示猫粮安全性评估结果
 */
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { successScale, neutralScale } from '@/src/design-system/tokens';

interface SafetyAnalysisSectionProps {
  safety: string;
}

export function SafetyAnalysisSection({ safety }: SafetyAnalysisSectionProps) {
  if (!safety) return null;

  return (
    <Card
      padding="$4"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$6"
      borderWidth={2}
      borderColor={successScale.success5}
    >
      <YStack gap="$3">
        <XStack alignItems="center" gap="$3">
          <YStack
            width={42}
            height={42}
            borderRadius="$10"
            backgroundColor={successScale.success3}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={successScale.success6}
          >
            <IconSymbol name="checkmark.shield.fill" size={22} color={successScale.success9} />
          </YStack>
          <YStack flex={1}>
            <Text
              fontSize="$6"
              fontWeight="800"
              color={successScale.success10}
              letterSpacing={-0.3}
            >
              安全性分析
            </Text>
            <Text fontSize="$2" color={successScale.success8} marginTop="$1" fontWeight="500">
              Safety Analysis
            </Text>
          </YStack>
        </XStack>

        <YStack
          padding="$4"
          backgroundColor={successScale.success1}
          borderRadius="$4"
          borderWidth={1.5}
          borderColor={successScale.success4}
        >
          <Text fontSize="$3" lineHeight={24} color={neutralScale.neutral11} fontWeight="500">
            {safety}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
