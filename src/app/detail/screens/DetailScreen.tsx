import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ScrollView, YStack } from 'tamagui';
import { CommentSection } from '@/src/components/Comments';
import { SkeletonAIReport } from '@/src/components/lazy';
import { useUserStore } from '@/src/store/userStore';
import { useLazyLoad } from '@/src/hooks';

import {
  ActionBar,
  AdditiveDetailModal,
  AdditiveSection,
  AdminUpdatePrompt,
  AIReportSection,
  BasicInfoSection,
  EmptyState,
  LoadingState,
  NutrientAnalysisSection,
  NutritionChartSection,
  NutritionInputPrompt,
  NutritionListSection,
  RatingSection,
  ReportHeader,
  SafetyAnalysisSection,
} from '../components';
import { useAdditiveModal, useAIReport, useCatFoodDetail } from '../hooks';

/**
 * Detail 主屏幕组件
 * 显示猫粮的详细信息，支持懒加载
 */
export function DetailScreen() {
  const insets = useSafeAreaInsets();

  // 使用自定义 hooks
  const { catfoodId, catFood, isLoading } = useCatFoodDetail();
  const { selectedAdditive, modalVisible, handleAdditivePress, handleCloseModal } =
    useAdditiveModal();

  // AI 报告相关
  const { report, hasReport, isLoading: isLoadingReport } = useAIReport(catfoodId);

  // 用户信息（用于管理员权限检查）
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.isAdmin || false;

  // 懒加载控制：延迟渲染重型组件
  const { isReady: isAIReportReady } = useLazyLoad({ delay: 100 });
  const { isReady: isChartReady } = useLazyLoad({ delay: 200 });
  const { isReady: isCommentsReady } = useLazyLoad({ delay: 300 });

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
          paddingBottom: 100 + insets.bottom, // 为底部 ActionBar 留出空间
        }}
      >
        {/* 头部信息 - 优先渲染 */}
        <ReportHeader name={catFood.name} tags={catFood.tags || []} imageUrl={catFood.imageUrl} />

        {/* 基本信息 - 优先渲染 */}
        <BasicInfoSection
          brand={catFood.brand}
          score={catFood.score}
          countNum={catFood.countNum}
          catfoodId={catFood.id}
        />

        {/* AI 报告板块 - 懒加载 */}
        {hasReport && report && (
          <>
            {isAIReportReady ? (
              <AIReportSection report={report} isLoading={isLoadingReport} />
            ) : (
              <SkeletonAIReport />
            )}
          </>
        )}

        {/* 管理员更新提示 - 仅当有营养信息且用户是管理员时显示 */}
        {isAdmin && (hasReport || catFood.percentage) && (
          <AdminUpdatePrompt catfoodId={catFood.id} catfoodName={catFood.name} />
        )}

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

            {/* 营养成分分析图表 - 懒加载 */}
            {catFood.percentage && catFood.percentData && isChartReady && (
              <NutritionChartSection percentData={catFood.percentData} />
            )}

            {/* 营养成分详情列表 */}
            {catFood.ingredient && catFood.ingredient.length > 0 && (
              <NutritionListSection ingredients={catFood.ingredient} />
            )}

            {/* 如果缺少营养成分信息，显示录入提示 */}
            {(!catFood.ingredient || catFood.ingredient.length === 0) &&
              !catFood.percentage &&
              !catFood.safety &&
              !catFood.nutrient && (
                <NutritionInputPrompt catfoodId={catFood.id} catfoodName={catFood.name} />
              )}
          </>
        )}

        {/* 评分区 */}
        {catFood && <RatingSection catfoodId={catFood.id} />}

        {/* 评论区 - 懒加载 */}
        {catFood && isCommentsReady && (
          <CommentSection targetType="catfood" targetId={catFood.id} />
        )}
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
          headerShadowVisible: false,
        }}
      />

      <YStack flex={1} position="relative" backgroundColor="white">
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
