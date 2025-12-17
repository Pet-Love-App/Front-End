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
  MessageCircle,
  X,
  MapPin,
  Calendar,
} from '@tamagui/lucide-icons';
import { supabaseFriendsService, supabaseProfileService, type Profile } from '@/src/lib/supabase';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND_COLOR = '#1DA1F2';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'sent' | 'received' | 'friends'>(
    'none'
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      loadUserProfile();
      loadFriendStatus();
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

  const renderActionButton = () => {
    if (actionLoading) {
      return (
        <View style={[styles.actionButton, styles.actionButtonPrimary]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      );
    }

    switch (friendStatus) {
      case 'friends':
        return (
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => onSendMessage?.(userId)}
              activeOpacity={0.8}
            >
              <MessageCircle size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionButtonText}>发送消息</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleRemoveFriend}
              activeOpacity={0.8}
            >
              <UserMinus size={18} color="#FF3B30" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        );
      case 'sent':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonTextDisabled}>已发送请求</Text>
          </View>
        );
      case 'received':
        return (
          <View style={[styles.actionButton, styles.actionButtonPrimary]}>
            <Text style={styles.actionButtonText}>接受好友请求</Text>
          </View>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleSendFriendRequest}
            activeOpacity={0.8}
          >
            <UserPlus size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionButtonText}>添加好友</Text>
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
        entering={SlideInDown.springify().damping(20)}
        exiting={SlideOutDown.springify().damping(20)}
        style={styles.container}
      >
        {/* 头部背景 */}
        <LinearGradient
          colors={['#1DA1F2', '#0EA5E9', '#3B82F6']}
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
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>帖子</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>粉丝</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>关注</Text>
                  </View>
                </View>

                {/* 操作按钮 */}
                <View style={styles.actionContainer}>{renderActionButton()}</View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
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
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  actionContainer: {
    width: '100%',
    marginTop: 24,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonPrimary: {
    backgroundColor: BRAND_COLOR,
  },
  actionButtonSecondary: {
    backgroundColor: '#FEE2E2',
    flex: 0,
    paddingHorizontal: 14,
  },
  actionButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  infoSection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
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
