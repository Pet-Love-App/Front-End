import { CatFoodCard } from '@/src/components/CatFoodCard';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getCatFoods, type CatFood } from '@/src/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { ScrollView, Separator, Tabs, Text, YStack } from 'tamagui';

export default function RankingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [catfoods, setCatfoods] = useState<CatFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载猫粮数据
  const loadCatFoods = async (pageNum: number = 1, refresh: boolean = false) => {
    if (loading) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getCatFoods(pageNum, 20);

      // 确保响应数据有效
      if (response && Array.isArray(response.results)) {
        if (refresh || pageNum === 1) {
          setCatfoods(response.results);
        } else {
          setCatfoods((prev) => [...prev, ...response.results]);
        }

        setHasMore(response.next !== null);
        setPage(pageNum);
      } else {
        console.warn('响应数据格式异常:', response);
        // 如果是第一页或刷新，设置为空数组
        if (refresh || pageNum === 1) {
          setCatfoods([]);
        }
      }
    } catch (error) {
      console.error('加载猫粮失败:', error);
      // 出错时，如果是第一页或刷新，设置为空数组
      if (refresh || pageNum === 1) {
        setCatfoods([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadCatFoods(1);
  }, []);

  // 下拉刷新
  const handleRefresh = () => {
    loadCatFoods(1, true);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadCatFoods(page + 1);
    }
  };

  // 跳转到详情页
  const handleCatFoodPress = (catfood: CatFood) => {
    // router.push(`/catfood/${catfood.id}`);
    console.log('查看猫粮详情:', catfood.name);
  };

  // 渲染猫粮卡片
  const renderCatFoodCard = ({ item, index }: { item: CatFood; index: number }) => (
    <CatFoodCard catfood={item} index={index} onPress={handleCatFoodPress} />
  );

  // 渲染列表底部
  const renderFooter = () => {
    if (!loading) return null;
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
    if (loading) return null;
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
      {/* Tabs */}
      <Tabs
        defaultValue="all"
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        onValueChange={setActiveTab}
      >
        <Tabs.List
          separator={<Separator vertical />}
          paddingHorizontal="$4"
          backgroundColor="$background"
        >
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
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
