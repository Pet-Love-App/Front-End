import { CommentSection } from '@/src/components/Comments';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import {
  ActionBar,
  AdditiveDetailModal,
  AdditiveSection,
  AIReportButton,
  AIReportModal,
  BasicInfoSection,
  EmptyState,
  LoadingState,
  NutrientAnalysisSection,
  NutritionChartSection,
  NutritionListSection,
  RatingSection,
  ReportHeader,
  SafetyAnalysisSection,
} from '../components';
import { useAdditiveModal, useAIReport, useCatFoodDetail } from '../hooks';

/**
 * Detail 主屏幕组件
 * 显示猫粮的详细信息
 */
export function DetailScreen() {
  const insets = useSafeAreaInsets();

  // 使用自定义 hooks
  const { catfoodId, catFood, isLoading } = useCatFoodDetail();
  const { selectedAdditive, modalVisible, handleAdditivePress, handleCloseModal } =
    useAdditiveModal();

  // AI 报告相关
  const { report, hasReport, isLoading: isLoadingReport } = useAIReport(catfoodId);
  const [showReportModal, setShowReportModal] = useState(false);

  // 渲染内容
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (!catFood) {
      return <EmptyState />;
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingLeft: Math.max(12, insets.left),
          paddingRight: Math.max(12, insets.right),
        }}
      >
        {/* 头部信息 */}
        <ReportHeader name={catFood.name} tags={catFood.tags || []} imageUrl={catFood.imageUrl} />

        {/* 基本信息 */}
        <BasicInfoSection
          brand={catFood.brand}
          score={catFood.score}
          countNum={catFood.countNum}
          catfoodId={catFood.id}
        />

        {/* 安全性分析 */}
        {catFood.safety && <SafetyAnalysisSection safety={catFood.safety} />}

        {/* 营养分析 */}
        {catFood.nutrient && <NutrientAnalysisSection nutrient={catFood.nutrient} />}

        {/* 添加剂成分 */}
        {catFood.additive && catFood.additive.length > 0 && (
          <AdditiveSection additives={catFood.additive} onAdditivePress={handleAdditivePress} />
        )}

        {/* 营养成分分析图表 */}
        {catFood.percentage && catFood.percentData && (
          <NutritionChartSection percentData={catFood.percentData} />
        )}

        {/* 营养成分详情列表 */}
        {catFood.ingredient && catFood.ingredient.length > 0 && (
          <NutritionListSection ingredients={catFood.ingredient} />
        )}

        {/* 评分区 */}
        {catFood && <RatingSection catfoodId={catFood.id} />}

        {/* 评论区 */}
        {catFood && <CommentSection targetType="catfood" targetId={catFood.id} />}

        {/* AI 报告按钮 */}
        {catfoodId && (
          <YStack paddingHorizontal="$3" marginTop="$4" marginBottom="$3">
            <AIReportButton
              hasReport={hasReport}
              isLoading={isLoadingReport}
              onPress={() => setShowReportModal(true)}
            />
          </YStack>
        )}

        {/* 底部安全区间距 */}
        <YStack height={Math.max(24, insets.bottom + 16)} />
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '猫粮详情',
          headerBackTitle: '返回',
          headerBackVisible: true,
        }}
      />

      <YStack flex={1} backgroundColor="$gray1">
        {renderContent()}

        {/* 添加剂详情弹窗 */}
        <AdditiveDetailModal
          visible={modalVisible}
          additive={selectedAdditive}
          onClose={handleCloseModal}
        />

        {/* AI 报告详情弹窗 */}
        <AIReportModal
          visible={showReportModal}
          report={report}
          onClose={() => setShowReportModal(false)}
        />

        {/* 底部操作栏：收藏和点赞 */}
        {catfoodId && <ActionBar catfoodId={catfoodId} />}
      </YStack>
    </>
  );
}
