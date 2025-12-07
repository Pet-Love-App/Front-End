import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

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
      borderColor="$green6"
    >
      <YStack gap="$3">
        {/* 标题 */}
        <XStack alignItems="center" gap="$3">
          <YStack
            width={42}
            height={42}
            borderRadius="$10"
            backgroundColor="$green4"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor="$green7"
          >
            <IconSymbol name="checkmark.shield.fill" size={22} color="$green10" />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$6" fontWeight="800" color="$green11" letterSpacing={-0.3}>
              安全性分析
            </Text>
            <Text fontSize="$2" color="$green9" marginTop="$1" fontWeight="500">
              Safety Analysis
            </Text>
          </YStack>
        </XStack>

        {/* 内容 */}
        <YStack
          padding="$4"
          backgroundColor="$green2"
          borderRadius="$4"
          borderWidth={1.5}
          borderColor="$green5"
        >
          <Text fontSize="$3" lineHeight={24} color="$gray12" fontWeight="500">
            {safety}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
