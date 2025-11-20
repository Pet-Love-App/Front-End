import { CommentSection } from '@/src/components/Comments';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import {
  ActionBar,
  AdditiveDetailModal,
  AdditiveSection,
  BasicInfoSection,
  EmptyState,
  LoadingState,
  NutrientAnalysisSection,
  NutritionChartSection,
  NutritionListSection,
  ReportHeader,
  SafetyAnalysisSection,
} from './_components';
interface Additive {
  name: string;
  type?: string;
  en_name?: string;
  applicable_range?: string;
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [selectedAdditive, setSelectedAdditive] = useState<Additive | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 从路由参数获取猫粮 ID
  const catfoodId = useMemo(() => (params.id ? Number(params.id) : null), [params.id]);

  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const fetchCatFoodById = useCatFoodStore((state) => state.fetchCatFoodById);
  const isLoading = useCatFoodStore((state) => state.isLoading);

  // 使用 useMemo 优化 selector，避免每次渲染都创建新函数
  const catFoodSelector = useCallback(
    (state: ReturnType<typeof useCatFoodStore.getState>) =>
      catfoodId ? state.getCatFoodById(catfoodId) : null,
    [catfoodId]
  );
  const catFood = useCatFoodStore(catFoodSelector);

  useEffect(() => {
    if (catfoodId && !catFood) {
      // 如果缓存中没有数据，则从服务器加载
      fetchCatFoodById(catfoodId).catch((error) => {
        console.error('加载猫粮详情失败:', error);
        Alert.alert('加载失败', '无法获取猫粮详情，请稍后重试');
      });
    }
  }, [catfoodId, catFood, fetchCatFoodById]);

  // 显示添加剂详情
  const handleAdditivePress = (additive: Additive) => {
    setSelectedAdditive(additive);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAdditive(null);
  };

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
          paddingLeft: Math.max(16, insets.left),
          paddingRight: Math.max(16, insets.right),
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
        }}
      />

      <YStack flex={1} backgroundColor="$background">
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
