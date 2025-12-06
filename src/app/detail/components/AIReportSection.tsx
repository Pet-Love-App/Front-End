/**
 * AI 报告嵌入式展示组件
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { supabaseAdditiveService, type Additive } from '@/src/lib/supabase';
import type { AIReportData } from '@/src/services/api';
import { useState } from 'react';
import { Alert, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card, H4, H5, Separator, Spinner, Text, XStack, YStack } from 'tamagui';
import { AdditiveDetailModal } from './AdditiveDetailModal';

interface AIReportSectionProps {
  /** AI 报告数据 */
  report: AIReportData;
  /** 是否正在加载 */
  isLoading?: boolean;
}

/**
 * AI 报告内容展示板块
 */
export function AIReportSection({ report, isLoading }: AIReportSectionProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  const [selectedItem, setSelectedItem] = useState<Additive | null>(null);
  const [baikeInfo, setBaikeInfo] = useState<{ title: string; extract: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  if (isLoading) {
    return (
      <Card
        size="$4"
        bordered
        backgroundColor="$background"
        marginHorizontal="$3"
        marginBottom="$3"
      >
        <Card.Header>
          <YStack alignItems="center" paddingVertical="$4">
            <Spinner size="large" color={colors.tint} />
            <Text fontSize="$3" color="$gray10" marginTop="$2">
              正在加载 AI 分析报告...
            </Text>
          </YStack>
        </Card.Header>
      </Card>
    );
  }

  if (!report) {
    return null;
  }

  // 处理点击添加剂
  const handleAdditivePress = async (additiveName: string) => {
    setIsLoadingDetail(true);
    setSelectedItem(null);
    setBaikeInfo(null);
    setModalVisible(true);

    try {
      // 并行获取数据库信息和百度百科信息
      const [additiveResult, baikeResult] = await Promise.allSettled([
        supabaseAdditiveService.searchAdditive(additiveName),
        // getIngredientInfo 仍然使用 Django 后端（保护 API 密钥）
        // 暂时注释掉，需要单独处理
        Promise.resolve({ ok: false }),
      ]);

      // 处理添加剂数据库信息
      if (additiveResult.status === 'fulfilled') {
        const result = additiveResult.value;
        console.log('📥 添加剂搜索结果:', result);

        if (result.data) {
          const data = result.data;
          // 根据 Supabase 返回的数据结构处理
          if (
            data.matchType === 'exact' ||
            data.matchType === 'fuzzy' ||
            data.matchType === 'fuzzy_single'
          ) {
            // 单个结果
            if (data.additive) {
              setSelectedItem(data.additive);
            }
          } else if (data.matchType === 'multiple') {
            // 多个结果，取第一个
            if (data.additives && data.additives.length > 0) {
              setSelectedItem(data.additives[0]);
            }
          } else if (data.matchType === 'not_found') {
            // 未找到，创建一个基本对象
            setSelectedItem({
              id: 0, // 占位符ID，表示未找到
              name: additiveName,
              enName: '',
              type: '未分类',
              applicableRange: '暂无数据',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } else if (result.error) {
          console.error('❌ 添加剂搜索失败:', result.error);
          // 创建一个基本对象
          setSelectedItem({
            id: 0, // 占位符ID，表示未找到
            name: additiveName,
            enName: '',
            type: '未分类',
            applicableRange: '暂无数据',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 处理百度百科信息
      if (baikeResult.status === 'fulfilled') {
        const baikeData = baikeResult.value as { ok?: boolean; title?: string; extract?: string };
        console.log('📥 百度百科搜索结果:', baikeData);

        if (baikeData.ok && baikeData.extract) {
          setBaikeInfo({
            title: baikeData.title || additiveName,
            extract: baikeData.extract,
          });
        }
      } else {
        console.error('❌ 百度百科搜索失败:', baikeResult.reason);
      }
    } catch (error) {
      console.error('❌ 获取添加剂详情失败:', error);
      // 创建一个基本对象以显示错误信息
      setSelectedItem({
        id: 0, // 占位符ID，表示加载失败
        name: additiveName,
        enName: '',
        type: '加载失败',
        applicableRange: '请稍后重试',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // 处理点击营养成分
  const handleIngredientPress = (ingredientName: string) => {
    // 营养成分暂时使用 Alert
    Alert.alert('营养成分', `${ingredientName}\n\n营养成分详情功能开发中`);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setBaikeInfo(null);
  };

  // 获取营养成分占比数据
  // 验证数据完整性
  const hasNutritionData =
    report.percentage === true &&
    report.percent_data &&
    Object.keys(report.percent_data).length > 0;

  // 准备图表数据（仅在需要时）
  const chartData = hasNutritionData ? preparePieChartData(report.percent_data) : [];
  const hasValidChartData = chartData.length > 0;

  return (
    <Card
      size="$4"
      backgroundColor="white"
      marginHorizontal="$3"
      marginBottom="$3"
      borderRadius="$6"
      borderWidth={2}
      borderColor={colors.tint + '40'}
    >
      <Card.Header paddingBottom="$2">
        {/* 板块标题 */}
        <XStack alignItems="center" gap="$3" marginBottom="$3">
          <YStack
            backgroundColor={colors.tint + '20'}
            padding="$2.5"
            borderRadius="$4"
            borderWidth={2}
            borderColor={colors.tint + '50'}
          >
            <IconSymbol name="doc.text.fill" size={26} color={colors.tint} />
          </YStack>
          <YStack flex={1}>
            <H4 color="$gray12" fontWeight="800" letterSpacing={-0.4}>
              AI 智能分析报告
            </H4>
            <Text fontSize="$2" color="$gray10" marginTop="$1" fontWeight="500">
              基于配料表的深度分析
            </Text>
          </YStack>
        </XStack>

        <Separator borderColor="$borderColor" />
      </Card.Header>

      <YStack padding="$4" gap="$4">
        {/* 产品标签 */}
        {report.tags && report.tags.length > 0 && (
          <YStack gap="$2.5">
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="tag.fill" size={20} color={colors.tint} />
              <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
                产品特征
              </H5>
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {report.tags.map((tag: string, index: number) => (
                <YStack
                  key={index}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor="$blue3"
                  borderRadius="$4"
                  borderWidth={1.5}
                  borderColor="$blue7"
                >
                  <Text fontSize="$2" color="$blue11" fontWeight="600">
                    {tag}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}

        {/* 安全性分析 */}
        {report.safety && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$2.5">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="shield.fill" size={20} color="$green10" />
                <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
                  安全性分析
                </H5>
              </XStack>
              <YStack
                backgroundColor="$green2"
                padding="$4"
                borderRadius="$4"
                borderWidth={1.5}
                borderColor="$green6"
              >
                <Text fontSize="$3" color="$gray12" lineHeight={24} fontWeight="500">
                  {report.safety}
                </Text>
              </YStack>
            </YStack>
          </>
        )}

        {/* 营养分析 */}
        {report.nutrient && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$2.5">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="chart.bar.fill" size={20} color="$orange10" />
                <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
                  营养分析
                </H5>
              </XStack>
              <YStack
                backgroundColor="$orange2"
                padding="$4"
                borderRadius="$4"
                borderWidth={1.5}
                borderColor="$orange6"
              >
                <Text fontSize="$3" color="$gray12" lineHeight={24} fontWeight="500">
                  {report.nutrient}
                </Text>
              </YStack>
            </YStack>
          </>
        )}

        {/* 营养成分占比 */}
        {hasNutritionData && hasValidChartData && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="chart.pie.fill" size={20} color="$purple10" />
                <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
                  营养成分占比
                </H5>
              </XStack>

              {/* 饼图展示 */}
              <YStack alignItems="center" marginVertical="$3">
                <PieChart
                  data={chartData}
                  width={Dimensions.get('window').width - 64}
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

              {/* 进度条详细展示 */}
              {Object.entries(report.percent_data).map(([key, value], index) => {
                if (value === null || value === undefined) return null;

                // 营养成分名称映射
                const nameMap: Record<string, string> = {
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

                // 颜色映射
                const colorMap: Record<string, string> = {
                  protein: '$red9',
                  crude_protein: '$red9',
                  fat: '$orange9',
                  crude_fat: '$orange9',
                  carbohydrates: '$yellow9',
                  fiber: '$green9',
                  crude_fiber: '$green9',
                  ash: '$gray9',
                  crude_ash: '$gray9',
                  moisture: '$blue9',
                  others: '$purple9',
                };

                const label = nameMap[key] || key;
                const color = colorMap[key] || '$blue9';

                return <NutrientBar key={key} label={label} value={value} color={color} />;
              })}
            </YStack>
          </>
        )}

        {/* 营养成分占比缺失提示 */}
        {report.percentage === true && !hasValidChartData && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$2.5">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color="$orange10" />
                <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
                  营养成分占比
                </H5>
              </XStack>
              <YStack
                backgroundColor="$orange2"
                padding="$4"
                borderRadius="$4"
                borderWidth={1.5}
                borderColor="$orange6"
              >
                <Text fontSize="$3" color="$gray11" lineHeight={22} fontWeight="500">
                  该报告标记支持营养成分占比分析，但未包含具体数据。这可能是历史数据问题或AI分析未能提取到足够信息。
                </Text>
                <Text fontSize="$2" color="$gray10" marginTop="$2">
                  提示：可以重新生成报告以获取最新的营养分析数据
                </Text>
              </YStack>
            </YStack>
          </>
        )}

        {/* 识别的添加剂 */}
        {report.additives && report.additives.length > 0 && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="flask.fill" size={18} color="$purple10" />
                <H5 color="$gray12" fontWeight="600">
                  识别的添加剂
                </H5>
              </XStack>
              <XStack gap="$2" flexWrap="wrap">
                {report.additives.map((additive: string, index: number) => (
                  <YStack
                    key={index}
                    paddingHorizontal="$2.5"
                    paddingVertical="$1.5"
                    backgroundColor="$purple2"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor="$purple6"
                    pressStyle={{ opacity: 0.7, scale: 0.98 }}
                    cursor="pointer"
                    onPress={() => handleAdditivePress(additive)}
                  >
                    <Text fontSize="$2" color="$purple11">
                      {additive}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          </>
        )}

        {/* 识别的营养成分 */}
        {report.ingredients && report.ingredients.length > 0 && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="leaf.fill" size={18} color="$green10" />
                <H5 color="$gray12" fontWeight="600">
                  识别的营养成分
                </H5>
              </XStack>
              <XStack gap="$2" flexWrap="wrap">
                {report.ingredients.map((ingredient: string, index: number) => (
                  <YStack
                    key={index}
                    paddingHorizontal="$2.5"
                    paddingVertical="$1.5"
                    backgroundColor="$green2"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor="$green6"
                    pressStyle={{ opacity: 0.7, scale: 0.98 }}
                    cursor="pointer"
                    onPress={() => handleIngredientPress(ingredient)}
                  >
                    <Text fontSize="$2" color="$green11">
                      {ingredient}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          </>
        )}

        {/* 报告时间戳 */}
        <YStack marginTop="$2" paddingTop="$3" borderTopWidth={1} borderTopColor="$borderColor">
          <XStack alignItems="center" gap="$2">
            <IconSymbol name="clock.fill" size={14} color="$gray10" />
            <Text fontSize="$1" color="$gray10">
              报告生成于 {new Date(report.created_at).toLocaleString('zh-CN')}
            </Text>
          </XStack>
          {report.updated_at !== report.created_at && (
            <XStack alignItems="center" gap="$2" marginTop="$1">
              <IconSymbol name="arrow.clockwise" size={14} color="$gray10" />
              <Text fontSize="$1" color="$gray10">
                最后更新于 {new Date(report.updated_at).toLocaleString('zh-CN')}
              </Text>
            </XStack>
          )}
        </YStack>
      </YStack>

      {/* 添加剂详情弹窗 */}
      <AdditiveDetailModal
        visible={modalVisible}
        additive={selectedItem}
        baikeInfo={baikeInfo}
        onClose={handleCloseModal}
      />
    </Card>
  );
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

/**
 * 准备饼图数据
 */
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

/**
 * 营养成分进度条组件
 */
interface NutrientBarProps {
  label: string;
  value: number;
  color: string;
}

function NutrientBar({ label, value, color }: NutrientBarProps) {
  return (
    <YStack gap="$1.5">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" color="$gray11" fontWeight="600">
          {label}
        </Text>
        <Text fontSize="$5" color={color} fontWeight="800" letterSpacing={-0.5}>
          {value.toFixed(1)}%
        </Text>
      </XStack>
      <YStack
        height={10}
        backgroundColor="$gray3"
        borderRadius="$3"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack
          height="100%"
          width={`${Math.min(value, 100)}%`}
          backgroundColor={color}
          borderRadius="$3"
        />
      </YStack>
    </YStack>
  );
}
