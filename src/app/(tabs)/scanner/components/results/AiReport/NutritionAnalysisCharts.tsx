/**
 * 营养分析图表组合组件 - 包含饼状图、柱状图和数据表格
 */
import { Dimensions, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface NutritionAnalysisChartsProps {
  data: Record<string, number | null>;
}

// 营养成分名称映射和颜色配置 - 使用更现代的配色方案
const NUTRITION_CONFIG: Record<string, { name: string; color: string; icon: string }> = {
  protein: { name: '粗蛋白', color: '#FF6B6B', icon: 'bolt.fill' },
  crude_protein: { name: '粗蛋白', color: '#FF6B6B', icon: 'bolt.fill' },
  fat: { name: '粗脂肪', color: '#FFB347', icon: 'drop.fill' },
  crude_fat: { name: '粗脂肪', color: '#FFB347', icon: 'drop.fill' },
  carbohydrates: { name: '碳水化合物', color: '#4ECDC4', icon: 'leaf.fill' },
  fiber: { name: '粗纤维', color: '#45B7D1', icon: 'wind' },
  crude_fiber: { name: '粗纤维', color: '#45B7D1', icon: 'wind' },
  ash: { name: '粗灰分', color: '#A06CD5', icon: 'sparkles' },
  crude_ash: { name: '粗灰分', color: '#A06CD5', icon: 'sparkles' },
  moisture: { name: '水分', color: '#6BCB77', icon: 'drop.fill' },
  others: { name: '其他', color: '#95A5A6', icon: 'ellipsis.circle.fill' },
};

// 默认颜色池（用于未知字段）
const DEFAULT_COLORS = ['#5D5FEF', '#F093FB', '#F5576C', '#4FACFE', '#43E97B'];

export function NutritionAnalysisCharts({ data }: NutritionAnalysisChartsProps) {
  // 验证数据
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
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

  if (validEntries.length === 0) {
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

  // 响应式配置
  const isSmallScreen = screenWidth < 380;
  const chartPadding = isSmallScreen ? 24 : 32;
  const chartWidth = screenWidth - chartPadding * 2;

  // 饼图配置 - 纯净饼图，不带内置 legend
  const pieChartSize = Math.min(chartWidth * 0.55, 180); // 饼图直径
  const barChartHeight = isSmallScreen ? 200 : 220;

  // 柱状图动态宽度 - 根据数据项数量计算，确保每个柱子有足够空间
  const minBarWidth = 60; // 每个柱子最小宽度
  const dataCount = validEntries.length;
  const calculatedBarWidth = Math.max(chartWidth - 32, dataCount * minBarWidth + 60);
  const needsScroll = calculatedBarWidth > chartWidth - 32; // 是否需要滚动

  // 准备饼状图数据 - 只显示大于 0 的值，按值排序
  const pieData = validEntries
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((entry) => ({
      name: entry.name,
      population: parseFloat(entry.value.toFixed(1)),
      color: entry.color,
      legendFontColor: 'transparent', // 隐藏内置 legend
      legendFontSize: 0,
    }));

  // 计算总和用于百分比显示
  const totalValue = pieData.reduce((sum, item) => sum + item.population, 0);

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
    <YStack gap="$4">
      {/* 饼状图卡片 - 全新设计，图表和图例分离 */}
      {pieData.length > 0 && (
        <Card
          padding="$4"
          marginHorizontal="$4"
          backgroundColor="white"
          borderRadius="$6"
          elevate
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.08}
          shadowRadius={12}
        >
          <YStack gap="$4">
            {/* 标题 */}
            <XStack alignItems="center" gap="$3">
              <YStack
                backgroundColor="#FFF0F0"
                padding="$2.5"
                borderRadius="$4"
                borderWidth={1.5}
                borderColor="#FFD4D4"
              >
                <IconSymbol name="chart.pie.fill" size={24} color="#FF6B6B" />
              </YStack>
              <YStack flex={1}>
                <Text fontSize="$6" fontWeight="800" color="$gray12" letterSpacing={-0.3}>
                  营养成分占比
                </Text>
                <Text fontSize="$2" color="$gray9" marginTop={2}>
                  基于干物质计算
                </Text>
              </YStack>
            </XStack>

            {/* 饼图 + 自定义图例 横向布局 */}
            <XStack alignItems="center" justifyContent="space-between" gap="$3">
              {/* 左侧：饼图 */}
              <YStack alignItems="center" justifyContent="center" width={pieChartSize + 20}>
                <PieChart
                  data={pieData}
                  width={pieChartSize + 20}
                  height={pieChartSize}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: () => 'transparent',
                    strokeWidth: 0,
                    decimalPlaces: 1,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  center={[pieChartSize / 4, 0]}
                  absolute={false}
                  hasLegend={false}
                  avoidFalseZero
                />
              </YStack>

              {/* 右侧：自定义图例 */}
              <YStack flex={1} gap="$2">
                {pieData.map((item, index) => {
                  const percentage =
                    totalValue > 0 ? ((item.population / totalValue) * 100).toFixed(1) : '0';
                  return (
                    <XStack
                      key={index}
                      alignItems="center"
                      gap="$2"
                      paddingVertical="$1.5"
                      paddingHorizontal="$2"
                      backgroundColor={`${item.color}10` as any}
                      borderRadius="$3"
                    >
                      <YStack
                        width={12}
                        height={12}
                        borderRadius={6}
                        backgroundColor={item.color as any}
                        shadowColor={item.color as any}
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.4}
                        shadowRadius={3}
                      />
                      <Text
                        fontSize={13}
                        color="$gray11"
                        fontWeight="600"
                        flex={1}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text fontSize={14} color={item.color as any} fontWeight="800">
                        {item.population}%
                      </Text>
                    </XStack>
                  );
                })}
              </YStack>
            </XStack>

            {/* 底部统计摘要 */}
            <YStack
              backgroundColor="$gray1"
              padding="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$gray3"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$3" color="$gray10" fontWeight="600">
                  📊 数据来源：产品标签
                </Text>
                <XStack gap="$1" alignItems="baseline">
                  <Text fontSize="$5" fontWeight="800" color="$gray12">
                    {totalValue.toFixed(1)}
                  </Text>
                  <Text fontSize="$2" color="$gray9">
                    % 总计
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
        </Card>
      )}

      {/* 柱状图卡片 */}
      <Card
        padding="$4"
        marginHorizontal="$4"
        backgroundColor="white"
        borderRadius="$6"
        elevate
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.08}
        shadowRadius={12}
      >
        <YStack gap="$4">
          <XStack alignItems="center" gap="$3">
            <YStack
              backgroundColor="#E8F4FD"
              padding="$2.5"
              borderRadius="$4"
              borderWidth={1.5}
              borderColor="#B8DDFB"
            >
              <IconSymbol name="chart.bar.fill" size={24} color="#45B7D1" />
            </YStack>
            <YStack flex={1}>
              <Text fontSize="$6" fontWeight="800" color="$gray12" letterSpacing={-0.3}>
                含量对比分析
              </Text>
              <Text fontSize="$2" color="$gray9" marginTop={2}>
                各营养成分数值对比
              </Text>
            </YStack>
          </XStack>

          {/* 滑动提示 */}
          {needsScroll && (
            <XStack
              backgroundColor="#FEF3C7"
              padding="$2"
              borderRadius="$3"
              gap="$2"
              alignItems="center"
              marginBottom="$2"
            >
              <IconSymbol name="hand.draw.fill" size={16} color="#D97706" />
              <Text fontSize="$2" color="#92400E" fontWeight="600">
                👆 左右滑动查看全部数据
              </Text>
            </XStack>
          )}

          {/* 可滚动的柱状图容器 */}
          <YStack
            backgroundColor="$gray1"
            borderRadius="$4"
            marginHorizontal={-8}
            overflow="hidden"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={needsScroll}
              contentContainerStyle={{
                paddingVertical: 8,
                paddingHorizontal: 8,
              }}
              bounces={needsScroll}
              scrollEnabled={needsScroll}
            >
              <BarChart
                data={barData}
                width={calculatedBarWidth}
                height={barChartHeight}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#F8FAFC',
                  backgroundGradientTo: '#F8FAFC',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(69, 183, 209, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                  style: {
                    borderRadius: 12,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '4,4',
                    stroke: '#E2E8F0',
                    strokeWidth: 1,
                  },
                  propsForLabels: {
                    fontSize: 11,
                    fontWeight: '600',
                  },
                  barPercentage: 0.6,
                }}
                withCustomBarColorFromData={true}
                flatColor={true}
                showBarTops={true}
                showValuesOnTopOfBars={true}
                fromZero
                segments={4}
                style={{
                  borderRadius: 12,
                }}
              />
            </ScrollView>
          </YStack>

          {/* 图表说明 */}
          <XStack
            backgroundColor="#F0FDF4"
            padding="$2.5"
            borderRadius="$3"
            gap="$2"
            alignItems="center"
          >
            <IconSymbol name="info.circle.fill" size={16} color="#22C55E" />
            <Text fontSize="$2" color="#166534" flex={1}>
              柱状图高度表示各成分在产品中的百分比含量
              {needsScroll && '（共 ' + dataCount + ' 项数据）'}
            </Text>
          </XStack>
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
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.08}
        shadowRadius={12}
      >
        <YStack gap="$4">
          <XStack alignItems="center" gap="$3">
            <YStack
              backgroundColor="#ECFDF5"
              padding="$2.5"
              borderRadius="$4"
              borderWidth={1.5}
              borderColor="#A7F3D0"
            >
              <IconSymbol name="list.bullet.rectangle" size={24} color="#6BCB77" />
            </YStack>
            <YStack flex={1}>
              <Text fontSize="$6" fontWeight="800" color="$gray12" letterSpacing={-0.3}>
                营养成分详情
              </Text>
              <Text fontSize="$2" color="$gray9" marginTop={2}>
                精确数值一览
              </Text>
            </YStack>
          </XStack>

          {/* 表头 */}
          <XStack
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor="$gray2"
            borderRadius="$3"
          >
            <Text fontSize="$2" color="$gray10" fontWeight="700" flex={1}>
              成分名称
            </Text>
            <Text fontSize="$2" color="$gray10" fontWeight="700" width={80} textAlign="right">
              含量
            </Text>
            <Text fontSize="$2" color="$gray10" fontWeight="700" width={60} textAlign="right">
              占比
            </Text>
          </XStack>

          {/* 数据行 */}
          <YStack gap="$2">
            {validEntries.map((entry, index) => {
              const percentage =
                totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(0) : '0';
              return (
                <XStack
                  key={entry.key}
                  paddingVertical="$3"
                  paddingHorizontal="$3"
                  backgroundColor={index % 2 === 0 ? '$gray1' : 'white'}
                  borderRadius="$3"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$gray2"
                >
                  <XStack gap="$2.5" alignItems="center" flex={1}>
                    <YStack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={entry.color as any}
                    />
                    <YStack
                      backgroundColor={`${entry.color}15` as any}
                      padding="$1.5"
                      borderRadius="$2"
                    >
                      <IconSymbol name={entry.icon as any} size={14} color={entry.color} />
                    </YStack>
                    <Text fontSize="$3" color="$gray12" fontWeight="600">
                      {entry.name}
                    </Text>
                  </XStack>

                  <Text
                    fontSize="$4"
                    fontWeight="800"
                    color={entry.color as any}
                    width={80}
                    textAlign="right"
                  >
                    {entry.value.toFixed(1)}%
                  </Text>

                  <YStack
                    width={50}
                    height={6}
                    backgroundColor="$gray3"
                    borderRadius={3}
                    marginLeft="$2"
                    overflow="hidden"
                  >
                    <YStack
                      width={`${Math.min(parseFloat(percentage), 100)}%` as any}
                      height="100%"
                      backgroundColor={entry.color as any}
                      borderRadius={3}
                    />
                  </YStack>
                </XStack>
              );
            })}
          </YStack>

          {/* 总计行 */}
          <XStack
            paddingVertical="$3.5"
            paddingHorizontal="$3"
            marginTop="$1"
            backgroundColor="#EEF2FF"
            borderRadius="$4"
            borderWidth={2}
            borderColor="#C7D2FE"
            alignItems="center"
          >
            <XStack gap="$2" alignItems="center" flex={1}>
              <IconSymbol name="sum" size={18} color="#6366F1" />
              <Text fontSize="$4" color="#4338CA" fontWeight="700">
                总计
              </Text>
            </XStack>
            <Text fontSize="$6" fontWeight="800" color="#4338CA">
              {validEntries.reduce((sum, entry) => sum + entry.value, 0).toFixed(1)}%
            </Text>
          </XStack>

          {/* 数据说明 */}
          <YStack
            backgroundColor="#FFFBEB"
            padding="$3"
            borderRadius="$3"
            borderWidth={1}
            borderColor="#FDE68A"
          >
            <XStack gap="$2" alignItems="flex-start">
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F59E0B" />
              <YStack flex={1}>
                <Text fontSize="$2" color="#92400E" lineHeight={18}>
                  以上数据基于产品包装标注，实际含量可能因批次略有差异。建议结合猫咪实际情况选择合适的猫粮。
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  );
}
