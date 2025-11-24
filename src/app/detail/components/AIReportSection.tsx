/**
 * AIReportSection Component
 *
 * AI 报告嵌入式展示组件
 * 企业最佳实践：
 * - 组件化：独立的 AI 报告展示板块
 * - 可复用：可在多个页面中使用
 * - 响应式：适配不同屏幕尺寸
 * - 性能优化：条件渲染，仅在有数据时加载
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { AIReportData } from '@/src/services/api';
import { useState } from 'react';
import { Alert } from 'react-native';
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

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  // 处理点击成分/添加剂
  const handleItemPress = (itemName: string, type: 'additive' | 'ingredient') => {
    // 简化版：显示名称
    // 完整版可以调用 API 查询详细信息
    Alert.alert(
      type === 'additive' ? '添加剂' : '营养成分',
      `${itemName}\n\n点击功能开发中，将显示详细信息`
    );
  };

  // 获取营养成分占比数据
  const hasNutritionData = report.percentage && report.percent_data;

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
        {hasNutritionData && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="chart.pie.fill" size={20} color="$purple10" />
                <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
                  营养成分占比
                </H5>
              </XStack>

              {report.percent_data.crude_protein !== null && (
                <NutrientBar
                  label="粗蛋白"
                  value={report.percent_data.crude_protein}
                  color="$red9"
                />
              )}

              {report.percent_data.crude_fat !== null && (
                <NutrientBar
                  label="粗脂肪"
                  value={report.percent_data.crude_fat}
                  color="$orange9"
                />
              )}

              {report.percent_data.carbohydrates !== null && (
                <NutrientBar
                  label="碳水化合物"
                  value={report.percent_data.carbohydrates}
                  color="$yellow9"
                />
              )}

              {report.percent_data.crude_fiber !== null && (
                <NutrientBar
                  label="粗纤维"
                  value={report.percent_data.crude_fiber}
                  color="$green9"
                />
              )}

              {report.percent_data.crude_ash !== null && (
                <NutrientBar label="粗灰分" value={report.percent_data.crude_ash} color="$gray9" />
              )}

              {report.percent_data.others !== null && (
                <NutrientBar label="其他成分" value={report.percent_data.others} color="$blue9" />
              )}
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
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => handleItemPress(additive, 'additive')}
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
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => handleItemPress(ingredient, 'ingredient')}
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

      {/* 详情弹窗 */}
      <AdditiveDetailModal
        visible={modalVisible}
        additive={selectedItem}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
      />
    </Card>
  );
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
