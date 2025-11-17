import CollectListItem from '@/src/app/(tabs)/collect/components/collectItem';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useCollectStore } from '@/src/store/collectStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 收藏页面
export default function CollectScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // 使用 collectStore
  const { favorites, isLoading, error, fetchFavorites, removeFavorite } = useCollectStore();

  // 初始加载数据
  useEffect(() => {
    fetchFavorites().catch((err) => {
      console.error('获取收藏列表失败:', err);
    });
  }, []);

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFavorites();
    } catch (err) {
      Alert.alert('刷新失败', '请检查网络连接后重试');
    } finally {
      setRefreshing(false);
    }
  };

  // 删除收藏
  const handleDelete = async (favoriteId: number) => {
    Alert.alert('确认删除', '您确定要取消收藏这个猫粮吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFavorite(favoriteId);
            Alert.alert('✅ 成功', '已取消收藏');
          } catch (err) {
            Alert.alert('❌ 失败', '取消收藏失败，请重试');
            console.error('删除收藏失败:', err);
          }
        },
      },
    ]);
  };

  // 点击收藏项，跳转到详情页
  const handlePress = (catfoodId: number) => {
    router.push({
      pathname: '/report/[id]',
      params: { id: catfoodId },
    });
  };

  // 过滤收藏列表（根据搜索文本）
  // 确保 favorites 始终是数组，防止 undefined 错误
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const filteredFavorites = safeFavorites.filter((favorite) => {
    if (!searchText.trim()) return true;
    const keyword = searchText.toLowerCase();
    return (
      favorite.catfood.name.toLowerCase().includes(keyword) ||
      favorite.catfood.brand?.toLowerCase().includes(keyword)
    );
  });

  return (
    <ThemedView style={styles.container}>
      {/* 搜索框区域 */}
      <View style={[styles.searchContainer, { paddingTop: insets.top + 16 }]}>
        <Image source={require('@/assets/appIcon.png')} style={styles.logo} />
        <View style={styles.searchBox}>
          <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索您收藏的猫粮..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* 收藏列表区域 */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <ThemedText style={styles.loadingText}>加载中...</ThemedText>
          </View>
        )}

        {error && !isLoading && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
            <ThemedText style={styles.emptyText}>下拉刷新重试</ThemedText>
          </View>
        )}

        {!isLoading && !error && filteredFavorites.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {searchText.trim() ? '未找到匹配的收藏' : '还没有收藏任何猫粮哦~'}
            </ThemedText>
          </View>
        )}

        {!isLoading && !error && filteredFavorites.length > 0 && (
          <>
            {filteredFavorites.map((favorite) => (
              <TouchableOpacity
                key={favorite.id}
                style={styles.itemWrapper}
                onPress={() => handlePress(favorite.catfood.id)}
                activeOpacity={0.7}
              >
                <CollectListItem favorite={favorite} onDelete={() => handleDelete(favorite.id)} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  itemWrapper: {
    marginBottom: 12,
  },
});
