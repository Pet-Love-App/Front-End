import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Card, Text, XStack, YStack } from 'tamagui';

interface SafetyAnalysisSectionProps {
  safety: string;
}

export function SafetyAnalysisSection({ safety }: SafetyAnalysisSectionProps) {
  if (!safety) return null;

  return (
    <Card
      padding="$4"
      marginHorizontal="$4"
      marginBottom="$3"
      backgroundColor="$background"
      borderRadius="$5"
      borderWidth={1}
      borderColor="$green5"
      bordered
    >
      <YStack gap="$3">
        {/* 标题 */}
        <XStack alignItems="center" gap="$2">
          <YStack
            width={36}
            height={36}
            borderRadius="$10"
            backgroundColor="$green3"
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="checkmark.shield.fill" size={20} color="$green10" />
          </YStack>
          <Text fontSize="$6" fontWeight="bold" color="$green11">
            安全性分析
          </Text>
        </XStack>

        {/* 内容 */}
        <YStack
          padding="$3"
          backgroundColor="$green2"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$green4"
        >
          <Text fontSize="$3" lineHeight={22} color="$gray11">
            {safety}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
