/**
 * UserProfileModal - 用户资料弹窗组件
 *
 * 显示用户的基本信息、帖子数量等
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MessageCircle, UserPlus, Flag } from '@tamagui/lucide-icons';
import { styled, XStack, YStack, Text, Avatar, Stack } from 'tamagui';

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

const Overlay = styled(YStack, {
  name: 'Overlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

const ModalContainer = styled(YStack, {
  name: 'UserProfileModal',
  backgroundColor: '$background',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: '80%',
  overflow: 'hidden',
});

const ModalHeader = styled(XStack, {
  name: 'ModalHeader',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColorMuted',
});

const CloseButton = styled(XStack, {
  name: 'CloseButton',
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '$backgroundSubtle',
  alignItems: 'center',
  justifyContent: 'center',
});

const ProfileSection = styled(YStack, {
  name: 'ProfileSection',
  padding: '$4',
  alignItems: 'center',
  gap: '$3',
});

const UserAvatar = styled(Avatar, {
  name: 'UserAvatar',
});

const Username = styled(Text, {
  name: 'Username',
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
});

const Bio = styled(Text, {
  name: 'Bio',
  fontSize: '$3',
  color: '$colorMuted',
  textAlign: 'center',
  paddingHorizontal: '$4',
});

const StatsRow = styled(XStack, {
  name: 'StatsRow',
  gap: '$6',
  paddingVertical: '$3',
});

const StatItem = styled(YStack, {
  name: 'StatItem',
  alignItems: 'center',
  gap: '$1',
});

const StatValue = styled(Text, {
  name: 'StatValue',
  fontSize: '$5',
  fontWeight: '700',
  color: '$color',
});

const StatLabel = styled(Text, {
  name: 'StatLabel',
  fontSize: '$2',
  color: '$colorMuted',
});

const ActionsRow = styled(XStack, {
  name: 'ActionsRow',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  gap: '$3',
  justifyContent: 'center',
});

const ActionButton = styled(XStack, {
  name: 'ActionButton',
  flex: 1,
  maxWidth: 150,
  paddingVertical: '$3',
  borderRadius: '$4',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
      },
      secondary: {
        backgroundColor: '$backgroundSubtle',
        borderWidth: 1,
        borderColor: '$borderColor',
      },
    },
  } as const,
});

const ActionText = styled(Text, {
  name: 'ActionText',
  fontSize: '$3',
  fontWeight: '600',

  variants: {
    variant: {
      primary: {
        color: '$primaryContrast',
      },
      secondary: {
        color: '$color',
      },
    },
  } as const,
});

const InfoSection = styled(YStack, {
  name: 'InfoSection',
  padding: '$4',
  gap: '$3',
  borderTopWidth: 1,
  borderTopColor: '$borderColorMuted',
});

const InfoRow = styled(XStack, {
  name: 'InfoRow',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const InfoLabel = styled(Text, {
  name: 'InfoLabel',
  fontSize: '$3',
  color: '$colorMuted',
});

const InfoValue = styled(Text, {
  name: 'InfoValue',
  fontSize: '$3',
  color: '$color',
});

const ReportButton = styled(XStack, {
  name: 'ReportButton',
  paddingVertical: '$3',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
});

function UserProfileModalComponent({
  visible,
  user,
  onClose,
  onFollow,
  onMessage,
  onReport,
}: UserProfileModalProps) {
  const insets = useSafeAreaInsets();
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
  }, [user, onMessage]);

  const handleReport = useCallback(() => {
    if (!user) return;
    onReport?.(user.id);
  }, [user, onReport]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月加入`;
  };

  if (!visible || !user) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <YStack flex={1}>
        <AnimatedYStack entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} flex={1}>
          <Overlay>
            <Pressable style={{ flex: 1 }} onPress={onClose} />
          </Overlay>
        </AnimatedYStack>

        <AnimatedYStack
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.springify().damping(20)}
          position="absolute"
          bottom={0}
          left={0}
          right={0}
        >
          <ModalContainer>
            <ModalHeader>
              <Stack width={32} />
              <Text fontSize="$4" fontWeight="600" color="$color">
                用户资料
              </Text>
              <Pressable onPress={onClose}>
                <CloseButton>
                  <X size={18} color="$colorMuted" />
                </CloseButton>
              </Pressable>
            </ModalHeader>

            <ScrollView>
              <ProfileSection>
                <UserAvatar circular size="$8">
                  <Avatar.Image
                    source={{ uri: user.avatar || 'https://placekitten.com/200/200' }}
                  />
                  <Avatar.Fallback backgroundColor="$color5" />
                </UserAvatar>

                <Username>{user.username}</Username>

                {user.bio && <Bio numberOfLines={3}>{user.bio}</Bio>}

                <StatsRow>
                  <StatItem>
                    <StatValue>{user.postsCount ?? 0}</StatValue>
                    <StatLabel>帖子</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{user.followersCount ?? 0}</StatValue>
                    <StatLabel>粉丝</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{user.followingCount ?? 0}</StatValue>
                    <StatLabel>关注</StatLabel>
                  </StatItem>
                </StatsRow>
              </ProfileSection>

              <ActionsRow>
                <Pressable style={{ flex: 1, maxWidth: 150 }} onPress={handleFollow}>
                  <ActionButton variant={isFollowing ? 'secondary' : 'primary'}>
                    <UserPlus size={18} color={isFollowing ? '$color' : '$primaryContrast'} />
                    <ActionText variant={isFollowing ? 'secondary' : 'primary'}>
                      {isFollowing ? '已关注' : '关注'}
                    </ActionText>
                  </ActionButton>
                </Pressable>

                <Pressable style={{ flex: 1, maxWidth: 150 }} onPress={handleMessage}>
                  <ActionButton variant="secondary">
                    <MessageCircle size={18} color="$color" />
                    <ActionText variant="secondary">私信</ActionText>
                  </ActionButton>
                </Pressable>
              </ActionsRow>

              <InfoSection>
                <InfoRow>
                  <InfoLabel>加入时间</InfoLabel>
                  <InfoValue>{formatDate(user.createdAt)}</InfoValue>
                </InfoRow>
              </InfoSection>

              <Pressable onPress={handleReport}>
                <ReportButton>
                  <Flag size={16} color="$colorMuted" />
                  <Text fontSize="$2" color="$colorMuted">
                    举报用户
                  </Text>
                </ReportButton>
              </Pressable>

              <Stack height={insets.bottom + 16} />
            </ScrollView>
          </ModalContainer>
        </AnimatedYStack>
      </YStack>
    </Modal>
  );
}

export const UserProfileModal = memo(UserProfileModalComponent);
