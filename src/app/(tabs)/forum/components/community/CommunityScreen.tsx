/**
 * CommunityScreen - 社区主页面
 *
 * Pinterest/小红书风格的瀑布流社区
 * 支持分类筛选、收藏、搜索、用户资料查看等功能
 * 设计风格：简洁现代，流畅动画，统一配色
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { styled, YStack, Stack } from 'tamagui';

import { supabaseForumService, type Post } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';

import { PostDetailScreen } from '../post-detail';

import {
  ForumHeader,
  CategoryTabs,
  MasonryFeed,
  CreatePostFAB,
  UserProfileModal,
  type PostCardData,
  type CategoryItem,
  type UserProfile,
} from './index';

const ScreenContainer = styled(YStack, {
  name: 'CommunityScreen',
  flex: 1,
  backgroundColor: '$background',
});

const TabsSection = styled(Stack, {
  name: 'TabsSection',
  backgroundColor: '$background',
});

const FeedContainer = styled(Stack, {
  name: 'FeedContainer',
  flex: 1,
  backgroundColor: '$backgroundSubtle',
});

const CATEGORIES: CategoryItem[] = [
  { id: 'recommend', label: '推荐', icon: '✨' },
  { id: 'favorites', label: '收藏', icon: '❤️' },
  { id: 'help', label: '求助', icon: '🆘' },
  { id: 'share', label: '分享', icon: '📢' },
  { id: 'science', label: '科普', icon: '📚' },
  { id: 'warning', label: '避雷', icon: '⚠️' },
];

function postToCardData(post: Post): PostCardData {
  const firstImage = post.media?.find((m) => m.mediaType === 'image');
  const hasVideo = post.media?.some((m) => m.mediaType === 'video');

  return {
    id: post.id,
    title: post.content?.slice(0, 50) || '无标题',
    imageUrl: firstImage?.fileUrl || 'https://placekitten.com/400/500',
    imageHeight: firstImage ? undefined : Math.random() * 80 + 120,
    isVideo: hasVideo,
    author: {
      id: post.author?.id || '0',
      name: post.author?.username || '匿名用户',
      avatar: post.author?.avatar || undefined,
      hasReputationBadge: false,
    },
    likeCount: post.favoritesCount || 0,
    viewCount: post.likesCount || 0,
    isLiked: post.isFavorited,
  };
}

export function CommunityScreen() {
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('recommend');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const cardData = useMemo(() => posts.map(postToCardData), [posts]);

  /**
   * 加载未读通知数量
   */
  const loadUnreadCount = useCallback(async () => {
    try {
      const { data, error } = await supabaseForumService.getNotifications(true);
      if (!error && data) {
        setUnreadNotifications(data.length);
      }
    } catch (err) {
      logger.error('加载未读通知数失败', err as Error);
    }
  }, []);

  // 初始化加载未读数
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const loadPosts = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
          // 刷新时也更新未读数
          loadUnreadCount();
        } else {
          setIsLoading(true);
        }

        let result;

        if (activeCategory === 'favorites') {
          result = await supabaseForumService.getMyFavorites();
        } else if (activeCategory === 'recommend') {
          result = await supabaseForumService.getPosts({ order: 'latest' });
        } else {
          result = await supabaseForumService.getPosts({
            order: 'latest',
            category: activeCategory as 'help' | 'share' | 'science' | 'warning',
          });
        }

        if (result.error) throw result.error;
        setPosts(result.data || []);
      } catch (error) {
        logger.error('加载帖子失败', error as Error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeCategory, loadUnreadCount]
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 页面获得焦点时刷新帖子列表（例如从发帖页面返回）
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      // 跳过首次加载（已经在 useEffect 中处理）
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      // 后续的焦点事件触发刷新
      loadPosts(true);
    }, [loadPosts])
  );

  // 处理点赞（实际为收藏）
  const handleLikePress = useCallback(
    async (post: PostCardData) => {
      // 先乐观更新UI
      const wasLiked = posts.find((p) => p.id === post.id)?.isFavorited ?? false;
      const prevCount = posts.find((p) => p.id === post.id)?.favoritesCount ?? 0;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isFavorited: !wasLiked,
                favoritesCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
              }
            : p
        )
      );

      try {
        const { data, error } = await supabaseForumService.toggleFavorite(post.id);
        if (error) throw error;

        // 用服务器返回的真实数据更新
        if (data) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    isFavorited: data.action === 'favorited',
                    favoritesCount: data.favoritesCount ?? p.favoritesCount,
                  }
                : p
            )
          );
        }
      } catch (error) {
        // 出错时回滚
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  isFavorited: wasLiked,
                  favoritesCount: prevCount,
                }
              : p
          )
        );
        logger.error('点赞失败', error as Error);
      }
    },
    [posts]
  );

  // 处理帖子点击
  const handlePostPress = useCallback(
    (post: PostCardData) => {
      const fullPost = posts.find((p) => p.id === post.id);
      if (fullPost) {
        setSelectedPost(fullPost);
      }
    },
    [posts]
  );

  // 处理搜索
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        loadPosts(true);
        return;
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabaseForumService.getPosts({
          order: 'latest',
        });
        if (error) throw error;
        const filtered = (data || []).filter(
          (post) =>
            post.content?.toLowerCase().includes(query.toLowerCase()) ||
            post.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        );
        setPosts(filtered);
      } catch (error) {
        logger.error('搜索失败', error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [loadPosts]
  );

  // 处理创建帖子 - 跳转到独立页面
  const handleCreatePost = useCallback(() => {
    router.push('/(tabs)/forum/create-post');
  }, []);

  // 处理作者点击
  const handleAuthorPress = useCallback((author: PostCardData['author']) => {
    setSelectedUser({
      id: author.id,
      username: author.name,
      avatar: author.avatar,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    });
  }, []);

  // 处理帖子删除
  const handlePostDeleted = useCallback(() => {
    setSelectedPost(null);
    loadPosts(true);
  }, [loadPosts]);

  // 处理从详情页编辑
  const handleEditFromDetail = useCallback((post: Post) => {
    setSelectedPost(null);
    router.push({
      pathname: '/(tabs)/forum/create-post',
      params: { editPostId: post.id.toString() },
    });
  }, []);

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" />

      <ForumHeader
        title="社区"
        unreadCount={unreadNotifications}
        onSearch={handleSearch}
        paddingTop={insets.top}
      />

      <TabsSection>
        <CategoryTabs
          categories={CATEGORIES}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />
      </TabsSection>

      <FeedContainer>
        <MasonryFeed
          data={cardData}
          onPostPress={handlePostPress}
          onLikePress={handleLikePress}
          onAuthorPress={handleAuthorPress}
          onRefresh={() => loadPosts(true)}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
        />
      </FeedContainer>

      <CreatePostFAB onPress={handleCreatePost} />

      <PostDetailScreen
        visible={!!selectedPost}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onEditPost={handleEditFromDetail}
        onPostDeleted={handlePostDeleted}
      />

      <UserProfileModal
        visible={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </ScreenContainer>
  );
}
