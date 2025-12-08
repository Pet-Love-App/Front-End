/**
 * 营养成分饼图 - 可视化展示各营养成分占比
 */
import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card, Text, YStack } from 'tamagui';

import { neutralScale } from '@/src/design-system/tokens';

interface NutritionChartSectionProps {
  percentData: Record<string, number | null>;
}

// 饼图配色方案
const CHART_COLORS = [
  '#E74C3C',
  '#2ECC71',
  '#3498DB',
  '#F1C40F',
  '#9B59B6',
  '#1ABC9C',
  '#E67E22',
  '#34495E',
  '#95A5A6',
  '#2C3E50',
];

// 营养成分名称映射
const NUTRITION_NAME_MAP: Record<string, string> = {
  protein: '粗蛋白',
  crude_protein: '粗蛋白',
  fat: '粗脂肪',
  crude_fat: '粗脂肪',
  carbohydrates: '碳水化合物',
  fiber: '粗纤维',
  crude_fiber: '粗纤维',
  ash: '粗灰分',
  crude_ash: '粗灰分',
  moisture: '水分',
  others: '其它',
};

// 准备饼图数据
function preparePieChartData(percentData: Record<string, number | null>) {
  if (!percentData || typeof percentData !== 'object') return [];

  const data: { name: string; value: number }[] = [];

  Object.entries(percentData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && typeof value === 'number' && value > 0) {
      data.push({ name: NUTRITION_NAME_MAP[key] || key, value });
    }
  });

  if (data.length === 0) return [];

  return data.map((item, index) => ({
    name: item.name,
    population: parseFloat(item.value.toFixed(1)),
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: neutralScale.neutral9,
    legendFontSize: 12,
  }));
}

export function NutritionChartSection({ percentData }: NutritionChartSectionProps) {
  if (!percentData || typeof percentData !== 'object' || Object.keys(percentData).length === 0) {
    return null;
  }

  const chartData = preparePieChartData(percentData);
  if (chartData.length === 0) return null;

  const screenWidth = Dimensions.get('window').width;

  return (
    <Card
      padding="$4"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$5"
      bordered
      borderColor={neutralScale.neutral3}
    >
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="600" color="$foreground">
          营养成分分析
        </Text>
        <YStack alignItems="center" marginVertical="$4">
          <PieChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              strokeWidth: 2,
              barPercentage: 0.5,
              decimalPlaces: 1,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend
            avoidFalseZero
          />
        </YStack>
      </YStack>
    </Card>
  );
}
