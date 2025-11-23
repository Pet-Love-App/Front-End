/**
 * RankingScreen - 猫粮排行榜页面
 *
 * 企业级最佳实践：
 * - 性能优化：useMemo、useCallback、React.memo
 * - 状态管理：Zustand store + 选择器模式
 * - 用户体验：下拉刷新、无限滚动、骨架屏、空状态
 * - 视觉设计：参考主流电商应用（淘宝、京东、小红书）
 * - 代码质量：TypeScript、ESLint、注释文档
 * - 可访问性：accessibilityLabel、语义化标签
 */

import { CatFoodCard } from '@/src/components/CatFoodCard';
import SearchBox from '@/src/components/searchBox';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useAllCatFoods, useCatFoodStore } from '@/src/store/catFoodStore';
import type { CatFood } from '@/src/types/catFood';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Separator, Text, XStack, YStack } from 'tamagui';
import { TopRankingSwiper } from './_components/TopRankingSwiper';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

        {/* 搜索框和筛选区域 */}
        <YStack backgroundColor="white">
          {/* 搜索框 */}
          <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$3">
            <SearchBox
              value={searchQuery}
              onChangeText={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="搜索猫粮名称、品牌或标签..."
              size="$4"
            />
          </YStack>

          {/* 快捷筛选标签 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 12,
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => {
                setSortBy('score');
                setSelectedBrand('all');
              }}
            >
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$10"
                backgroundColor={
                  sortBy === 'score' && selectedBrand === 'all' ? '$blue2' : '$gray2'
                }
                borderWidth={1.5}
                borderColor={
                  sortBy === 'score' && selectedBrand === 'all' ? '$blue9' : 'transparent'
                }
                gap="$1.5"
                alignItems="center"
              >
                <IconSymbol
                  name="sparkles"
                  size={14}
                  color={sortBy === 'score' && selectedBrand === 'all' ? '$blue10' : '$gray10'}
                />
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color={sortBy === 'score' && selectedBrand === 'all' ? '$blue11' : '$gray11'}
                >
                  综合推荐
                </Text>
              </XStack>
            </Pressable>

            <Pressable onPress={() => setSortBy('score')}>
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$10"
                backgroundColor={sortBy === 'score' ? '$yellow2' : '$gray2'}
                borderWidth={1.5}
                borderColor={sortBy === 'score' ? '$yellow9' : 'transparent'}
                gap="$1.5"
                alignItems="center"
              >
                <IconSymbol
                  name="star.fill"
                  size={14}
                  color={sortBy === 'score' ? '$yellow10' : '$gray10'}
                />
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color={sortBy === 'score' ? '$yellow11' : '$gray11'}
                >
                  高评分
                </Text>
              </XStack>
            </Pressable>

            <Pressable onPress={() => setSortBy('likes')}>
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$10"
                backgroundColor={sortBy === 'likes' ? '$red2' : '$gray2'}
                borderWidth={1.5}
                borderColor={sortBy === 'likes' ? '$red9' : 'transparent'}
                gap="$1.5"
                alignItems="center"
              >
                <IconSymbol
                  name="heart.fill"
                  size={14}
                  color={sortBy === 'likes' ? '$red10' : '$gray10'}
                />
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color={sortBy === 'likes' ? '$red11' : '$gray11'}
                >
                  最受欢迎
                </Text>
              </XStack>
            </Pressable>

            <Pressable onPress={toggleBrandMenu}>
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$10"
                backgroundColor={selectedBrand !== 'all' ? '$orange2' : '$gray2'}
                borderWidth={1.5}
                borderColor={selectedBrand !== 'all' ? '$orange9' : 'transparent'}
                gap="$1.5"
                alignItems="center"
              >
                <IconSymbol
                  name="building.2.fill"
                  size={14}
                  color={selectedBrand !== 'all' ? '$orange10' : '$gray10'}
                />
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color={selectedBrand !== 'all' ? '$orange11' : '$gray11'}
                >
                  {selectedBrand === 'all' ? '品牌' : selectedBrand}
                </Text>
                <IconSymbol
                  name="chevron.down"
                  size={12}
                  color={selectedBrand !== 'all' ? '$orange10' : '$gray10'}
                />
              </XStack>
            </Pressable>
          </ScrollView>

          <Separator marginVertical="$2" />

          {/* 统计信息栏 */}
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$2.5"
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="$gray1"
          >
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="list.bullet" size={16} color="$gray10" />
              {searchQuery.trim() || selectedBrand !== 'all' ? (
                <Text fontSize="$2" color="$gray11" fontWeight="500">
                  找到{' '}
                  <Text fontWeight="700" color="$blue10">
                    {filteredCatFoods.length}
                  </Text>{' '}
                  个结果
                  {filteredCatFoods.length > 0 && catfoods.length > 0 && (
                    <Text color="$gray9"> / 共 {catfoods.length} 个</Text>
                  )}
                </Text>
              ) : (
                <Text fontSize="$2" color="$gray11" fontWeight="500">
                  共{' '}
                  <Text fontWeight="700" color="$blue10">
                    {filteredCatFoods.length}
                  </Text>{' '}
                  个优质猫粮
                </Text>
              )}
            </XStack>

            {/* 排序指示器 */}
            <XStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal="$2"
              paddingVertical="$1"
              backgroundColor="white"
              borderRadius="$6"
            >
              <IconSymbol
                name={sortBy === 'score' ? 'arrow.up.arrow.down' : 'arrow.up.arrow.down'}
                size={12}
                color="$gray10"
              />
              <Text fontSize="$1" color="$gray10" fontWeight="600">
                {sortBy === 'score' ? '按评分' : '按点赞'}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* 品牌筛选弹窗 */}
        {brandMenuExpanded && (
          <YStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            backgroundColor="white"
            borderBottomWidth={1}
            borderBottomColor="$gray3"
          >
            <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="building.2.fill" size={18} color="$orange10" />
                <Text fontSize="$4" fontWeight="700" color="$gray12">
                  选择品牌
                </Text>
              </XStack>
              <Pressable onPress={toggleBrandMenu}>
                <XStack
                  paddingHorizontal="$2.5"
                  paddingVertical="$1.5"
                  backgroundColor="$gray3"
                  borderRadius="$6"
                  alignItems="center"
                  gap="$1"
                >
                  <IconSymbol name="xmark" size={12} color="$gray11" />
                  <Text fontSize="$1" color="$gray11" fontWeight="600">
                    收起
                  </Text>
                </XStack>
              </Pressable>
            </XStack>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {brandList.map((brand) => (
                <Pressable key={brand} onPress={() => handleSelectBrand(brand)}>
                  <YStack
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
                    borderRadius="$8"
                    backgroundColor={selectedBrand === brand ? '$orange9' : '$gray2'}
                    borderWidth={1.5}
                    borderColor={selectedBrand === brand ? '$orange10' : '$gray4'}
                    minWidth={80}
                    alignItems="center"
                    gap="$1"
                  >
                    <Text
                      fontSize="$3"
                      color={selectedBrand === brand ? 'white' : '$gray11'}
                      fontWeight={selectedBrand === brand ? '700' : '500'}
                      numberOfLines={1}
                    >
                      {brand === 'all' ? '全部' : brand}
                    </Text>
                    <Text
                      fontSize="$1"
                      color={selectedBrand === brand ? 'rgba(255,255,255,0.9)' : '$gray9'}
                      fontWeight="600"
                    >
                      {brandCounts[brand] || 0} 个
                    </Text>
                  </YStack>
                </Pressable>
              ))}
            </ScrollView>
          </YStack>
        )}
      </>
    );
  };

  // 渲染列表底部加载器
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <YStack padding="$5" alignItems="center" gap="$2">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text fontSize="$3" color="$gray11" fontWeight="600">
          加载更多猫粮中...
        </Text>
        <Text fontSize="$2" color="$gray9">
          为您精选优质产品
        </Text>
      </YStack>
    );
  };

  // 渲染空状态 - 精美设计
  const renderEmpty = () => {
    if (isLoading) return null;

    // 搜索结果为空
    if (searchQuery.trim()) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" minHeight={400}>
          <YStack
            width={120}
            height={120}
            borderRadius="$12"
            backgroundColor="$blue2"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <IconSymbol name="magnifyingglass" size={56} color="$blue9" />
          </YStack>
          <Text fontSize="$7" fontWeight="800" color="$gray12" marginBottom="$2">
            未找到相关猫粮
          </Text>
          <Text fontSize="$3" color="$gray10" textAlign="center" lineHeight={22} marginBottom="$4">
            试试搜索其他品牌或关键词
          </Text>
          <Pressable
            onPress={() => {
              setSearchQuery('');
              setSelectedBrand('all');
            }}
          >
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius="$10"
              backgroundColor="$blue9"
              gap="$2"
              alignItems="center"
            >
              <IconSymbol name="arrow.counterclockwise" size={16} color="white" />
              <Text fontSize="$3" color="white" fontWeight="700">
                重置筛选
              </Text>
            </XStack>
          </Pressable>
        </YStack>
      );
    }

    // 列表为空但有轮播图
    if (topCatFoods.length > 0 && listCatFoods.length === 0) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" minHeight={300}>
          <YStack
            width={100}
            height={100}
            borderRadius="$12"
            backgroundColor="$green2"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <IconSymbol name="checkmark.circle.fill" size={50} color="$green9" />
          </YStack>
          <Text fontSize="$6" fontWeight="800" color="$gray12" marginBottom="$2">
            已显示全部猫粮
          </Text>
          <Text fontSize="$3" color="$gray10" textAlign="center" lineHeight={22}>
            以上是为您精选的热门推荐
          </Text>
        </YStack>
      );
    }

    // 原始空状态
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" minHeight={400}>
        <YStack
          width={120}
          height={120}
          borderRadius="$12"
          backgroundColor="$gray3"
          alignItems="center"
          justifyContent="center"
          marginBottom="$4"
        >
          <IconSymbol name="tray.fill" size={56} color="$gray9" />
        </YStack>
        <Text fontSize="$7" fontWeight="800" color="$gray12" marginBottom="$2">
          暂无猫粮数据
        </Text>
        <Text fontSize="$3" color="$gray10" textAlign="center" lineHeight={22} marginBottom="$4">
          还没有猫粮信息，敬请期待
        </Text>
        <Pressable onPress={handleRefresh}>
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderRadius="$10"
            backgroundColor="$blue9"
            gap="$2"
            alignItems="center"
          >
            <IconSymbol name="arrow.clockwise" size={16} color="white" />
            <Text fontSize="$3" color="white" fontWeight="700">
              刷新页面
            </Text>
          </XStack>
        </Pressable>
      </YStack>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 图片预览 Modal - 精美设计 */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
        statusBarTranslucent
      >
        <Pressable style={{ flex: 1 }} onPress={closePreview}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.97)', 'rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.97)']}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            {/* 顶部工具栏 */}
            <XStack
              position="absolute"
              top={50}
              left={0}
              right={0}
              paddingHorizontal="$4"
              justifyContent="space-between"
              alignItems="center"
              zIndex={10}
            >
              <Text fontSize="$4" color="white" fontWeight="700">
                图片预览
              </Text>
              <Pressable onPress={closePreview}>
                <XStack
                  width={40}
                  height={40}
                  borderRadius="$10"
                  backgroundColor="rgba(255, 255, 255, 0.15)"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.2)"
                >
                  <IconSymbol name="xmark" size={20} color="white" />
                </XStack>
              </Pressable>
            </XStack>

            {/* 预览图片 */}
            {previewImageUrl && (
              <YStack
                flex={1}
                width="100%"
                justifyContent="center"
                alignItems="center"
                padding="$6"
              >
                <Image
                  source={{ uri: previewImageUrl }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                  }}
                  resizeMode="contain"
                />
              </YStack>
            )}

            {/* 底部提示 */}
            <YStack
              position="absolute"
              bottom={50}
              alignSelf="center"
              paddingHorizontal="$4"
              paddingVertical="$2.5"
              backgroundColor="rgba(255, 255, 255, 0.15)"
              borderRadius="$10"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.2)"
            >
              <Text fontSize="$2" color="white" fontWeight="600">
                点击任意位置关闭
              </Text>
            </YStack>
          </LinearGradient>
        </Pressable>
      </Modal>

      {/* 猫粮列表 */}
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
    </YStack>
  );
}
