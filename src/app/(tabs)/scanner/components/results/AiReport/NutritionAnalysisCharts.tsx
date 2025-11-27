/**
 * 营养分析图表组合组件 - 包含饼状图、柱状图和数据表格
 * 企业最佳实践：支持动态字段，适配新的 percent_data 结构
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Card, Text, XStack, YStack } from 'tamagui';

interface NutritionAnalysisChartsProps {
  data: Record<string, number | null>;
}

// 营养成分名称映射和颜色配置
const NUTRITION_CONFIG: Record<string, { name: string; color: string; icon: string }> = {
  protein: { name: '粗蛋白', color: '#E74C3C', icon: 'bolt.fill' },
  crude_protein: { name: '粗蛋白', color: '#E74C3C', icon: 'bolt.fill' },
  fat: { name: '粗脂肪', color: '#F39C12', icon: 'drop.fill' },
  crude_fat: { name: '粗脂肪', color: '#F39C12', icon: 'drop.fill' },
  carbohydrates: { name: '碳水化合物', color: '#3498DB', icon: 'leaf.fill' },
  fiber: { name: '粗纤维', color: '#2ECC71', icon: 'wind' },
  crude_fiber: { name: '粗纤维', color: '#2ECC71', icon: 'wind' },
  ash: { name: '粗灰分', color: '#9B59B6', icon: 'sparkles' },
  crude_ash: { name: '粗灰分', color: '#9B59B6', icon: 'sparkles' },
  moisture: { name: '水分', color: '#1ABC9C', icon: 'drop.fill' },
  others: { name: '其他', color: '#95A5A6', icon: 'ellipsis.circle.fill' },
};

// 默认颜色池（用于未知字段）
const DEFAULT_COLORS = ['#34495E', '#E67E22', '#16A085', '#C0392B', '#8E44AD'];

export function NutritionAnalysisCharts({ data }: NutritionAnalysisChartsProps) {
  console.log('📊 [NutritionAnalysisCharts] 接收到数据:', data);

  // 验证数据
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    console.warn('⚠️ [NutritionAnalysisCharts] 数据无效或为空');
    return (
      <Card
        padding="$4"
        marginHorizontal="$4"
        marginBottom="$3"
        backgroundColor="$background"
        borderRadius="$4"
        bordered
      >
        <YStack gap="$3" alignItems="center" paddingVertical="$4">
          <IconSymbol name="chart.bar.xaxis" size={48} color="$gray9" />
          <Text fontSize="$4" color="$gray10" textAlign="center">
            暂无营养成分数据
          </Text>
        </YStack>
      </Card>
    );
  }

  // 动态处理所有有效字段
  const validEntries = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && typeof value === 'number')
    .map(([key, value], index) => {
      const config = NUTRITION_CONFIG[key] || {
        name: key,
        color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        icon: 'circle.fill',
      };
      return { key, value: value as number, ...config };
    });

  console.log('✅ [NutritionAnalysisCharts] 有效数据数量:', validEntries.length);

  if (validEntries.length === 0) {
    console.warn('⚠️ [NutritionAnalysisCharts] 没有有效的数值数据');
    return (
      <Card
        padding="$4"
        marginHorizontal="$4"
        marginBottom="$3"
        backgroundColor="$background"
        borderRadius="$4"
        bordered
      >
        <YStack gap="$3" alignItems="center" paddingVertical="$4">
          <IconSymbol name="chart.bar.xaxis" size={48} color="$gray9" />
          <Text fontSize="$4" color="$gray10" textAlign="center">
            暂无营养成分数据
          </Text>
        </YStack>
      </Card>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  // 响应式图表配置 - 针对小屏幕优化
  const isSmallScreen = screenWidth < 380;
  const chartPadding = isSmallScreen ? 16 : 32;
  const chartWidth = screenWidth - chartPadding * 2; // 根据padding调整宽度

  // 饼图尺寸优化
  const pieChartHeight = isSmallScreen
    ? Math.min(240, screenWidth * 0.65) // 小屏幕：更紧凑
    : Math.min(280, screenWidth * 0.7); // 大屏幕：更舒展

  const pieChartPaddingLeft = isSmallScreen ? '10' : '20'; // 小屏幕减少左边距
  const pieLegendFontSize = isSmallScreen ? 10 : 12; // 小屏幕减小字体

  const barChartHeight = isSmallScreen ? 200 : 220;

  // 准备饼状图数据 - 只显示大于 0 的值
  const pieData = validEntries
    .filter((entry) => entry.value > 0)
    .map((entry) => ({
      name: entry.name,
      population: parseFloat(entry.value.toFixed(1)),
      color: entry.color,
      legendFontColor: '#555',
      legendFontSize: pieLegendFontSize, // 响应式字体大小
    }));

  console.log('📊 [NutritionAnalysisCharts] 饼图数据:', pieData);

  // 准备柱状图数据
  const barData = {
    labels: validEntries.map((entry) => entry.name),
    datasets: [
      {
        data: validEntries.map((entry) => entry.value),
        colors: validEntries.map((entry) => () => entry.color),
      },
    ],
  };

  return (
    <YStack gap="$3">
      {/* 饼状图卡片 - 只在有非零数据时显示 */}
      {pieData.length > 0 && (
        <Card
          padding="$4"
          marginHorizontal="$4"
          backgroundColor="white"
          borderRadius="$6"
          elevate
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={8}
        >
          <YStack gap="$4">
            <XStack alignItems="center" gap="$2.5">
              <YStack
                backgroundColor="$red2"
                padding="$2"
                borderRadius="$3"
                borderWidth={1.5}
                borderColor="$red6"
              >
                <IconSymbol name="chart.pie.fill" size={22} color="#E74C3C" />
              </YStack>
              <YStack flex={1}>
                <Text fontSize="$6" fontWeight="800" color="$gray12" letterSpacing={-0.3}>
                  营养成分占比
                </Text>
                <Text fontSize="$2" color="$gray10" marginTop="$1">
                  直观展示各成分比例
                </Text>
              </YStack>
            </XStack>

            <YStack alignItems="center" paddingVertical="$2">
              <PieChart
                data={pieData}
                width={chartWidth}
                height={pieChartHeight}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(60, 60, 67, ${opacity})`,
                  strokeWidth: 2,
                  decimalPlaces: 1,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
                center={[chartWidth / 4, 0]}
                absolute
                hasLegend={true}
                avoidFalseZero
                style={{
                  borderRadius: 16,
                }}
              />
            </YStack>

            {/* 数据摘要 */}
            <YStack
              backgroundColor="$gray2"
              padding="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$gray4"
            >
              <XStack justifyContent="space-around" flexWrap="wrap" gap="$2">
                {pieData.slice(0, 3).map((item, index) => (
                  <XStack key={index} alignItems="center" gap="$2">
                    <YStack
                      width={10}
                      height={10}
                      borderRadius="$10"
                      backgroundColor={item.color}
                    />
                    <Text fontSize="$2" color="$gray11" fontWeight="600">
                      {item.name} {item.population}%
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </YStack>
        </Card>
      )}

      {/* 柱状图卡片 */}
      <Card
        padding={isSmallScreen ? '$3' : '$4'}
        marginHorizontal={isSmallScreen ? '$3' : '$4'}
        backgroundColor="white"
        borderRadius="$6"
        elevate
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <YStack gap={isSmallScreen ? '$3' : '$4'}>
          <XStack alignItems="center" gap="$2.5">
            <YStack
              backgroundColor="$blue2"
              padding={isSmallScreen ? '$1.5' : '$2'}
              borderRadius="$3"
              borderWidth={1.5}
              borderColor="$blue6"
            >
              <IconSymbol name="chart.bar.fill" size={isSmallScreen ? 18 : 22} color="#3498DB" />
            </YStack>
            <YStack flex={1}>
              <Text
                fontSize={isSmallScreen ? '$5' : '$6'}
                fontWeight="800"
                color="$gray12"
                letterSpacing={-0.3}
              >
                营养成分对比
              </Text>
              <Text fontSize="$2" color="$gray10" marginTop="$1">
                各成分含量数值对比
              </Text>
            </YStack>
          </XStack>

          <YStack alignItems="center" paddingVertical={isSmallScreen ? '$1' : '$2'}>
            <BarChart
              data={barData}
              width={chartWidth}
              height={barChartHeight}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#f8f9fa',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(60, 60, 67, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '3,3',
                  stroke: '#e1e4e8',
                  strokeWidth: 1,
                },
                propsForLabels: {
                  fontSize: isSmallScreen ? 10 : 11,
                  fontWeight: '600',
                },
              }}
              withCustomBarColorFromData={true}
              flatColor={true}
              showBarTops={true}
              fromZero
              segments={4}
              style={{
                borderRadius: 16,
              }}
            />
          </YStack>
        </YStack>
      </Card>

      {/* 详细数据表格 */}
      <Card
        padding="$4"
        marginHorizontal="$4"
        backgroundColor="white"
        borderRadius="$6"
        elevate
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <YStack gap="$4">
          <XStack alignItems="center" gap="$2.5">
            <YStack
              backgroundColor="$green2"
              padding="$2"
              borderRadius="$3"
              borderWidth={1.5}
              borderColor="$green6"
            >
              <IconSymbol name="list.bullet.rectangle" size={22} color="#2ECC71" />
            </YStack>
            <YStack flex={1}>
              <Text fontSize="$6" fontWeight="800" color="$gray12" letterSpacing={-0.3}>
                营养成分详情
              </Text>
              <Text fontSize="$2" color="$gray10" marginTop="$1">
                精确数值数据表
              </Text>
            </YStack>
          </XStack>

          <YStack gap="$2.5">
            {validEntries.map((entry, index) => (
              <XStack
                key={entry.key}
                paddingVertical="$3.5"
                paddingHorizontal="$4"
                backgroundColor={index % 2 === 0 ? '$gray2' : 'white'}
                borderRadius="$4"
                alignItems="center"
                justifyContent="space-between"
                borderWidth={1}
                borderColor={index % 2 === 0 ? '$gray3' : '$gray2'}
              >
                <XStack gap="$3" alignItems="center" flex={1}>
                  <YStack
                    width={12}
                    height={12}
                    borderRadius="$10"
                    backgroundColor={entry.color}
                    borderWidth={2}
                    borderColor="white"
                    shadowColor={entry.color}
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.3}
                    shadowRadius={2}
                  />
                  <YStack backgroundColor={`${entry.color}15`} padding="$1.5" borderRadius="$2">
                    <IconSymbol name={entry.icon as any} size={16} color={entry.color} />
                  </YStack>
                  <Text fontSize="$4" color="$gray12" fontWeight="600">
                    {entry.name}
                  </Text>
                </XStack>

                <XStack gap="$1.5" alignItems="baseline">
                  <Text fontSize="$8" fontWeight="800" color={entry.color} letterSpacing={-0.5}>
                    {entry.value.toFixed(1)}
                  </Text>
                  <Text fontSize="$3" color="$gray10" fontWeight="600">
                    %
                  </Text>
                </XStack>
              </XStack>
            ))}
          </YStack>

          {/* 总计提示 */}
          <YStack
            paddingVertical="$3.5"
            paddingHorizontal="$4"
            marginTop="$2"
            backgroundColor="$blue2"
            borderRadius="$4"
            borderWidth={2}
            borderColor="$blue6"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$2" alignItems="center">
                <IconSymbol name="sum" size={18} color="#3498DB" />
                <Text fontSize="$4" color="$blue11" fontWeight="700">
                  总计
                </Text>
              </XStack>
              <XStack gap="$1.5" alignItems="baseline">
                <Text fontSize="$8" fontWeight="800" color="$blue11" letterSpacing={-0.5}>
                  {validEntries.reduce((sum, entry) => sum + entry.value, 0).toFixed(1)}
                </Text>
                <Text fontSize="$3" color="$blue10" fontWeight="600">
                  %
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  );
}
