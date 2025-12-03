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

function buildChartData(report: GenerateReportResponse) {
  if (!report.percentage) return [];

  const data = [];
  let colorIndex = 0;

  const nutrients = [
    { name: '粗蛋白', value: report.crude_protein },
    { name: '粗脂肪', value: report.crude_fat },
    { name: '碳水化合物', value: report.carbohydrates },
    { name: '粗纤维', value: report.crude_fiber },
    { name: '粗灰分', value: report.crude_ash },
    { name: '其他', value: report.others },
  ];

  for (const nutrient of nutrients) {
    if (nutrient.value !== null && nutrient.value > 0) {
      data.push({
        name: nutrient.name,
        value: nutrient.value,
        color: COLORS[colorIndex++ % COLORS.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      });
    }
  }

  return data;
}
