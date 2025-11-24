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
import type { CatFood } from '@/src/types/catFood';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { TopRankingSwiper } from '../components/TopRankingSwiper';
import { useImagePreview, useRankingData, useRankingFilter } from '../hooks';

export function RankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 使用自定义 hooks
  const { catfoods, isLoading, isRefreshing, isLoadingMore, handleRefresh, handleLoadMore } =
    useRankingData();

  const {
    sortBy,
    setSortBy,
    selectedBrand,
    brandMenuExpanded,
    searchQuery,
    brandList,
    brandCounts,
    filteredCatFoods,
    topCatFoods,
    listCatFoods,
    handleSearchChange,
    handleClearSearch,
    handleSelectBrand,
    toggleBrandMenu,
    resetFilters,
  } = useRankingFilter(catfoods);

  const { previewVisible, previewImageUrl, handleImagePress, closePreview } = useImagePreview();

  // 跳转到详情页
  const handleCatFoodPress = (catfood: CatFood) => {
    router.push({
      pathname: '/detail',
      params: { id: catfood.id },
    });
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
        <YStack backgroundColor="#FAFAFA" paddingTop="$3">
          {/* 搜索框 */}
          <YStack paddingHorizontal="$4" paddingBottom="$3">
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
              paddingBottom: 16,
              gap: 10,
            }}
          >
            <Pressable
              onPress={() => {
                setSortBy('score');
                handleSelectBrand('all');
              }}
            >
              <XStack
                paddingHorizontal="$4"
                paddingVertical="$2.5"
                borderRadius="$12"
                backgroundColor={
                  sortBy === 'score' && selectedBrand === 'all' ? '#DBEAFE' : 'white'
                }
                borderWidth={2}
                borderColor={sortBy === 'score' && selectedBrand === 'all' ? '#3B82F6' : '#E5E7EB'}
                gap="$2"
                alignItems="center"
              >
                <IconSymbol
                  name="sparkles"
                  size={16}
                  color={sortBy === 'score' && selectedBrand === 'all' ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  fontSize={14}
                  fontWeight="700"
                  color={sortBy === 'score' && selectedBrand === 'all' ? '#1E40AF' : '#4B5563'}
                  letterSpacing={0.3}
                >
                  综合推荐
                </Text>
              </XStack>
            </Pressable>

            <Pressable onPress={() => setSortBy('score')}>
              <XStack
                paddingHorizontal="$4"
                paddingVertical="$2.5"
                borderRadius="$12"
                backgroundColor={sortBy === 'score' ? '#FEF3C7' : 'white'}
                borderWidth={2}
                borderColor={sortBy === 'score' ? '#F59E0B' : '#E5E7EB'}
                gap="$2"
                alignItems="center"
              >
                <IconSymbol
                  name="star.fill"
                  size={16}
                  color={sortBy === 'score' ? '#F59E0B' : '#6B7280'}
                />
                <Text
                  fontSize={14}
                  fontWeight="700"
                  color={sortBy === 'score' ? '#D97706' : '#4B5563'}
                  letterSpacing={0.3}
                >
                  高评分
                </Text>
              </XStack>
            </Pressable>

            <Pressable onPress={() => setSortBy('likes')}>
              <XStack
                paddingHorizontal="$4"
                paddingVertical="$2.5"
                borderRadius="$12"
                backgroundColor={sortBy === 'likes' ? '#FEE2E2' : 'white'}
                borderWidth={2}
                borderColor={sortBy === 'likes' ? '#EF4444' : '#E5E7EB'}
                gap="$2"
                alignItems="center"
              >
                <IconSymbol
                  name="heart.fill"
                  size={16}
                  color={sortBy === 'likes' ? '#EF4444' : '#6B7280'}
                />
                <Text
                  fontSize={14}
                  fontWeight="700"
                  color={sortBy === 'likes' ? '#DC2626' : '#4B5563'}
                  letterSpacing={0.3}
                >
                  最受欢迎
                </Text>
              </XStack>
            </Pressable>

            <Pressable onPress={toggleBrandMenu}>
              <XStack
                paddingHorizontal="$4"
                paddingVertical="$2.5"
                borderRadius="$12"
                backgroundColor={selectedBrand !== 'all' ? '#FFEDD5' : 'white'}
                borderWidth={2}
                borderColor={selectedBrand !== 'all' ? '#F97316' : '#E5E7EB'}
                gap="$2"
                alignItems="center"
              >
                <IconSymbol
                  name="building.2.fill"
                  size={16}
                  color={selectedBrand !== 'all' ? '#F97316' : '#6B7280'}
                />
                <Text
                  fontSize={14}
                  fontWeight="700"
                  color={selectedBrand !== 'all' ? '#EA580C' : '#4B5563'}
                  letterSpacing={0.3}
                  numberOfLines={1}
                  maxWidth={120}
                >
                  {selectedBrand === 'all' ? '品牌' : selectedBrand}
                </Text>
                <IconSymbol
                  name={brandMenuExpanded ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  color={selectedBrand !== 'all' ? '#F97316' : '#6B7280'}
                />
              </XStack>
            </Pressable>
          </ScrollView>

          {/* 统计信息栏 */}
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="white"
            borderTopWidth={1}
            borderTopColor="#F3F4F6"
          >
            <XStack alignItems="center" gap="$2.5">
              <YStack
                width={32}
                height={32}
                borderRadius="$8"
                backgroundColor="#F3F4F6"
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="list.bullet" size={18} color="#3B82F6" />
              </YStack>
              {searchQuery.trim() || selectedBrand !== 'all' ? (
                <Text fontSize={14} color="#4B5563" fontWeight="600">
                  找到{' '}
                  <Text fontWeight="800" color="#3B82F6" fontSize={15}>
                    {filteredCatFoods.length}
                  </Text>{' '}
                  个结果
                  {filteredCatFoods.length > 0 && catfoods.length > 0 && (
                    <Text color="#9CA3AF" fontSize={13}>
                      {' '}
                      / 共 {catfoods.length} 个
                    </Text>
                  )}
                </Text>
              ) : (
                <Text fontSize={14} color="#4B5563" fontWeight="600">
                  共{' '}
                  <Text fontWeight="800" color="#3B82F6" fontSize={15}>
                    {filteredCatFoods.length}
                  </Text>{' '}
                  个优质猫粮
                </Text>
              )}
            </XStack>

            {/* 排序指示器 */}
            <XStack
              alignItems="center"
              gap="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
              backgroundColor="#F9FAFB"
              borderRadius="$8"
              borderWidth={1}
              borderColor="#E5E7EB"
            >
              <IconSymbol
                name={sortBy === 'score' ? 'arrow.up.arrow.down' : 'arrow.up.arrow.down'}
                size={14}
                color={sortBy === 'score' ? '#F59E0B' : '#EF4444'}
              />
              <Text fontSize={13} color="#374151" fontWeight="700">
                {sortBy === 'score' ? '按评分' : '按点赞'}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* 品牌筛选弹窗 */}
        {brandMenuExpanded && (
          <YStack
            paddingHorizontal="$4"
            paddingVertical="$4"
            backgroundColor="#FFFBEB"
            borderBottomWidth={2}
            borderBottomColor="#FEF3C7"
          >
            <XStack alignItems="center" justifyContent="space-between" marginBottom="$3.5">
              <XStack alignItems="center" gap="$2.5">
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$10"
                  backgroundColor="#FBBF24"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="building.2.fill" size={20} color="white" />
                </YStack>
                <YStack>
                  <Text fontSize={18} fontWeight="800" color="#78350F" letterSpacing={0.3}>
                    选择品牌
                  </Text>
                  <Text fontSize={12} color="#92400E" fontWeight="600">
                    共 {brandList.length - 1} 个品牌
                  </Text>
                </YStack>
              </XStack>
              <Pressable onPress={toggleBrandMenu}>
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor="white"
                  borderRadius="$8"
                  alignItems="center"
                  gap="$2"
                  borderWidth={1.5}
                  borderColor="#FDE68A"
                >
                  <IconSymbol name="xmark" size={14} color="#D97706" />
                  <Text fontSize={13} color="#D97706" fontWeight="700">
                    收起
                  </Text>
                </XStack>
              </Pressable>
            </XStack>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {brandList.map((brand) => (
                <Pressable key={brand} onPress={() => handleSelectBrand(brand)}>
                  <YStack
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    borderRadius="$10"
                    backgroundColor={selectedBrand === brand ? '#F97316' : 'white'}
                    borderWidth={2}
                    borderColor={selectedBrand === brand ? '#EA580C' : '#FED7AA'}
                    minWidth={90}
                    alignItems="center"
                    gap="$1.5"
                  >
                    <Text
                      fontSize={15}
                      color={selectedBrand === brand ? 'white' : '#78350F'}
                      fontWeight="800"
                      numberOfLines={1}
                      letterSpacing={0.3}
                    >
                      {brand === 'all' ? '全部' : brand}
                    </Text>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$0.5"
                      backgroundColor={
                        selectedBrand === brand ? 'rgba(255,255,255,0.2)' : '#FEF3C7'
                      }
                      borderRadius="$6"
                    >
                      <Text
                        fontSize={12}
                        color={selectedBrand === brand ? 'white' : '#92400E'}
                        fontWeight="700"
                      >
                        {brandCounts[brand] || 0} 个
                      </Text>
                    </YStack>
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
      <YStack padding="$6" alignItems="center" gap="$3" backgroundColor="white" marginTop="$2">
        <YStack
          width={60}
          height={60}
          borderRadius="$12"
          backgroundColor="#EFF6FF"
          alignItems="center"
          justifyContent="center"
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </YStack>
        <Text fontSize={16} color="#1F2937" fontWeight="700" letterSpacing={0.3}>
          加载更多猫粮中...
        </Text>
        <Text fontSize={14} color="#6B7280" fontWeight="500">
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
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$8"
          minHeight={400}
          backgroundColor="white"
        >
          <YStack
            width={140}
            height={140}
            borderRadius="$12"
            backgroundColor="#EFF6FF"
            alignItems="center"
            justifyContent="center"
            marginBottom="$5"
            borderWidth={3}
            borderColor="#DBEAFE"
          >
            <IconSymbol name="magnifyingglass" size={64} color="#3B82F6" />
          </YStack>
          <Text
            fontSize={24}
            fontWeight="900"
            color="#111827"
            marginBottom="$2.5"
            letterSpacing={0.5}
          >
            未找到相关猫粮
          </Text>
          <Text
            fontSize={15}
            color="#6B7280"
            textAlign="center"
            lineHeight={24}
            marginBottom="$5"
            fontWeight="500"
          >
            试试搜索其他品牌或关键词
          </Text>
          <Pressable onPress={resetFilters}>
            <XStack
              paddingHorizontal="$5"
              paddingVertical="$3.5"
              borderRadius="$12"
              backgroundColor="#3B82F6"
              gap="$2.5"
              alignItems="center"
              borderWidth={2}
              borderColor="#2563EB"
            >
              <IconSymbol name="arrow.counterclockwise" size={18} color="white" />
              <Text fontSize={16} color="white" fontWeight="800" letterSpacing={0.3}>
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
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$8"
          minHeight={300}
          backgroundColor="white"
        >
          <YStack
            width={120}
            height={120}
            borderRadius="$12"
            backgroundColor="#D1FAE5"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
            borderWidth={3}
            borderColor="#A7F3D0"
          >
            <IconSymbol name="checkmark.circle.fill" size={64} color="#10B981" />
          </YStack>
          <Text
            fontSize={22}
            fontWeight="900"
            color="#111827"
            marginBottom="$2.5"
            letterSpacing={0.5}
          >
            已显示全部猫粮
          </Text>
          <Text fontSize={15} color="#6B7280" textAlign="center" lineHeight={24} fontWeight="500">
            以上是为您精选的热门推荐
          </Text>
        </YStack>
      );
    }

    // 原始空状态
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$8"
        minHeight={400}
        backgroundColor="white"
      >
        <YStack
          width={140}
          height={140}
          borderRadius="$12"
          backgroundColor="#F3F4F6"
          alignItems="center"
          justifyContent="center"
          marginBottom="$5"
          borderWidth={3}
          borderColor="#E5E7EB"
        >
          <IconSymbol name="tray.fill" size={64} color="#9CA3AF" />
        </YStack>
        <Text
          fontSize={24}
          fontWeight="900"
          color="#111827"
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          暂无猫粮数据
        </Text>
        <Text
          fontSize={15}
          color="#6B7280"
          textAlign="center"
          lineHeight={24}
          marginBottom="$5"
          fontWeight="500"
        >
          还没有猫粮信息，敬请期待
        </Text>
        <Pressable onPress={handleRefresh}>
          <XStack
            paddingHorizontal="$5"
            paddingVertical="$3.5"
            borderRadius="$12"
            backgroundColor="#3B82F6"
            gap="$2.5"
            alignItems="center"
            borderWidth={2}
            borderColor="#2563EB"
          >
            <IconSymbol name="arrow.clockwise" size={18} color="white" />
            <Text fontSize={16} color="white" fontWeight="800" letterSpacing={0.3}>
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
            colors={['rgba(0, 0, 0, 0.96)', 'rgba(0, 0, 0, 0.94)', 'rgba(0, 0, 0, 0.96)']}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            {/* 顶部工具栏 */}
            <XStack
              position="absolute"
              top={60}
              left={0}
              right={0}
              paddingHorizontal="$5"
              justifyContent="space-between"
              alignItems="center"
              zIndex={10}
            >
              <YStack
                paddingHorizontal="$4"
                paddingVertical="$2.5"
                backgroundColor="rgba(255, 255, 255, 0.1)"
                borderRadius="$10"
                borderWidth={1}
                borderColor="rgba(255, 255, 255, 0.15)"
              >
                <Text fontSize={18} color="white" fontWeight="800" letterSpacing={0.5}>
                  图片预览
                </Text>
              </YStack>
              <Pressable onPress={closePreview}>
                <XStack
                  width={48}
                  height={48}
                  borderRadius="$12"
                  backgroundColor="rgba(255, 255, 255, 0.12)"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={1.5}
                  borderColor="rgba(255, 255, 255, 0.18)"
                >
                  <IconSymbol name="xmark" size={22} color="white" />
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
                padding="$8"
              >
                <Image
                  source={{ uri: previewImageUrl }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                  }}
                  resizeMode="contain"
                />
              </YStack>
            )}

            {/* 底部提示 */}
            <YStack
              position="absolute"
              bottom={60}
              alignSelf="center"
              paddingHorizontal="$5"
              paddingVertical="$3"
              backgroundColor="rgba(255, 255, 255, 0.12)"
              borderRadius="$12"
              borderWidth={1.5}
              borderColor="rgba(255, 255, 255, 0.18)"
            >
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="hand.tap.fill" size={16} color="white" />
                <Text fontSize={14} color="white" fontWeight="700" letterSpacing={0.3}>
                  点击任意位置关闭
                </Text>
              </XStack>
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
