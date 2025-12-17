import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { XStack, Stack } from 'tamagui'; // 新增 Stack 导入，移除不存在的 Section

export default function CreditScoreExplanation() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>信用分计算规则</Text>

      {/* 总分构成部分 - 替换不存在的 Section 组件 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>总分构成（0-100分）</Text>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>资料完整度（15%）</Text>
          <Text style={styles.itemDesc}>
            用户名（3分）+ 头像（2分）+ 宠物信息（6分）+ 地理位置（4分）
          </Text>
        </View>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>评价可信度（40%）</Text>
          <Text style={styles.itemDesc}>
            评分一致性（15分）+ 评价行为健康度（15分）+ 评价质量（10分）
          </Text>
        </View>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>社区贡献（25%）</Text>
          <Text style={styles.itemDesc}>基于发布的评价数量，50条评价即可获得满分</Text>
        </View>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>合规性（20%）</Text>
          <Text style={styles.itemDesc}>无违规记录满分，每违规一次扣5分</Text>
        </View>
      </View>

      {/* 评价可信度详细规则 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>评价可信度详细规则</Text>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>评分一致性</Text>
          <Text style={styles.itemDesc}>
            新用户（注册（30天）评分与社区平均分偏差≤3分不扣分，老用户≤2分不扣分，超出部分每分扣0.5分
          </Text>
        </View>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>评价行为健康度</Text>
          <Text style={styles.itemDesc}>短时间内大量评分、极端评分（1分/5分）占比过高会扣分</Text>
        </View>

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>评价质量</Text>
          <Text style={styles.itemDesc}>带文字评论的评价占比（5分）+ 带图片的评价占比（5分）</Text>
        </View>
      </View>

      {/* 申诉通道 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>申诉通道</Text>
        <Text style={styles.text}>
          如您认为信用分计算有误，可在「我的-信用分-申诉」中提交申诉，管理员将在1-3个工作日内处理。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#444',
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
