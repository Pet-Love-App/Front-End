/**
 * 营养分析图表组合组件 - 包含饼状图、柱状图和数据表格
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Card, Text, XStack, YStack } from 'tamagui';

interface NutritionData {
  crude_protein: number | null;
  crude_fat: number | null;
  carbohydrates: number | null;
  crude_fiber: number | null;
  crude_ash: number | null;
  others: number | null;
}

interface NutritionAnalysisChartsProps {
  data: NutritionData;
}

// 营养成分配置
const NUTRITION_CONFIG = [
  { key: 'crude_protein', name: '粗蛋白', color: '#E74C3C', icon: 'bolt.fill', unit: '%' },
  { key: 'crude_fat', name: '粗脂肪', color: '#F39C12', icon: 'drop.fill', unit: '%' },
  { key: 'carbohydrates', name: '碳水', color: '#3498DB', icon: 'leaf.fill', unit: '%' },
  { key: 'crude_fiber', name: '粗纤维', color: '#2ECC71', icon: 'wind', unit: '%' },
  { key: 'crude_ash', name: '粗灰分', color: '#9B59B6', icon: 'sparkles', unit: '%' },
  { key: 'others', name: '其他', color: '#95A5A6', icon: 'ellipsis.circle.fill', unit: '%' },
] as const;

export function NutritionAnalysisCharts({ data }: NutritionAnalysisChartsProps) {
  // 过滤有效数据 - 只要不是 null 就显示（包括 0）
  const validData = NUTRITION_CONFIG.filter((config) => {
    const value = data[config.key];
    return value !== null && value !== undefined;
  });

  console.log('📈 图表组件数据:', {
    rawData: data,
    validDataCount: validData.length,
    validData: validData.map((v) => ({ name: v.name, value: data[v.key] })),
  });

  if (validData.length === 0) {
    console.log('⚠️ 没有有效的营养数据，显示空状态');
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

  // 准备饼状图数据 - 只显示大于 0 的值（饼图不能显示 0）
  const pieData = validData
    .filter((config) => (data[config.key] || 0) > 0)
    .map((config) => ({
      name: config.name,
      population: data[config.key] || 0,
      color: config.color,
      legendFontColor: '#666',
      legendFontSize: 13,
    }));

  // 准备柱状图数据
  const barData = {
    labels: validData.map((config) => config.name),
    datasets: [
      {
        data: validData.map((config) => data[config.key] || 0),
        colors: validData.map((config) => () => config.color),
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
          backgroundColor="$background"
          borderRadius="$4"
          bordered
        >
          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="chart.pie.fill" size={20} color="#E74C3C" />
              <Text fontSize="$6" fontWeight="700" color="$color">
                营养成分占比
              </Text>
            </XStack>

            <YStack alignItems="center" paddingVertical="$3">
              <PieChart
                data={pieData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
              />
            </YStack>
          </YStack>
        </Card>
      )}

      {/* 柱状图卡片 */}
      <Card
        padding="$4"
        marginHorizontal="$4"
        backgroundColor="$background"
        borderRadius="$4"
        bordered
      >
        <YStack gap="$3">
          <XStack alignItems="center" gap="$2">
            <IconSymbol name="chart.bar.fill" size={20} color="#3498DB" />
            <Text fontSize="$6" fontWeight="700" color="$color">
              营养成分对比
            </Text>
          </XStack>

          <YStack alignItems="center" paddingVertical="$3">
            <BarChart
              data={barData}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#e3e3e3',
                  strokeWidth: 1,
                },
              }}
              withCustomBarColorFromData={true}
              flatColor={true}
              showBarTops={false}
              fromZero
              segments={5}
            />
          </YStack>
        </YStack>
      </Card>

      {/* 详细数据表格 */}
      <Card
        padding="$4"
        marginHorizontal="$4"
        backgroundColor="$background"
        borderRadius="$4"
        bordered
      >
        <YStack gap="$3">
          <XStack alignItems="center" gap="$2">
            <IconSymbol name="list.bullet.rectangle" size={20} color="#2ECC71" />
            <Text fontSize="$6" fontWeight="700" color="$color">
              营养成分详情
            </Text>
          </XStack>

          <YStack gap="$2">
            {validData.map((config, index) => {
              const value = data[config.key];
              return (
                <XStack
                  key={config.key}
                  paddingVertical="$3"
                  paddingHorizontal="$3"
                  backgroundColor={index % 2 === 0 ? '$gray2' : '$background'}
                  borderRadius="$2"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <XStack gap="$2" alignItems="center" flex={1}>
                    <YStack
                      width={8}
                      height={8}
                      borderRadius="$10"
                      backgroundColor={config.color}
                    />
                    <IconSymbol name={config.icon as any} size={16} color={config.color} />
                    <Text fontSize="$4" color="$color" fontWeight="500">
                      {config.name}
                    </Text>
                  </XStack>

                  <XStack gap="$2" alignItems="baseline">
                    <Text fontSize="$7" fontWeight="700" color={config.color}>
                      {value?.toFixed(1)}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {config.unit}
                    </Text>
                  </XStack>
                </XStack>
              );
            })}
          </YStack>

          {/* 总计提示 */}
          <YStack paddingTop="$3" marginTop="$2" borderTopWidth={1} borderTopColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$gray10">
                总计
              </Text>
              <XStack gap="$2" alignItems="baseline">
                <Text fontSize="$6" fontWeight="700" color="$color">
                  {validData.reduce((sum, config) => sum + (data[config.key] || 0), 0).toFixed(1)}
                </Text>
                <Text fontSize="$3" color="$gray10">
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
