/**
 * 营养分析卡片 - 显示营养成分分析结果
 */
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { infoScale, neutralScale } from '@/src/design-system/tokens';

interface NutrientAnalysisSectionProps {
  nutrient: string;
}

export function NutrientAnalysisSection({ nutrient }: NutrientAnalysisSectionProps) {
  if (!nutrient) return null;

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
          backgroundColor={infoScale.info2}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="chart.bar.fill" size={22} color={infoScale.info7} />
        </YStack>
        <YStack flex={1}>
          <Text fontSize="$5" fontWeight="700" color={neutralScale.neutral12}>
            营养分析
          </Text>
          <Text fontSize={11} color={neutralScale.neutral8} marginTop={2}>
            Nutrition Analysis
          </Text>
        </YStack>
      </XStack>

      {/* 内容区域 */}
      <YStack padding="$4">
        <YStack padding="$4" backgroundColor={infoScale.info1} borderRadius={12}>
          <Text fontSize="$3" lineHeight={24} color={neutralScale.neutral11} fontWeight="500">
            {nutrient}
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
