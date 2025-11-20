/**
 * ActionBar - 详情页底部操作栏
 * 包含收藏和点赞功能
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useCollectStore } from '@/src/store/collectStore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';

interface ActionBarProps {
  /** 猫粮 ID */
  catfoodId: number;
  /** 当前点赞状态（预留） */
  isLiked?: boolean;
  /** 点赞数量（预留） */
  likeCount?: number;
  /** 点赞回调（预留） */
  onLike?: () => void;
}

/**
 * ActionBar - 企业级详情页操作栏
 *
 * 特性：
 * - 收藏功能（已接入后端）
 * - 点赞功能（预留接口）
 * - 固定在底部
 * - 动画效果
 * - 状态管理
 * - 错误处理
 */
export function ActionBar({ catfoodId, isLiked = false, likeCount = 0, onLike }: ActionBarProps) {
  const insets = useSafeAreaInsets();

  // 收藏状态管理
  const toggleFavorite = useCollectStore((state) => state.toggleFavorite);
  const isFavorited = useCollectStore((state) => state.isFavorited(catfoodId));
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 点赞状态管理（预留）
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [likeLoading, setLikeLoading] = useState(false);

  // 动画值
  const [favoriteScale] = useState(new Animated.Value(1));
  const [likeScale] = useState(new Animated.Value(1));

  // 同步收藏状态
  useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);

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

      // 成功提示
      const message = isFavoritedResult ? '已添加到收藏' : '已取消收藏';
      Alert.alert('提示', message);
    } catch (error) {
      console.error('收藏操作失败:', error);

      // 回滚状态
      setLocalFavorited(!localFavorited);

      Alert.alert('操作失败', '收藏操作失败，请稍后重试');
    } finally {
      setFavoriteLoading(false);
    }
  }, [catfoodId, localFavorited, favoriteLoading, toggleFavorite, animateFavorite]);

  // 处理点赞（预留）
  const handleLike = useCallback(() => {
    if (likeLoading) return;

    // 乐观更新
    const newLikedState = !localLiked;
    setLocalLiked(newLikedState);
    setLocalLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    animateLike();

    // TODO: 调用点赞 API
    if (onLike) {
      onLike();
    } else {
      // 暂未实现后端接口的提示
      setTimeout(() => {
        Alert.alert('提示', '点赞功能即将上线');
        // 回滚状态
        setLocalLiked(!newLikedState);
        setLocalLikeCount((prev) => (newLikedState ? prev - 1 : prev + 1));
      }, 300);
    }
  }, [localLiked, likeLoading, onLike, animateLike]);

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
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={8}
        paddingBottom={Math.max(insets.bottom, 16)}
      >
        <Separator />

        <XStack
          paddingHorizontal="$4"
          paddingTop="$4"
          gap="$3"
          alignItems="center"
          justifyContent="space-evenly"
        >
          {/* 收藏按钮 */}
          <YStack flex={1}>
            <Button
              size="$5"
              backgroundColor={localFavorited ? '$yellow9' : '$gray4'}
              borderWidth={1}
              borderColor={localFavorited ? '$yellow10' : '$gray7'}
              onPress={handleFavorite}
              disabled={favoriteLoading}
              pressStyle={{
                scale: 0.95,
                backgroundColor: localFavorited ? '$yellow10' : '$gray5',
              }}
              icon={
                <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                  <IconSymbol
                    name={localFavorited ? 'star.fill' : 'star'}
                    size={24}
                    color={localFavorited ? 'white' : '$gray11'}
                  />
                </Animated.View>
              }
            >
              <Text color={localFavorited ? 'white' : '$gray11'} fontSize="$4" fontWeight="600">
                {favoriteLoading ? '处理中...' : localFavorited ? '已收藏' : '收藏'}
              </Text>
            </Button>
          </YStack>

          {/* 点赞按钮 */}
          <YStack flex={1}>
            <Button
              size="$5"
              backgroundColor={localLiked ? '$red9' : '$gray4'}
              borderWidth={1}
              borderColor={localLiked ? '$red10' : '$gray7'}
              onPress={handleLike}
              disabled={likeLoading}
              pressStyle={{
                scale: 0.95,
                backgroundColor: localLiked ? '$red10' : '$gray5',
              }}
              icon={
                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                  <IconSymbol
                    name={localLiked ? 'heart.fill' : 'heart'}
                    size={24}
                    color={localLiked ? 'white' : '$gray11'}
                  />
                </Animated.View>
              }
            >
              <XStack alignItems="center" gap="$2">
                <Text color={localLiked ? 'white' : '$gray11'} fontSize="$4" fontWeight="600">
                  {localLiked ? '已点赞' : '点赞'}
                </Text>
                {localLikeCount > 0 && (
                  <Text color={localLiked ? 'white' : '$gray10'} fontSize="$3">
                    {localLikeCount}
                  </Text>
                )}
              </XStack>
            </Button>
          </YStack>
        </XStack>
      </YStack>
    </>
  );
}
