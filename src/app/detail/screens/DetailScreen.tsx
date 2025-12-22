import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ScrollView, YStack } from 'tamagui';
import { CommentSection } from '@/src/components/Comments';
import { SkeletonAIReport } from '@/src/components/lazy';
import { useUserStore } from '@/src/store/userStore';
import { useLazyLoad } from '@/src/hooks';
import { toast } from '@/src/components/dialogs';

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
import { useAdditiveModal, useAIReport, useCatFoodDetail, useStreamingReport } from '../hooks';

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
  const {
    report,
    hasReport,
    isLoading: isLoadingReport,
    refetch: refetchReport,
  } = useAIReport(catfoodId);

  // 流式生成 hook
  const {
    state: streamingState,
    startStreaming,
    stopStreaming,
    reset: resetStreaming,
  } = useStreamingReport();

  // 用户信息（用于管理员权限检查）
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.isAdmin || false;

  // 懒加载控制：延迟渲染重型组件
  const { isReady: isAIReportReady } = useLazyLoad({ delay: 100 });
  const { isReady: isChartReady } = useLazyLoad({ delay: 200 });
  const { isReady: isCommentsReady } = useLazyLoad({ delay: 300 });

  /**
   * 构建配料表文本
   * 如果有已有报告，使用报告中的配料表文本
   * 否则使用猫粮的 ingredient 和 additive 生成
   */
  const getIngredientsText = useCallback(() => {
    // 优先使用已有报告的配料表文本
    if (report?.ingredients_text) {
      return report.ingredients_text;
    }

    // 从猫粮数据构建配料表文本
    if (catFood) {
      const ingredients = catFood.ingredient?.map((i) => i.name) || [];
      const additives = catFood.additive?.map((a) => a.name) || [];
      const combined = [...ingredients, ...additives];
      if (combined.length > 0) {
        return combined.join(', ');
      }
    }

    return '';
  }, [report, catFood]);

  /**
   * 开始生成 AI 报告
   */
  const handleGenerateReport = useCallback(async () => {
    if (!catfoodId) {
      toast.error('无法获取猫粮信息');
      return;
    }

    const ingredientsText = getIngredientsText();
    if (!ingredientsText) {
      toast.warning('没有可用的配料信息，无法生成报告');
      return;
    }

    try {
      await startStreaming(catfoodId, ingredientsText);
    } catch (error) {
      console.error('生成报告失败:', error);
    }
  }, [catfoodId, getIngredientsText, startStreaming]);

  /**
   * 停止生成
   */
  const handleStopGeneration = useCallback(() => {
    stopStreaming();
  }, [stopStreaming]);

  // 用 ref 记录上一次的完成状态，避免重复刷新
  const prevCompleteRef = useRef(false);

  /**
   * 监听流式完成状态，完成后刷新报告数据
   */
  useEffect(() => {
    // 检测从未完成变为已完成的状态变化
    if (streamingState.isComplete && !streamingState.error && !prevCompleteRef.current) {
      // 延迟刷新，确保数据已保存到数据库
      const timer = setTimeout(() => {
        refetchReport();
        resetStreaming();
      }, 1500);
      return () => clearTimeout(timer);
    }
    prevCompleteRef.current = streamingState.isComplete;
  }, [streamingState.isComplete, streamingState.error, refetchReport, resetStreaming]);

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
        testID="detail-scroll-view"
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
          likeCount={catFood.like_count || 0}
          catfoodId={catFood.id}
        />

        {/* AI 报告板块 - 支持流式生成和已有报告显示 */}
        {isAIReportReady ? (
          <>
            {/* 流式生成模式 */}
            {(streamingState.isStreaming || streamingState.isComplete) && (
              <AIReportSection streamingState={streamingState} onStopPress={handleStopGeneration} />
            )}

            {/* 已有报告模式 */}
            {hasReport && report && !streamingState.isStreaming && !streamingState.isComplete && (
              <AIReportSection
                report={report}
                isLoading={isLoadingReport}
                showGenerateButton={false}
              />
            )}

            {/* 无报告时显示生成按钮 */}
            {!hasReport && !streamingState.isStreaming && !streamingState.isComplete && (
              <AIReportSection
                showGenerateButton={true}
                isGenerating={false}
                onGeneratePress={handleGenerateReport}
              />
            )}
          </>
        ) : (
          <SkeletonAIReport />
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

      <View testID="catfood-detail-screen" style={{ flex: 1 }}>
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
      </View>
    </>
  );
}
