/**
 * 底部操作栏 - 包含收藏和点赞功能
 */
import { useCallback, useMemo, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Separator, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { useActionStatus } from '@/src/app/(tabs)/collect/hooks/useActionStatus';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { warningScale, errorScale, neutralScale } from '@/src/design-system/tokens';

interface ActionBarProps {
  catfoodId: number;
}

export function ActionBar({ catfoodId }: ActionBarProps) {
  const insets = useSafeAreaInsets();
  const { liked, likeCount, favorited, toggleLike, toggleFavorite } = useActionStatus(
    catfoodId.toString()
  );

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const favoriteScale = useMemo(() => new Animated.Value(1), []);
  const likeScale = useMemo(() => new Animated.Value(1), []);

  // 按钮动画
  const animateButton = useCallback((scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  // 处理收藏
  const handleFavorite = useCallback(async () => {
    if (favoriteLoading) return;
    try {
      setFavoriteLoading(true);
      animateButton(favoriteScale);
      await toggleFavorite();
    } catch (error) {
      console.error('收藏操作失败:', error);
      Alert.alert('操作失败', '收藏操作失败，请稍后重试');
    } finally {
      setFavoriteLoading(false);
    }
  }, [favoriteLoading, toggleFavorite, animateButton, favoriteScale]);

  // 处理点赞
  const handleLike = useCallback(async () => {
    if (likeLoading) return;
    try {
      setLikeLoading(true);
      animateButton(likeScale);
      await toggleLike();
    } catch (error) {
      console.error('点赞操作失败:', error);
      Alert.alert('操作失败', '点赞操作失败，请稍后重试');
    } finally {
      setLikeLoading(false);
    }
  }, [likeLoading, toggleLike, animateButton, likeScale]);

  return (
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
            height={52}
            backgroundColor={favorited ? warningScale.warning8 : 'transparent'}
            borderWidth={2}
            borderColor={favorited ? warningScale.warning8 : neutralScale.neutral6}
            borderRadius="$4"
            onPress={handleFavorite}
            disabled={favoriteLoading}
            pressStyle={{
              scale: 0.97,
              backgroundColor: favorited ? warningScale.warning9 : neutralScale.neutral2,
            }}
            icon={
              <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                <IconSymbol
                  name={favorited ? 'star.fill' : 'star'}
                  size={24}
                  color={favorited ? 'white' : neutralScale.neutral10}
                />
              </Animated.View>
            }
          >
            <Text
              color={favorited ? 'white' : neutralScale.neutral10}
              fontSize="$5"
              fontWeight="700"
            >
              {favoriteLoading ? '处理中...' : favorited ? '已收藏' : '收藏'}
            </Text>
          </Button>
        </YStack>

        {/* 点赞按钮 */}
        <YStack flex={1}>
          <Button
            height={52}
            backgroundColor={liked ? errorScale.error8 : 'transparent'}
            borderWidth={2}
            borderColor={liked ? errorScale.error8 : neutralScale.neutral6}
            borderRadius="$4"
            onPress={handleLike}
            disabled={likeLoading}
            pressStyle={{
              scale: 0.97,
              backgroundColor: liked ? errorScale.error9 : neutralScale.neutral2,
            }}
            icon={
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <IconSymbol
                  name={liked ? 'heart.fill' : 'heart'}
                  size={24}
                  color={liked ? 'white' : neutralScale.neutral10}
                />
              </Animated.View>
            }
          >
            <XStack alignItems="center" gap="$2">
              <Text color={liked ? 'white' : neutralScale.neutral10} fontSize="$5" fontWeight="700">
                {likeLoading ? '处理中...' : liked ? '已点赞' : '点赞'}
              </Text>
              {likeCount > 0 && (
                <YStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={liked ? 'rgba(255,255,255,0.2)' : neutralScale.neutral3}
                  borderRadius="$10"
                >
                  <Text
                    color={liked ? 'white' : neutralScale.neutral10}
                    fontSize="$3"
                    fontWeight="bold"
                  >
                    {likeCount}
                  </Text>
                </YStack>
              )}
            </XStack>
          </Button>
        </YStack>
      </XStack>
    </YStack>
  );
}
