/**
 * CommunityScreen - 社区主页面
 *
 * Pinterest/小红书风格的瀑布流社区
 * 支持分类筛选、收藏、搜索等功能
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, YStack, Stack } from 'tamagui';

import { supabaseForumService, type Post } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';

import { PostDetailModal } from '../index';

import {
  GlassSearchBar,
  CategoryTabs,
  MasonryFeed,
  CreatePostFAB,
  PostEditorModal,
  type PostCardData,
  type CategoryItem,
} from './index';

// 样式组件
const ScreenContainer = styled(YStack, {
  name: 'CommunityScreen',
  flex: 1,
  backgroundColor: '$backgroundSubtle',
});

const HeaderContainer = styled(YStack, {
  name: 'CommunityHeader',
  backgroundColor: '$background',
  paddingHorizontal: '$4',
  gap: '$3',
  paddingBottom: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColorMuted',
});

const SearchSection = styled(Stack, {
  name: 'SearchSection',
});

const TabsSection = styled(Stack, {
  name: 'TabsSection',
  marginHorizontal: -16,
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
      id: Number(post.author?.id) || 0,
      name: post.author?.username || '匿名用户',
      avatar: post.author?.avatar || undefined,
      hasReputationBadge: false,
    },
    likeCount: post.favoritesCount || 0,
    isLiked: post.isFavorited,
  };
}

export function CommunityScreen() {
  const insets = useSafeAreaInsets();

  // 状态
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('recommend');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const cardData = useMemo(() => posts.map(postToCardData), [posts]);

  const loadPosts = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
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
    [activeCategory]
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 处理点赞
  const handleLikePress = useCallback(async (post: PostCardData) => {
    try {
      const { data, error } = await supabaseForumService.toggleFavorite(post.id);
      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isFavorited: data?.action === 'favorited',
                favoritesCount: data?.favoritesCount ?? p.favoritesCount,
              }
            : p
        )
      );
    } catch (error) {
      logger.error('点赞失败', error as Error);
    }
  }, []);

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

  // 处理搜索输入
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 处理搜索提交
  const handleSearchSubmit = useCallback(
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

  // 处理创建帖子
  const handleCreatePost = useCallback(() => {
    setEditingPost(null);
    setIsPostEditorOpen(true);
  }, []);

  // 处理帖子编辑成功
  const handlePostEditorSuccess = useCallback(() => {
    setIsPostEditorOpen(false);
    loadPosts(true);
  }, [loadPosts]);

  // 处理帖子删除
  const handlePostDeleted = useCallback(() => {
    setSelectedPost(null);
    loadPosts(true);
  }, [loadPosts]);

  // 处理从详情页编辑
  const handleEditFromDetail = useCallback((post: Post) => {
    setSelectedPost(null);
    setEditingPost(post);
    setIsPostEditorOpen(true);
  }, []);

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" />

      <HeaderContainer paddingTop={insets.top + 8}>
        <SearchSection>
          <GlassSearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmit={handleSearchSubmit}
            placeholder="搜索话题、标签..."
          />
        </SearchSection>

        <TabsSection>
          <CategoryTabs
            categories={CATEGORIES}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
        </TabsSection>
      </HeaderContainer>

      <MasonryFeed
        data={cardData}
        onPostPress={handlePostPress}
        onLikePress={handleLikePress}
        onRefresh={() => loadPosts(true)}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
      />

      <CreatePostFAB onPress={handleCreatePost} />

      <PostDetailModal
        visible={!!selectedPost}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onEditPost={handleEditFromDetail}
        onPostDeleted={handlePostDeleted}
      />

      <PostEditorModal
        visible={isPostEditorOpen}
        editingPost={editingPost}
        onClose={() => setIsPostEditorOpen(false)}
        onSuccess={handlePostEditorSuccess}
      />
    </ScreenContainer>
  );
}
