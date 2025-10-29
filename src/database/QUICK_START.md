# 🚀 SQLite 数据库快速参考

## 📦 一行代码开始使用

```tsx
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
const { collects, addCollect, deleteCollect } = useCollectDatabase();
```

## 🎯 常用操作

### 1️⃣ 添加收藏

```tsx
const item: CatFoodCollectItem = {
  id: Date.now().toString(),
  tag1: '成猫粮',
  tag2: '高蛋白',
  name: '皇家猫粮',
  description: '专业配方',
  collectCount: 12345,
};

await addCollect(item);
```

### 2️⃣ 查询所有

```tsx
useEffect(() => {
  loadCollects(); // 自动加载到 collects 状态
}, []);

// 使用数据
collects.map(item => <CollectCard {...item} />)
```

### 3️⃣ 删除收藏

```tsx
await deleteCollect(id);
```

### 4️⃣ 更新收藏

```tsx
await updateCollect(id, { rating: 5.0 });
```

### 5️⃣ 搜索

```tsx
const results = await searchCollects('皇家');
```

## 📋 完整 Hook API

```tsx
const {
  // 状态
  collects,              // 收藏列表
  loading,               // 加载状态
  initialized,           // 是否初始化完成
  
  // 方法
  loadCollects,          // 加载列表
  addCollect,            // 添加
  deleteCollect,         // 删除
  updateCollect,         // 更新
  searchCollects,        // 搜索
  getCollectsByTags,     // 按标签查询
  getStatistics,         // 统计信息
  isCollected,           // 检查是否已收藏
} = useCollectDatabase();
```

## 🎨 在 CollectScreen 中使用

```tsx
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { CollectCard } from '@/src/components/collect-card';

export default function CollectScreen() {
  const { collects, loadCollects, deleteCollect } = useCollectDatabase();

  useEffect(() => {
    loadCollects();
  }, []);

  return (
    <ScrollView>
      {collects.map(item => (
        <CollectCard
          key={item.id}
          {...item}
          onLongPress={() => deleteCollect(item.id)}
        />
      ))}
    </ScrollView>
  );
}
```

## 🔧 高级用法

### 排序

```tsx
loadCollects('collect', 'DESC'); // 按收藏数降序
loadCollects('time', 'DESC');    // 按时间降序
loadCollects('name', 'ASC');     // 按名称升序
```

### 统计

```tsx
const stats = await getStatistics();
console.log(stats.totalCount);      // 总数
console.log(stats.recentCount);     // 最近7天
console.log(stats.popularTags);     // 热门标签
```

### 批量操作

```tsx
// 批量添加
for (const item of items) {
  await addCollect(item);
}

// 批量删除
for (const id of ids) {
  await deleteCollect(id);
}
```

## 📁 文件位置

```
src/database/
├── database.ts                  ← 数据库配置
├── collectService.ts            ← 数据库操作
├── useCollectDatabase.ts        ← React Hook ⭐
├── DATABASE_GUIDE.md            ← 完整文档
└── DatabaseTestScreen.tsx       ← 测试页面
```

## ✅ 三步集成

### Step 1: 导入 Hook
```tsx
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
```

### Step 2: 使用 Hook
```tsx
const { collects, loadCollects, addCollect } = useCollectDatabase();
```

### Step 3: 渲染数据
```tsx
{collects.map(item => <CollectCard key={item.id} {...item} />)}
```

## 💡 注意事项

1. ✅ Hook 会自动初始化数据库
2. ✅ 数据永久保存在设备上
3. ✅ 支持 TypeScript 类型检查
4. ✅ 所有操作都是异步的（使用 async/await）
5. ✅ 删除后状态会自动更新

## 🐛 常见问题

**Q: 数据不显示？**
```tsx
// 确保调用了 loadCollects
useEffect(() => {
  loadCollects();
}, []);
```

**Q: 如何生成唯一 ID？**
```tsx
const id = Date.now().toString() + Math.random();
// 或使用 UUID 库
```

**Q: 如何清空数据？**
```tsx
import { clearCollectTable } from '@/src/database/database';
await clearCollectTable();
```

## 📚 更多文档

- **完整教程**: `DATABASE_GUIDE.md`
- **测试页面**: `DatabaseTestScreen.tsx`
- **API 文档**: `collectService.ts`

---

**开始使用**: 复制上面的代码，直接粘贴到你的 CollectScreen 中！🚀
