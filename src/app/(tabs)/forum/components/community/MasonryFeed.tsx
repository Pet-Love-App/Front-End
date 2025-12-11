/**
 * MasonryFeed - 瀑布流布局组件
 *
 * Pinterest/小红书风格的双列瀑布流
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView } from 'react-native';
import { styled, YStack, Stack, Spinner, Text } from 'tamagui';

import { PostCard, PostCardData } from './PostCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 12;
const HORIZONTAL_PADDING = 16;
const COLUMN_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

export interface MasonryFeedProps {
  data: PostCardData[];
  onPostPress?: (post: PostCardData) => void;
  onLikePress?: (post: PostCardData) => void;
  onAuthorPress?: (author: PostCardData['author']) => void;
  onRefresh?: () => Promise<void>;
  onEndReached?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  ListEmptyComponent?: React.ReactNode;
}

const FeedContainer = styled(Stack, {
  name: 'FeedContainer',
  flex: 1,
  backgroundColor: '$backgroundSubtle',
});

const ColumnsContainer = styled(Stack, {
  name: 'ColumnsContainer',
  flexDirection: 'row',
  paddingHorizontal: HORIZONTAL_PADDING,
  gap: COLUMN_GAP,
});

const Column = styled(YStack, {
  name: 'MasonryColumn',
  flex: 1,
  gap: COLUMN_GAP,
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$8',
});

const EmptyContainer = styled(YStack, {
  name: 'EmptyContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$8',
  gap: '$3',
});

const EmptyText = styled(Text, {
  name: 'EmptyText',
  fontSize: '$4',
  color: '$colorMuted',
  textAlign: 'center',
});

function distributeToColumns(data: PostCardData[], columnCount: number): PostCardData[][] {
  const columns: PostCardData[][] = Array.from({ length: columnCount }, () => []);
  const columnHeights: number[] = Array(columnCount).fill(0);

  data.forEach((item) => {
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    columns[shortestColumn].push(item);
    const estimatedHeight = (item.imageHeight || COLUMN_WIDTH * 1.2) + 80;
    columnHeights[shortestColumn] += estimatedHeight;
  });

  return columns;
}

function MasonryFeedComponent({
  data,
  onPostPress,
  onLikePress,
  onAuthorPress,
  onRefresh,
  onEndReached,
  isLoading = false,
  isRefreshing = false,
  ListEmptyComponent,
}: MasonryFeedProps) {
  const [refreshing, setRefreshing] = useState(false);

  const columns = useMemo(() => distributeToColumns(data, 2), [data]);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);

  const handleScroll = useCallback(
    (event: {
      nativeEvent: {
        contentOffset: { y: number };
        contentSize: { height: number };
        layoutMeasurement: { height: number };
      };
    }) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const isCloseToBottom =
        contentOffset.y + layoutMeasurement.height >= contentSize.height - 200;
      if (isCloseToBottom && onEndReached) {
        onEndReached();
      }
    },
    [onEndReached]
  );

  if (isLoading && data.length === 0) {
    return (
      <LoadingContainer>
        <Spinner size="large" color="$primary" />
      </LoadingContainer>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <EmptyContainer>
        {ListEmptyComponent || (
          <>
            <Text fontSize={48}>🐾</Text>
            <EmptyText>还没有帖子</EmptyText>
            <EmptyText fontSize="$3">成为第一个分享的人吧！</EmptyText>
          </>
        )}
      </EmptyContainer>
    );
  }

  return (
    <FeedContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#7FB093"
              colors={['#7FB093']}
            />
          ) : undefined
        }
        contentContainerStyle={{
          paddingTop: COLUMN_GAP,
          paddingBottom: 100,
        }}
      >
        <ColumnsContainer>
          {columns.map((columnData, columnIndex) => (
            <Column key={`column-${columnIndex}`}>
              {columnData.map((item) => (
                <PostCard
                  key={item.id}
                  data={item}
                  columnWidth={COLUMN_WIDTH}
                  onPress={onPostPress}
                  onLikePress={onLikePress}
                  onAuthorPress={onAuthorPress}
                />
              ))}
            </Column>
          ))}
        </ColumnsContainer>
      </ScrollView>
    </FeedContainer>
  );
}

export const MasonryFeed = memo(MasonryFeedComponent);
