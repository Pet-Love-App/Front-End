# 🚀 CollectCard 快速参考卡

## 📦 安装（无需安装，已创建完成）

组件已经创建在你的项目中，可以直接使用！

## 📝 最简单的使用（复制粘贴）

```tsx
import { CollectCard } from '@/src/components/collect-card';

<CollectCard
  tag1="成猫粮"
  tag2="高蛋白"
  name="皇家猫粮"
  description="专业营养配方"
  collectCount={12345}
  onPress={() => console.log('点击')}
/>
```

## 📋 所有参数一览

```tsx
<CollectCard
  tag1="成猫粮"              // 必填：标签1
  tag2="高蛋白"              // 必填：标签2
  name="皇家猫粮"            // 必填：猫粮名称
  description="专业配方"     // 必填：简介（最多2行）
  collectCount={12345}       // 必填：收藏人数（自动格式化）
  onPress={() => {}}         // 可选：点击回调
  onLongPress={() => {}}     // 可选：长按回调
  style={{ margin: 10 }}     // 可选：自定义样式
/>
```

## 🔢 收藏数字格式化

- `999` → `999 人收藏`
- `1234` → `1.2K 人收藏`
- `12345` → `1.2W 人收藏`

## 🎨 主题

自动适配系统主题（浅色/深色模式），无需额外配置！

## 📱 在列表中使用

```tsx
<ScrollView>
  {data.map(item => (
    <CollectCard key={item.id} {...item} />
  ))}
</ScrollView>
```

## 📚 详细文档

- **完整文档**: `src/components/COLLECT_CARD_README.md`
- **快速集成**: `src/components/COLLECT_CARD_INTEGRATION.md`
- **设计指南**: `src/components/COLLECT_CARD_VISUAL_GUIDE.md`
- **示例代码**: `src/components/collect-card-example.tsx`

## 🎯 三步集成到 collect 页面

### Step 1: 导入
```tsx
import { CollectCard } from '@/src/components/collect-card';
```

### Step 2: 准备数据
```tsx
const data = [
  {
    id: '1',
    tag1: '成猫粮',
    tag2: '高蛋白',
    name: '皇家猫粮',
    description: '专业配方',
    collectCount: 12345,
  },
];
```

### Step 3: 渲染
```tsx
<ScrollView>
  {data.map(item => (
    <CollectCard key={item.id} {...item} />
  ))}
</ScrollView>
```

## ✅ 特性检查表

- ✅ 两个标签显示
- ✅ 猫粮名称（粗体）
- ✅ 简介（最多2行）
- ✅ 收藏人数（格式化）
- ✅ 点击交互
- ✅ 长按交互
- ✅ 按压动画
- ✅ 深色模式
- ✅ 浅色模式
- ✅ 完全独立
- ✅ 不污染其他文件

## 🐛 遇到问题？

1. **卡片不显示** → 检查父容器有 `flex: 1`
2. **点击无反应** → 确认传入了 `onPress`
3. **样式不对** → 检查导入路径和主题配置
4. **类型错误** → 参考 `src/types/collect.ts`

## 💡 进阶用法

### 添加空状态
```tsx
{list.length === 0 ? (
  <Text>暂无收藏</Text>
) : (
  list.map(item => <CollectCard {...item} />)
)}
```

### 添加下拉刷新
```tsx
<ScrollView
  refreshControl={
    <RefreshControl refreshing={loading} onRefresh={refresh} />
  }
>
```

### 使用 FlatList（大列表优化）
```tsx
<FlatList
  data={data}
  renderItem={({ item }) => <CollectCard {...item} />}
  keyExtractor={item => item.id}
/>
```

## 📞 快速帮助

**Q: 如何修改颜色？**  
A: 修改 `collect-card.tsx` 中的颜色常量

**Q: 如何添加图片？**  
A: 扩展组件添加 `imageUrl` prop 和 `Image` 组件

**Q: 如何连接 API？**  
A: 将模拟数据替换为 `fetch()` 或 `axios` 调用

## 🎉 完成！

组件已就绪，可以立即使用！  
复制上面的代码开始使用吧 🚀

---

**文件位置**: `src/components/collect-card.tsx`  
**类型定义**: `src/types/collect.ts`  
**示例代码**: `src/components/collect-card-example.tsx`
