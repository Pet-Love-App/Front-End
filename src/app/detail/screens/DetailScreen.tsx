import { CommentSection } from '@/src/components/Comments';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import {
  ActionBar,
  AdditiveDetailModal,
  AdditiveSection,
  AIReportSection,
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
          paddingTop: 8,
          paddingLeft: Math.max(8, insets.left),
          paddingRight: Math.max(8, insets.right),
          paddingBottom: 16,
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

        {/* AI 报告板块 - 如果有报告则显示（包含安全性、营养分析、添加剂、营养成分等） */}
        {hasReport && report && <AIReportSection report={report} isLoading={isLoadingReport} />}

        {/* 如果没有 AI 报告，则显示原始数据 */}
        {!hasReport && (
          <>
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
          </>
        )}

        {/* 评分区 */}
        {catFood && <RatingSection catfoodId={catFood.id} />}

        {/* 评论区 */}
        {catFood && <CommentSection targetType="catfood" targetId={catFood.id} />}

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
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: true,
        }}
      />

      <YStack flex={1} position="relative">
        {/* 背景渐变 */}
        <YStack position="absolute" width="100%" height="100%">
          <LinearGradient
            colors={['#FFF5F0', '#FFF9F5', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={{ width: '100%', height: '100%' }}
          />
        </YStack>

        {renderContent()}

        {/* 添加剂详情弹窗 */}
        <AdditiveDetailModal
          visible={modalVisible}
          additive={selectedAdditive}
          onClose={handleCloseModal}
        />

        {/* 底部操作栏：收藏和点赞 */}
        {catfoodId && <ActionBar catfoodId={catfoodId} />}
      </YStack>
    </>
  );
}
