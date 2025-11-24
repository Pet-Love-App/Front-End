/**
 * AI 报告详情页面 - 主组件
 *
 * 复用detail页面现有组件，保持一致性
 */
import {
  AdditiveDetailModal,
  NutrientAnalysisSection,
  SafetyAnalysisSection,
} from '@/src/app/detail/components';
import { searchAdditive, searchIngredient, type GenerateReportResponse } from '@/src/services/api';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';
import { ActionButtons } from './ActionButtons';
import { IdentifiedItemsSection } from './IdentifiedItemsSection';
import { NutritionAnalysisCharts } from './NutritionAnalysisCharts';

export interface AiReportDetailProps {
  report: GenerateReportResponse;
  onSave?: () => void;
  onRetake?: () => void;
  onClose?: () => void;
  isSaving?: boolean;
}

/**
 * AI 报告详情页面
 */
export function AiReportDetail({
  report,
  onSave,
  onRetake,
  onClose,
  isSaving,
}: AiReportDetailProps) {
  const insets = useSafeAreaInsets();
  const [selectedAdditive, setSelectedAdditive] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  // 处理添加剂点击
  const handleAdditiveClick = useCallback(async (additiveName: string) => {
    try {
      setLoadingItem(additiveName);
      const response = await searchAdditive(additiveName);

      if (response.additive) {
        setSelectedAdditive(response.additive);
        setModalVisible(true);
      } else {
        Alert.alert('提示', '未找到该添加剂的详细信息');
      }
    } catch (error) {
      console.error('查询添加剂失败:', error);
      Alert.alert('查询失败', '无法获取添加剂详情');
    } finally {
      setLoadingItem(null);
    }
  }, []);

  // 处理成分点击
  const handleIngredientClick = useCallback(async (ingredientName: string) => {
    try {
      setLoadingItem(ingredientName);
      const response = await searchIngredient(ingredientName);

      if (response.ingredient) {
        const additive = {
          name: response.ingredient.name,
          type: response.ingredient.type,
          applicable_range: response.ingredient.desc,
        };
        setSelectedAdditive(additive);
        setModalVisible(true);
      } else {
        Alert.alert('提示', '未找到该成分的详细信息');
      }
    } catch (error) {
      console.error('查询成分失败:', error);
      Alert.alert('查询失败', '无法获取成分详情');
    } finally {
      setLoadingItem(null);
    }
  }, []);

  // 转换percentData格式 - 只要有任何营养数据就显示图表
  // 修复：检查 !== null && !== undefined，避免误判
  const hasAnyNutritionData =
    (report.crude_protein !== null && report.crude_protein !== undefined) ||
    (report.crude_fat !== null && report.crude_fat !== undefined) ||
    (report.carbohydrates !== null && report.carbohydrates !== undefined) ||
    (report.crude_fiber !== null && report.crude_fiber !== undefined) ||
    (report.crude_ash !== null && report.crude_ash !== undefined) ||
    (report.others !== null && report.others !== undefined);

  const percentData = hasAnyNutritionData
    ? {
        crude_protein: report.crude_protein,
        crude_fat: report.crude_fat,
        carbohydrates: report.carbohydrates,
        crude_fiber: report.crude_fiber,
        crude_ash: report.crude_ash,
        others: report.others,
      }
    : null;

  // 调试信息
  console.log('📊 营养数据检查:', {
    hasAnyNutritionData,
    crude_protein: report.crude_protein,
    crude_fat: report.crude_fat,
    carbohydrates: report.carbohydrates,
    crude_fiber: report.crude_fiber,
    crude_ash: report.crude_ash,
    others: report.others,
    percentage: report.percentage,
  });

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
            <Button size="$3" circular chromeless onPress={onClose}>
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
              <ActionButtons
                onSave={onSave}
                onRetake={onRetake}
                onClose={onClose}
                isSaving={isSaving}
              />
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>

      {/* 详情弹窗 - 复用report页面组件 */}
      <AdditiveDetailModal
        visible={modalVisible}
        additive={selectedAdditive}
        onClose={() => {
          setModalVisible(false);
          setSelectedAdditive(null);
        }}
      />
    </>
  );
}
