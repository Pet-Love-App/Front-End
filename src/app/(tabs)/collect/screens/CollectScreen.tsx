import { RefreshControl, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';

import CollectListItem from '@/src/app/(tabs)/collect/components/collectItem';
import PostCollectItem from '@/src/app/(tabs)/collect/components/PostCollectItem';
import { PostDetailScreen } from '@/src/app/(tabs)/forum/components/post-detail';
import { AppHeader } from '@/src/components/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale } from '@/src/design-system/tokens';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
import type { CatfoodFavorite } from '@/src/types/collect';

import { useCollectData, useCollectFilter, usePostCollectData } from '../hooks';

/**
 * Collect 主屏幕组件
 * 显示用户收藏的猫粮和帖子
 */
export function CollectScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // 使用自定义 hooks
  const { favorites, isLoading, error, refreshing, handleRefresh, handleDelete, handlePress } =
    useCollectData();

  // 帖子收藏数据
  const {
    favoritePosts,
    isLoadingPosts,
    postError,
    refreshing: refreshingPosts,
    handleRefresh: handleRefreshPosts,
    handleDelete: handleDeletePost,
    handlePress: handlePressPost,
    selectedPost,
    closePostDetail,
    handlePostDeleted,
  } = usePostCollectData();

  const {
    currentTab,
    setCurrentTab,
    searchText,
    setSearchText,
    filteredFavorites,
    favoritesCount,
  } = useCollectFilter(favorites);

  // 渲染空状态
  const renderEmptyState = (message: string, icon: string) => (
    <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10" gap="$4">
      <YStack
        width={100}
        height={100}
        borderRadius={50}
        backgroundColor={colors.backgroundMuted as any}
        alignItems="center"
        justifyContent="center"
        borderWidth={2}
        borderColor={colors.border as any}
      >
        <IconSymbol name={icon as any} size={48} color={colors.textTertiary} />
      </YStack>
      <Text fontSize={15} color={colors.textSecondary as any} textAlign="center" lineHeight={24}>
        {message}
      </Text>
    </YStack>
  );

  // 渲染猫粮收藏列表
  const renderCatFoodList = () => {
    if (isLoading && !refreshing) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
          <Spinner size="large" color={colors.primary} />
          <Text fontSize={15} color={colors.textSecondary as any} marginTop="$4">
            加载中...
          </Text>
        </YStack>
      );
    }

    if (error && !isLoading) {
      return renderEmptyState(`${error}\n下拉刷新重试`, 'exclamationmark.triangle');
    }

    if (filteredFavorites.length === 0) {
      return renderEmptyState(
        searchText.trim() ? '未找到匹配的收藏' : '还没有收藏任何猫粮哦~\n快去发现喜欢的猫粮吧！',
        'heart.slash'
      );
    }

    return (
      <YStack gap="$3" paddingBottom="$4">
        {filteredFavorites.map((favorite, index) => {
          // API 返回的数据是扁平结构，需要转换
          const rawData = favorite as any;
          const catfoodId = rawData.id;
          const favoriteRecordId = rawData.favoriteId;

          // 将扁平结构转换为嵌套结构
          const normalizedFavorite: CatfoodFavorite = {
            id: favoriteRecordId?.toString() || '',
            catfoodId: catfoodId?.toString() || '',
            catfood: {
              id: catfoodId?.toString() || '',
              name: rawData.name || '',
              brand: rawData.brand || '',
              imageUrl: rawData.imageUrl,
              score: rawData.score,
              barcode: rawData.barcode,
              crudeProtein: rawData.crudeProtein,
              crudeFat: rawData.crudeFat,
              carbohydrates: rawData.carbohydrates,
              crudeFiber: rawData.crudeFiber,
              crudeAsh: rawData.crudeAsh,
              others: rawData.others,
              percentData: rawData.percentData,
            },
            favoritedAt: rawData.favoritedAt,
            createdAt: rawData.createdAt || rawData.favoritedAt,
          };

          return (
            <TouchableOpacity
              key={favoriteRecordId || index}
              activeOpacity={0.7}
              onPress={() => {
                console.log('点击收藏项', { catfoodId, rawData });
                handlePress(catfoodId?.toString() || '');
              }}
            >
              <CollectListItem
                favorite={normalizedFavorite}
                onDelete={() =>
                  handleDelete(favoriteRecordId?.toString() || '', catfoodId?.toString() || '')
                }
              />
            </TouchableOpacity>
          );
        })}
      </YStack>
    );
  };

  // 渲染帖子收藏列表
  const renderPostList = () => {
    if (isLoadingPosts && !refreshingPosts) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
          <Spinner size="large" color={colors.primary} />
          <Text fontSize={15} color={colors.textSecondary as any} marginTop="$4">
            加载中...
          </Text>
        </YStack>
      );
    }

    if (postError && !isLoadingPosts) {
      return renderEmptyState(`${postError}\n下拉刷新重试`, 'exclamationmark.triangle');
    }

    // 过滤帖子收藏
    const filteredPosts = favoritePosts.filter((post) => {
      if (!searchText.trim()) return true;
      const search = searchText.toLowerCase();
      return (
        post.content?.toLowerCase().includes(search) ||
        post.author?.username?.toLowerCase().includes(search) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(search))
      );
    });

    if (filteredPosts.length === 0) {
      return renderEmptyState(
        searchText.trim()
          ? '未找到匹配的帖子收藏'
          : '还没有收藏任何帖子哦~\n快去社区发现感兴趣的内容吧！',
        'doc.text.fill'
      );
    }

    return (
      <YStack gap="$3" paddingBottom="$4">
        {filteredPosts.map((post) => (
          <PostCollectItem
            key={post.id}
            post={post}
            onDelete={() => handleDeletePost(post.id)}
            onPress={() => handlePressPost(post.id)}
          />
        ))}
      </YStack>
    );
  };

  return (
    <View testID="home-screen" style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor={colors.background as any}>
        {/* 整合的顶部区域 */}
        <YStack backgroundColor={colors.cardBackground as any}>
          {/* 标题栏 */}
          <AppHeader
            title="我的收藏"
            insets={insets}
            rightElement={
              <YStack
                backgroundColor={(isDark ? '#3D2A1F' : primaryScale.primary2) as any}
                paddingHorizontal={12}
                paddingVertical={6}
                borderRadius={16}
                borderWidth={1.5}
                borderColor={(isDark ? '#4D3A2F' : primaryScale.primary3) as any}
              >
                <Text fontSize={13} fontWeight="700" color={colors.primary as any}>
                  {currentTab === 'catfood' ? favoritesCount : favoritePosts.length}
                </Text>
              </YStack>
            }
          />

          {/* 搜索框 */}
          <YStack paddingHorizontal={16} paddingBottom={12}>
            <XStack
              backgroundColor={colors.backgroundMuted as any}
              borderRadius={12}
              paddingHorizontal={14}
              paddingVertical={10}
              alignItems="center"
              gap={10}
              borderWidth={1.5}
              borderColor={colors.border as any}
            >
              <IconSymbol name="magnifyingglass" size={18} color={colors.textTertiary} />
              <Input
                flex={1}
                placeholder="搜索收藏的内容..."
                placeholderTextColor={colors.textTertiary}
                value={searchText}
                onChangeText={setSearchText}
                backgroundColor="transparent"
                borderWidth={0}
                padding={0}
                height={24}
                fontSize={15}
                color={colors.text as any}
                focusStyle={{ borderWidth: 0 }}
              />
            </XStack>
          </YStack>

          {/* Tab 按钮 - 美化版本 */}
          <XStack paddingHorizontal={16} gap={8} paddingBottom={12}>
            {/* 猫粮收藏 Tab */}
            <YStack
              flex={1}
              paddingVertical={12}
              alignItems="center"
              backgroundColor={
                (currentTab === 'catfood' ? colors.primary : colors.backgroundMuted) as any
              }
              borderRadius={12}
              borderWidth={1.5}
              borderColor={(currentTab === 'catfood' ? colors.primaryDark : colors.border) as any}
              pressStyle={{ scale: 0.97, opacity: 0.9 }}
              animation="quick"
              onPress={() => setCurrentTab('catfood')}
            >
              <XStack gap={8} alignItems="center">
                <IconSymbol
                  name="pawprint.fill"
                  size={18}
                  color={
                    currentTab === 'catfood'
                      ? isDark
                        ? '#0A0A0A'
                        : '#FFFFFF'
                      : colors.textSecondary
                  }
                />
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={
                    (currentTab === 'catfood'
                      ? isDark
                        ? '#0A0A0A'
                        : '#FFFFFF'
                      : colors.textSecondary) as any
                  }
                >
                  猫粮收藏
                </Text>
              </XStack>
            </YStack>

            {/* 帖子收藏 Tab */}
            <YStack
              flex={1}
              paddingVertical={12}
              alignItems="center"
              backgroundColor={
                (currentTab === 'post' ? colors.primary : colors.backgroundMuted) as any
              }
              borderRadius={12}
              borderWidth={1.5}
              borderColor={(currentTab === 'post' ? colors.primaryDark : colors.border) as any}
              pressStyle={{ scale: 0.97, opacity: 0.9 }}
              animation="quick"
              onPress={() => setCurrentTab('post')}
            >
              <XStack gap={8} alignItems="center">
                <IconSymbol
                  name="doc.text.fill"
                  size={18}
                  color={
                    currentTab === 'post' ? (isDark ? '#0A0A0A' : '#FFFFFF') : colors.textSecondary
                  }
                />
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={
                    (currentTab === 'post'
                      ? isDark
                        ? '#0A0A0A'
                        : '#FFFFFF'
                      : colors.textSecondary) as any
                  }
                >
                  帖子收藏
                </Text>
              </XStack>
            </YStack>
          </XStack>
        </YStack>

        {/* Tab 内容区域 */}
        <YStack flex={1} backgroundColor={colors.background as any}>
          {currentTab === 'catfood' ? (
            <ScrollView
              flex={1}
              padding="$4"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                />
              }
            >
              {renderCatFoodList()}
            </ScrollView>
          ) : (
            <ScrollView
              flex={1}
              padding="$4"
              refreshControl={
                <RefreshControl
                  refreshing={refreshingPosts}
                  onRefresh={handleRefreshPosts}
                  tintColor={colors.primary}
                />
              }
            >
              {renderPostList()}
            </ScrollView>
          )}
        </YStack>

        {/* 帖子详情模态框 */}
        <PostDetailScreen
          visible={!!selectedPost}
          post={selectedPost}
          onClose={closePostDetail}
          onPostDeleted={handlePostDeleted}
        />
      </YStack>
    </View>
  );
}
