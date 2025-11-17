import { Card, Text, YStack } from 'tamagui';

interface NutrientAnalysisSectionProps {
  nutrient: string;
}

export function NutrientAnalysisSection({ nutrient }: NutrientAnalysisSectionProps) {
  if (!nutrient) return null;

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
          营养分析
        </Text>
        <Text fontSize="$3" lineHeight="$1" color="$gray11">
          {nutrient}
        </Text>
      </YStack>
    </Card>
  );
}
