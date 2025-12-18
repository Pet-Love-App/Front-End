import { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, Text, YStack } from 'tamagui';
import { supabaseChatService, supabase } from '@/src/lib/supabase';
import { Button } from '@/src/design-system/components';

import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';

import {
  AddPetModal,
  PetDetailModal,
  ProfileHeader,
  ProfileTabs,
  ReputationCard,
  BadgeGrid,
  BadgeDetailModal,
} from '../components';
import { usePetManagement, useProfileData, useReputation } from '../hooks';
import { BADGE_CONFIGS } from '@/src/constants/badges';

/**
 * Profile 主屏幕组件
 */
export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 使用自定义 hooks
  const {
    user,
    isLoading,
    isAuthenticated,
    _hasHydrated,
    fetchCurrentUser,
    handleUnauthenticated,
  } = useProfileData();

  const {
    petModalVisible,
    selectedPet,
    handleAddPet,
    handleDeletePet,
    openAddPetModal,
    closeAddPetModal,
    selectPet,
  } = usePetManagement();

  // 信誉分和勋章数据
  const {
    reputation,
    badges,
    loading: reputationLoading,
    equipBadge,
    unequipBadge,
    refresh,
  } = useReputation(user?.id);

  // 勋章详情模态框
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // 未读消息计数
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    // 订阅会话变化
    const unsubscribeConversations = supabaseChatService.subscribeToConversations(() => {
      loadUnreadCount();
    });

    // 订阅未读计数变化
    const unreadChannel = supabase
      .channel('profile_unread_counts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unread_counts',
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      unsubscribeConversations();
      supabase.removeChannel(unreadChannel);
    };
  }, []);

  // 当页面获得焦点时刷新未读计数和信誉分
  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
      refresh(); // 自动刷新信誉分
    }, [refresh])
  );

  const loadUnreadCount = async () => {
    const response = await supabaseChatService.getTotalUnreadCount();
    if (response.success && response.data !== null) {
      setUnreadCount(response.data);
    }
  };

  // 获取已装备的勋章配置
  const equippedBadge = badges.find((b) => b.is_equipped);
  const equippedBadgeConfig = equippedBadge?.badge?.code
    ? BADGE_CONFIGS[equippedBadge.badge.code]
    : null;

  // 未认证视图
  if (_hasHydrated && !isAuthenticated) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.background}
        alignItems="center"
        justifyContent="center"
        padding="$6"
      >
        <YStack alignItems="center" gap="$4" maxWidth={400}>
          <Text fontSize={24} fontWeight="700" color={colors.text}>
            会话已过期
          </Text>
          <Text fontSize={16} color={colors.icon} textAlign="center">
            您的登录状态已失效，请重新登录以继续查看个人资料与宠物信息。
          </Text>
          <Button
            size="$5"
            backgroundColor="$blue10"
            color="white"
            onPress={handleUnauthenticated}
            marginTop="$4"
          >
            前往登录
          </Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <ScrollView
      flex={1}
      backgroundColor={colors.background}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 30,
      }}
    >
      <YStack flex={1} alignItems="center" position="relative">
        {/* 消息按钮 - 浮动在左上角 */}
        <YStack position="absolute" top={20} left={20} zIndex={100}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/messages' as any)}
            activeOpacity={0.7}
          >
            <YStack
              width={44}
              height={44}
              borderRadius="$10"
              backgroundColor="rgba(255, 255, 255, 0.95)"
              alignItems="center"
              justifyContent="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.15}
              shadowRadius={4}
              elevation={4}
            >
              <Ionicons name="chatbubbles-outline" size={22} color={colors.icon} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </YStack>
          </TouchableOpacity>
        </YStack>

        {/* 设置按钮 - 浮动在右上角 */}
        <YStack position="absolute" top={20} right={20} zIndex={100}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/settings' as any)}
            activeOpacity={0.7}
          >
            <YStack
              width={44}
              height={44}
              borderRadius="$10"
              backgroundColor="rgba(255, 255, 255, 0.95)"
              alignItems="center"
              justifyContent="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.15}
              shadowRadius={4}
              elevation={4}
            >
              <Ionicons name="settings-outline" size={22} color={colors.icon} />
            </YStack>
          </TouchableOpacity>
        </YStack>

        {/* 个人资料头部 - 用户头像和信息 */}
        <ProfileHeader
          username={user?.username}
          bio={user?.bio || '这个人很懒，什么都没留下~'}
          onAvatarUpdate={fetchCurrentUser}
          equippedBadge={
            equippedBadgeConfig
              ? {
                  icon: equippedBadgeConfig.icon,
                  color: equippedBadgeConfig.color,
                  gradient: equippedBadgeConfig.gradient,
                }
              : null
          }
        />

        {/* 我的好友入口 */}
        <YStack width="100%" paddingHorizontal="$4" marginTop="$4">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/friends' as any)}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <YStack flexDirection="row" alignItems="center" gap="$3">
              <YStack
                width={40}
                height={40}
                borderRadius="$10"
                backgroundColor="$blue2"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="people-outline" size={22} color="#FEBE98" />
              </YStack>
              <YStack>
                <Text fontSize={16} fontWeight="600" color={colors.text}>
                  我的好友
                </Text>
                <Text fontSize={13} color={colors.icon}>
                  管理你的好友和请求
                </Text>
              </YStack>
            </YStack>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>
        </YStack>

        {/* 信誉分和勋章 */}
        <YStack width="100%" paddingHorizontal="$4" gap="$3" marginTop="$4" marginBottom="$2">
          {/* 信誉分卡片 */}
          {reputation && <ReputationCard reputation={reputation} />}

          {/* 勋章展示 */}
          {badges.length > 0 && (
            <BadgeGrid
              badges={badges}
              onBadgePress={(badge) => setSelectedBadge(badge)}
              maxDisplay={8}
            />
          )}
        </YStack>

        {/* 个人资料标签页 - 宠物、评论、点赞 */}
        <ProfileTabs
          pets={user?.pets}
          isLoading={isLoading && !user}
          onAddPet={openAddPetModal}
          onDeletePet={handleDeletePet}
        />
      </YStack>

      {/* 模态框 */}
      <AddPetModal open={petModalVisible} onOpenChange={closeAddPetModal} onSubmit={handleAddPet} />

      <PetDetailModal
        pet={selectedPet}
        open={!!selectedPet}
        onOpenChange={(open) => !open && selectPet(null)}
        onDelete={handleDeletePet}
      />

      <BadgeDetailModal
        visible={!!selectedBadge}
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
        onEquip={equipBadge}
        onUnequip={unequipBadge}
      />
    </ScrollView>
  );
}
