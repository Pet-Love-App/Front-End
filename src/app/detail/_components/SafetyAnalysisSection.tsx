import { Card, Text, YStack } from 'tamagui';

interface SafetyAnalysisSectionProps {
  safety: string;
}

export function SafetyAnalysisSection({ safety }: SafetyAnalysisSectionProps) {
  if (!safety) return null;

  return (
    <Card
      elevate
      padding="$4"
      marginHorizontal="$4"
      marginBottom="$3"
      backgroundColor="$background"
      borderRadius="$4"
    >
      <YStack space="$3">
        <Text fontSize="$6" fontWeight="600" color="$color">
          安全性分析
        </Text>
        <Text fontSize="$3" lineHeight="$1" color="$gray11">
          {safety}
        </Text>
      </YStack>
    </Card>
  );
}
