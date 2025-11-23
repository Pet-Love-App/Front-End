import { CatFoodCard } from '@/src/components/CatFoodCard';
import SearchBox from '@/src/components/searchBox';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useAllCatFoods, useCatFoodStore } from '@/src/store/catFoodStore';
import type { CatFood } from '@/src/types/catFood';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Separator, Tabs, Text, XStack, YStack } from 'tamagui';
import { TopRankingSwiper } from './_components/TopRankingSwiper';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'likes'>('score'); // 排序方式
  const [selectedBrand, setSelectedBrand] = useState<string>('all'); // 选中的品牌
  const [brandMenuExpanded, setBrandMenuExpanded] = useState(false); // 品牌菜单展开状态

  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const { catfoods, isLoading, hasMore } = useAllCatFoods();
  const fetchCatFoods = useCatFoodStore((state) => state.fetchCatFoods);
  const isRefreshing = useCatFoodStore((state) => state.isRefreshing);
  const isLoadingMore = useCatFoodStore((state) => state.isLoadingMore);
  const pagination = useCatFoodStore((state) => state.pagination);

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');

  // 图片预览相关状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  // 获取所有品牌列表 - 使用 useMemo 优化性能
  const brandList = useMemo(() => {
    const brands = new Set<string>();
    catfoods.forEach((catfood) => {
      if (catfood.brand && catfood.brand.trim()) {
        brands.add(catfood.brand);
      }
    });
    return ['all', ...Array.from(brands).sort()];
  }, [catfoods]);

  // 获取每个品牌的猫粮数量
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { all: catfoods.length };
    catfoods.forEach((catfood) => {
      const brand = catfood.brand || '未知品牌';
      counts[brand] = (counts[brand] || 0) + 1;
    });
    return counts;
  }, [catfoods]);

  // 搜索、品牌筛选和排序逻辑 - 使用 useMemo 优化性能
  const filteredCatFoods = useMemo(() => {
    let result = catfoods;

    // 品牌过滤
    if (selectedBrand !== 'all') {
      result = result.filter((catfood) => catfood.brand === selectedBrand);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((catfood) => {
        // 搜索猫粮名称
        if (catfood.name.toLowerCase().includes(query)) {
          return true;
        }
        // 搜索品牌
        if (catfood.brand.toLowerCase().includes(query)) {
          return true;
        }
        // 搜索标签
        if (catfood.tags && catfood.tags.some((tag) => tag.toLowerCase().includes(query))) {
          return true;
        }
        return false;
      });
    }

    // 排序
    return [...result].sort((a, b) => {
      if (sortBy === 'likes') {
        // 按点赞数排序（降序）
        return (b.like_count || 0) - (a.like_count || 0);
      } else {
        // 按评分排序（降序）
        return b.score - a.score;
      }
    });
  }, [catfoods, searchQuery, sortBy, selectedBrand]);

  // 轮播图显示的前5名猫粮
  const topCatFoods = useMemo(() => {
    // 只在未搜索且未筛选品牌时显示轮播图
    if (!searchQuery.trim() && selectedBrand === 'all') {
      return filteredCatFoods.slice(0, 5);
    }
    return [];
  }, [filteredCatFoods, searchQuery, selectedBrand]);

  // 列表显示的猫粮（排除轮播图中的前5名）
  const listCatFoods = useMemo(() => {
    // 如果有轮播图，则从第6名开始显示
    if (topCatFoods.length > 0) {
      return filteredCatFoods.slice(5);
    }
    // 如果没有轮播图（有搜索或品牌筛选），显示全部
    return filteredCatFoods;
  }, [filteredCatFoods, topCatFoods]);

  // 处理搜索输入
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 选择品牌
  const handleSelectBrand = useCallback((brand: string) => {
    setSelectedBrand(brand);
    setBrandMenuExpanded(false); // 选择后自动收起
  }, []);

  // 切换品牌菜单展开状态
  const toggleBrandMenu = useCallback(() => {
    setBrandMenuExpanded((prev) => !prev);
  }, []);

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
  const renderCatFoodCard = ({ item, index }: { item: CatFood; index: number }) => {
    // 如果有轮播图（前5名），列表从第6名开始显示
    const displayIndex = topCatFoods.length > 0 ? index + 5 : index;

    return (
      <CatFoodCard
        catfood={item}
        index={displayIndex}
        onPress={handleCatFoodPress}
        onImagePress={handleImagePress}
      />
    );
  };

  // 渲染列表头部（轮播图和搜索框）
  const renderHeader = () => {
    return (
      <>
        {/* 热门推荐轮播图 */}
        {topCatFoods.length > 0 && (
          <TopRankingSwiper data={topCatFoods} topCount={5} onPress={handleCatFoodPress} />
        )}

        {/* 搜索框和筛选 */}
        <YStack
          paddingHorizontal="$4"
          paddingTop="$3"
          paddingBottom="$2"
          backgroundColor="white"
          borderBottomWidth={1}
          borderBottomColor="$gray3"
        >
          <SearchBox
            value={searchQuery}
            onChangeText={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="搜索猫粮名称、品牌或标签..."
            size="$4"
          />

          {/* 品牌筛选器 - 可展开 */}
          <YStack marginTop="$3" gap="$2">
            {/* 品牌选择按钮 */}
            <Button
              size="$4"
              backgroundColor="white"
              borderWidth={1}
              borderColor="$gray4"
              onPress={toggleBrandMenu}
              pressStyle={{ scale: 0.98, backgroundColor: '$gray2' }}
              icon={
                <YStack
                  width={32}
                  height={32}
                  backgroundColor="$orange3"
                  borderRadius="$10"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="building.2.fill" size={16} color="$orange10" />
                </YStack>
              }
              iconAfter={
                <IconSymbol
                  name={brandMenuExpanded ? 'chevron.up' : 'chevron.down'}
                  size={16}
                  color="$gray10"
                />
              }
            >
              <XStack flex={1} alignItems="center" gap="$2">
                <Text fontSize="$3" color="$gray11" fontWeight="600">
                  品牌筛选:
                </Text>
                <Text fontSize="$3" color="$orange11" fontWeight="700">
                  {selectedBrand === 'all' ? '全部品牌' : selectedBrand}
                </Text>
                {selectedBrand !== 'all' && (
                  <Text fontSize="$2" color="$gray9">
                    ({brandCounts[selectedBrand] || 0} 个)
                  </Text>
                )}
              </XStack>
            </Button>

            {/* 展开的品牌列表 */}
            {brandMenuExpanded && (
              <YStack
                backgroundColor="white"
                borderWidth={1}
                borderColor="$gray4"
                borderRadius="$4"
                padding="$3"
                gap="$2"
                maxHeight={300}
              >
                <ScrollView showsVerticalScrollIndicator={true}>
                  <YStack gap="$2">
                    {brandList.map((brand) => (
                      <Button
                        key={brand}
                        size="$3"
                        backgroundColor={selectedBrand === brand ? '$orange9' : '$gray2'}
                        borderWidth={1}
                        borderColor={selectedBrand === brand ? '$orange10' : '$gray4'}
                        onPress={() => handleSelectBrand(brand)}
                        pressStyle={{ scale: 0.98 }}
                        justifyContent="space-between"
                      >
                        <XStack alignItems="center" gap="$2" flex={1}>
                          {brand === 'all' ? (
                            <IconSymbol
                              name="square.grid.2x2.fill"
                              size={14}
                              color={selectedBrand === brand ? 'white' : '$gray11'}
                            />
                          ) : (
                            <IconSymbol
                              name="building.2"
                              size={14}
                              color={selectedBrand === brand ? 'white' : '$gray10'}
                            />
                          )}
                          <Text
                            fontSize="$3"
                            color={selectedBrand === brand ? 'white' : '$gray11'}
                            fontWeight={selectedBrand === brand ? '600' : '400'}
                            flex={1}
                            textAlign="left"
                          >
                            {brand === 'all' ? '全部品牌' : brand}
                          </Text>
                          <YStack
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            backgroundColor={
                              selectedBrand === brand ? 'rgba(255,255,255,0.2)' : '$gray4'
                            }
                            borderRadius="$10"
                          >
                            <Text
                              fontSize="$2"
                              color={selectedBrand === brand ? 'white' : '$gray11'}
                              fontWeight="600"
                            >
                              {brandCounts[brand] || 0}
                            </Text>
                          </YStack>
                        </XStack>
                      </Button>
                    ))}
                  </YStack>
                </ScrollView>
              </YStack>
            )}
          </YStack>

          {/* 排序和统计 */}
          <XStack marginTop="$3" alignItems="center" justifyContent="space-between">
            {/* 筛选结果统计 */}
            <XStack alignItems="center" gap="$2" flex={1}>
              {searchQuery.trim() || selectedBrand !== 'all' ? (
                <>
                  <Text fontSize="$2" color="$gray10">
                    找到 {filteredCatFoods.length} 个结果
                  </Text>
                  {filteredCatFoods.length > 0 && catfoods.length > 0 && (
                    <Text fontSize="$2" color="$gray9">
                      / 共 {catfoods.length} 个
                    </Text>
                  )}
                </>
              ) : (
                <Text fontSize="$2" color="$gray10">
                  共 {filteredCatFoods.length} 个猫粮
                </Text>
              )}
            </XStack>

            {/* 排序切换 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize="$2" color="$gray10">
                排序:
              </Text>
              <Button
                size="$2"
                paddingHorizontal="$3"
                backgroundColor={sortBy === 'score' ? '$blue9' : '$gray4'}
                borderWidth={0}
                onPress={() => setSortBy('score')}
                pressStyle={{ scale: 0.95 }}
              >
                <XStack alignItems="center" gap="$1">
                  <IconSymbol
                    name="star.fill"
                    size={12}
                    color={sortBy === 'score' ? 'white' : '$gray10'}
                  />
                  <Text
                    fontSize="$2"
                    color={sortBy === 'score' ? 'white' : '$gray11'}
                    fontWeight={sortBy === 'score' ? '600' : '400'}
                  >
                    评分
                  </Text>
                </XStack>
              </Button>
              <Button
                size="$2"
                paddingHorizontal="$3"
                backgroundColor={sortBy === 'likes' ? '$red9' : '$gray4'}
                borderWidth={0}
                onPress={() => setSortBy('likes')}
                pressStyle={{ scale: 0.95 }}
              >
                <XStack alignItems="center" gap="$1">
                  <IconSymbol
                    name="heart.fill"
                    size={12}
                    color={sortBy === 'likes' ? 'white' : '$gray10'}
                  />
                  <Text
                    fontSize="$2"
                    color={sortBy === 'likes' ? 'white' : '$gray11'}
                    fontWeight={sortBy === 'likes' ? '600' : '400'}
                  >
                    点赞
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </XStack>
        </YStack>
      </>
    );
  };

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

    // 如果是搜索结果为空
    if (searchQuery.trim()) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
          <IconSymbol name="magnifyingglass" size={64} color="$gray9" />
          <Text fontSize="$6" fontWeight="600" marginTop="$4" color="$gray11">
            未找到相关结果
          </Text>
          <Text fontSize="$3" color="$gray10" marginTop="$2" textAlign="center">
            试试其他关键词吧
          </Text>
        </YStack>
      );
    }

    // 如果列表为空但有轮播图（说明只有5个或更少猫粮）
    if (topCatFoods.length > 0 && listCatFoods.length === 0) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
          <IconSymbol name="checkmark.circle.fill" size={64} color="$green9" />
          <Text fontSize="$6" fontWeight="600" marginTop="$4" color="$gray11">
            已显示全部结果
          </Text>
          <Text fontSize="$3" color="$gray10" marginTop="$2" textAlign="center">
            以上是热门推荐的全部猫粮
          </Text>
        </YStack>
      );
    }

    // 原始空状态
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <IconSymbol name="tray.fill" size={64} color="$gray9" />
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
    <YStack flex={1} backgroundColor="$gray1">
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
            data={listCatFoods}
            renderItem={renderCatFoodCard}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: Math.max(10, insets.bottom) }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            onEndReached={searchQuery.trim() ? undefined : handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={searchQuery.trim() ? null : renderFooter}
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
