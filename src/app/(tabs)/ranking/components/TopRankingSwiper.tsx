/**
 * TopRankingSwiper - 顶部排名横向滑动组件
 *
 * 企业级最佳实践：
 * - 使用 React Native Animated API 实现流畅的 3D 轮播效果
 * - 响应式设计，适配不同屏幕尺寸
 * - 性能优化：useMemo, useCallback, useNativeDriver
 * - 类型安全：TypeScript
 * - 可访问性：accessibilityLabel
 * - 视觉层次：缩放、透明度、垂直位移实现前后远近效果
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ListRenderItem, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { RANK_COLORS } from '@/src/constants/colors';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
import type { CatFood } from '@/src/types/catFood';

interface TopRankingSwiperProps {
  /** 猫粮数据列表 */
  data: CatFood[];
  /** 显示数量（默认前5名） */
  topCount?: number;
  /** 点击回调 */
  onPress: (catFood: CatFood) => void;
  /** 是否显示统计信息（评分、点赞数），默认 false */
  showStats?: boolean;
}

/**
 * 获取排名徽章样式（使用统一颜色系统）
 * 深色模式适配版本
 */
const getRankStyle = (
  index: number,
  isDark: boolean,
  colors: ReturnType<typeof useThemeColors>
) => {
  switch (index) {
    case 0:
      return {
        gradient: ['#FFD700', '#FFA500'] as const, // 金色渐变
        textColor: 'white' as const,
        icon: 'crown.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#FFD700',
        cardGradient: isDark
          ? (['#2D2510', '#1F1A08'] as const)
          : (['#FFF9E6', '#FFF3CC'] as const),
        borderColor: '#FFD700',
      };
    case 1:
      return {
        gradient: ['#C0C0C0', '#A8A8A8'] as const, // 银色渐变
        textColor: 'white' as const,
        icon: 'medal.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#C0C0C0',
        cardGradient: isDark
          ? (['#252525', '#1A1A1A'] as const)
          : (['#F8F8F8', '#F0F0F0'] as const),
        borderColor: '#C0C0C0',
      };
    case 2:
      return {
        gradient: ['#CD7F32', '#B8692D'] as const, // 铜色渐变
        textColor: 'white' as const,
        icon: 'medal.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#CD7F32',
        cardGradient: isDark
          ? (['#2D1F1A', '#1F1410'] as const)
          : (['#FDF5EE', '#FAE8D8'] as const),
        borderColor: '#CD7F32',
      };
    default:
      return {
        gradient: RANK_COLORS.normal,
        textColor: 'white' as const,
        icon: 'star.fill' as const,
        iconColor: 'white' as const,
        shadowColor: RANK_COLORS.normal[0],
        cardGradient: isDark
          ? ([colors.cardBackground, colors.backgroundMuted] as const)
          : (['#FFFFFF', '#F9FAFB'] as const),
        borderColor: isDark ? colors.borderMuted : '#E5E7EB',
      };
  }
};

/**
 * TopRankingSwiper 组件
 */
export function TopRankingSwiper({
  data,
  topCount = 5,
  onPress,
  showStats = true, // 默认显示统计信息
}: TopRankingSwiperProps) {
  const { width, isExtraSmallScreen, isSmallScreen } = useResponsiveLayout();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // 动画值：跟踪滚动位置
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<CatFood>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 只取前 N 名
  const topData = useMemo(() => data.slice(0, topCount), [data, topCount]);

  // 计算卡片尺寸（响应式）- 调整为更小的尺寸
  const cardWidth = useMemo(() => {
    if (isExtraSmallScreen) return width * 0.6; // 60% 屏幕宽度（减小）
    if (isSmallScreen) return width * 0.55; // 55% 屏幕宽度（减小）
    return Math.min(width * 0.5, 220); // 50% 或最大 220px（减小）
  }, [width, isExtraSmallScreen, isSmallScreen]);

  const cardHeight = useMemo(() => {
    return cardWidth * 1.15; // 调整宽高比为 1:1.15（更紧凑）
  }, [cardWidth]);

  // 卡片布局计算 - 精确居中方案
  const CARD_MARGIN = 12; // 卡片左右各12px间距，增加间隔增强3D效果
  const SPACER_WIDTH = (width - cardWidth) / 2; // 首尾占位符宽度，让卡片居中
  const ITEM_WIDTH = cardWidth + CARD_MARGIN * 2; // 单个卡片的完整宽度（包括间距）

  // 自动轮播
  useEffect(() => {
    if (topData.length <= 1) return;

    const autoPlayInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % topData.length;

        // 计算精确的滚动位置
        const offset = ITEM_WIDTH * nextIndex;

        flatListRef.current?.scrollToOffset({
          offset,
          animated: true,
        });

        return nextIndex;
      });
    }, 3500); // 每3.5秒切换一次（稍微延长，让用户有更多时间观察）

    return () => clearInterval(autoPlayInterval);
  }, [topData.length, ITEM_WIDTH]);

  /**
   * 计算动画插值 - 增强的3D立体效果
   * 为每张卡片根据滚动位置计算缩放、透明度、Y轴偏移、旋转、创建前后层次感
   */
  const getAnimatedStyle = useCallback(
    (index: number) => {
      const inputRange = [
        (index - 2) * ITEM_WIDTH,
        (index - 1) * ITEM_WIDTH,
        index * ITEM_WIDTH,
        (index + 1) * ITEM_WIDTH,
        (index + 2) * ITEM_WIDTH,
      ];

      // 缩放：中间最大(1.1)，两侧明显更小(0.7) - 增强前后对比
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.7, 0.8, 1.1, 0.8, 0.7],
        extrapolate: 'clamp',
      });

      // 透明度：中间完全不透明(1)，两侧更透明(0.25) - 增强层次感
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.25, 0.5, 1, 0.5, 0.25],
        extrapolate: 'clamp',
      });

      // Y轴偏移：中间在正常位置(0)，两侧下沉(50) - 模拟后退效果
      const translateY = scrollX.interpolate({
        inputRange,
        outputRange: [50, 30, 0, 30, 50],
        extrapolate: 'clamp',
      });

      // 3D旋转效果：中间不旋转(0deg)，两侧明显旋转 - 增强立体感
      const rotateY = scrollX.interpolate({
        inputRange,
        outputRange: ['20deg', '10deg', '0deg', '-10deg', '-20deg'],
        extrapolate: 'clamp',
      });

      // X轴偏移：让两侧卡片略微向后缩进，增强深度
      const translateX = scrollX.interpolate({
        inputRange,
        outputRange: [0, 0, 0, 0, 0],
        extrapolate: 'clamp',
      });

      return {
        opacity,
        transform: [
          { perspective: 1200 }, // 增加透视距离，增强3D效果
          { translateX },
          { translateY },
          { scale },
          { rotateY },
        ],
      };
    },
    [ITEM_WIDTH, scrollX]
  );

  // 滚动事件处理
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true, // 使用原生驱动以提升性能
  });

  // 渲染单个卡片
  const renderItem: ListRenderItem<CatFood> = useCallback(
    ({ item, index }) => {
      const rankStyle = getRankStyle(index, isDark, colors);
      const animatedStyle = getAnimatedStyle(index);
      const isTopThree = index < 3;

      return (
        <Animated.View
          style={[
            {
              width: cardWidth,
              marginHorizontal: CARD_MARGIN,
            },
            animatedStyle,
          ]}
        >
          <Pressable
            onPress={() => {
              onPress(item);
            }}
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel={`第${index + 1}名：${item.name}`}
          >
            {/* 卡片背景渐变 */}
            <LinearGradient
              colors={rankStyle.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                flex: 1,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: isTopThree ? 2.5 : 1,
                borderColor: rankStyle.borderColor,
                // 添加柔和阴影
                shadowColor: rankStyle.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isTopThree ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: isTopThree ? 8 : 3,
              }}
            >
              {/* 排名徽章 - 浮动在顶部 */}
              <YStack
                position="absolute"
                top={-2}
                left={12}
                zIndex={10}
                borderRadius={12}
                overflow="hidden"
                // 添加微妙的阴影效果
                shadowColor={rankStyle.shadowColor as any}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.4}
                shadowRadius={4}
                elevation={4}
              >
                <LinearGradient
                  colors={rankStyle.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <IconSymbol name={rankStyle.icon} size={14} color={rankStyle.iconColor} />
                  <Text fontSize="$4" fontWeight="900" color={rankStyle.textColor}>
                    {index + 1}
                  </Text>
                </LinearGradient>
              </YStack>

              {/* 图片区域 */}
              <YStack height="52%" backgroundColor="$gray1" position="relative" marginTop={12}>
                {item.imageUrl ? (
                  <>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                    {/* 底部渐变遮罩 */}
                    <LinearGradient
                      colors={
                        isDark
                          ? ['transparent', 'rgba(0,0,0,0.6)']
                          : ['transparent', 'rgba(255,255,255,0.8)']
                      }
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '25%',
                      }}
                    />
                  </>
                ) : (
                  <YStack flex={1} alignItems="center" justifyContent="center">
                    <IconSymbol name="photo" size={36} color="$gray6" />
                  </YStack>
                )}
              </YStack>

              {/* 信息区域 */}
              <YStack
                padding="$3"
                paddingTop="$2"
                gap="$1.5"
                flex={1}
                justifyContent="space-between"
              >
                {/* 名称 */}
                <Text
                  fontSize="$3"
                  fontWeight="700"
                  numberOfLines={2}
                  lineHeight={18}
                  color={(isDark ? colors.text : '$gray12') as any}
                >
                  {item.name}
                </Text>

                {/* 品牌标签 */}
                <XStack alignItems="center" gap="$1.5">
                  <YStack
                    backgroundColor={(isTopThree ? `${rankStyle.borderColor}20` : '$gray2') as any}
                    borderRadius={6}
                    paddingHorizontal="$1.5"
                    paddingVertical="$0.5"
                  >
                    <Text
                      fontSize={11}
                      color={(isTopThree ? rankStyle.borderColor : '$gray10') as any}
                      numberOfLines={1}
                      fontWeight="600"
                    >
                      {item.brand || '未知品牌'}
                    </Text>
                  </YStack>
                </XStack>

                {/* 评分和点赞 - 更紧凑的布局 */}
                {showStats && (
                  <XStack gap="$2" marginTop="$1">
                    <XStack
                      alignItems="center"
                      gap="$1"
                      backgroundColor="$orange1"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={8}
                      borderWidth={1}
                      borderColor="$orange4"
                    >
                      <IconSymbol name="star.fill" size={12} color="$orange9" />
                      <Text fontSize={13} fontWeight="800" color="$orange10">
                        {item.score.toFixed(1)}
                      </Text>
                    </XStack>
                    <XStack
                      alignItems="center"
                      gap="$1"
                      backgroundColor="$pink1"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={8}
                      borderWidth={1}
                      borderColor="$pink4"
                    >
                      <IconSymbol name="heart.fill" size={12} color="$pink9" />
                      <Text fontSize={13} fontWeight="800" color="$pink10">
                        {item.like_count || 0}
                      </Text>
                    </XStack>
                  </XStack>
                )}
              </YStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      );
    },
    [cardWidth, cardHeight, onPress, getAnimatedStyle, showStats, CARD_MARGIN, isDark, colors]
  );

  // 提取 key
  const keyExtractor = useCallback((item: CatFood) => item.id.toString(), []);

  // 提供精确的布局信息
  const getItemLayout = useCallback(
    (_data: ArrayLike<CatFood> | null | undefined, index: number) => {
      return {
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
      };
    },
    [ITEM_WIDTH]
  );

  // 如果没有数据，不显示
  if (topData.length === 0) {
    return null;
  }

  return (
    <YStack
      position="relative"
      paddingTop="$4"
      paddingBottom="$2"
      marginBottom="$1"
      minHeight={cardHeight * 1.15 + 10}
    >
      {/* 渐变背景 */}
      {/* <LinearGradient
        colors={['#FEF3C7', '#FECACA', '#E0E7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
        }}
      /> */}

      {/* 横向滑动列表 - 增强的3D轮播效果 */}
      <YStack height={cardHeight * 1.15 + 10} overflow="visible" zIndex={1} paddingTop="$2">
        <Animated.FlatList
          ref={flatListRef}
          data={topData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={ITEM_WIDTH} // 精确的snap间隔
          snapToAlignment="start" // 对齐方式
          decelerationRate="fast" // 快速减速，增强snap效果
          disableIntervalMomentum // 禁用区间动量，确保精确停留
          onScroll={onScroll} // 监听滚动事件
          scrollEventThrottle={16} // 滚动事件节流（每16ms触发一次，约60fps）
          onMomentumScrollEnd={(event) => {
            // 手动滑动后更新当前索引
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / ITEM_WIDTH);
            setCurrentIndex(Math.max(0, Math.min(index, topData.length - 1)));
          }}
          contentContainerStyle={{
            paddingHorizontal: SPACER_WIDTH,
            paddingVertical: 20,
            alignItems: 'center',
          }}
          // 性能优化
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          windowSize={5}
          removeClippedSubviews={false} // 禁用裁剪以保持动画流畅
          // 可访问性
          accessibilityLabel="热门猫粮排行榜"
        />
      </YStack>

      {/* 指示器 - 现代化简洁设计 */}
      {topData.length > 1 && (
        <XStack justifyContent="center" gap="$1.5" paddingTop="$2" paddingBottom="$1" zIndex={2}>
          {topData.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <Pressable
                key={`indicator-${index}`}
                onPress={() => {
                  const offset = ITEM_WIDTH * index;
                  flatListRef.current?.scrollToOffset({
                    offset,
                    animated: true,
                  });
                  setCurrentIndex(index);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              >
                <YStack
                  width={isActive ? 24 : 8}
                  height={8}
                  borderRadius={4}
                  backgroundColor={isActive ? '$orange9' : '$gray5'}
                  opacity={isActive ? 1 : 0.5}
                  animation="quick"
                />
              </Pressable>
            );
          })}
        </XStack>
      )}
    </YStack>
  );
}
