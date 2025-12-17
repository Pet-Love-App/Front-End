/**
 * 用户详情查看模态框
 *
 * 功能：
 * - 查看用户详细信息
 * - 发送/接受好友请求
 * - 删除好友
 * - 查看用户发布的帖子
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageCircle,
  X,
  MapPin,
  Calendar,
  Heart,
} from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import {
  supabaseFriendsService,
  supabaseProfileService,
  supabaseChatService,
  supabaseFollowService,
  type Profile,
} from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND_COLOR = '#FEBE98'; // 应用主题色 - 温暖的桃色

interface UserProfileModalProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onSendMessage?: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  userId,
  onClose,
  onSendMessage,
}) => {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'sent' | 'received' | 'friends'>(
    'none'
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 检查是否是当前用户自己
  const isCurrentUser = currentUser?.id === userId;

  useEffect(() => {
    if (visible && userId) {
      loadUserProfile();
      loadFriendStatus();
      loadFollowStatus();
      loadFollowStats();
    }
  }, [visible, userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const response = await supabaseProfileService.getProfileById(userId);
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendStatus = async () => {
    try {
      const response = await supabaseFriendsService.getFriendRequestStatus(userId);
      if (response.success && response.data) {
        setFriendStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load friend status:', error);
    }
  };

  const loadFollowStatus = async () => {
    try {
      const response = await supabaseFollowService.isFollowing(userId);
      if (response.success) {
        setIsFollowing(response.data || false);
      }
    } catch (error) {
      console.error('Failed to load follow status:', error);
    }
  };

  const loadFollowStats = async () => {
    try {
      const response = await supabaseFollowService.getFollowStats(userId);
      if (response.success && response.data) {
        setFollowStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load follow stats:', error);
    }
  };

  const handleToggleFollow = async () => {
    setFollowLoading(true);
    try {
      const response = await supabaseFollowService.toggleFollow(userId);
      if (response.success && response.data) {
        setIsFollowing(response.data.isFollowing);
        // 重新加载统计数据以确保准确性
        await loadFollowStats();
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert('操作失败，请稍后再试');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    setActionLoading(true);
    try {
      const response = await supabaseFriendsService.sendFriendRequest(
        userId,
        `你好，我想和你成为好友！`
      );
      if (response.success) {
        setFriendStatus('sent');
      } else {
        alert(response.error?.message || '发送失败');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('发送失败，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    try {
      const response = await supabaseFriendsService.removeFriend(userId);
      if (response.success) {
        setFriendStatus('none');
      } else {
        alert(response.error?.message || '删除失败');
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('删除失败，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setActionLoading(true);
    try {
      const response = await supabaseFriendsService.acceptFriendRequestBySenderId(userId);
      if (response.success) {
        setFriendStatus('friends');
      } else {
        alert(response.error?.message || '接受失败');
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('接受失败，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (friendStatus !== 'friends') {
      alert('只能给好友发送消息');
      return;
    }

    setActionLoading(true);
    try {
      // 获取或创建会话
      const response = await supabaseChatService.getOrCreateConversation(userId);

      if (response.success && response.data) {
        onClose();
        // 跳转到聊天界面
        router.push(`/profile/chat?conversationId=${response.data.id}&userId=${userId}` as any);
      } else {
        alert('无法开始聊天，请稍后再试');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('无法开始聊天，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };

  const renderFollowButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.followButton,
          isFollowing ? styles.followButtonActive : styles.followButtonInactive,
        ]}
        onPress={handleToggleFollow}
        disabled={followLoading}
        activeOpacity={0.8}
      >
        {followLoading ? (
          <ActivityIndicator size="small" color={isFollowing ? '#6B7280' : '#FFFFFF'} />
        ) : (
          <>
            <Heart
              size={16}
              color={isFollowing ? '#6B7280' : '#FFFFFF'}
              strokeWidth={2}
              fill={isFollowing ? '#6B7280' : 'transparent'}
            />
            <Text
              style={[
                styles.followButtonText,
                isFollowing ? styles.followButtonTextActive : styles.followButtonTextInactive,
              ]}
            >
              {isFollowing ? '已关注' : '关注'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderFriendButton = () => {
    if (actionLoading) {
      return (
        <View style={[styles.friendButton, styles.friendButtonPrimary]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      );
    }

    switch (friendStatus) {
      case 'friends':
        return (
          <TouchableOpacity
            style={[styles.friendButton, styles.friendButtonSuccess]}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <MessageCircle size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.friendButtonText}>发送消息</Text>
          </TouchableOpacity>
        );
      case 'sent':
        return (
          <View style={[styles.friendButton, styles.friendButtonDisabled]}>
            <Text style={styles.friendButtonTextDisabled}>已发送请求</Text>
          </View>
        );
      case 'received':
        return (
          <TouchableOpacity
            style={[styles.friendButton, styles.friendButtonPrimary]}
            onPress={handleAcceptRequest}
            activeOpacity={0.8}
          >
            <UserCheck size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.friendButtonText}>接受请求</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.friendButton, styles.friendButtonPrimary]}
            onPress={handleSendFriendRequest}
            activeOpacity={0.8}
          >
            <UserPlus size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.friendButtonText}>添加好友</Text>
          </TouchableOpacity>
        );
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      </Pressable>

      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.container}
      >
        {/* 头部背景 */}
        <LinearGradient
          colors={['#FEBE98', '#FFCCBC', '#FFD5C4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />

        {/* 关闭按钮 */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
          <BlurView intensity={40} tint="light" style={styles.closeButtonBlur}>
            <X size={20} color="#262626" strokeWidth={2.5} />
          </BlurView>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLOR} />
            </View>
          ) : profile ? (
            <>
              {/* 用户头像和基本信息 */}
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={48} color="#FFFFFF" strokeWidth={2} />
                    </View>
                  )}
                </View>

                <Text style={styles.username}>{profile.username || '未知用户'}</Text>

                {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                {/* 统计信息 */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{followStats.followersCount}</Text>
                    <Text style={styles.statLabel}>粉丝</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{followStats.followingCount}</Text>
                    <Text style={styles.statLabel}>关注</Text>
                  </View>
                </View>

                {/* 操作按钮组 - 只在不是当前用户时显示 */}
                {!isCurrentUser && (
                  <View style={styles.buttonGroup}>
                    {renderFollowButton()}
                    {renderFriendButton()}
                  </View>
                )}
              </View>

              {/* 其他信息 */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>详细信息</Text>

                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Calendar size={16} color="#6B7280" strokeWidth={2} />
                  </View>
                  <Text style={styles.infoText}>
                    加入于 {new Date(profile.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
              </View>

              {/* 用户发布的帖子 */}
              <View style={styles.postsSection}>
                <Text style={styles.sectionTitle}>Ta的帖子</Text>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>暂无帖子</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>加载失败</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
  },
  username: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginTop: 18,
    letterSpacing: -0.5,
  },
  bio: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 24,
    gap: 14,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  followButtonInactive: {
    backgroundColor: '#FF6B6B',
  },
  followButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  followButtonTextInactive: {
    color: '#FFFFFF',
  },
  followButtonTextActive: {
    color: '#6B7280',
  },
  friendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  friendButtonPrimary: {
    backgroundColor: BRAND_COLOR,
  },
  friendButtonSuccess: {
    backgroundColor: '#10B981',
  },
  friendButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  friendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  friendButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: -0.3,
  },
  infoSection: {
    marginTop: 36,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
    fontWeight: '500',
  },
  postsSection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
