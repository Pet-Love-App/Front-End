# CollectCard 组件可视化说明

## 组件结构

```
┌─────────────────────────────────────┐
│  ┌────────┐  ┌────────┐            │ ← 标签区域
│  │ 标签1  │  │ 标签2  │            │
│  └────────┘  └────────┘            │
│                                     │
│  猫粮名称                           │ ← 标题（粗体，18px）
│                                     │
│  猫粮简介文字，最多显示两行，      │ ← 简介（14px，最多2行）
│  超出部分会显示省略号...           │
│                                     │
│  ❤️ 1.2W 人收藏                    │ ← 收藏人数
│                                     │
└─────────────────────────────────────┘
```

## 组件尺寸

- **宽度**: 自适应容器宽度（左右各留 16px 边距）
- **高度**: 根据内容自适应
- **内边距**: 16px
- **圆角**: 12px
- **卡片间距**: 上下各 8px

## 元素详细说明

### 1. 标签区域
- **位置**: 卡片顶部
- **排列**: 横向排列，间隔 8px
- **样式**: 
  - 圆角胶囊形状（12px圆角）
  - 浅色模式：浅橙色背景 + 橙色文字
  - 深色模式：深灰背景 + 浅橙文字
- **字体**: 12px，粗体(600)

### 2. 猫粮名称
- **位置**: 标签下方，间隔 12px
- **样式**:
  - 字体大小: 18px
  - 字重: 粗体(bold)
  - 颜色: 跟随主题文字颜色

### 3. 猫粮简介
- **位置**: 名称下方，间隔 8px
- **样式**:
  - 字体大小: 14px
  - 行高: 20px
  - 最多显示: 2行
  - 超出处理: 显示省略号(...)
  - 颜色: 次要文字颜色（半透明效果）

### 4. 收藏信息
- **位置**: 简介下方，间隔 12px
- **组成**: 
  - 心形图标 ❤️ (16px)
  - 收藏人数文字 (13px)
- **排列**: 横向排列，图标和文字间隔 6px

## 交互状态

### 正常状态
```
┌─────────────────────────┐
│                         │
│   卡片内容              │
│                         │
└─────────────────────────┘
缩放: 100%
阴影: 正常
```

### 按下状态
```
┌────────────────────────┐
│                        │
│   卡片内容             │
│                        │
└────────────────────────┘
缩放: 98% (轻微缩小)
```

## 颜色方案

### 浅色模式（Light）
```
卡片背景:     #FFFFFF (白色)
标签背景:     #FFF5E6 (浅橙色)
标签文字:     #FF8C42 (橙色)
标题文字:     #11181C (深色)
简介文字:     #666666 (灰色)
收藏图标:     #FF6B6B (红色)
收藏文字:     #666666 (灰色)
阴影:         rgba(0,0,0,0.1)
```

### 深色模式（Dark）
```
卡片背景:     #1E1E1E (深灰)
标签背景:     #2A2A2A (更深的灰)
标签文字:     #FFB366 (浅橙色)
标题文字:     #ECEDEE (浅色)
简介文字:     #B0B0B0 (浅灰)
收藏图标:     #FFB366 (浅橙色)
收藏文字:     #B0B0B0 (浅灰)
阴影:         rgba(0,0,0,0.3)
```

## 响应式设计

卡片会根据屏幕宽度自动调整：

- **手机竖屏**: 几乎占满屏幕宽度（左右留16px）
- **手机横屏**: 同样适配
- **平板**: 可以考虑使用 FlatList 的 numColumns 实现多列布局

## 使用场景示例

### 场景1: 我的收藏列表
```tsx
<ScrollView>
  {collectionList.map(item => (
    <CollectCard
      key={item.id}
      {...item}
      onPress={() => navigateToDetail(item)}
    />
  ))}
</ScrollView>
```

### 场景2: 搜索结果
```tsx
<CollectCard
  tag1={searchResult.category}
  tag2={searchResult.feature}
  name={searchResult.name}
  description={searchResult.desc}
  collectCount={searchResult.likes}
  onPress={() => viewDetail()}
/>
```

### 场景3: 推荐列表
```tsx
<FlatList
  data={recommendations}
  renderItem={({ item }) => (
    <CollectCard
      {...item}
      onPress={() => addToCart(item)}
      onLongPress={() => showOptions(item)}
    />
  )}
  keyExtractor={item => item.id}
/>
```

## 动画效果

当前实现的动画：
- ✅ 按下缩放 (scale: 1 → 0.98)
- ✅ 自动动画过渡

可以扩展的动画：
- 🔄 进入动画（淡入/滑入）
- 🔄 删除动画（滑出）
- 🔄 收藏数字变化动画
- 🔄 标签颜色渐变

## 性能优化建议

1. **使用 React.memo** 包裹组件避免不必要的重渲染
2. **FlatList 优化**: 
   ```tsx
   <FlatList
     data={data}
     renderItem={({ item }) => <CollectCard {...item} />}
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     windowSize={5}
   />
   ```
3. **图片懒加载**: 如果后续添加猫粮图片
4. **防抖处理**: 对点击事件进行防抖

## 可访问性（Accessibility）

当前支持：
- ✅ 可通过触摸交互
- ✅ 支持长按操作

建议添加：
- 📝 添加 accessibilityLabel
- 📝 添加 accessibilityHint
- 📝 支持键盘导航（Web端）
- 📝 支持屏幕阅读器

示例：
```tsx
<Pressable
  accessibilityLabel={`${name}, ${tag1}, ${tag2}标签`}
  accessibilityHint="点击查看详情，长按显示更多操作"
  accessibilityRole="button"
>
```
