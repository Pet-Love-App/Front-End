import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card, Text, YStack } from 'tamagui';

interface NutritionChartSectionProps {
  percentData: Record<string, number | null>;
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

// 营养成分中文名称映射
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

function preparePieChartData(percentData: Record<string, number | null>) {
  // 数据验证
  if (!percentData || typeof percentData !== 'object') {
    return [];
  }

  const data: { name: string; value: number }[] = [];

  // 动态处理所有字段，严格验证
  Object.entries(percentData).forEach(([key, value]) => {
    // 严格验证：必须是数字且大于0
    if (value !== null && value !== undefined && typeof value === 'number' && value > 0) {
      const name = NUTRITION_NAME_MAP[key] || key;
      data.push({ name, value });
    }
  });

  if (data.length === 0) {
    return [];
  }

  const chartData = data.map((item, index) => ({
    name: item.name,
    population: parseFloat(item.value.toFixed(1)),
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));

  return chartData;
}

export function NutritionChartSection({ percentData }: NutritionChartSectionProps) {
  // 数据验证
  if (!percentData || typeof percentData !== 'object' || Object.keys(percentData).length === 0) {
    return null;
  }

  const chartData = preparePieChartData(percentData);
  if (chartData.length === 0) {
    return null;
  }

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
            hasLegend={true}
            avoidFalseZero
          />
        </YStack>
      </YStack>
    </Card>
  );
}
