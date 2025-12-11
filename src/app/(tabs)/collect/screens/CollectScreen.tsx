import { RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';

import CollectListItem from '@/src/app/(tabs)/collect/components/collectItem';
import PostCollectItem from '@/src/app/(tabs)/collect/components/PostCollectItem';
import { PostDetailScreen } from '@/src/app/(tabs)/forum/components/post-detail';
import { AppHeader } from '@/src/components/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';

import { useCollectData, useCollectFilter, usePostCollectData } from '../hooks';

/**
 * Collect 主屏幕组件
 * 显示用户收藏的猫粮和帖子
 */
export function CollectScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

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
      <IconSymbol name={icon as any} size={80} color={colors.icon + '40'} />
      <Text fontSize={16} color={colors.icon} textAlign="center">
        {message}
      </Text>
    </YStack>
  );

  // 渲染猫粮收藏列表
  const renderCatFoodList = () => {
    if (isLoading && !refreshing) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
          <Spinner size="large" color={colors.tint} />
          <Text fontSize={16} color={colors.icon} marginTop="$4">
            加载中...
          </Text>
        </YStack>
      );
    }

    if (error && !isLoading) {
      return renderEmptyState(`❌ ${error}\n下拉刷新重试`, 'exclamationmark.triangle');
    }

    if (filteredFavorites.length === 0) {
      return renderEmptyState(
        searchText.trim() ? '未找到匹配的收藏' : '还没有收藏任何猫粮哦~\n快去发现喜欢的猫粮吧！',
        'heart.slash'
      );
    }

    return (
      <YStack gap="$3" paddingBottom="$4">
        {filteredFavorites.map((favorite) => (
          <YStack
            key={favorite.id}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
            animation="quick"
            onPress={() => handlePress(favorite.catfood.id)}
          >
            <CollectListItem
              favorite={favorite}
              onDelete={() => handleDelete(favorite.id, favorite.catfood.id)}
            />
          </YStack>
        ))}
      </YStack>
    );
  };

  // 渲染帖子收藏列表
  const renderPostList = () => {
    if (isLoadingPosts && !refreshingPosts) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
          <Spinner size="large" color={colors.tint} />
          <Text fontSize={16} color={colors.icon} marginTop="$4">
            加载中...
          </Text>
        </YStack>
      );
    }

    if (postError && !isLoadingPosts) {
      return renderEmptyState(`❌ ${postError}\n下拉刷新重试`, 'exclamationmark.triangle');
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
    <YStack flex={1} backgroundColor="$gray1">
      {/* 整合的顶部区域 */}
      <YStack backgroundColor="white" borderBottomWidth={1} borderBottomColor="$gray3">
        {/* 标题栏 */}
        <AppHeader
          title="我的收藏"
          insets={insets}
          rightElement={
            <XStack
              backgroundColor={colors.tint + '15'}
              paddingHorizontal="$2.5"
              paddingVertical="$1.5"
              borderRadius="$10"
            >
              <Text fontSize={13} fontWeight="600" color={colors.tint}>
                {currentTab === 'catfood' ? favoritesCount : favoritePosts.length}
              </Text>
            </XStack>
          }
        />

        {/* 搜索框 */}
        <YStack paddingHorizontal="$4" paddingBottom="$3">
          <Input
            placeholder="搜索收藏的内容..."
            placeholderTextColor={colors.icon}
            value={searchText}
            onChangeText={setSearchText}
            size="$3"
            backgroundColor={colors.icon + '10'}
            borderColor="transparent"
            color={colors.text}
            focusStyle={{
              borderColor: colors.tint,
              backgroundColor: colors.background,
            }}
          />
        </YStack>

        {/* Tab 按钮 */}
        <XStack
          paddingHorizontal="$4"
          gap="$2"
          borderBottomWidth={1}
          borderBottomColor={colors.icon + '15'}
        >
          <YStack
            flex={1}
            paddingVertical="$2.5"
            alignItems="center"
            borderBottomWidth={2}
            borderBottomColor={currentTab === 'catfood' ? colors.tint : 'transparent'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setCurrentTab('catfood')}
          >
            <XStack gap="$2" alignItems="center">
              <IconSymbol
                name="pawprint.fill"
                size={18}
                color={currentTab === 'catfood' ? colors.tint : colors.icon}
              />
              <Text
                fontSize={15}
                fontWeight={currentTab === 'catfood' ? '600' : '400'}
                color={currentTab === 'catfood' ? colors.tint : colors.icon}
              >
                猫粮收藏
              </Text>
            </XStack>
          </YStack>

          <YStack
            flex={1}
            paddingVertical="$2.5"
            alignItems="center"
            borderBottomWidth={2}
            borderBottomColor={currentTab === 'post' ? colors.tint : 'transparent'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setCurrentTab('post')}
          >
            <XStack gap="$2" alignItems="center">
              <IconSymbol
                name="doc.text.fill"
                size={18}
                color={currentTab === 'post' ? colors.tint : colors.icon}
              />
              <Text
                fontSize={15}
                fontWeight={currentTab === 'post' ? '600' : '400'}
                color={currentTab === 'post' ? colors.tint : colors.icon}
              >
                帖子收藏
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </YStack>

      {/* Tab 内容区域 */}
      <YStack flex={1} backgroundColor="$gray1">
        {currentTab === 'catfood' ? (
          <ScrollView
            flex={1}
            padding="$4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.tint}
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
                tintColor={colors.tint}
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
  );
}
