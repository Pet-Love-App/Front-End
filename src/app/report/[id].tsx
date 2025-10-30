import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { CatFoodCollectItem } from '@/src/types/collect';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ReportScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // 解析传递过来的数据
  const item: CatFoodCollectItem = params.data 
    ? JSON.parse(params.data as string)
    : null;

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>数据加载失败</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: '综合报告',
          headerBackTitle: '返回',
        }} 
      />
      
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 头部信息卡片 */}
          <View style={styles.headerCard}>
            <ThemedText style={styles.title}>{item.name}</ThemedText>
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <ThemedText style={styles.tagText}>{item.tag1}</ThemedText>
              </View>
              <View style={styles.tag}>
                <ThemedText style={styles.tagText}>{item.tag2}</ThemedText>
              </View>
            </View>
          </View>

          {/* 基本信息 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>基本信息</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>品牌：</ThemedText>
              <ThemedText style={styles.infoValue}>{item.brand || '暂无'}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>价格：</ThemedText>
              <ThemedText style={styles.infoValue}>
                {item.price ? `¥${item.price}` : '暂无'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>评分：</ThemedText>
              <ThemedText style={styles.infoValue}>
                {item.rating ? `${item.rating}分` : '暂无'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>收藏人数：</ThemedText>
              <ThemedText style={styles.infoValue}>{item.collectCount}</ThemedText>
            </View>
          </View>

          {/* 产品描述 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>产品描述</ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          </View>

          {/* 收藏时间 */}
          {item.collectTime && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>收藏时间</ThemedText>
              <ThemedText style={styles.description}>
                {new Date(item.collectTime).toLocaleString('zh-CN')}
              </ThemedText>
            </View>
          )}

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => Alert.alert('提示', '查看详细营养成分')}
            >
              <ThemedText style={styles.buttonText}>营养成分</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => Alert.alert('提示', '查看用户评价')}
            >
              <ThemedText style={styles.buttonText}>用户评价</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: '#FF8C42',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF8C42',
  },
  secondaryButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});