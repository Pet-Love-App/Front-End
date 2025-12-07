import { memo, useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Spinner, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { supabaseCatfoodService } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import type { CatFood } from '@/src/types/catFood';

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
  const { _hasHydrated, isAuthenticated } = useUserStore();
  const [likes, setLikes] = useState<CatFood[]>([]);
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

      // 获取用户点赞的猫粮列表
      const { data, error } = await supabaseCatfoodService.getUserLikes({ page: 1, pageSize: 100 });

      if (error) {
        throw new Error(error.message);
      }

      setLikes(data || []);
    } catch (error: any) {
      console.error('加载点赞列表失败:', error);
      Alert.alert('错误', '加载点赞列表失败，请稍后重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 等待 Zustand 状态恢复完成后再加载点赞列表
    if (_hasHydrated && isAuthenticated) {
      loadLikes();
    } else if (_hasHydrated && !isAuthenticated) {
      // 如果已经恢复但未认证，停止加载
      setIsLoading(false);
    }
  }, [_hasHydrated, isAuthenticated]);

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
        {likes.map((catfood) => (
          <TouchableOpacity
            key={catfood.id}
            onPress={() => handleNavigateToDetail(catfood.id)}
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
                {catfood.imageUrl ? (
                  <YStack
                    width={80}
                    height={80}
                    borderRadius="$3"
                    overflow="hidden"
                    backgroundColor="$gray2"
                  >
                    <Image
                      source={{ uri: catfood.imageUrl }}
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
                    {catfood.name}
                  </Text>
                  {catfood.brand && (
                    <XStack gap="$1.5" alignItems="center">
                      <IconSymbol name="building.2.fill" size={14} color={colors.icon} />
                      <Text fontSize={13} color={colors.icon}>
                        {catfood.brand}
                      </Text>
                    </XStack>
                  )}
                  <XStack gap="$3" alignItems="center">
                    <XStack gap="$1" alignItems="center">
                      <IconSymbol name="star.fill" size={14} color="#FDB97A" />
                      <Text fontSize={13} fontWeight="600" color={colors.text}>
                        {catfood.score ? catfood.score.toFixed(1) : '暂无评分'}
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
