/**
 * 营养成分饼状图组件
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { GenerateReportResponse } from '@/src/services/api';
import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card, Text, XStack, YStack } from 'tamagui';

interface NutritionPieChartProps {
  report: GenerateReportResponse;
}

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884D8', '#82ca9d'];

export function NutritionPieChart({ report }: NutritionPieChartProps) {
  const chartData = buildChartData(report);

  if (chartData.length === 0) return null;

  const screenWidth = Dimensions.get('window').width;

  return (
    <Card bordered>
      <Card.Header padded>
        <YStack gap="$3">
          <XStack alignItems="center" gap="$2">
            <IconSymbol name="chart.pie.fill" size={20} color="$purple10" />
            <Text fontSize="$5" fontWeight="600">
              营养成分占比
            </Text>
          </XStack>
          <YStack alignItems="center" paddingVertical="$3">
            <PieChart
              data={chartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </YStack>
        </YStack>
      </Card.Header>
    </Card>
  );
}

/** 营养字段到中文名称的映射 */
const NUTRIENT_LABELS: Record<string, string> = {
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
  others: '其他',
};

function buildChartData(report: GenerateReportResponse) {
  if (!report.percentage || !report.percent_data) return [];

  const data: {
    name: string;
    value: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[] = [];
  let colorIndex = 0;

  // 从 percent_data 动态获取营养数据
  for (const [key, value] of Object.entries(report.percent_data)) {
    if (value !== null && value > 0) {
      const label = NUTRIENT_LABELS[key] || key;
      data.push({
        name: label,
        value,
        color: COLORS[colorIndex++ % COLORS.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      });
    }
  }

  return data;
}
