import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { CatFoodCollectItem } from '@/src/types/collect';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

// 添加剂气泡组件
function AdditiveBubble({ additive, index, total, onPress }: any) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 随机颜色（橙黄色调）
  const colors = ['#FFB347', '#FFA500', '#FF8C42', '#FFD700', '#FDB45C', '#FF9966', '#FFAA33'];
  const color = colors[index % colors.length];

  // 随机大小
  const size = 60 + Math.random() * 40;

  // 计算气泡位置（圆形排列，避免重叠）
  const angle = (index / total) * Math.PI * 2;
  const radius = 80 + Math.random() * 30;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  useEffect(() => {
    // 轻微碰撞动画
    scale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 2 }),
        withSpring(0.95, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );

    translateX.value = withRepeat(
      withSequence(
        withSpring(Math.random() * 10 - 5, { damping: 5 }),
        withSpring(0, { damping: 5 })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withSpring(Math.random() * 10 - 5, { damping: 5 }),
        withSpring(0, { damping: 5 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + translateX.value },
      { translateY: y + translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.bubble, animatedStyle, { backgroundColor: color, width: size, height: size }]}
    >
      <TouchableOpacity
        style={styles.bubbleContent}
        onPress={() => onPress(additive)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.bubbleText} numberOfLines={2}>
          {additive.name}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ReportScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [detailData, setDetailData] = useState<any>(null);
  const [selectedAdditive, setSelectedAdditive] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 解析传递过来的数据
  const item: CatFoodCollectItem = params.data ? JSON.parse(params.data as string) : null;

  useEffect(() => {
    if (item) {
      loadDetailData();
    }
  }, [item]);

  // 加载详细数据（添加剂、营养成分、评论）
  const loadDetailData = async () => {
    try {
      const { getFoodDetail } = require('@/src/database/collectExtendedService');
      const detail = await getFoodDetail(item.id);
      setDetailData(detail);
    } catch (error) {
      console.error('加载详情失败:', error);
    }
  };

  // 显示添加剂详情
  const showAdditiveDetail = (additive: any) => {
    setSelectedAdditive(additive);
    setModalVisible(true);
  };

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>数据加载失败</ThemedText>
      </ThemedView>
    );
  }

  // 准备饼图数据
  const preparePieChartData = () => {
    if (!detailData?.nutrition || detailData.nutrition.length === 0) {
      return [];
    }
    //color设置10个对比度较大的颜色
    // 柔和版高对比度颜色
    const colors = [
      '#E74C3C', // 红色
      '#2ECC71', // 绿色
      '#3498DB', // 蓝色
      '#F1C40F', // 黄色
      '#9B59B6', // 紫色
      '#1ABC9C', // 青绿色
      '#E67E22', // 橙色
      '#34495E', // 深蓝色
      '#95A5A6', // 灰色
      '#2C3E50', // 深灰色
    ];
    //这里处理一下百分比加起来不等于100的问题，如果不到100，可以用“其它”来表示
    const totalPercentage = detailData.nutrition.reduce(
      (sum: number, item: any) => sum + item.percentage,
      0
    );
    if (totalPercentage < 100) {
      const otherPercentage = 100 - totalPercentage;
      detailData.nutrition.push({
        name: '其它',
        percentage: otherPercentage,
        color: '#CCCCCC',
        legendFontColor: '#666',
        legendFontSize: 12,
      });
    }

    return detailData.nutrition.map((item: any, index: number) => ({
      name: item.name,
      //这里全部取成小数点后一位
      population: parseFloat(item.percentage.toFixed(1)),
      color: colors[index % colors.length],
      legendFontColor: '#666',
      legendFontSize: 12,
    }));
  };

  const screenWidth = Dimensions.get('window').width;

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

          {/* 添加剂气泡图 */}
          {detailData?.additives && detailData.additives.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>添加剂成分</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>点击气泡查看详情</ThemedText>
              <View style={styles.bubblesContainer}>
                {detailData.additives.map((additive: any, index: number) => (
                  <AdditiveBubble
                    key={index}
                    additive={additive}
                    index={index}
                    total={detailData.additives.length}
                    onPress={showAdditiveDetail}
                  />
                ))}
              </View>
            </View>
          )}

          {/* 营养成分饼图 */}
          {detailData?.nutrition && detailData.nutrition.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>营养成分分析</ThemedText>
              <View style={styles.chartContainer}>
                <PieChart
                  data={preparePieChartData()}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 140, 66, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
              <View style={styles.nutritionList}>
                {detailData.nutrition.map((item: any, index: number) => (
                  <View key={index} style={styles.nutritionItem}>
                    <ThemedText style={styles.nutritionName}>{item.name}</ThemedText>
                    <ThemedText style={styles.nutritionValue}>
                      {item.percentage}
                      {item.unit}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 高赞评论 */}
          {detailData?.topComments && detailData.topComments.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>高赞评论</ThemedText>
              {detailData.topComments.map((comment: any, index: number) => (
                <View key={index} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentUserInfo}>
                      <View style={styles.avatar}>
                        <ThemedText style={styles.avatarText}>
                          {comment.userName.charAt(0)}
                        </ThemedText>
                      </View>
                      <View>
                        <ThemedText style={styles.userName}>{comment.userName}</ThemedText>
                        <ThemedText style={styles.commentTime}>
                          {new Date(comment.commentTime).toLocaleDateString('zh-CN')}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.commentStats}>
                      <ThemedText style={styles.likes}>👍 {comment.likeCount}</ThemedText>
                      {comment.rating && (
                        <ThemedText style={styles.rating}>⭐ {comment.rating}</ThemedText>
                      )}
                    </View>
                  </View>
                  <ThemedText style={styles.commentContent}>{comment.content}</ThemedText>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* 添加剂详情弹窗 */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              {selectedAdditive && (
                <>
                  <ThemedText style={styles.modalTitle}>{selectedAdditive.name}</ThemedText>
                  <View style={styles.modalInfo}>
                    <ThemedText style={styles.modalLabel}>类别：</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {selectedAdditive.category || '未分类'}
                    </ThemedText>
                  </View>
                  <View style={styles.modalInfo}>
                    <ThemedText style={styles.modalLabel}>说明：</ThemedText>
                    <ThemedText style={styles.modalDescription}>
                      {selectedAdditive.description || '暂无说明'}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <ThemedText style={styles.closeButtonText}>关闭</ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
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
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
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
  // 添加剂气泡样式
  bubblesContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bubbleContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // 营养成分样式
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  nutritionList: {
    marginTop: 16,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutritionName: {
    fontSize: 14,
    color: '#333',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C42',
  },
  // 评论卡片样式
  commentCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  commentStats: {
    alignItems: 'flex-end',
  },
  likes: {
    fontSize: 13,
    color: '#FF8C42',
    fontWeight: '600',
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#FF8C42',
  },
  modalInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  modalValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  safetyGreen: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 24,
  },
});
