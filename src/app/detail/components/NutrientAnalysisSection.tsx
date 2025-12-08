/**
 * 营养分析卡片 - 显示营养成分分析结果
 */
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { infoScale, neutralScale } from '@/src/design-system/tokens';

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
      borderColor={infoScale.info5}
    >
      <YStack gap="$3">
        <XStack alignItems="center" gap="$3">
          <YStack
            width={42}
            height={42}
            borderRadius="$10"
            backgroundColor={infoScale.info3}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={infoScale.info6}
          >
            <IconSymbol name="chart.bar.fill" size={22} color={infoScale.info9} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$6" fontWeight="800" color={infoScale.info10} letterSpacing={-0.3}>
              营养分析
            </Text>
            <Text fontSize="$2" color={infoScale.info8} marginTop="$1" fontWeight="500">
              Nutrition Analysis
            </Text>
          </YStack>
        </XStack>

        <YStack
          padding="$4"
          backgroundColor={infoScale.info1}
          borderRadius="$4"
          borderWidth={1.5}
          borderColor={infoScale.info4}
        >
          <Text fontSize="$3" lineHeight={24} color={neutralScale.neutral11} fontWeight="500">
            {nutrient}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
