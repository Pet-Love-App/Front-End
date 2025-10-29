# 快速集成指南 - 将 CollectCard 添加到收藏页面

## 🎯 目标
在 `src/app/(tabs)/collect/index.tsx` 中集成 CollectCard 组件，展示收藏列表。

## 📋 步骤

### 步骤 1: 导入组件

在 `collect/index.tsx` 文件顶部添加导入：

```tsx
import { CollectCard } from '@/src/components/collect-card';
import { ScrollView } from 'react-native';
```

### 步骤 2: 准备数据

在组件中定义收藏数据（或从 API/数据库获取）：

```tsx
export default function CollectScreen() {
  const [searchText, setSearchText] = useState('');
  
  // 添加收藏数据
  const [collectList] = useState([
    {
      id: '1',
      tag1: '成猫粮',
      tag2: '高蛋白',
      name: '皇家猫粮 K36',
      description: '专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素',
      collectCount: 12345,
    },
    {
      id: '2',
      tag1: '幼猫粮',
      tag2: '易消化',
      name: '渴望幼猫粮',
      description: '富含新鲜肉类，为快速成长的幼猫提供充足能量',
      collectCount: 8976,
    },
    // ... 更多数据
  ]);

  // 处理卡片点击
  const handleCardPress = (item: any) => {
    Alert.alert('查看详情', `您点击了: ${item.name}`);
  };

  return (
    // ...
  );
}
```

### 步骤 3: 渲染卡片列表

替换或修改 `<BottomAnimation />` 部分：

```tsx
export default function CollectScreen() {
  // ... 状态定义 ...

  return (
    <ThemedView style={styles.container}>
      {/* 保留现有的搜索栏 */}
      <View style={styles.searchBar}>
        <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
        <ThemedText style={styles.searchInput} onPress={() => keyboardinput()}>
          {searchText || '搜索历史报告...'}
        </ThemedText>
      </View>

      {/* 替换为收藏列表 */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {collectList.map((item) => (
          <CollectCard
            key={item.id}
            tag1={item.tag1}
            tag2={item.tag2}
            name={item.name}
            description={item.description}
            collectCount={item.collectCount}
            onPress={() => handleCardPress(item)}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}
```

### 步骤 4: 更新样式

添加或更新样式：

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginTop: 60,  // 适配刘海屏
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#888',
  },
  scrollView: {
    flex: 1,
  },
});
```

## 🚀 完整代码示例

```tsx
import { CollectCard } from '@/src/components/collect-card';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';

export default function CollectScreen() {
  const [searchText, setSearchText] = useState('');
  
  const [collectList] = useState([
    {
      id: '1',
      tag1: '成猫粮',
      tag2: '高蛋白',
      name: '皇家猫粮 K36',
      description: '专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素，帮助维持猫咪健康体态',
      collectCount: 12345,
    },
    {
      id: '2',
      tag1: '幼猫粮',
      tag2: '易消化',
      name: '渴望幼猫粮',
      description: '富含新鲜肉类，为快速成长的幼猫提供充足能量，促进骨骼和肌肉发育',
      collectCount: 8976,
    },
    {
      id: '3',
      tag1: '全阶段',
      tag2: '无谷配方',
      name: '爱肯拿鸭肉梨',
      description: '单一肉源配方，适合敏感肠胃的猫咪，不含谷物，低过敏原',
      collectCount: 5432,
    },
  ]);

  const handleCardPress = (item: any) => {
    Alert.alert('查看详情', `您点击了: ${item.name}`);
  };

  const handleCardLongPress = (item: any) => {
    Alert.alert(
      '操作',
      `对 ${item.name} 执行操作`,
      [
        { text: '取消收藏', style: 'destructive' },
        { text: '分享', style: 'default' },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchBar}>
        <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
        <ThemedText style={styles.searchInput}>
          {searchText || '搜索我的收藏...'}
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {collectList.map((item) => (
          <CollectCard
            key={item.id}
            tag1={item.tag1}
            tag2={item.tag2}
            name={item.name}
            description={item.description}
            collectCount={item.collectCount}
            onPress={() => handleCardPress(item)}
            onLongPress={() => handleCardLongPress(item)}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginTop: 60,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#888',
  },
  scrollView: {
    flex: 1,
  },
});
```

## 🎨 进阶功能

### 1. 空状态处理

```tsx
{collectList.length === 0 ? (
  <View style={styles.emptyState}>
    <LottieAnimation
      source={require('@/assets/animations/cat_mark_loading.json')}
      width={150}
      height={150}
    />
    <ThemedText style={styles.emptyText}>
      还没有收藏内容
    </ThemedText>
  </View>
) : (
  <ScrollView>
    {collectList.map(item => (
      <CollectCard key={item.id} {...item} />
    ))}
  </ScrollView>
)}
```

### 2. 下拉刷新

```tsx
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  // 重新获取数据
  await fetchCollectList();
  setRefreshing(false);
};

<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* 卡片列表 */}
</ScrollView>
```

### 3. 搜索功能

```tsx
const [searchText, setSearchText] = useState('');

const filteredList = collectList.filter(item =>
  item.name.toLowerCase().includes(searchText.toLowerCase()) ||
  item.description.toLowerCase().includes(searchText.toLowerCase())
);

// 渲染 filteredList 而不是 collectList
```

### 4. 使用 FlatList 优化性能

```tsx
import { FlatList } from 'react-native';

<FlatList
  data={collectList}
  renderItem={({ item }) => (
    <CollectCard
      tag1={item.tag1}
      tag2={item.tag2}
      name={item.name}
      description={item.description}
      collectCount={item.collectCount}
      onPress={() => handleCardPress(item)}
    />
  )}
  keyExtractor={item => item.id}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 20 }}
/>
```

## ✅ 测试清单

- [ ] 卡片能正常显示
- [ ] 点击卡片有响应
- [ ] 长按卡片有响应
- [ ] 列表可以滚动
- [ ] 深色模式切换正常
- [ ] 文字截断正常（测试长文本）
- [ ] 收藏数字格式化正常（测试不同数量级）

## 🐛 常见问题

### Q: 卡片显示不全？
A: 确保 ScrollView 的父容器有 `flex: 1`

### Q: 点击没反应？
A: 检查是否正确传入了 `onPress` 回调函数

### Q: 样式不对？
A: 确保导入了正确的组件，并且主题配置正确

### Q: TypeScript 报错？
A: 确保安装了所有依赖，并且数据类型匹配 `CollectCardProps`

## 📝 注意事项

1. ✅ CollectCard 组件完全独立，不会影响其他文件
2. ✅ 组件已适配深色/浅色主题
3. ✅ 建议使用 FlatList 替代 ScrollView 以优化大列表性能
4. ✅ 可以保留原有的 BottomAnimation 作为空状态展示

## 🎉 完成

现在你已经成功将 CollectCard 组件集成到收藏页面了！

如有问题，请参考：
- `src/components/COLLECT_CARD_README.md` - 完整文档
- `src/components/collect-card-example.tsx` - 示例代码
- `src/components/COLLECT_CARD_VISUAL_GUIDE.md` - 可视化指南
