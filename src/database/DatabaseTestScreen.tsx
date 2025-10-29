/**
 * 数据库功能测试和演示
 * 
 * 这个文件演示如何使用数据库系统
 * 包含完整的测试用例
 */

import { CollectCard } from '@/src/components/collect-card';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { CatFoodCollectItem } from '@/src/types/collect';
import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

/**
 * 数据库测试页面
 */
export default function DatabaseTestScreen() {
  const {
    collects,
    loading,
    initialized,
    loadCollects,
    addCollect,
    deleteCollect,
    updateCollect,
    searchCollects,
    getStatistics,
  } = useCollectDatabase();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [stats, setStats] = useState<any>(null);

  // 初始化
  useEffect(() => {
    if (initialized) {
      loadData();
    }
  }, [initialized]);

  const loadData = async () => {
    await loadCollects('time', 'DESC');
    const statistics = await getStatistics();
    setStats(statistics);
  };

  /**
   * 测试1: 添加单个收藏
   */
  const testAddOne = async () => {
    const newItem: CatFoodCollectItem = {
      id: Date.now().toString(),
      tag1: '成猫粮',
      tag2: '高蛋白',
      name: '皇家猫粮 K36',
      description: '专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素',
      collectCount: 12345,
      collectTime: Date.now(),
      brand: '皇家',
      price: 298,
      rating: 4.8,
    };

    const success = await addCollect(newItem);
    
    if (success) {
      Alert.alert('✅ 成功', '添加收藏成功');
      loadData();
    } else {
      Alert.alert('❌ 失败', '添加收藏失败');
    }
  };

  /**
   * 测试2: 批量添加模拟数据
   */
  const testAddBatch = async () => {
    const mockData: CatFoodCollectItem[] = [
      {
        id: Date.now().toString() + '_1',
        tag1: '成猫粮',
        tag2: '高蛋白',
        name: '皇家猫粮 K36',
        description: '专为成年猫设计的营养配方',
        collectCount: 12345,
        collectTime: Date.now(),
        brand: '皇家',
        price: 298,
        rating: 4.8,
      },
      {
        id: Date.now().toString() + '_2',
        tag1: '幼猫粮',
        tag2: '易消化',
        name: '渴望幼猫粮',
        description: '富含新鲜肉类，为幼猫提供充足能量',
        collectCount: 8976,
        collectTime: Date.now() - 1000,
        brand: '渴望',
        price: 458,
        rating: 4.9,
      },
      {
        id: Date.now().toString() + '_3',
        tag1: '全阶段',
        tag2: '无谷配方',
        name: '爱肯拿鸭肉梨',
        description: '单一肉源配方，适合敏感肠胃',
        collectCount: 5432,
        collectTime: Date.now() - 2000,
        brand: '爱肯拿',
        price: 368,
        rating: 4.7,
      },
      {
        id: Date.now().toString() + '_4',
        tag1: '处方粮',
        tag2: '泌尿道',
        name: '希尔斯 c/d 处方粮',
        description: '专业处方粮，帮助溶解结石',
        collectCount: 3210,
        collectTime: Date.now() - 3000,
        brand: '希尔斯',
        price: 528,
        rating: 4.6,
      },
      {
        id: Date.now().toString() + '_5',
        tag1: '冻干',
        tag2: '高肉含量',
        name: '巅峰风干猫粮',
        description: '96%纯肉配方，冷冻干燥技术',
        collectCount: 15680,
        collectTime: Date.now() - 4000,
        brand: '巅峰',
        price: 688,
        rating: 5.0,
      },
    ];

    let successCount = 0;
    for (const item of mockData) {
      const success = await addCollect(item);
      if (success) successCount++;
    }

    Alert.alert(
      '✅ 批量添加完成',
      `成功添加 ${successCount}/${mockData.length} 条数据`
    );
    loadData();
  };

  /**
   * 测试3: 删除收藏
   */
  const testDelete = (id: string, name: string) => {
    Alert.alert(
      '确认删除',
      `确定要删除 ${name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCollect(id);
            if (success) {
              Alert.alert('✅ 成功', '已删除收藏');
              loadData();
            } else {
              Alert.alert('❌ 失败', '删除失败');
            }
          },
        },
      ]
    );
  };

  /**
   * 测试4: 更新收藏
   */
  const testUpdate = (id: string) => {
    Alert.alert(
      '更新收藏',
      '选择要更新的内容',
      [
        {
          text: '增加收藏数',
          onPress: async () => {
            const item = collects.find(c => c.id === id);
            if (item) {
              const success = await updateCollect(id, {
                collectCount: item.collectCount + 1000,
              });
              if (success) {
                Alert.alert('✅ 成功', '收藏数已更新');
                loadData();
              }
            }
          },
        },
        {
          text: '更新评分',
          onPress: async () => {
            const success = await updateCollect(id, {
              rating: 5.0,
            });
            if (success) {
              Alert.alert('✅ 成功', '评分已更新为 5.0');
              loadData();
            }
          },
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  /**
   * 测试5: 搜索功能
   */
  const testSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return;
    }

    const results = await searchCollects(searchKeyword);
    Alert.alert(
      '搜索结果',
      `找到 ${results.length} 条匹配数据`
    );
  };

  /**
   * 测试6: 排序功能
   */
  const testSort = () => {
    Alert.alert(
      '排序方式',
      '选择排序方式',
      [
        {
          text: '按收藏数（高到低）',
          onPress: () => loadCollects('collect', 'DESC'),
        },
        {
          text: '按收藏数（低到高）',
          onPress: () => loadCollects('collect', 'ASC'),
        },
        {
          text: '按时间（新到旧）',
          onPress: () => loadCollects('time', 'DESC'),
        },
        {
          text: '按时间（旧到新）',
          onPress: () => loadCollects('time', 'ASC'),
        },
        {
          text: '按名称（A-Z）',
          onPress: () => loadCollects('name', 'ASC'),
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  /**
   * 查看统计信息
   */
  const showStats = () => {
    if (!stats) return;
    
    const tagsText = stats.popularTags
      .map((t: any) => `${t.tag} (${t.count})`)
      .join('\n');

    Alert.alert(
      '📊 统计信息',
      `总收藏: ${stats.totalCount}\n` +
      `最近7天: ${stats.recentCount}\n\n` +
      `热门标签:\n${tagsText || '暂无'}`
    );
  };

  if (!initialized) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loading}>数据库初始化中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          数据库测试 ({stats?.totalCount || 0})
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          测试 SQLite 数据库功能
        </ThemedText>
      </View>

      {/* 测试按钮 */}
      <View style={styles.buttonContainer}>
        <Button title="➕ 添加单个" onPress={testAddOne} />
        <Button title="📦 批量添加" onPress={testAddBatch} />
        <Button title="🔄 排序" onPress={testSort} />
        <Button title="📊 统计" onPress={showStats} />
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索关键词..."
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        <Button title="🔍" onPress={testSearch} />
      </View>

      {/* 列表 */}
      {loading ? (
        <ThemedText style={styles.loading}>加载中...</ThemedText>
      ) : collects.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText style={styles.emptyText}>
            暂无数据
          </ThemedText>
          <ThemedText style={styles.emptyHint}>
            点击上方按钮添加测试数据
          </ThemedText>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {collects.map(item => (
            <CollectCard
              key={item.id}
              tag1={item.tag1}
              tag2={item.tag2}
              name={item.name}
              description={item.description}
              collectCount={item.collectCount}
              onPress={() => testUpdate(item.id)}
              onLongPress={() => testDelete(item.id, item.name)}
            />
          ))}
          
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              点击卡片更新 | 长按卡片删除
            </ThemedText>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  loading: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    opacity: 0.5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
