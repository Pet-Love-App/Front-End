import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';
import Tag from '@/src/components/ui/Tag';
import { Colors } from '@/src/constants/colors';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { supabaseForumService, type Post } from '@/src/lib/supabase';

interface SquareTabProps {
  onOpenPost?: (post: Post) => void;
  externalReloadRef?: React.MutableRefObject<(() => void) | null>;
  order?: 'latest' | 'most_replied' | 'featured';
  filterTag?: string;
  filterTags?: string[];
}

export function SquareTab({
  onOpenPost,
  externalReloadRef,
  order = 'latest',
  filterTag,
  filterTags,
}: SquareTabProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const animationRefs = useRef<Record<number, LottieView | null>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        order: 'latest' | 'most_replied' | 'featured';
        tag?: string;
        tags?: string[];
      } = { order };
      if (filterTag) params.tag = filterTag;
      if (filterTags && filterTags.length) params.tags = filterTags;
      const { data, error } = await supabaseForumService.getPosts(params);
      if (error) throw error;
      setList(data || []);
    } catch (_e) {
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [order, filterTag, filterTags]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (externalReloadRef) {
      externalReloadRef.current = load;
    }
    return () => {
      if (externalReloadRef) {
        externalReloadRef.current = null;
      }
    };
  }, [externalReloadRef, load]);

  const toggleFavorite = async (postId: number, wasFavorited: boolean) => {
    try {
      const { data: res, error } = await supabaseForumService.toggleFavorite(postId);
      if (error || !res) {
        Alert.alert('错误', '操作失败');
        return;
      }
      setList((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isFavorited: res.action === 'favorited',
                favoritesCount: res.favoritesCount ?? p.favoritesCount,
              }
            : p
        )
      );
      if (!wasFavorited && res.action === 'favorited') {
        setTimeout(() => animationRefs.current[postId]?.play(), 0);
      }
    } catch (_e) {
      Alert.alert('错误', '操作失败');
    }
  };

  const renderTags = (item: Post) => {
    if (!item.tags || item.tags.length === 0) return null;
    return (
      <XStack gap="$2" alignItems="center" flexWrap="wrap" marginTop="$2">
        {item.tags.map((tag, index) => (
          <Tag key={`${item.id}-${tag}`} name={tag} index={index} />
        ))}
      </XStack>
    );
  };

  const renderMediaPreview = (item: Post) => {
    if (!item.media || item.media.length === 0) return null;
    const maxThumbs = 3;
    const thumbs = item.media.slice(0, maxThumbs);
    const overflow = item.media.length - maxThumbs;

    return (
      <XStack gap="$2" flexWrap="wrap">
        {thumbs.map((m, idx) =>
          m.mediaType === 'image' ? (
            <Card key={m.id} width={110} height={110} overflow="hidden">
              <Image
                source={{ uri: m.file }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              {idx === maxThumbs - 1 && overflow > 0 ? (
                <YStack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.35)'}
                >
                  <Text color={isDark ? '#000' : '#fff'} fontWeight="700">
                    +{overflow}
                  </Text>
                </YStack>
              ) : null}
            </Card>
          ) : (
            <Card key={m.id} padding="$2">
              <Text color="$gray10">[视频]</Text>
            </Card>
          )
        )}
      </XStack>
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Card
      margin="$3"
      padding="$3"
      backgroundColor={colors.cardBackground}
      borderWidth={1}
      borderColor="#E5E7EB"
      borderRadius="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.05}
      shadowRadius={2}
      elevation={1}
    >
      <YStack gap="$2">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontWeight="700">{item.author.username}</Text>
          <Text color="$gray10">{new Date(item.createdAt).toLocaleString()}</Text>
        </XStack>
        <Text>{item.content}</Text>

        {renderTags(item)}
        {renderMediaPreview(item)}

        <XStack gap="$3" alignItems="center" justifyContent="space-between">
          <XStack gap="$3" alignItems="center">
            <Text color="$gray10">{item.commentsCount ?? 0} 回复</Text>
            <Text color="$gray10">{item.favoritesCount} 收藏</Text>
          </XStack>
          <XStack gap="$3" alignItems="center">
            <Button
              size="$2"
              onPress={() => toggleFavorite(item.id, item.isFavorited)}
              backgroundColor={item.isFavorited ? '$yellow4' : '$background'}
            >
              <XStack alignItems="center" gap="$1">
                <Text fontSize="$5" color={item.isFavorited ? '$yellow10' : '$gray10'}>
                  {item.isFavorited ? '★' : '☆'}
                </Text>
                <Text fontSize="$3" color="$gray11">
                  {item.favoritesCount}
                </Text>
              </XStack>
              <YStack
                position="absolute"
                top={-20}
                left={-20}
                width={60}
                height={60}
                pointerEvents="none"
              >
                <LottieView
                  ref={(ref) => {
                    animationRefs.current[item.id] = ref;
                  }}
                  source={require('@/assets/animations/Tap_Burst.json')}
                  loop={false}
                  autoPlay={false}
                  style={{ width: 60, height: 60 }}
                />
              </YStack>
            </Button>
          </XStack>
        </XStack>

        <XStack gap="$2">
          <Button size="$3" onPress={() => onOpenPost?.(item)}>
            查看详情
          </Button>
        </XStack>
      </YStack>
    </Card>
  );

  if (loading) {
    return (
      <YStack alignItems="center" marginTop={40}>
        <Spinner />
      </YStack>
    );
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    />
  );
}
