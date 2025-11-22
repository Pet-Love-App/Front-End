# 响应式设计指南

## 概述

本文档描述了项目中的响应式设计最佳实践，确保应用在所有设备上都能提供一致的用户体验。

## 核心原则

### 1. 避免固定宽度

❌ **错误做法：**
```tsx
<YStack width={48} height={48}>
  <IconSymbol name="star" size={28} />
</YStack>
```

✅ **正确做法：**
```tsx
const { getResponsiveSize } = useResponsiveLayout();
const starSize = getResponsiveSize(48);

<YStack width={starSize} height={starSize}>
  <IconSymbol name="star" size={Math.floor(starSize * 0.58)} />
</YStack>
```

### 2. 使用 Flexbox 布局

✅ **推荐：**
```tsx
<XStack flex={1} gap="$2" flexWrap="wrap">
  {items.map(item => (
    <YStack flex={1} minWidth={100} maxWidth="45%">
      {item}
    </YStack>
  ))}
</XStack>
```

### 3. 动态计算尺寸

✅ **根据屏幕宽度动态调整：**
```tsx
const { width, getItemWidth } = useResponsiveLayout();
const columns = Math.floor(width / 120); // 每项最小 120px
const itemWidth = getItemWidth(columns, 16);
```

## 屏幕尺寸断点

| 断点 | 尺寸 | 设备示例 |
|------|------|----------|
| xs | < 320px | 非常旧的设备 |
| sm | 320-374px | iPhone SE (1st gen) |
| md | 375-413px | iPhone 12 mini, 大部分手机 |
| lg | 414-767px | iPhone 12 Pro Max, 小平板 |
| xl | ≥ 768px | iPad, 大平板, 桌面 |

## 使用 useResponsiveLayout Hook

### 基础用法

```tsx
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';

function MyComponent() {
  const {
    width,
    height,
    deviceSize,
    isSmallScreen,
    isExtraSmallScreen,
    isTabletOrLarger,
    getResponsiveSize,
    getHorizontalPadding,
  } = useResponsiveLayout();

  const iconSize = getResponsiveSize(24);
  const padding = getHorizontalPadding();

  return (
    <YStack padding={padding}>
      <IconSymbol size={iconSize} />
    </YStack>
  );
}
```

### 响应式值选择

```tsx
import { useResponsiveValue } from '@/src/hooks/useResponsiveLayout';

function MyComponent() {
  const fontSize = useResponsiveValue({
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    default: 16,
  });

  return <Text fontSize={fontSize}>响应式文本</Text>;
}
```

## 常见组件模式

### 1. 评分星星组件

```tsx
const starConfig = useMemo(() => {
  const cardPadding = 32;
  const ratingDisplayWidth = myRating > 0 ? 60 : 0;
  const availableWidth = width - cardPadding * 2 - ratingDisplayWidth - 40;
  
  const minStarSize = 36;
  const maxStarSize = 48;
  const starCount = 5;
  const minGap = 4;
  
  let starSize = maxStarSize;
  let gap = 8;
  
  while (starSize >= minStarSize && 
         (starSize * starCount + gap * (starCount - 1)) > availableWidth) {
    starSize -= 2;
    if (starSize < 40) gap = minGap;
  }
  
  return {
    size: Math.max(minStarSize, starSize),
    iconSize: Math.max(20, Math.floor(starSize * 0.58)),
    gap,
  };
}, [width, myRating]);
```

### 2. 网格布局

```tsx
const { getGridColumns, getItemWidth } = useResponsiveLayout();
const columns = getGridColumns(150, 16); // 最小项宽度 150px, 间距 16px
const itemWidth = getItemWidth(columns, 16);

return (
  <XStack flexWrap="wrap" gap={16}>
    {items.map(item => (
      <YStack key={item.id} width={itemWidth}>
        {item.content}
      </YStack>
    ))}
  </XStack>
);
```

### 3. 卡片组件

```tsx
const { getHorizontalPadding, getMaxContentWidth } = useResponsiveLayout();

return (
  <YStack
    paddingHorizontal={getHorizontalPadding()}
    maxWidth={getMaxContentWidth()}
    alignSelf="center"
    width="100%"
  >
    <Card bordered>
      {content}
    </Card>
  </YStack>
);
```

## 已修复的组件

### 1. RatingSection 评分组件

**问题：** 5个固定宽度（48px）的星星在小屏幕上溢出

**解决方案：**
- 动态计算星星尺寸（36px - 48px）
- 根据可用空间调整间距（4px - 8px）
- 在超小屏幕上缩小评分显示文字

**关键代码：**
```tsx
const starConfig = useMemo(() => {
  // 动态计算星星尺寸和间距
  const availableWidth = width - cardPadding * 2 - ratingDisplayWidth - 40;
  // ... 计算逻辑
}, [width, myRating]);
```

### 2. ReportHeader 图片组件

**当前状态：** 使用固定 130px 宽度

**优化建议：**
```tsx
const imageSize = isSmallScreen ? 100 : 130;
```

## 测试清单

在提交前，请在以下设备上测试：

- [ ] **iPhone SE (320px)** - 超小屏幕
- [ ] **iPhone 12 mini (375px)** - 小屏幕
- [ ] **iPhone 12 Pro (390px)** - 标准屏幕
- [ ] **iPhone 12 Pro Max (428px)** - 大屏幕
- [ ] **iPad mini (768px)** - 小平板
- [ ] **iPad Pro (1024px)** - 大平板

### 检查要点

1. ✅ 所有内容都在屏幕内，没有水平滚动
2. ✅ 文字大小合适，易于阅读
3. ✅ 触摸目标足够大（最小 44x44pt）
4. ✅ 间距适当，不会过于拥挤
5. ✅ 图片和图标等比缩放
6. ✅ 布局保持一致性

## 常见问题

### Q: 为什么不用百分比宽度？

A: 百分比宽度在某些情况下有用，但无法精确控制组件数量和间距。使用 `useResponsiveLayout` 可以更灵活地处理复杂布局。

### Q: 什么时候使用 ScrollView？

A: 当内容可能超过一屏时，使用 ScrollView。但要确保主要的交互元素（如按钮、评分）始终可见。

### Q: 如何处理横屏模式？

A: `useResponsiveLayout` 基于宽度判断，横屏会被视为"更大"的设备。如需特殊处理，可以使用：
```tsx
const { width, height } = useResponsiveLayout();
const isLandscape = width > height;
```

## 工具函数

### 1. getResponsiveSize()

根据设备尺寸缩放数值：
- 超小屏幕：0.8x
- 小屏幕：0.9x
- 标准屏幕：1.0x
- 平板：1.2x

### 2. getHorizontalPadding()

返回推荐的水平内边距：
- 超小屏幕：12px
- 小屏幕：16px
- 标准屏幕：16px
- 平板：32px

### 3. getGridColumns()

计算最佳列数：
```tsx
const columns = getGridColumns(150); // 每项最少 150px
```

## 最佳实践总结

1. ✅ **优先使用 Flexbox** - `flex`, `flexWrap`, `justifyContent`
2. ✅ **避免固定宽度** - 除非是装饰性元素
3. ✅ **使用相对单位** - Tamagui 的 `$` 单位系统
4. ✅ **动态计算尺寸** - 使用 `useResponsiveLayout`
5. ✅ **测试多设备** - 不要只在一种设备上开发
6. ✅ **保持一致性** - 相同类型的组件使用相同的响应式策略
7. ✅ **性能优化** - 使用 `useMemo` 缓存计算结果

## 参考资源

- [React Native Dimensions API](https://reactnative.dev/docs/dimensions)
- [Flexbox 布局指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Material Design - Responsive Layout](https://material.io/design/layout/responsive-layout-grid.html)
- [iOS Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)

