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
import {
  searchAdditive,
  searchIngredient,
  searchService,
  type GenerateReportResponse,
} from '@/src/services/api';
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
  const [baikeInfo, setBaikeInfo] = useState<{ title: string; extract: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  // 处理添加剂点击 - 同时查询数据库和百度百科
  const handleAdditiveClick = useCallback(async (additiveName: string) => {
    try {
      setLoadingItem(additiveName);

      // 并行调用两个接口
      const [dbResponse, baikeResponse] = await Promise.allSettled([
        searchAdditive(additiveName),
        searchService.searchBaike({ ingredient: additiveName }),
      ]);

      let hasData = false;

      // 处理数据库结果
      if (dbResponse.status === 'fulfilled' && dbResponse.value.additive) {
        setSelectedAdditive(dbResponse.value.additive);
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
        searchIngredient(ingredientName),
        searchService.searchBaike({ ingredient: ingredientName }),
      ]);

      let hasData = false;

      // 处理数据库结果
      if (dbResponse.status === 'fulfilled' && dbResponse.value.ingredient) {
        const additive = {
          name: dbResponse.value.ingredient.name,
          type: dbResponse.value.ingredient.type,
          applicable_range: dbResponse.value.ingredient.desc,
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

  // 转换percentData格式 - 只显示有实际数据的营养成分
  // 注意：忽略 others 字段，因为它是计算值，当所有数据为 null 时会错误地显示 100%
  const hasActualNutritionData =
    (report.crude_protein !== null && report.crude_protein !== undefined) ||
    (report.crude_fat !== null && report.crude_fat !== undefined) ||
    (report.carbohydrates !== null && report.carbohydrates !== undefined) ||
    (report.crude_fiber !== null && report.crude_fiber !== undefined) ||
    (report.crude_ash !== null && report.crude_ash !== undefined);

  // 只有当有实际营养数据时才构建 percentData
  const percentData = hasActualNutritionData
    ? {
        crude_protein: report.crude_protein,
        crude_fat: report.crude_fat,
        carbohydrates: report.carbohydrates,
        crude_fiber: report.crude_fiber,
        crude_ash: report.crude_ash,
        others: report.others,
      }
    : null;

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
              <ActionButtons onRetake={onRetake} onClose={onClose} isSaving={isSaving} />
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
