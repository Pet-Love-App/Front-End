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
  onSave?: () => void;
  onRetake?: () => void;
  onClose?: () => void;
  isSaving?: boolean;
  /** 是否为管理员用户 */
  isAdmin?: boolean;
  /** 猫粮是否已有报告 */
  hasExistingReport?: boolean;
}

export function AiReportDetail({
  report,
  onSave,
  onRetake,
  onClose,
  isSaving,
  isAdmin = false,
  hasExistingReport = false,
}: AiReportDetailProps) {
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

            {/* 自动保存提示 */}
            {onSave && (
              <YStack paddingHorizontal="$4" marginTop="$4">
                <YStack
                  backgroundColor="$green2"
                  padding="$3"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$green6"
                  alignItems="center"
                >
                  <XStack gap="$2" alignItems="center">
                    <Text fontSize="$5">✅</Text>
                    <Text fontSize="$4" color="$green11" fontWeight="600">
                      报告已自动保存到猫粮
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            )}

            {/* 操作按钮 */}
            <YStack paddingHorizontal="$4" marginTop="$4">
              <ActionButtons
                onSave={onSave}
                onRetake={onRetake}
                onClose={onClose}
                isSaving={isSaving}
                isAdmin={isAdmin}
                hasExistingReport={hasExistingReport}
              />
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
