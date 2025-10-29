# 📚 SQLite 数据库使用指南

## 📖 概述

这个数据库系统基于 Expo SQLite，用于本地存储猫粮收藏信息。

## 🎯 功能特性

- ✅ **添加收藏** - 保存猫粮信息到本地
- ✅ **删除收藏** - 移除不需要的收藏
- ✅ **更新收藏** - 修改收藏信息
- ✅ **查询收藏** - 按各种条件查询
- ✅ **搜索功能** - 关键词搜索
- ✅ **统计信息** - 收藏统计数据
- ✅ **自动初始化** - 首次使用自动创建数据库

## 📁 文件结构

```
src/database/
├── database.ts              ← 数据库配置和初始化
├── collectService.ts        ← 数据库操作接口（CRUD）
└── useCollectDatabase.ts    ← React Hook 封装
```

## 🚀 快速开始

### 方式1: 使用 Hook（推荐）

```tsx
import { useCollectDatabase } from '@/src/database/useCollectDatabase';

function MyComponent() {
  const { 
    collects,           // 收藏列表
    loading,            // 加载状态
    loadCollects,       // 加载数据
    addCollect,         // 添加
    deleteCollect,      // 删除
    updateCollect,      // 更新
  } = useCollectDatabase();

  // 加载数据
  useEffect(() => {
    loadCollects();
  }, []);

  // 使用数据
  return (
    <ScrollView>
      {collects.map(item => (
        <CollectCard key={item.id} {...item} />
      ))}
    </ScrollView>
  );
}
```

### 方式2: 直接调用接口

```tsx
import * as CollectService from '@/src/database/collectService';

// 添加收藏
await CollectService.addCollect({
  id: '1',
  tag1: '成猫粮',
  tag2: '高蛋白',
  name: '皇家猫粮',
  description: '专业配方',
  collectCount: 12345,
});

// 查询所有
const list = await CollectService.getAllCollects();

// 删除
await CollectService.deleteCollect('1');
```

## 📝 详细用法

### 1️⃣ 添加收藏

```tsx
import { useCollectDatabase } from '@/src/database/useCollectDatabase';

function AddCollectExample() {
  const { addCollect } = useCollectDatabase();

  const handleAdd = async () => {
    const newItem: CatFoodCollectItem = {
      id: Date.now().toString(), // 生成唯一 ID
      tag1: '成猫粮',
      tag2: '高蛋白',
      name: '皇家猫粮 K36',
      description: '专为成年猫设计的营养配方',
      collectCount: 12345,
      collectTime: Date.now(),
      brand: '皇家',
      price: 298,
      rating: 4.8,
    };

    const success = await addCollect(newItem);
    
    if (success) {
      Alert.alert('成功', '添加收藏成功');
    } else {
      Alert.alert('失败', '添加收藏失败');
    }
  };

  return (
    <Button title="添加收藏" onPress={handleAdd} />
  );
}
```

### 2️⃣ 查询和显示收藏

```tsx
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { CollectCard } from '@/src/components/collect-card';

function CollectListExample() {
  const { collects, loading, loadCollects } = useCollectDatabase();

  // 初始加载
  useEffect(() => {
    loadCollects('time', 'DESC'); // 按时间倒序
  }, []);

  if (loading) {
    return <Text>加载中...</Text>;
  }

  return (
    <ScrollView>
      {collects.map(item => (
        <CollectCard
          key={item.id}
          tag1={item.tag1}
          tag2={item.tag2}
          name={item.name}
          description={item.description}
          collectCount={item.collectCount}
        />
      ))}
    </ScrollView>
  );
}
```

### 3️⃣ 删除收藏

```tsx
function DeleteExample() {
  const { deleteCollect } = useCollectDatabase();

  const handleDelete = async (id: string, name: string) => {
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
              Alert.alert('成功', '已删除收藏');
            }
          },
        },
      ]
    );
  };

  return (
    <CollectCard
      {...item}
      onLongPress={() => handleDelete(item.id, item.name)}
    />
  );
}
```

### 4️⃣ 更新收藏

```tsx
function UpdateExample() {
  const { updateCollect } = useCollectDatabase();

  const handleUpdateRating = async (id: string) => {
    const success = await updateCollect(id, {
      rating: 5.0,
      collectCount: 20000,
    });

    if (success) {
      Alert.alert('成功', '更新成功');
    }
  };

  return <Button title="更新评分" onPress={() => handleUpdateRating('1')} />;
}
```

### 5️⃣ 搜索功能

```tsx
function SearchExample() {
  const { searchCollects } = useCollectDatabase();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<CatFoodCollectItem[]>([]);

  const handleSearch = async () => {
    const data = await searchCollects(keyword);
    setResults(data);
  };

  return (
    <>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="搜索猫粮..."
      />
      <Button title="搜索" onPress={handleSearch} />
      
      {results.map(item => (
        <CollectCard key={item.id} {...item} />
      ))}
    </>
  );
}
```

### 6️⃣ 统计信息

```tsx
function StatisticsExample() {
  const { getStatistics } = useCollectDatabase();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getStatistics();
    setStats(data);
  };

  return (
    <View>
      <Text>总收藏: {stats?.totalCount}</Text>
      <Text>最近7天: {stats?.recentCount}</Text>
      <Text>热门标签: {stats?.popularTags.map(t => t.tag).join(', ')}</Text>
    </View>
  );
}
```

### 7️⃣ 排序功能

```tsx
function SortExample() {
  const { loadCollects } = useCollectDatabase();

  const sortByCollectCount = () => {
    loadCollects('collect', 'DESC'); // 按收藏数降序
  };

  const sortByTime = () => {
    loadCollects('time', 'DESC'); // 按时间降序
  };

  const sortByName = () => {
    loadCollects('name', 'ASC'); // 按名称升序
  };

  return (
    <View>
      <Button title="按收藏数排序" onPress={sortByCollectCount} />
      <Button title="按时间排序" onPress={sortByTime} />
      <Button title="按名称排序" onPress={sortByName} />
    </View>
  );
}
```

## 🎨 完整示例：CollectScreen

```tsx
import { CollectCard } from '@/src/components/collect-card';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function CollectScreen() {
  const { 
    collects, 
    loading, 
    loadCollects, 
    deleteCollect,
    searchCollects,
    getStatistics,
  } = useCollectDatabase();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [stats, setStats] = useState<any>(null);

  // 初始加载
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadCollects('time', 'DESC');
    const statistics = await getStatistics();
    setStats(statistics);
  };

  // 搜索
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      const results = await searchCollects(keyword);
      // 显示搜索结果
    } else {
      await loadCollects();
    }
  };

  // 删除
  const handleDelete = (id: string, name: string) => {
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
              Alert.alert('成功', '已删除收藏');
              loadData(); // 刷新统计
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* 统计信息 */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          我的收藏 ({stats?.totalCount || 0})
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          最近7天收藏了 {stats?.recentCount || 0} 个
        </ThemedText>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索收藏..."
          value={searchKeyword}
          onChangeText={handleSearch}
        />
      </View>

      {/* 收藏列表 */}
      {loading ? (
        <ThemedText style={styles.loading}>加载中...</ThemedText>
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
              onPress={() => Alert.alert('详情', item.description)}
              onLongPress={() => handleDelete(item.id, item.name)}
            />
          ))}
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  loading: {
    textAlign: 'center',
    padding: 20,
  },
});
```

## 🔧 API 参考

### Hook API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `loadCollects` | `orderBy?, order?` | `Promise<CatFoodCollectItem[]>` | 加载所有收藏 |
| `addCollect` | `item: CatFoodCollectItem` | `Promise<boolean>` | 添加收藏 |
| `deleteCollect` | `id: string` | `Promise<boolean>` | 删除收藏 |
| `updateCollect` | `id, updates` | `Promise<boolean>` | 更新收藏 |
| `searchCollects` | `keyword: string` | `Promise<CatFoodCollectItem[]>` | 搜索收藏 |
| `getStatistics` | - | `Promise<Statistics>` | 获取统计信息 |
| `isCollected` | `id: string` | `Promise<boolean>` | 检查是否已收藏 |

### Service API

```tsx
import * as CollectService from '@/src/database/collectService';

// 添加
await CollectService.addCollect(item);

// 批量添加
await CollectService.addCollectBatch(items);

// 删除
await CollectService.deleteCollect(id);

// 批量删除
await CollectService.deleteCollectBatch(ids);

// 更新
await CollectService.updateCollect(id, updates);

// 查询
await CollectService.getCollectById(id);
await CollectService.getAllCollects(orderBy, order);
await CollectService.searchCollects(keyword);
await CollectService.getCollectsByTags(tags);

// 统计
await CollectService.getCollectStatistics();
await CollectService.getCollectCount();
await CollectService.isCollectExists(id);
```

## 💡 最佳实践

### 1. 使用 Hook 而不是直接调用 Service

✅ 推荐：
```tsx
const { addCollect } = useCollectDatabase();
await addCollect(item);
```

❌ 不推荐：
```tsx
await CollectService.addCollect(item);
```

### 2. 生成唯一 ID

```tsx
const newItem = {
  id: Date.now().toString() + Math.random(),
  // 或使用 UUID 库
  // id: uuid(),
  ...
};
```

### 3. 错误处理

```tsx
try {
  const success = await addCollect(item);
  if (!success) {
    Alert.alert('错误', '添加失败');
  }
} catch (error) {
  console.error(error);
  Alert.alert('错误', '发生异常');
}
```

### 4. 加载状态

```tsx
const { loading } = useCollectDatabase();

if (loading) {
  return <ActivityIndicator />;
}
```

## 🐛 故障排除

### Q: 数据库初始化失败？
A: 检查 expo-sqlite 是否正确安装：`npx expo install expo-sqlite`

### Q: 数据不同步？
A: 删除后记得调用 `loadCollects()` 重新加载

### Q: 搜索不到数据？
A: 检查关键词是否正确，搜索是模糊匹配

### Q: 如何重置数据库？
```tsx
import { clearCollectTable } from '@/src/database/database';
await clearCollectTable();
```

## 📊 数据库结构

```sql
CREATE TABLE cat_food_collect (
  id TEXT PRIMARY KEY,
  tag1 TEXT NOT NULL,
  tag2 TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  collectCount INTEGER,
  collectTime INTEGER,
  imageUrl TEXT,
  brand TEXT,
  price REAL,
  rating REAL,
  createdAt INTEGER,
  updatedAt INTEGER
);
```

## 🎓 总结

1. **使用 Hook** - `useCollectDatabase()` 是最简单的方式
2. **自动初始化** - 首次使用会自动创建数据库
3. **完整 CRUD** - 增删改查功能齐全
4. **类型安全** - 完整的 TypeScript 支持
5. **本地存储** - 数据永久保存在设备上

开始使用吧！🚀
