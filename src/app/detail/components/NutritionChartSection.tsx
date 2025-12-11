/**
 * 营养成分饼图 - 可视化展示各营养成分占比
 * 响应式设计，适配不同屏幕尺寸
 */
import { Dimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { neutralScale, successScale, primaryScale } from '@/src/design-system/tokens';

interface NutritionChartSectionProps {
  percentData: Record<string, number | null>;
}

// 专业饼图配色方案 - 柔和渐变色系
const CHART_COLORS = [
  '#FF7B54', // 橙红 - 蛋白质
  '#4CAF50', // 绿色 - 脂肪
  '#2196F3', // 蓝色 - 碳水
  '#FFC107', // 金黄 - 纤维
  '#9C27B0', // 紫色 - 灰分
  '#00BCD4', // 青色 - 水分
  '#E91E63', // 粉红 - 其他
  '#607D8B', // 灰蓝
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
    legendFontColor: neutralScale.neutral10,
    legendFontSize: 11,
  }));
}

export function NutritionChartSection({ percentData }: NutritionChartSectionProps) {
  const { width: screenWidth, isExtraSmallScreen, isSmallScreen } = useResponsiveLayout();

  if (!percentData || typeof percentData !== 'object' || Object.keys(percentData).length === 0) {
    return null;
  }

  const chartData = preparePieChartData(percentData);
  if (chartData.length === 0) return null;

  // 响应式尺寸计算
  const chartWidth = screenWidth - 32;
  const chartHeight = isExtraSmallScreen ? 180 : isSmallScreen ? 200 : 220;

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
          backgroundColor={successScale.success2}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="chart.pie.fill" size={22} color={successScale.success7} />
        </YStack>
        <YStack flex={1}>
          <Text fontSize="$5" fontWeight="700" color={neutralScale.neutral12}>
            营养成分分析
          </Text>
          <Text fontSize={11} color={neutralScale.neutral8} marginTop={2}>
            Nutrition Analysis
          </Text>
        </YStack>
      </XStack>

      {/* 图表区域 */}
      <YStack padding="$4" gap="$4">
        {/* 饼图 */}
        <View style={{ alignItems: 'center' }}>
          <PieChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: () => neutralScale.neutral10,
              strokeWidth: 2,
              decimalPlaces: 1,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[chartWidth / 4, 0]}
            absolute
            hasLegend={false}
          />
        </View>

        {/* 自定义图例 */}
        <YStack gap="$2" paddingTop="$2">
          <XStack flexWrap="wrap" gap="$2" justifyContent="center">
            {chartData.map((item, index) => (
              <XStack
                key={index}
                alignItems="center"
                gap="$2"
                backgroundColor={neutralScale.neutral1}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={20}
                borderWidth={1}
                borderColor={neutralScale.neutral3}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: item.color,
                  }}
                />
                <Text fontSize={12} fontWeight="600" color={neutralScale.neutral10}>
                  {item.name}
                </Text>
                <Text fontSize={12} fontWeight="700" color={primaryScale.primary9}>
                  {item.population}%
                </Text>
              </XStack>
            ))}
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
