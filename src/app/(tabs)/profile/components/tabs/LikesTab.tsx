import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { likeApi, type Like } from '@/src/services/api/like';
import { useRouter } from 'expo-router';
import { memo, useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Spinner, Text, XStack, YStack } from 'tamagui';

/**
 * 点赞 Tab 组件
 *
 * 功能：
 * - 显示用户点赞的所有猫粮
 * - 支持下拉刷新
 * - 点击跳转到猫粮详情
 *
 * @component
 */
export const LikesTab = memo(function LikesTab() {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 加载点赞列表
   */
  const loadLikes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await likeApi.getLikes();
      setLikes(data);
    } catch (error: any) {
      console.error('加载点赞列表失败:', error);
      Alert.alert('错误', '加载点赞列表失败，请稍后重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLikes();
  }, []);

  /**
   * 跳转到猫粮详情
   */
  const handleNavigateToDetail = (catfoodId: number) => {
    router.push({
      pathname: '/detail',
      params: { id: catfoodId.toString() },
    } as any);
  };

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <Spinner size="large" color="#FEBE98" />
        <Text fontSize={14} color={colors.icon} marginTop="$3">
          加载中...
        </Text>
      </YStack>
    );
  }

  if (likes.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadLikes(true)} />
        }
      >
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
          <YStack
            width={100}
            height={100}
            borderRadius="$12"
            backgroundColor="$gray2"
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="heart.fill" size={50} color={colors.icon + '60'} />
          </YStack>
          <Text fontSize={16} fontWeight="600" color={colors.text}>
            还没有点赞
          </Text>
          <Text fontSize={14} color={colors.icon} textAlign="center">
            去发现页面点赞你喜欢的猫粮吧
          </Text>
        </YStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => loadLikes(true)} />
      }
    >
      <YStack width="100%" alignItems="center" paddingVertical="$4" gap="$3">
        {likes.map((like) => (
          <TouchableOpacity
            key={like.id}
            onPress={() => handleNavigateToDetail(like.catfood.id)}
            activeOpacity={0.8}
            style={{ width: '90%' }}
          >
            <Card
              padding="$4"
              backgroundColor={colors.background}
              borderWidth={1}
              borderColor={colors.icon + '15'}
              borderRadius="$4"
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
            >
              <XStack gap="$3" alignItems="center">
                {/* 猫粮图片 */}
                {like.catfood.imageUrl ? (
                  <YStack
                    width={80}
                    height={80}
                    borderRadius="$3"
                    overflow="hidden"
                    backgroundColor="$gray2"
                  >
                    <Image
                      source={{ uri: like.catfood.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </YStack>
                ) : (
                  <YStack
                    width={80}
                    height={80}
                    borderRadius="$3"
                    backgroundColor="$gray2"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <IconSymbol name="photo" size={32} color={colors.icon} />
                  </YStack>
                )}

                {/* 猫粮信息 */}
                <YStack flex={1} gap="$2">
                  <Text fontSize={16} fontWeight="600" color={colors.text} numberOfLines={2}>
                    {like.catfood.name}
                  </Text>
                  {like.catfood.brand && (
                    <XStack gap="$1.5" alignItems="center">
                      <IconSymbol name="building.2.fill" size={14} color={colors.icon} />
                      <Text fontSize={13} color={colors.icon}>
                        {like.catfood.brand}
                      </Text>
                    </XStack>
                  )}
                  <XStack gap="$3" alignItems="center">
                    <XStack gap="$1" alignItems="center">
                      <IconSymbol name="star.fill" size={14} color="#FDB97A" />
                      <Text fontSize={13} fontWeight="600" color={colors.text}>
                        {like.catfood.score ? like.catfood.score.toFixed(1) : '暂无评分'}
                      </Text>
                    </XStack>
                  </XStack>
                </YStack>

                {/* 箭头 */}
                <IconSymbol name="chevron.right" size={20} color={colors.icon + '60'} />
              </XStack>
            </Card>
          </TouchableOpacity>
        ))}
      </YStack>
    </ScrollView>
  );
});
