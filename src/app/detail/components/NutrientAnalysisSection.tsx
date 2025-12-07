import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface NutrientAnalysisSectionProps {
  nutrient: string;
}

export function NutrientAnalysisSection({ nutrient }: NutrientAnalysisSectionProps) {
  if (!nutrient) return null;

  return (
    <Card
      padding="$4"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$6"
      borderWidth={2}
      borderColor="$blue6"
    >
      <YStack gap="$3">
        {/* 标题 */}
        <XStack alignItems="center" gap="$3">
          <YStack
            width={42}
            height={42}
            borderRadius="$10"
            backgroundColor="$blue4"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor="$blue7"
          >
            <IconSymbol name="chart.bar.fill" size={22} color="$blue10" />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$6" fontWeight="800" color="$blue11" letterSpacing={-0.3}>
              营养分析
            </Text>
            <Text fontSize="$2" color="$blue9" marginTop="$1" fontWeight="500">
              Nutrition Analysis
            </Text>
          </YStack>
        </XStack>

        {/* 内容 */}
        <YStack
          padding="$4"
          backgroundColor="$blue2"
          borderRadius="$4"
          borderWidth={1.5}
          borderColor="$blue5"
        >
          <Text fontSize="$3" lineHeight={24} color="$gray12" fontWeight="500">
            {nutrient}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
