import { CatFoodCard } from '@/src/components/CatFoodCard';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useAllCatFoods, useCatFoodStore } from '@/src/store/catFoodStore';
import type { CatFood } from '@/src/types/catFood';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Separator, Tabs, Text, XStack, YStack } from 'tamagui';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const { catfoods, isLoading, hasMore } = useAllCatFoods();
  const fetchCatFoods = useCatFoodStore((state) => state.fetchCatFoods);
  const isRefreshing = useCatFoodStore((state) => state.isRefreshing);
  const isLoadingMore = useCatFoodStore((state) => state.isLoadingMore);
  const pagination = useCatFoodStore((state) => state.pagination);

  // 图片预览相关状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  // 初始加载
  useEffect(() => {
    // 如果没有数据，则加载
    if (catfoods.length === 0 && !isLoading) {
      fetchCatFoods(1, true);
    }
  }, [catfoods.length, isLoading, fetchCatFoods]);

  // 下拉刷新
  const handleRefresh = async () => {
    await fetchCatFoods(1, true);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = pagination.all.page + 1;
      fetchCatFoods(nextPage, false);
    }
  };

  // 跳转到详情页
  const handleCatFoodPress = (catfood: CatFood) => {
    router.push({
      pathname: '/detail',
      params: { id: catfood.id },
    });
  };

  // 处理图片点击
  const handleImagePress = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setPreviewVisible(true);
  };

  // 关闭图片预览
  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewImageUrl('');
  };

  // 渲染猫粮卡片
  const renderCatFoodCard = ({ item, index }: { item: CatFood; index: number }) => (
    <CatFoodCard
      catfood={item}
      index={index}
      onPress={handleCatFoodPress}
      onImagePress={handleImagePress}
    />
  );

  // 渲染列表底部
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <YStack padding="$4" alignItems="center">
        <ActivityIndicator size="small" color="#666" />
        <Text fontSize="$2" color="$gray10" marginTop="$2">
          加载中...
        </Text>
      </YStack>
    );
  };

  // 渲染空状态
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <IconSymbol name="magnifyingglass" size={64} color="$gray9" />
        <Text fontSize="$6" fontWeight="600" marginTop="$4" color="$gray11">
          暂无数据
        </Text>
        <Text fontSize="$3" color="$gray10" marginTop="$2" textAlign="center">
          还没有猫粮信息哦
        </Text>
      </YStack>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 图片预览 Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
        statusBarTranslucent
      >
        <YStack
          flex={1}
          backgroundColor="rgba(0, 0, 0, 0.95)"
          justifyContent="center"
          alignItems="center"
          onPress={closePreview}
        >
          {/* 关闭按钮 */}
          <XStack position="absolute" top={50} right={20} zIndex={10}>
            <Button
              size="$4"
              circular
              icon={<IconSymbol name="xmark" size={24} color="white" />}
              backgroundColor="rgba(0, 0, 0, 0.6)"
              borderWidth={0}
              chromeless
              pressStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                scale: 0.95,
              }}
              onPress={closePreview}
            />
          </XStack>

          {/* 预览图片 */}
          {previewImageUrl && (
            <YStack flex={1} width="100%" justifyContent="center" alignItems="center" padding="$6">
              <Image
                source={{ uri: previewImageUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </YStack>
          )}
        </YStack>
      </Modal>

      {/* Tabs */}
      <Tabs
        defaultValue="all"
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        onValueChange={setActiveTab}
      >
        <Tabs.List paddingHorizontal="$4" backgroundColor="$background">
          <Tabs.Tab flex={1} value="all">
            <Text>全部猫粮</Text>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="highScore">
            <Text>高分推荐</Text>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="popular">
            <Text>热门</Text>
          </Tabs.Tab>
        </Tabs.List>

        <Separator />

        {/* 全部猫粮 Tab */}
        <Tabs.Content value="all" flex={1}>
          <FlatList
            data={catfoods}
            renderItem={renderCatFoodCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: Math.max(10, insets.bottom) }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        </Tabs.Content>

        {/* 高分推荐 Tab */}
        <Tabs.Content value="highScore" flex={1}>
          <ScrollView flex={1}>
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
              <IconSymbol name="chart.line.uptrend.xyaxis" size={64} color="$gray9" />
              <Text fontSize="$6" fontWeight="600" marginTop="$4" color="$gray11">
                高分推荐
              </Text>
              <Text fontSize="$3" color="$gray10" marginTop="$2" textAlign="center">
                即将上线
              </Text>
            </YStack>
          </ScrollView>
        </Tabs.Content>

        {/* 热门 Tab */}
        <Tabs.Content value="popular" flex={1}>
          <ScrollView flex={1}>
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
              <IconSymbol name="flame.fill" size={64} color="$gray9" />
              <Text fontSize="$6" fontWeight="600" marginTop="$4" color="$gray11">
                热门猫粮
              </Text>
              <Text fontSize="$3" color="$gray10" marginTop="$2" textAlign="center">
                即将上线
              </Text>
            </YStack>
          </ScrollView>
        </Tabs.Content>
      </Tabs>
    </YStack>
  );
}
