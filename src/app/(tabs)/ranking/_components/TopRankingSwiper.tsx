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

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import type { CatFood } from '@/src/types/catFood';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ListRenderItem, Pressable } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

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
 * 获取排名徽章样式
 */
const getRankStyle = (index: number) => {
  switch (index) {
    case 0:
      return {
        gradient: ['#FFD700', '#FFA500'] as const, // 金色渐变
        textColor: 'white' as const,
        icon: 'crown.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#FFD700',
      };
    case 1:
      return {
        gradient: ['#C0C0C0', '#A8A8A8'] as const, // 银色渐变
        textColor: 'white' as const,
        icon: 'medal.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#C0C0C0',
      };
    case 2:
      return {
        gradient: ['#CD7F32', '#A0522D'] as const, // 铜色渐变
        textColor: 'white' as const,
        icon: 'medal.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#CD7F32',
      };
    default:
      return {
        gradient: ['#60A5FA', '#3B82F6'] as const, // 蓝色渐变
        textColor: 'white' as const,
        icon: 'star.fill' as const,
        iconColor: 'white' as const,
        shadowColor: '#3B82F6',
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
      const rankStyle = getRankStyle(index);
      const animatedStyle = getAnimatedStyle(index);

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
              console.log('Pressed card:', item.name);
              onPress(item);
            }}
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel={`第${index + 1}名：${item.name}`}
          >
            <Card
              backgroundColor="white"
              borderRadius="$7"
              overflow="hidden"
              bordered
              borderColor={index < 3 ? rankStyle.gradient[0] : '$gray4'}
              borderWidth={index < 3 ? 2.5 : 1}
              height={cardHeight}
              shadowColor={rankStyle.shadowColor}
              shadowOffset={{ width: 0, height: index < 3 ? 16 : 10 }}
              shadowOpacity={index < 3 ? 0.45 : 0.28}
              shadowRadius={index < 3 ? 24 : 18}
              elevation={index < 3 ? 16 : 10}
              style={{
                // 添加额外的阴影增强立体感
                shadowColor: index < 3 ? rankStyle.shadowColor : '#000',
              }}
            >
              {/* 排名徽章 - 使用渐变 */}
              <YStack
                position="absolute"
                top={10}
                left={10}
                zIndex={10}
                borderRadius="$10"
                overflow="hidden"
                style={{
                  shadowColor: rankStyle.shadowColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={rankStyle.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <IconSymbol name={rankStyle.icon} size={16} color={rankStyle.iconColor} />
                  <Text fontSize="$5" fontWeight="900" color={rankStyle.textColor}>
                    {index + 1}
                  </Text>
                </LinearGradient>
              </YStack>

              {/* 图片区域 */}
              <YStack height="55%" backgroundColor="$gray2" position="relative">
                {item.imageUrl ? (
                  <>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    {/* 底部渐变遮罩 - 增强层次感 */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.15)']}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '30%',
                      }}
                    />
                  </>
                ) : (
                  <YStack flex={1} alignItems="center" justifyContent="center">
                    <IconSymbol name="photo" size={40} color="$gray8" />
                  </YStack>
                )}

                {/* 前三名顶部闪光效果 */}
                {index < 3 && (
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'transparent']}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                    }}
                  />
                )}
              </YStack>

              {/* 信息区域 */}
              <YStack padding="$3" gap="$2" flex={1} justifyContent="space-between">
                {/* 名称 */}
                <Text
                  fontSize="$3"
                  fontWeight="800"
                  numberOfLines={2}
                  lineHeight={17}
                  color="$gray12"
                >
                  {item.name}
                </Text>

                {/* 品牌 */}
                <XStack alignItems="center" gap="$1.5" paddingVertical="$1">
                  <YStack backgroundColor="$gray3" borderRadius="$6" padding="$1">
                    <IconSymbol name="building.2.fill" size={11} color="$gray10" />
                  </YStack>
                  <Text fontSize="$2" color="$gray11" numberOfLines={1} fontWeight="500">
                    {item.brand || '未知品牌'}
                  </Text>
                </XStack>

                {/* 评分和点赞 */}
                {showStats && (
                  <XStack gap="$2" marginTop="auto">
                    <XStack
                      alignItems="center"
                      gap="$1.5"
                      flex={1}
                      backgroundColor="$yellow2"
                      paddingHorizontal="$2"
                      paddingVertical="$1.5"
                      borderRadius="$6"
                    >
                      <IconSymbol name="star.fill" size={13} color="$yellow10" />
                      <Text fontSize="$3" fontWeight="700" color="$yellow11">
                        {item.score.toFixed(1)}
                      </Text>
                    </XStack>
                    <XStack
                      alignItems="center"
                      gap="$1.5"
                      flex={1}
                      backgroundColor="$red2"
                      paddingHorizontal="$2"
                      paddingVertical="$1.5"
                      borderRadius="$6"
                    >
                      <IconSymbol name="heart.fill" size={13} color="$red10" />
                      <Text fontSize="$3" fontWeight="700" color="$red11">
                        {item.like_count || 0}
                      </Text>
                    </XStack>
                  </XStack>
                )}
              </YStack>
            </Card>
          </Pressable>
        </Animated.View>
      );
    },
    [cardWidth, cardHeight, onPress, getAnimatedStyle, showStats, CARD_MARGIN]
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

      {/* 标题 */}
      <XStack
        paddingHorizontal="$4"
        paddingBottom="$2"
        marginBottom="$2"
        alignItems="center"
        justifyContent="space-between"
        zIndex={2}
      >
        <XStack alignItems="center" gap="$2">
          <YStack
            overflow="hidden"
            width={48}
            height={48}
            borderRadius="$10"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor="$yellow6"
          >
            <LinearGradient
              colors={['#FCD34D', '#F59E0B']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <IconSymbol name="trophy.fill" size={26} color="white" style={{ zIndex: 1 }} />
          </YStack>
          <YStack>
            <Text fontSize="$7" fontWeight="900" color="$gray12">
              热门推荐
            </Text>
            <Text fontSize="$3" color="$gray11" fontWeight="600">
              精选优质猫粮
            </Text>
          </YStack>
        </XStack>
        <YStack
          overflow="hidden"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$10"
          borderWidth={1.5}
          borderColor="$yellow7"
        >
          <LinearGradient
            colors={['#FBBF24', '#F59E0B']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <Text fontSize="$3" color="white" fontWeight="900" style={{ zIndex: 1 }}>
            TOP {topCount}
          </Text>
        </YStack>
      </XStack>

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

      {/* 指示器 - 现代化设计 */}
      {topData.length > 1 && (
        <XStack justifyContent="center" gap="$2" paddingTop="$3" paddingBottom="$2" zIndex={2}>
          {topData.map((_, index) => (
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
            >
              {currentIndex === index ? (
                <YStack
                  width={32}
                  height={9}
                  borderRadius="$10"
                  overflow="hidden"
                  animation="quick"
                  borderWidth={1}
                  borderColor="$yellow7"
                >
                  <LinearGradient
                    colors={['#FBBF24', '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flex: 1,
                    }}
                  />
                </YStack>
              ) : (
                <YStack
                  width={9}
                  height={9}
                  borderRadius="$10"
                  backgroundColor="$gray6"
                  opacity={0.6}
                  animation="quick"
                />
              )}
            </Pressable>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
