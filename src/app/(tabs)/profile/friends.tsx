/**
 * 我的好友页面
 *
 * 功能：
 * - 查看好友列表
 * - 管理好友请求
 * - 删除好友
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, UserPlus, ChevronLeft, Search, MessageCircle } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  supabaseFriendsService,
  supabaseChatService,
  type Friend,
  type FriendRequest,
} from '@/src/lib/supabase';
import { UserProfileModal } from '@/src/components/UserProfileModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BRAND_COLOR = '#1DA1F2';

type TabType = 'friends' | 'requests';

export default function MyFriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        await loadFriends();
      } else {
        await loadRequests();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    const response = await supabaseFriendsService.getMyFriends();
    if (response.success && response.data) {
      setFriends(response.data);
    }
  };

  const loadRequests = async () => {
    const response = await supabaseFriendsService.getReceivedRequests();
    if (response.success && response.data) {
      setRequests(response.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: number) => {
    const response = await supabaseFriendsService.acceptFriendRequest(requestId);
    if (response.success) {
      await loadRequests();
      await loadFriends();
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    const response = await supabaseFriendsService.rejectFriendRequest(requestId);
    if (response.success) {
      await loadRequests();
    }
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const response = await supabaseChatService.getOrCreateConversation(friendId);
      if (response.success && response.data) {
        router.push(`/profile/chat?conversationId=${response.data.id}&userId=${friendId}` as any);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <TouchableOpacity
        style={styles.friendTouchable}
        onPress={() => handleViewProfile(item.friendId)}
        activeOpacity={0.8}
      >
        <View style={styles.friendAvatar}>
          {item.friendAvatar ? (
            <Image source={{ uri: item.friendAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.friendUsername.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.friendUsername}</Text>
          {item.friendBio && (
            <Text style={styles.friendBio} numberOfLines={1}>
              {item.friendBio}
            </Text>
          )}
          <Text style={styles.friendDate}>
            {new Date(item.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleStartChat(item.friendId)}
        activeOpacity={0.8}
      >
        <MessageCircle size={20} color={BRAND_COLOR} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestCard}>
      <TouchableOpacity
        style={styles.requestInfo}
        onPress={() => handleViewProfile(item.senderId)}
        activeOpacity={0.8}
      >
        <View style={styles.requestAvatar}>
          {item.senderAvatar ? (
            <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.senderUsername.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.requestTextInfo}>
          <Text style={styles.requestName}>{item.senderUsername}</Text>
          {item.message && (
            <Text style={styles.requestMessage} numberOfLines={2}>
              {item.message}
            </Text>
          )}
          <Text style={styles.requestDate}>
            {new Date(item.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>接受</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectButtonText}>拒绝</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {activeTab === 'friends' ? (
        <>
          <Users size={64} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>暂无好友</Text>
          <Text style={styles.emptyText}>快去添加好友吧！</Text>
        </>
      ) : (
        <>
          <UserPlus size={64} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>暂无好友请求</Text>
          <Text style={styles.emptyText}>当有人向你发送好友请求时，会显示在这里</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 自定义头部 */}
      <LinearGradient
        colors={['#1DA1F2', '#0EA5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的好友</Text>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <Search size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab 切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.8}
        >
          <Users
            size={20}
            color={activeTab === 'friends' ? BRAND_COLOR : '#6B7280'}
            strokeWidth={2}
          />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            好友 ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.8}
        >
          <UserPlus
            size={20}
            color={activeTab === 'requests' ? BRAND_COLOR : '#6B7280'}
            strokeWidth={2}
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            请求 ({requests.length})
          </Text>
          {requests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 列表内容 */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
        </View>
      ) : activeTab === 'friends' ? (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BRAND_COLOR}
              colors={[BRAND_COLOR]}
            />
          }
        />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BRAND_COLOR}
              colors={[BRAND_COLOR]}
            />
          }
        />
      )}

      {/* 用户详情模态框 */}
      {selectedUserId && (
        <UserProfileModal
          visible={showUserProfile}
          userId={selectedUserId}
          onClose={() => {
            setShowUserProfile(false);
            loadData(); // 关闭时刷新数据
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND_COLOR,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: BRAND_COLOR,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: '30%',
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  friendTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  friendBio: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  friendDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5FE',
    borderRadius: 22,
    marginLeft: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  requestAvatar: {
    marginRight: 16,
  },
  requestTextInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  requestDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: BRAND_COLOR,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#F3F4F6',
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
