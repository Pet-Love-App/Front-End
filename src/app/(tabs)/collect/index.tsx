import SearchBox from '@/src/components/searchBox';
import { useCollectStore } from '@/src/store/collectStore';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView as RNScrollView, RefreshControl } from 'react-native';
import { Spinner, Tabs, Text, YStack } from 'tamagui';
import { CollectListItem } from './components/collectItem';

export default function CollectionList() {
  const [searchWord, setSearchWord] = useState('');
  const { favorites, isLoading, fetchFavorites, removeFavorite } = useCollectStore();

  // 初始化加载收藏列表
  useEffect(() => {
    fetchFavorites();
  }, []);

  // 下拉刷新
  const handleRefresh = async () => {
    await fetchFavorites();
  };

  // 取消收藏
  const handleDelete = async (favoriteId: number) => {
    try {
      await removeFavorite(favoriteId);
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  // 搜索过滤
  const filteredFavorites = useMemo(() => {
    if (!searchWord.trim()) {
      return favorites;
    }
    const keyword = searchWord.toLowerCase().trim();
    return favorites.filter(
      (fav) =>
        fav.catfood.name.toLowerCase().includes(keyword) ||
        fav.catfood.brand?.toLowerCase().includes(keyword)
    );
  }, [favorites, searchWord]);

  // 渲染猫粮收藏内容
  const renderCatFoodContent = () => (
    <YStack flex={1} padding="$4" gap="$3">
      {isLoading && favorites.length === 0 && (
        <YStack alignItems="center" padding="$6">
          <Spinner size="large" />
          <Text marginTop="$3" color="$gray10">
            加载中...
          </Text>
        </YStack>
      )}

      {!isLoading && favorites.length === 0 && (
        <YStack alignItems="center" padding="$6">
          <Text fontSize="$5" color="$gray10">
            还没有收藏任何猫粮
          </Text>
          <Text fontSize="$3" color="$gray9" marginTop="$2">
            快去收藏喜欢的猫粮吧！
          </Text>
        </YStack>
      )}

      {filteredFavorites.length === 0 && searchWord && !isLoading && (
        <YStack alignItems="center" padding="$6">
          <Text fontSize="$5" color="$gray10">
            没有找到匹配的收藏
          </Text>
        </YStack>
      )}

      {filteredFavorites.map((favorite) => (
        <CollectListItem key={favorite.id} favorite={favorite} onDelete={handleDelete} />
      ))}
    </YStack>
  );

  // 渲染报告收藏内容（占位）
  const renderReportContent = () => (
    <YStack flex={1} padding="$4" alignItems="center" justifyContent="center">
      <Text fontSize="$5" color="$gray10">
        报告收藏功能
      </Text>
      <Text fontSize="$3" color="$gray9" marginTop="$2">
        即将上线...
      </Text>
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 搜索框 */}
      <YStack padding="$4" paddingBottom="$4">
        <SearchBox size="$4" value={searchWord} onChangeText={setSearchWord} />
      </YStack>

      {/* Tabs */}
      <Tabs defaultValue="catfood" flex={1} flexDirection="column" orientation="horizontal">
        <Tabs.List
          disablePassBorderRadius="bottom"
          aria-label="收藏类型"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Tabs.Tab flex={1} value="catfood">
            <Text fontSize="$4" fontWeight="600">
              猫粮
            </Text>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="report">
            <Text fontSize="$4" fontWeight="600">
              报告
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Content value="catfood" flex={1}>
          <RNScrollView
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
            style={{ flex: 1 }}
          >
            {renderCatFoodContent()}
          </RNScrollView>
        </Tabs.Content>

        <Tabs.Content value="report" flex={1}>
          <RNScrollView style={{ flex: 1 }}>{renderReportContent()}</RNScrollView>
        </Tabs.Content>
      </Tabs>
    </YStack>
  );
}
