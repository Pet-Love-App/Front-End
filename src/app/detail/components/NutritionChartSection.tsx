import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card, Text, YStack } from 'tamagui';

interface PercentData {
  crude_protein: number | null;
  crude_fat: number | null;
  carbohydrates: number | null;
  crude_fiber: number | null;
  crude_ash: number | null;
  others: number | null;
}

interface NutritionChartSectionProps {
  percentData: PercentData;
}

// 柔和的高对比度配色
const CHART_COLORS = [
  '#E74C3C', // 红色
  '#2ECC71', // 绿色
  '#3498DB', // 蓝色
  '#F1C40F', // 黄色
  '#9B59B6', // 紫色
  '#1ABC9C', // 青绿色
  '#E67E22', // 橙色
  '#34495E', // 深蓝色
  '#95A5A6', // 灰色
  '#2C3E50', // 深灰色
];

const NUTRITION_FIELDS = [
  { key: 'crude_protein', name: '粗蛋白' },
  { key: 'crude_fat', name: '粗脂肪' },
  { key: 'carbohydrates', name: '碳水化合物' },
  { key: 'crude_fiber', name: '粗纤维' },
  { key: 'crude_ash', name: '粗灰分' },
  { key: 'others', name: '其它' },
] as const;

function preparePieChartData(percentData: PercentData) {
  const data: Array<{ name: string; value: number }> = [];

  NUTRITION_FIELDS.forEach((field) => {
    const value = percentData[field.key];
    if (value !== null && value > 0) {
      data.push({
        name: field.name,
        value,
      });
    }
  });

  return data.map((item, index) => ({
    name: item.name,
    population: parseFloat(item.value.toFixed(1)),
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));
}

export function NutritionChartSection({ percentData }: NutritionChartSectionProps) {
  if (!percentData) return null;

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
      borderColor="$gray4"
    >
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="600" color="$color">
          营养成分分析
        </Text>
        <YStack alignItems="center" marginVertical="$4">
          <PieChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 140, 66, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </YStack>
      </YStack>
    </Card>
  );
}
