# CollectCard 组件使用文档

## 概述

`CollectCard` 是一个用于展示收藏猫粮信息的卡片组件，支持深色/浅色主题自动切换，具有良好的交互体验。

## 功能特性

- ✅ 展示两个标签（tag1, tag2）
- ✅ 显示猫粮名称
- ✅ 显示猫粮简介（最多2行，超出显示省略号）
- ✅ 显示收藏人数（自动格式化：1.2K, 1.5W）
- ✅ 点击交互（按下时缩放效果）
- ✅ 支持点击和长按事件
- ✅ 自动适配深色/浅色主题
- ✅ 卡片阴影效果

## 组件位置

```
src/components/collect-card.tsx
```

## 使用方法

### 基础用法

```tsx
import { CollectCard } from '@/src/components/collect-card';

<CollectCard
  tag1="成猫粮"
  tag2="高蛋白"
  name="皇家猫粮 K36"
  description="专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素"
  collectCount={12345}
  onPress={() => console.log('点击了卡片')}
/>
```

### 完整示例（带长按）

```tsx
import { CollectCard } from '@/src/components/collect-card';
import { Alert } from 'react-native';

<CollectCard
  tag1="幼猫粮"
  tag2="易消化"
  name="渴望幼猫粮"
  description="富含新鲜肉类，为快速成长的幼猫提供充足能量"
  collectCount={8976}
  onPress={() => {
    // 点击查看详情
    navigation.navigate('Detail', { id: '123' });
  }}
  onLongPress={() => {
    // 长按显示更多操作
    Alert.alert('操作', '取消收藏？');
  }}
  style={{ marginTop: 20 }}
/>
```

### 在列表中使用

```tsx
import { CollectCard } from '@/src/components/collect-card';
import { ScrollView } from 'react-native';

const data = [
  {
    id: '1',
    tag1: '成猫粮',
    tag2: '高蛋白',
    name: '皇家猫粮',
    description: '专业营养配方',
    collectCount: 12345,
  },
  // ... 更多数据
];

<ScrollView>
  {data.map((item) => (
    <CollectCard
      key={item.id}
      tag1={item.tag1}
      tag2={item.tag2}
      name={item.name}
      description={item.description}
      collectCount={item.collectCount}
      onPress={() => handlePress(item.id)}
    />
  ))}
</ScrollView>
```

## Props 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `tag1` | `string` | ✅ | - | 第一个标签文字 |
| `tag2` | `string` | ✅ | - | 第二个标签文字 |
| `name` | `string` | ✅ | - | 猫粮名称 |
| `description` | `string` | ✅ | - | 猫粮简介（最多显示2行） |
| `collectCount` | `number` | ✅ | - | 收藏人数 |
| `onPress` | `() => void` | ❌ | - | 点击卡片的回调函数 |
| `onLongPress` | `() => void` | ❌ | - | 长按卡片的回调函数 |
| `style` | `ViewStyle` | ❌ | - | 自定义卡片样式 |

## 收藏人数格式化规则

- `0 - 999`: 直接显示数字，如 `999 人收藏`
- `1,000 - 9,999`: 显示K格式，如 `1.2K 人收藏`
- `10,000+`: 显示W格式，如 `1.5W 人收藏`

## 主题适配

组件会自动根据系统主题切换样式：

**浅色模式：**
- 卡片背景：白色
- 标签背景：浅橙色 (#FFF5E6)
- 标签文字：橙色 (#FF8C42)
- 收藏图标：红色 (#FF6B6B)

**深色模式：**
- 卡片背景：深灰色 (#1E1E1E)
- 标签背景：深灰色 (#2A2A2A)
- 标签文字：浅橙色 (#FFB366)
- 收藏图标：浅橙色 (#FFB366)

## 交互效果

- 按下卡片时会有轻微的缩放效果（0.98倍）
- 松开后恢复原大小
- 提供触觉反馈（通过 Pressable 组件）

## 示例代码

完整的示例代码请参考：
```
src/components/collect-card-example.tsx
```

该文件包含：
- 列表展示示例
- 单个卡片示例
- 模拟数据
- 交互处理示例

## 在 collect/index.tsx 中集成

```tsx
import { CollectCard } from '@/src/components/collect-card';

// 在你的 CollectScreen 组件中
export default function CollectScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* 现有的搜索栏 */}
      
      {/* 添加收藏列表 */}
      <ScrollView>
        <CollectCard
          tag1="成猫粮"
          tag2="高蛋白"
          name="皇家猫粮"
          description="专业营养配方"
          collectCount={12345}
          onPress={() => Alert.alert('点击了卡片')}
        />
      </ScrollView>
    </ThemedView>
  );
}
```

## 注意事项

1. 组件不会修改或污染其他文件，完全独立
2. 使用了项目现有的 `ThemedText` 组件保持一致性
3. 遵循项目的主题配置 (`src/constants/theme.ts`)
4. 支持 TypeScript 类型检查
5. 简介文字超过2行会自动截断并显示省略号

## 开发建议

- 如需修改卡片样式，可通过 `style` prop 传入自定义样式
- 建议在真实项目中将数据存储到状态管理工具（如 Redux, Zustand）
- 可以添加骨架屏加载效果优化用户体验
- 可以添加下拉刷新和上拉加载更多功能
