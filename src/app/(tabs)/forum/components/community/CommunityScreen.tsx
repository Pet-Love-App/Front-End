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
import { YStack, Stack } from 'tamagui';

import { supabaseForumService, type Post } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';
import { useThemeColors } from '@/src/hooks/useThemeColors';

import { PostDetailScreen } from '../post-detail';

import {
  ForumHeader,
  CategoryTabs,
  MasonryFeed,
  CreatePostFAB,
  type PostCardData,
  type CategoryItem,
} from './index';
import { UserProfileModal } from '@/src/components/UserProfileModal';

const CATEGORIES: CategoryItem[] = [
  { id: 'recommend', label: '推荐' },
  { id: 'help', label: '求助' },
  { id: 'share', label: '分享' },
  { id: 'science', label: '科普' },
  { id: 'warning', label: '避雷' },
];

function postToCardData(post: Post): PostCardData {
  const firstImage = post.media?.find((m) => m.mediaType === 'image');
  const firstVideo = post.media?.find((m) => m.mediaType === 'video');
  const hasVideo = !!firstVideo;

  // 确定显示的图片 URL：
  // 1. 优先使用图片
  // 2. 如果只有视频，优先使用数据库存储的缩略图
  // 3. 如果没有缩略图，传递视频 URL 让前端动态生成
  let imageUrl = firstImage?.fileUrl || '';
  let videoUrl: string | undefined;
  let needsVideoThumbnail = false; // 标记是否需要动态生成视频缩略图

  if (!firstImage && firstVideo) {
    // 只有视频没有图片时
    if (firstVideo.thumbnailUrl) {
      // 使用数据库存储的缩略图
      imageUrl = firstVideo.thumbnailUrl;
    } else {
      // 没有缩略图，传递视频 URL 让前端动态生成
      videoUrl = firstVideo.fileUrl;
      needsVideoThumbnail = true;
    }
  }

  // 如果没有任何图片来源，使用占位图（仅用于纯文字帖子）
  const finalImageUrl = imageUrl || (needsVideoThumbnail ? '' : 'https://placekitten.com/400/500');

  return {
    id: post.id,
    title: post.content?.slice(0, 50) || '无标题',
    imageUrl: finalImageUrl,
    videoUrl, // 视频 URL，用于前端动态生成缩略图（作为后备方案）
    imageHeight: firstImage || firstVideo ? undefined : Math.random() * 80 + 120,
    isVideo: hasVideo,
    author: {
      id: post.author?.id || '0',
      name: post.author?.username || '匿名用户',
      avatar: post.author?.avatar || undefined,
      hasReputationBadge: false,
    },
    likeCount: post.likesCount || 0,
    viewCount: 0, // 暂未实现浏览数统计
    isLiked: post.isLiked,
  };
}

export function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('recommend');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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

        if (activeCategory === 'recommend') {
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

  // 初始加载和标签切换时加载帖子
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        let result;

        if (activeCategory === 'recommend') {
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
      }
    };

    load();
  }, [activeCategory]);

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

  // 处理点赞
  const handleLikePress = useCallback(
    async (post: PostCardData) => {
      // 先乐观更新UI
      const wasLiked = posts.find((p) => p.id === post.id)?.isLiked ?? false;
      const prevCount = posts.find((p) => p.id === post.id)?.likesCount ?? 0;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLiked: !wasLiked,
                likesCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
              }
            : p
        )
      );

      try {
        const { data, error } = await supabaseForumService.toggleLike(post.id);
        if (error) throw error;

        // 用服务器返回的真实数据更新
        if (data) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    isLiked: data.action === 'liked',
                    likesCount: data.likesCount ?? p.likesCount,
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
                  isLiked: wasLiked,
                  likesCount: prevCount,
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

        // 检查是否是标签搜索（以 # 开头）
        if (query.startsWith('#')) {
          const tag = query.slice(1).trim();
          if (tag) {
            // 使用服务器端标签过滤
            const { data, error } = await supabaseForumService.getPosts({
              order: 'latest',
              tag,
            });
            if (error) throw error;
            setPosts(data || []);
          } else {
            loadPosts(true);
          }
        } else {
          // 普通搜索：获取所有帖子并在客户端过滤
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
        }
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
    setSelectedUserId(author.id);
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
    <YStack flex={1} backgroundColor={colors.background as any} testID="forum-screen">
      <StatusBar barStyle="dark-content" />

      <Stack backgroundColor={colors.cardBackground as any}>
        <ForumHeader
          title="社区"
          unreadCount={unreadNotifications}
          onSearch={handleSearch}
          paddingTop={insets.top}
        />
      </Stack>

      <Stack backgroundColor={colors.cardBackground as any}>
        <CategoryTabs
          categories={CATEGORIES}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />
      </Stack>

      <Stack flex={1} backgroundColor={colors.backgroundSubtle as any}>
        <MasonryFeed
          data={cardData}
          onPostPress={handlePostPress}
          onLikePress={handleLikePress}
          onAuthorPress={handleAuthorPress}
          onRefresh={() => loadPosts(true)}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
        />
      </Stack>

      <CreatePostFAB onPress={handleCreatePost} />

      <PostDetailScreen
        visible={!!selectedPost}
        post={selectedPost}
        onClose={() => {
          setSelectedPost(null);
          // 关闭详情页后刷新列表，确保状态同步
          loadPosts(true);
        }}
        onEditPost={handleEditFromDetail}
        onPostDeleted={handlePostDeleted}
      />

      {selectedUserId && (
        <UserProfileModal
          visible={!!selectedUserId}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </YStack>
  );
}
