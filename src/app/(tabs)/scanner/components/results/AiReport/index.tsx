/**
 * AI 报告详情页面
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import {
  AdditiveDetailModal,
  NutrientAnalysisSection,
  SafetyAnalysisSection,
} from '@/src/app/detail/components';
import { hasValidNutritionData } from '@/src/constants/nutrition';
import type { GenerateReportResponse } from '@/src/services/api';
import { useItemDetail } from '@/src/hooks';

import { ActionButtons } from './ActionButtons';
import { IdentifiedItemsSection } from './IdentifiedItemsSection';
import { NutritionAnalysisCharts } from './NutritionAnalysisCharts';

export interface AiReportDetailProps {
  report: GenerateReportResponse;
  onRetake?: () => void;
  onClose?: () => void;
}

export function AiReportDetail({ report, onRetake, onClose }: AiReportDetailProps) {
  const insets = useSafeAreaInsets();

  const {
    item: selectedAdditive,
    baikeInfo,
    modalVisible,
    loadingItemName: loadingItem,
    fetchAdditive: handleAdditiveClick,
    fetchIngredient: handleIngredientClick,
    closeModal,
  } = useItemDetail();

  // 检查是否有有效营养数据
  const hasNutritionData = hasValidNutritionData(report.percentage, report.percent_data);
  const percentData = hasNutritionData ? report.percent_data : null;

  return (
    <>
      <YStack flex={1} backgroundColor="$background" paddingTop={insets.top + 20}>
        {/* 顶部标题栏 */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize="$7" fontWeight="bold">
            AI 分析报告
          </Text>
          {onClose && (
            <Button size="sm" variant="ghost" rounded onPress={onClose}>
              ✕
            </Button>
          )}
        </XStack>

        {/* 滚动内容区域 */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack paddingBottom={insets.bottom || 24}>
            {/* 安全性分析 */}
            <SafetyAnalysisSection safety={report.safety} />

            {/* 营养分析 */}
            <NutrientAnalysisSection nutrient={report.nutrient} />

            {/* 识别的添加剂 */}
            <IdentifiedItemsSection
              title="识别的添加剂"
              items={report.additives || []}
              type="additive"
              buttonColor="$orange3"
              loadingItem={loadingItem}
              onItemClick={handleAdditiveClick}
            />

            {/* 识别的营养成分 */}
            <IdentifiedItemsSection
              title="识别的营养成分"
              items={report.identified_nutrients || []}
              type="ingredient"
              buttonColor="$green3"
              loadingItem={loadingItem}
              onItemClick={handleIngredientClick}
            />

            {/* 营养成分分析图表（饼状图 + 柱状图 + 数据表格） */}
            {percentData && <NutritionAnalysisCharts data={percentData} />}

            {/* 操作按钮 */}
            <YStack paddingHorizontal="$4" marginTop="$4">
              <ActionButtons onRetake={onRetake} onClose={onClose} />
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>

      {/* 详情弹窗 */}
      <AdditiveDetailModal
        visible={modalVisible}
        additive={selectedAdditive}
        baikeInfo={baikeInfo}
        onClose={closeModal}
      />
    </>
  );
}
