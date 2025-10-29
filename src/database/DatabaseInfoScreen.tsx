/**
 * 数据库信息查看工具
 * 
 * 显示数据库路径、统计信息、导出数据等
 */

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { clearCollectTable, getDatabaseStats } from '@/src/database/database';
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Clipboard,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DatabaseInfoScreen() {
  const { collects, loadCollects, getStatistics } = useCollectDatabase();
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [dbPath, setDbPath] = useState<string>('');
  const [dbSize, setDbSize] = useState<string>('');

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      // 加载数据
      await loadCollects();
      
      // 获取统计
      const dbStats = await getDatabaseStats();
      const collectStats = await getStatistics();
      
      setDbInfo(dbStats);
      setStats(collectStats);
      
      // 获取数据库路径和大小
      await getDatabaseInfo();
    } catch (error) {
      console.error('加载信息失败:', error);
    }
  };

  /**
   * 获取数据库文件信息
   */
  const getDatabaseInfo = async () => {
    try {
      // 数据库路径
      const documentDir = FileSystem.documentDirectory;
      const sqliteDir = documentDir + 'SQLite/';
      const path = sqliteDir + 'petlove.db';
      
      setDbPath(path);
      
      // 尝试获取文件大小
      try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists && 'size' in fileInfo) {
          const sizeKB = (fileInfo.size / 1024).toFixed(2);
          setDbSize(`${sizeKB} KB`);
        } else {
          setDbSize('未找到文件');
        }
      } catch (e) {
        setDbSize('无法获取');
      }
    } catch (error) {
      console.error('获取数据库信息失败:', error);
      setDbPath('无法获取路径');
    }
  };

  /**
   * 复制数据库路径
   */
  const copyPath = () => {
    if (Platform.OS === 'web') {
      Alert.alert('提示', dbPath);
    } else {
      // @ts-ignore - Clipboard API 在 RN 中可用
      if (Clipboard && Clipboard.setString) {
        Clipboard.setString(dbPath);
        Alert.alert('✅ 成功', '数据库路径已复制到剪贴板');
      } else {
        Alert.alert('提示', dbPath);
      }
    }
  };

  /**
   * 导出数据为 JSON
   */
  const exportData = async () => {
    try {
      if (collects.length === 0) {
        Alert.alert('提示', '没有数据可导出');
        return;
      }

      const data = {
        exportTime: new Date().toISOString(),
        version: '1.0',
        count: collects.length,
        data: collects,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `petlove_export_${Date.now()}.json`;
      const filePath = FileSystem.documentDirectory + fileName;

      // 写入文件
      await FileSystem.writeAsStringAsync(filePath, jsonString);

      // 分享文件
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: '导出收藏数据',
        });
        Alert.alert('✅ 成功', `已导出 ${collects.length} 条数据`);
      } else {
        Alert.alert('✅ 成功', `数据已保存到:\n${filePath}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      Alert.alert('❌ 失败', '导出数据失败');
    }
  };

  /**
   * 查看原始数据
   */
  const viewRawData = () => {
    if (collects.length === 0) {
      Alert.alert('提示', '没有数据');
      return;
    }

    const sample = collects.slice(0, 3);
    const text = JSON.stringify(sample, null, 2);
    
    Alert.alert(
      '原始数据示例',
      `前 3 条数据:\n\n${text.substring(0, 500)}...`,
      [{ text: '关闭' }]
    );
  };

  /**
   * 清空数据库
   */
  const clearDatabase = () => {
    Alert.alert(
      '⚠️ 警告',
      '确定要清空所有收藏数据吗？此操作不可恢复！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCollectTable();
              await loadInfo();
              Alert.alert('✅ 成功', '数据库已清空');
            } catch (error) {
              Alert.alert('❌ 失败', '清空失败');
            }
          },
        },
      ]
    );
  };

  /**
   * 查看表结构
   */
  const viewSchema = () => {
    const schema = `CREATE TABLE cat_food_collect (
  id TEXT PRIMARY KEY NOT NULL,
  tag1 TEXT NOT NULL,
  tag2 TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  collectCount INTEGER NOT NULL DEFAULT 0,
  collectTime INTEGER,
  imageUrl TEXT,
  brand TEXT,
  price REAL,
  rating REAL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

索引:
- idx_collect_time (collectTime DESC)
- idx_name (name)
- idx_tag1 (tag1)
- idx_tag2 (tag2)`;

    Alert.alert('数据库表结构', schema, [{ text: '关闭' }]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>数据库信息</ThemedText>
          <ThemedText style={styles.subtitle}>
            查看和管理 SQLite 数据库
          </ThemedText>
        </View>

        {/* 基本信息 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📊 基本信息</ThemedText>
          
          <InfoRow label="数据库名称" value="petlove.db" />
          <InfoRow label="版本" value={`v${dbInfo?.version || 1}`} />
          <InfoRow label="文件大小" value={dbSize || '计算中...'} />
          <InfoRow label="平台" value={Platform.OS.toUpperCase()} />
        </View>

        {/* 数据库路径 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📍 数据库路径</ThemedText>
          
          <TouchableOpacity 
            style={styles.pathContainer}
            onPress={copyPath}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.pathText} numberOfLines={3}>
              {dbPath || '获取中...'}
            </ThemedText>
            <ThemedText style={styles.pathHint}>
              点击复制路径
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 数据统计 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📈 数据统计</ThemedText>
          
          <InfoRow 
            label="总收藏数" 
            value={stats?.totalCount?.toString() || '0'} 
          />
          <InfoRow 
            label="最近7天" 
            value={stats?.recentCount?.toString() || '0'} 
          />
          <InfoRow 
            label="热门标签" 
            value={
              stats?.popularTags
                ?.slice(0, 3)
                .map((t: any) => t.tag)
                .join(', ') || '暂无'
            } 
          />
        </View>

        {/* 表信息 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🗂️ 表信息</ThemedText>
          
          <InfoRow label="表名" value="cat_food_collect" />
          <InfoRow label="字段数" value="13" />
          <InfoRow label="索引数" value="4" />
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={viewSchema}
          >
            <ThemedText style={styles.linkText}>
              查看完整表结构 →
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 操作按钮 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🛠️ 操作</ThemedText>
          
          <View style={styles.buttonGroup}>
            <Button 
              title="📤 导出数据" 
              onPress={exportData}
            />
            <View style={styles.buttonSpacer} />
            <Button 
              title="👀 查看原始数据" 
              onPress={viewRawData}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button 
              title="🔄 刷新信息" 
              onPress={loadInfo}
            />
            <View style={styles.buttonSpacer} />
            <Button 
              title="🗑️ 清空数据库" 
              onPress={clearDatabase}
              color="#ff4444"
            />
          </View>
        </View>

        {/* 说明 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>💡 说明</ThemedText>
          
          <ThemedText style={styles.infoText}>
            • 数据库文件存储在应用的私有目录中{'\n'}
            • 卸载应用会删除数据库{'\n'}
            • 建议定期导出重要数据{'\n'}
            • 清空操作不可恢复，请谨慎使用
          </ThemedText>
        </View>

        {/* 底部空间 */}
        <View style={styles.footer} />
      </ScrollView>
    </ThemedView>
  );
}

/**
 * 信息行组件
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}:</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 24,
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  pathContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  pathText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  pathHint: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#007AFF',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  buttonSpacer: {
    width: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.7,
  },
  footer: {
    height: 40,
  },
});
