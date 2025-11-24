import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Card, Text, XStack, YStack } from 'tamagui';

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
      borderRadius="$5"
      borderWidth={1}
      borderColor="$blue5"
      bordered
    >
      <YStack gap="$3">
        {/* 标题 */}
        <XStack alignItems="center" gap="$2">
          <YStack
            width={36}
            height={36}
            borderRadius="$10"
            backgroundColor="$blue3"
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="chart.bar.fill" size={20} color="$blue10" />
          </YStack>
          <Text fontSize="$6" fontWeight="bold" color="$blue11">
            营养分析
          </Text>
        </XStack>

        {/* 内容 */}
        <YStack
          padding="$3"
          backgroundColor="$blue2"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$blue4"
        >
          <Text fontSize="$3" lineHeight={22} color="$gray11">
            {nutrient}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
