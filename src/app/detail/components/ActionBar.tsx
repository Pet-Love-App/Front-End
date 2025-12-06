/**
 * ActionBar - 详情页底部操作栏
 * 包含收藏和点赞功能
 */

import { useActionStatus } from '@/src/app/(tabs)/collect/hooks/useActionStatus';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';

interface ActionBarProps {
  /** 猫粮 ID */
  catfoodId: number;
}

/** ActionBar - 详情页操作栏 */
export function ActionBar({ catfoodId }: ActionBarProps) {
  const insets = useSafeAreaInsets();

  // 使用统一的状态管理 Hook
  const { liked, likeCount, favorited, toggleLike, toggleFavorite } = useActionStatus(
    catfoodId.toString()
  );

  // 加载状态
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // 动画值 - 使用 useMemo 避免重复创建
  const favoriteScale = useMemo(() => new Animated.Value(1), []);
  const likeScale = useMemo(() => new Animated.Value(1), []);

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
      animateFavorite();
      await toggleFavorite();
      // 静默更新，不弹窗提示
    } catch (error) {
      console.error('收藏操作失败:', error);
      Alert.alert('操作失败', '收藏操作失败，请稍后重试');
    } finally {
      setFavoriteLoading(false);
    }
  }, [favoriteLoading, toggleFavorite, animateFavorite]);

  // 处理点赞
  const handleLike = useCallback(async () => {
    if (likeLoading) return;

    try {
      setLikeLoading(true);
      animateLike();
      await toggleLike();
      // 静默更新，不弹窗提示
    } catch (error) {
      console.error('点赞操作失败:', error);
      Alert.alert('操作失败', '点赞操作失败，请稍后重试');
    } finally {
      setLikeLoading(false);
    }
  }, [likeLoading, toggleLike, animateLike]);

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
              backgroundColor={favorited ? '$yellow9' : 'transparent'}
              borderWidth={2}
              borderColor={favorited ? '$yellow9' : '$gray7'}
              onPress={handleFavorite}
              disabled={favoriteLoading}
              pressStyle={{
                scale: 0.97,
                backgroundColor: favorited ? '$yellow10' : '$gray3',
              }}
              icon={
                <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                  <IconSymbol
                    name={favorited ? 'star.fill' : 'star'}
                    size={22}
                    color={favorited ? 'white' : '$gray11'}
                  />
                </Animated.View>
              }
            >
              <Text color={favorited ? 'white' : '$gray11'} fontSize="$4" fontWeight="700">
                {favoriteLoading ? '处理中...' : favorited ? '已收藏' : '收藏'}
              </Text>
            </Button>
          </YStack>

          {/* 点赞按钮 */}
          <YStack flex={1}>
            <Button
              size="$5"
              backgroundColor={liked ? '$red9' : 'transparent'}
              borderWidth={2}
              borderColor={liked ? '$red9' : '$gray7'}
              onPress={handleLike}
              disabled={likeLoading}
              pressStyle={{
                scale: 0.97,
                backgroundColor: liked ? '$red10' : '$gray3',
              }}
              icon={
                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                  <IconSymbol
                    name={liked ? 'heart.fill' : 'heart'}
                    size={22}
                    color={liked ? 'white' : '$gray11'}
                  />
                </Animated.View>
              }
            >
              <XStack alignItems="center" gap="$2">
                <Text color={liked ? 'white' : '$gray11'} fontSize="$4" fontWeight="700">
                  {likeLoading ? '处理中...' : liked ? '已点赞' : '点赞'}
                </Text>
                {likeCount > 0 && (
                  <YStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    backgroundColor={liked ? 'rgba(255,255,255,0.2)' : '$gray4'}
                    borderRadius="$10"
                  >
                    <Text color={liked ? 'white' : '$gray11'} fontSize="$2" fontWeight="bold">
                      {likeCount}
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
