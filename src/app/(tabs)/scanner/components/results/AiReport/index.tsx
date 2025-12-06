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
import { supabaseAdditiveService } from '@/src/lib/supabase';
import { searchService, type GenerateReportResponse } from '@/src/services/api';
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
  isAdmin?: boolean; // 是否为管理员用户
  hasExistingReport?: boolean; // 猫粮是否已有报告
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
  isAdmin = false,
  hasExistingReport = false,
}: AiReportDetailProps) {
  const insets = useSafeAreaInsets();
  const [selectedAdditive, setSelectedAdditive] = useState<any>(null);
  const [baikeInfo, setBaikeInfo] = useState<{ title: string; extract: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  // 处理添加剂点击 - 同时查询数据库和百度百科
  const handleAdditiveClick = useCallback(async (additiveName: string) => {
    try {
      setLoadingItem(additiveName);

      // 并行调用两个接口
      const [dbResponse, baikeResponse] = await Promise.allSettled([
        supabaseAdditiveService.searchAdditive(additiveName),
        searchService.searchBaike({ ingredient: additiveName }),
      ]);

      let hasData = false;

      // 处理数据库结果
      if (
        dbResponse.status === 'fulfilled' &&
        dbResponse.value.data &&
        dbResponse.value.data.additive
      ) {
        setSelectedAdditive(dbResponse.value.data.additive);
        hasData = true;
      } else {
        setSelectedAdditive(null);
      }

      // 处理百度百科结果
      if (
        baikeResponse.status === 'fulfilled' &&
        baikeResponse.value.ok &&
        baikeResponse.value.extract
      ) {
        setBaikeInfo({
          title: baikeResponse.value.title || additiveName,
          extract: baikeResponse.value.extract,
        });
        hasData = true;
      } else {
        setBaikeInfo(null);
      }

      if (hasData) {
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

  // 处理成分点击 - 同时查询数据库和百度百科
  const handleIngredientClick = useCallback(async (ingredientName: string) => {
    try {
      setLoadingItem(ingredientName);

      // 并行调用两个接口
      const [dbResponse, baikeResponse] = await Promise.allSettled([
        supabaseAdditiveService.searchIngredient(ingredientName),
        searchService.searchBaike({ ingredient: ingredientName }),
      ]);

      let hasData = false;

      // 处理数据库结果
      if (
        dbResponse.status === 'fulfilled' &&
        dbResponse.value.data &&
        dbResponse.value.data.ingredient
      ) {
        const ingredient = dbResponse.value.data.ingredient;
        const additive = {
          name: ingredient.name,
          type: ingredient.type,
          applicable_range: ingredient.desc,
        };
        setSelectedAdditive(additive);
        hasData = true;
      } else {
        setSelectedAdditive(null);
      }

      // 处理百度百科结果
      if (
        baikeResponse.status === 'fulfilled' &&
        baikeResponse.value.ok &&
        baikeResponse.value.extract
      ) {
        setBaikeInfo({
          title: baikeResponse.value.title || ingredientName,
          extract: baikeResponse.value.extract,
        });
        hasData = true;
      } else {
        setBaikeInfo(null);
      }

      if (hasData) {
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

  // 使用动态 percent_data
  // 验证数据完整性
  const hasActualNutritionData =
    report.percentage === true &&
    report.percent_data &&
    typeof report.percent_data === 'object' &&
    Object.keys(report.percent_data).length > 0;

  // 只有当有实际营养数据时才使用 percentData
  const percentData = hasActualNutritionData ? report.percent_data : null;

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

      {/* 详情弹窗 - 复用report页面组件，并添加百度百科信息 */}
      <AdditiveDetailModal
        visible={modalVisible}
        additive={selectedAdditive}
        baikeInfo={baikeInfo}
        onClose={() => {
          setModalVisible(false);
          setSelectedAdditive(null);
          setBaikeInfo(null);
        }}
      />
    </>
  );
}
