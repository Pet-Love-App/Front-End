/**
 * 消息通知页面
 *
 * 现代化设计风格，显示：
 * - 帖子评论通知
 * - 评论回复通知
 * - 分时间段分组展示
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Dimensions,
  View,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  CheckCheck,
  MessageCircle,
  Reply,
  Sparkles,
} from '@tamagui/lucide-icons';
import { YStack, XStack, Text, Avatar, Spinner, Stack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { supabaseForumService, type NotificationItem } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 格式化时间为相对时间
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/**
 * 获取日期分组标签
 */
function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return '本周';
  return '更早';
}

/**
 * 获取通知图标和颜色 - 使用桃色主题
 */
function getNotificationStyle(verb: NotificationItem['verb'], isDark: boolean) {
  switch (verb) {
    case 'comment_post':
      return {
        icon: MessageCircle,
        gradientColors: isDark
          ? (['#4a3728', '#2d1f1a'] as const)
          : (['#FFF4ED', '#FFE4D6'] as const),
        iconColor: isDark ? '#FEBE98' : '#D89574',
        accentColor: '#FEBE98',
        label: '评论了你的帖子',
        emoji: '💬',
      };
    case 'reply_comment':
      return {
        icon: Reply,
        gradientColors: isDark
          ? (['#3D2A1F', '#251815'] as const)
          : (['#FEF0E6', '#FFDDC8'] as const),
        iconColor: isDark ? '#E8A47E' : '#C4785A',
        accentColor: '#E8A47E',
        label: '回复了你的评论',
        emoji: '↩️',
      };
    default:
      return {
        icon: Bell,
        gradientColors: isDark
          ? (['#374151', '#1f2937'] as const)
          : (['#F2E8DA', '#E6D5C3'] as const),
        iconColor: isDark ? '#D7CCC8' : '#A78C7B',
        accentColor: '#D7CCC8',
        label: '通知',
        emoji: '🔔',
      };
  }
}

/**
 * 通知卡片组件
 */
const NotificationCard = React.memo(function NotificationCard({
  item,
  onPress,
  colors,
  isDark,
  isFirst,
  isLast,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  colors: ReturnType<typeof useThemeColors>;
  isDark: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const style = getNotificationStyle(item.verb, isDark);
  const Icon = style.icon;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={() => onPress(item)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: item.unread
              ? isDark
                ? 'rgba(254, 190, 152, 0.12)'
                : 'rgba(254, 190, 152, 0.08)'
              : colors.cardBackground,
            borderTopLeftRadius: isFirst ? 20 : 4,
            borderTopRightRadius: isFirst ? 20 : 4,
            borderBottomLeftRadius: isLast ? 20 : 4,
            borderBottomRightRadius: isLast ? 20 : 4,
            marginTop: isFirst ? 0 : 1,
          },
        ]}
      >
        {/* 左侧：头像 + 类型图标 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {item.actor?.avatar ? (
              <Image
                source={{ uri: item.actor.avatar }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={isDark ? ['#4a5568', '#2d3748'] : ['#FEBE98', '#E8A47E']}
                style={styles.avatarGradient}
              >
                <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
                  {item.actor?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
            )}

            {/* 类型图标徽章 */}
            <LinearGradient colors={style.gradientColors} style={styles.typeBadge}>
              <Icon size={10} color={style.iconColor as any} strokeWidth={2.5} />
            </LinearGradient>
          </View>
        </View>

        {/* 中间：内容 */}
        <View style={styles.contentSection}>
          <View style={styles.contentHeader}>
            <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
              {item.actor?.username || '用户'}
            </Text>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{style.label}</Text>
          </View>

          {/* 预览内容 */}
          {(item.comment?.content || item.post?.content) && (
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderLeftColor: style.accentColor,
                },
              ]}
            >
              <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.comment?.content || item.post?.content}
              </Text>
            </View>
          )}

          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>

        {/* 右侧：未读指示器 */}
        {item.unread && (
          <View style={styles.unreadSection}>
            <View style={[styles.unreadDot, { backgroundColor: style.accentColor }]}>
              <View style={[styles.unreadDotInner, { backgroundColor: style.accentColor }]} />
            </View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

/**
 * 分组标题组件
 */
const SectionHeader = React.memo(function SectionHeader({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionLine, { backgroundColor: colors.borderMuted }]} />
      <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.borderMuted }]} />
    </View>
  );
});

/**
 * 空状态组件
 */
const EmptyState = React.memo(function EmptyState({
  colors,
  isDark,
}: {
  colors: ReturnType<typeof useThemeColors>;
  isDark: boolean;
}) {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={isDark ? ['#3D2A1F', '#2D1F1A'] : ['#FFF4ED', '#FFDDC8']}
        style={styles.emptyIconWrapper}
      >
        <Bell size={40} color={isDark ? '#FEBE98' : '#D89574'} strokeWidth={1.5} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>暂无新消息</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        和社区互动后会收到通知哦~{'\n'}去发帖或评论看看吧 ✨
      </Text>
    </View>
  );
});

/**
 * 消息通知页面
 */
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 未读数量
  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  // 按时间分组的通知
  const groupedNotifications = useMemo(() => {
    const groups: { title: string; data: NotificationItem[] }[] = [];
    const groupMap = new Map<string, NotificationItem[]>();

    notifications.forEach((item) => {
      const group = getDateGroup(item.createdAt);
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(item);
    });

    // 保持顺序：今天 -> 昨天 -> 本周 -> 更早
    const order = ['今天', '昨天', '本周', '更早'];
    order.forEach((title) => {
      if (groupMap.has(title)) {
        groups.push({ title, data: groupMap.get(title)! });
      }
    });

    return groups;
  }, [notifications]);

  /**
   * 加载通知
   */
  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error } = await supabaseForumService.getNotifications();
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      logger.error('加载通知失败', error as Error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * 标记全部已读
   */
  const handleMarkAllRead = useCallback(async () => {
    try {
      const { error } = await supabaseForumService.markAllNotificationsRead();
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (error) {
      logger.error('标记已读失败', error as Error);
    }
  }, []);

  /**
   * 点击通知
   */
  const handleNotificationPress = useCallback(async (item: NotificationItem) => {
    // 标记为已读
    if (item.unread) {
      try {
        await supabaseForumService.markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
        );
      } catch (error) {
        logger.error('标记已读失败', error as Error);
      }
    }

    // 跳转到相关帖子详情
    if (item.post?.id) {
      router.push({
        pathname: '/post-detail',
        params: {
          postId: item.post.id.toString(),
          commentId: item.comment?.id?.toString() || '',
        },
      });
    }
  }, []);

  /**
   * 渲染列表项
   */
  const renderItem = useCallback(
    ({ item, index }: { item: NotificationItem; index: number }) => {
      // 找到当前项所在的分组
      let groupIndex = 0;
      let itemIndexInGroup = 0;
      let groupSize = 0;

      for (const group of groupedNotifications) {
        const foundIndex = group.data.findIndex((n) => n.id === item.id);
        if (foundIndex !== -1) {
          itemIndexInGroup = foundIndex;
          groupSize = group.data.length;
          break;
        }
        groupIndex++;
      }

      return (
        <NotificationCard
          item={item}
          onPress={handleNotificationPress}
          colors={colors}
          isDark={isDark}
          isFirst={itemIndexInGroup === 0}
          isLast={itemIndexInGroup === groupSize - 1}
        />
      );
    },
    [handleNotificationPress, colors, isDark, groupedNotifications]
  );

  /**
   * 渲染分组
   */
  const renderSection = useCallback(
    ({ item: group }: { item: { title: string; data: NotificationItem[] } }) => (
      <View style={styles.sectionContainer}>
        <SectionHeader title={group.title} colors={colors} />
        <View style={[styles.cardsWrapper, { backgroundColor: colors.cardBackground }]}>
          {group.data.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              item={notification}
              onPress={handleNotificationPress}
              colors={colors}
              isDark={isDark}
              isFirst={index === 0}
              isLast={index === group.data.length - 1}
            />
          ))}
        </View>
      </View>
    ),
    [handleNotificationPress, colors, isDark]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 头部 - 桃色主题 */}
      <LinearGradient
        colors={isDark ? ['#3D2A1F', '#2D1F1A'] : ['#FEBE98', '#E8A47E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        {/* 装饰性背景元素 */}
        <View style={styles.headerDecoration}>
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />
        </View>

        <View style={styles.headerContent}>
          <Pressable
            onPress={() => {
              // 检查是否可以返回，如果不能则导航到论坛主页
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                router.replace('/(tabs)/forum');
              }
            }}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>

          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>消息通知</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 ? (
            <Pressable
              onPress={handleMarkAllRead}
              style={({ pressed }) => [
                styles.markAllButton,
                pressed && styles.markAllButtonPressed,
              ]}
            >
              <CheckCheck size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.markAllText}>全部已读</Text>
            </Pressable>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
        </View>
      </LinearGradient>

      {/* 通知列表 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Spinner size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState colors={colors} isDark={isDark} />
      ) : (
        <FlatList
          data={groupedNotifications}
          renderItem={renderSection}
          keyExtractor={(item) => item.title}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: -50,
    right: -30,
  },
  decorCircle2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  unreadCountBadge: {
    backgroundColor: '#E8A47E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markAllButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardsWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  avatarSection: {
    marginRight: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6D5C3',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentSection: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: 14,
  },
  previewBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadSection: {
    paddingLeft: 8,
    paddingTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
