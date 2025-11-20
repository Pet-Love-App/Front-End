/**
 * ActionBar - 详情页底部操作栏
 * 包含收藏和点赞功能
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useCollectStore } from '@/src/store/collectStore';
import { useLikeStore } from '@/src/store/likeStore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';

interface ActionBarProps {
  /** 猫粮 ID */
  catfoodId: number;
}

/**
 * ActionBar - 企业级详情页操作栏
 *
 * 特性：
 * - 收藏功能（已接入后端）
 * - 点赞功能（已接入后端）
 * - 固定在底部
 * - 动画效果
 * - 状态管理
 * - 错误处理
 */
export function ActionBar({ catfoodId }: ActionBarProps) {
  const insets = useSafeAreaInsets();

  // 收藏状态管理
  const toggleFavorite = useCollectStore((state) => state.toggleFavorite);
  const isFavorited = useCollectStore((state) => state.isFavorited(catfoodId));
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 点赞状态管理
  const toggleLike = useLikeStore((state) => state.toggleLike);
  const isLiked = useLikeStore((state) => state.isLiked(catfoodId));
  const getLikeCount = useLikeStore((state) => state.getLikeCount);
  // 直接从 store 中读取缓存的点赞数（会自动响应变化）
  const cachedLikeCount = useLikeStore((state) => state.likeCounts[catfoodId]);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(cachedLikeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  // 动画值
  const [favoriteScale] = useState(new Animated.Value(1));
  const [likeScale] = useState(new Animated.Value(1));

  // 同步收藏状态
  useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);

  // 同步点赞状态
  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  // 初始化点赞数量
  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const count = await getLikeCount(catfoodId);
        setLocalLikeCount(count);
      } catch (error) {
        console.error('获取点赞数量失败:', error);
      }
    };
    fetchLikeCount();
  }, [catfoodId, getLikeCount]);

  // 监听 store 中的点赞数变化，自动更新
  useEffect(() => {
    if (cachedLikeCount !== undefined) {
      setLocalLikeCount(cachedLikeCount);
    }
  }, [cachedLikeCount]);

  // 收藏动画
  const animateFavorite = useCallback(() => {
    Animated.sequence([
      Animated.timing(favoriteScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(favoriteScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [favoriteScale]);

  // 点赞动画
  const animateLike = useCallback(() => {
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [likeScale]);

  // 处理收藏
  const handleFavorite = useCallback(async () => {
    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      // 乐观更新
      const newFavoriteState = !localFavorited;
      setLocalFavorited(newFavoriteState);
      animateFavorite();

      // 调用 API
      const isFavoritedResult = await toggleFavorite(catfoodId);

      // 同步实际状态
      if (isFavoritedResult !== newFavoriteState) {
        setLocalFavorited(isFavoritedResult);
      }

      // 静默更新，不弹窗提示
    } catch (error) {
      console.error('收藏操作失败:', error);

      // 回滚状态
      setLocalFavorited(!localFavorited);

      Alert.alert('操作失败', '收藏操作失败，请稍后重试');
    } finally {
      setFavoriteLoading(false);
    }
  }, [catfoodId, localFavorited, favoriteLoading, toggleFavorite, animateFavorite]);

  // 处理点赞
  const handleLike = useCallback(async () => {
    if (likeLoading) return;

    try {
      setLikeLoading(true);

      // 乐观更新
      const newLikedState = !localLiked;
      setLocalLiked(newLikedState);
      setLocalLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
      animateLike();

      // 调用 API
      const result = await toggleLike(catfoodId);

      // 同步实际状态
      if (result.isLiked !== newLikedState) {
        setLocalLiked(result.isLiked);
      }
      setLocalLikeCount(result.likeCount);

      // 静默更新，不弹窗提示
    } catch (error) {
      console.error('点赞操作失败:', error);

      // 回滚状态
      setLocalLiked(!localLiked);
      setLocalLikeCount((prev) => (localLiked ? prev + 1 : prev - 1));

      Alert.alert('操作失败', '点赞操作失败，请稍后重试');
    } finally {
      setLikeLoading(false);
    }
  }, [catfoodId, localLiked, likeLoading, toggleLike, animateLike]);

  return (
    <>
      {/* 占位符，防止内容被遮挡 */}
      <YStack height={80 + Math.max(insets.bottom, 16)} />

      {/* 固定在底部的操作栏 */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="$background"
        borderTopWidth={1}
        borderColor="$borderColor"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: -4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
        elevation={10}
        paddingBottom={Math.max(insets.bottom, 16)}
      >
        <Separator />

        <XStack
          paddingHorizontal="$5"
          paddingTop="$4"
          gap="$4"
          alignItems="center"
          justifyContent="space-evenly"
        >
          {/* 收藏按钮 */}
          <YStack flex={1}>
            <Button
              size="$5"
              backgroundColor={localFavorited ? '$yellow9' : 'transparent'}
              borderWidth={2}
              borderColor={localFavorited ? '$yellow9' : '$gray7'}
              onPress={handleFavorite}
              disabled={favoriteLoading}
              pressStyle={{
                scale: 0.97,
                backgroundColor: localFavorited ? '$yellow10' : '$gray3',
              }}
              shadowColor={localFavorited ? '$yellow9' : 'transparent'}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={4}
              elevation={localFavorited ? 4 : 0}
              icon={
                <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                  <IconSymbol
                    name={localFavorited ? 'star.fill' : 'star'}
                    size={22}
                    color={localFavorited ? 'white' : '$gray11'}
                  />
                </Animated.View>
              }
            >
              <Text color={localFavorited ? 'white' : '$gray11'} fontSize="$4" fontWeight="700">
                {favoriteLoading ? '处理中...' : localFavorited ? '已收藏' : '收藏'}
              </Text>
            </Button>
          </YStack>

          {/* 点赞按钮 */}
          <YStack flex={1}>
            <Button
              size="$5"
              backgroundColor={localLiked ? '$red9' : 'transparent'}
              borderWidth={2}
              borderColor={localLiked ? '$red9' : '$gray7'}
              onPress={handleLike}
              disabled={likeLoading}
              pressStyle={{
                scale: 0.97,
                backgroundColor: localLiked ? '$red10' : '$gray3',
              }}
              shadowColor={localLiked ? '$red9' : 'transparent'}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={4}
              elevation={localLiked ? 4 : 0}
              icon={
                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                  <IconSymbol
                    name={localLiked ? 'heart.fill' : 'heart'}
                    size={22}
                    color={localLiked ? 'white' : '$gray11'}
                  />
                </Animated.View>
              }
            >
              <XStack alignItems="center" gap="$2">
                <Text color={localLiked ? 'white' : '$gray11'} fontSize="$4" fontWeight="700">
                  {likeLoading ? '处理中...' : localLiked ? '已点赞' : '点赞'}
                </Text>
                {localLikeCount > 0 && (
                  <YStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    backgroundColor={localLiked ? 'rgba(255,255,255,0.2)' : '$gray4'}
                    borderRadius="$10"
                  >
                    <Text color={localLiked ? 'white' : '$gray11'} fontSize="$2" fontWeight="bold">
                      {localLikeCount}
                    </Text>
                  </YStack>
                )}
              </XStack>
            </Button>
          </YStack>
        </XStack>
      </YStack>
    </>
  );
}
