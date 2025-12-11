/**
 * UserProfileModal - 用户资料弹窗组件
 *
 * 居中弹窗显示用户的基本信息、帖子数量等
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, Dimensions, StyleSheet } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { X, MessageCircle, UserPlus, Flag, User } from '@tamagui/lucide-icons';
import { XStack, YStack, Text, Image } from 'tamagui';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
}

export interface UserProfileModalProps {
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onReport?: (userId: string) => void;
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

function UserProfileModalComponent({
  visible,
  user,
  onClose,
  onFollow,
  onMessage,
  onReport,
}: UserProfileModalProps) {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing ?? false);

  useEffect(() => {
    if (user) {
      setIsFollowing(user.isFollowing ?? false);
    }
  }, [user]);

  const handleFollow = useCallback(() => {
    if (!user) return;
    setIsFollowing(!isFollowing);
    onFollow?.(user.id);
  }, [user, isFollowing, onFollow]);

  const handleMessage = useCallback(() => {
    if (!user) return;
    onMessage?.(user.id);
    onClose();
  }, [user, onMessage, onClose]);

  const handleReport = useCallback(() => {
    if (!user) return;
    onReport?.(user.id);
    onClose();
  }, [user, onReport, onClose]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月加入`;
  };

  if (!visible || !user) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* 背景遮罩 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 弹窗内容 */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <AnimatedYStack
            entering={ZoomIn.springify().damping(18)}
            exiting={ZoomOut.duration(200)}
            width={MODAL_WIDTH}
            backgroundColor="white"
            borderRadius={20}
            overflow="hidden"
          >
            {/* 关闭按钮 */}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <YStack
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor={neutralScale.neutral2}
                alignItems="center"
                justifyContent="center"
              >
                <X size={18} color={neutralScale.neutral7} />
              </YStack>
            </Pressable>

            {/* 头像区域 */}
            <YStack alignItems="center" paddingTop={28} paddingBottom={16}>
              <YStack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor={primaryScale.primary2}
                alignItems="center"
                justifyContent="center"
                borderWidth={3}
                borderColor={primaryScale.primary3}
                overflow="hidden"
              >
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} width={80} height={80} borderRadius={40} />
                ) : (
                  <User size={36} color={primaryScale.primary7} />
                )}
              </YStack>

              {/* 用户名 */}
              <Text fontSize={20} fontWeight="700" color={neutralScale.neutral12} marginTop={12}>
                {user.username}
              </Text>

              {/* 个人简介 */}
              {user.bio && (
                <Text
                  fontSize={14}
                  color={neutralScale.neutral8}
                  textAlign="center"
                  marginTop={6}
                  paddingHorizontal={24}
                  numberOfLines={2}
                >
                  {user.bio}
                </Text>
              )}
            </YStack>

            {/* 统计数据 */}
            <XStack
              justifyContent="space-around"
              paddingVertical={16}
              borderTopWidth={1}
              borderBottomWidth={1}
              borderColor={neutralScale.neutral3}
              marginHorizontal={16}
            >
              <YStack alignItems="center" gap={4}>
                <Text fontSize={20} fontWeight="700" color={neutralScale.neutral12}>
                  {user.postsCount ?? 0}
                </Text>
                <Text fontSize={12} color={neutralScale.neutral7}>
                  帖子
                </Text>
              </YStack>
              <YStack alignItems="center" gap={4}>
                <Text fontSize={20} fontWeight="700" color={neutralScale.neutral12}>
                  {user.followersCount ?? 0}
                </Text>
                <Text fontSize={12} color={neutralScale.neutral7}>
                  粉丝
                </Text>
              </YStack>
              <YStack alignItems="center" gap={4}>
                <Text fontSize={20} fontWeight="700" color={neutralScale.neutral12}>
                  {user.followingCount ?? 0}
                </Text>
                <Text fontSize={12} color={neutralScale.neutral7}>
                  关注
                </Text>
              </YStack>
            </XStack>

            {/* 操作按钮 */}
            <XStack paddingHorizontal={16} paddingVertical={16} gap={12}>
              <Pressable style={styles.actionButton} onPress={handleFollow}>
                <YStack
                  paddingVertical={12}
                  borderRadius={12}
                  backgroundColor={isFollowing ? neutralScale.neutral2 : primaryScale.primary7}
                  borderWidth={1.5}
                  borderColor={isFollowing ? neutralScale.neutral4 : primaryScale.primary6}
                  alignItems="center"
                >
                  <XStack alignItems="center" gap={6}>
                    <UserPlus size={18} color={isFollowing ? neutralScale.neutral8 : 'white'} />
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={isFollowing ? neutralScale.neutral8 : 'white'}
                    >
                      {isFollowing ? '已关注' : '关注'}
                    </Text>
                  </XStack>
                </YStack>
              </Pressable>

              <Pressable style={styles.actionButton} onPress={handleMessage}>
                <YStack
                  paddingVertical={12}
                  borderRadius={12}
                  backgroundColor={neutralScale.neutral2}
                  borderWidth={1.5}
                  borderColor={neutralScale.neutral4}
                  alignItems="center"
                >
                  <XStack alignItems="center" gap={6}>
                    <MessageCircle size={18} color={neutralScale.neutral8} />
                    <Text fontSize={14} fontWeight="600" color={neutralScale.neutral8}>
                      私信
                    </Text>
                  </XStack>
                </YStack>
              </Pressable>
            </XStack>

            {/* 加入时间 */}
            <YStack paddingHorizontal={16} paddingBottom={8}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={13} color={neutralScale.neutral6}>
                  加入时间
                </Text>
                <Text fontSize={13} color={neutralScale.neutral8}>
                  {formatDate(user.createdAt)}
                </Text>
              </XStack>
            </YStack>

            {/* 举报按钮 */}
            <Pressable onPress={handleReport}>
              <XStack
                justifyContent="center"
                alignItems="center"
                gap={6}
                paddingVertical={14}
                borderTopWidth={1}
                borderColor={neutralScale.neutral3}
              >
                <Flag size={14} color={neutralScale.neutral6} />
                <Text fontSize={13} color={neutralScale.neutral6}>
                  举报用户
                </Text>
              </XStack>
            </Pressable>
          </AnimatedYStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  actionButton: {
    flex: 1,
  },
});

export const UserProfileModal = memo(UserProfileModalComponent);
