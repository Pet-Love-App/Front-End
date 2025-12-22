/**
 * MentionFriendsModal - @好友选择模态框
 *
 * 允许用户选择要@的好友
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { X, Search, Check, Info } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';
import { UserProfileModal } from '@/src/components/UserProfileModal';
import { supabaseFriendsService } from '@/src/lib/supabase';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
}

interface MentionFriendsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (friends: Friend[]) => void;
  initialSelected?: Friend[];
}

export function MentionFriendsModal({
  visible,
  onClose,
  onConfirm,
  initialSelected = [],
}: MentionFriendsModalProps) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>(initialSelected);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  // 样式定义
  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: colors.overlay as any,
        justifyContent: 'flex-end',
      },
      container: {
        backgroundColor: colors.cardBackground as any,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        paddingTop: 20,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border as any,
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text as any,
      },
      closeButton: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundMuted as any,
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
      },
      searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text as any,
        marginLeft: 10,
      },
      selectedContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        borderRadius: 8,
        marginHorizontal: 20,
        marginBottom: 12,
      },
      selectedLabel: {
        fontSize: 13,
        color: colors.primary as any,
        fontWeight: '600',
      },
      list: {
        flex: 1,
      },
      listContent: {
        paddingHorizontal: 20,
        paddingVertical: 8,
      },
      friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 20,
      },
      friendTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      },
      friendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      infoButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
      },
      avatarContainer: {
        marginRight: 12,
      },
      avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
      },
      avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.borderMuted as any,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary as any,
      },
      friendName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text as any,
      },
      checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary as any,
        alignItems: 'center',
        justifyContent: 'center',
      },
      footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border as any,
      },
      confirmButton: {
        backgroundColor: colors.primary as any,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
      },
      confirmButtonDisabled: {
        backgroundColor: colors.border as any,
      },
      confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
      },
      confirmButtonTextDisabled: {
        color: colors.textTertiary as any,
      },
    });
  }, [colors, isDark]);

  // 加载真实好友列表
  useEffect(() => {
    if (visible) {
      loadFriends();
    }
  }, [visible]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const response = await supabaseFriendsService.getMyFriends();
      if (response.success && response.data) {
        const friendList: Friend[] = response.data.map((f) => ({
          id: f.friendId,
          username: f.friendUsername,
          avatar: f.friendAvatar,
        }));
        setFriends(friendList);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    return friends.filter((friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const toggleFriend = useCallback((friend: Friend) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.some((f) => f.id === friend.id);
      if (isSelected) {
        return prev.filter((f) => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedFriends);
    onClose();
  }, [selectedFriends, onConfirm, onClose]);

  const handleViewProfile = useCallback((userId: string, event: any) => {
    event?.stopPropagation();
    setSelectedUserId(userId);
    setShowUserProfile(true);
  }, []);

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => {
      const isSelected = selectedFriends.some((f) => f.id === item.id);

      return (
        <View style={dynamicStyles.friendItem}>
          <TouchableOpacity
            style={dynamicStyles.friendTouchable}
            onPress={() => toggleFriend(item)}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.friendLeft}>
              <View style={dynamicStyles.avatarContainer}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={dynamicStyles.avatar} />
                ) : (
                  <View style={dynamicStyles.avatarPlaceholder}>
                    <Text style={dynamicStyles.avatarText}>
                      {item.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={dynamicStyles.friendName}>{item.username}</Text>
            </View>

            {isSelected && (
              <View style={dynamicStyles.checkmark}>
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          {/* 查看详情按钮 */}
          <TouchableOpacity
            style={dynamicStyles.infoButton}
            onPress={(e) => handleViewProfile(item.id, e)}
            activeOpacity={0.7}
          >
            <Info size={20} color={colors.textSecondary as any} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      );
    },
    [selectedFriends, toggleFriend, handleViewProfile, dynamicStyles, colors]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={20} style={dynamicStyles.backdrop}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>选择好友</Text>
            <TouchableOpacity
              style={dynamicStyles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.text as any} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.searchContainer}>
            <Search size={20} color={colors.textTertiary as any} strokeWidth={2} />
            <TextInput
              style={dynamicStyles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索好友"
              placeholderTextColor={colors.textTertiary as any}
            />
          </View>

          {selectedFriends.length > 0 && (
            <View style={dynamicStyles.selectedContainer}>
              <Text style={dynamicStyles.selectedLabel}>
                已选择 {selectedFriends.length} 位好友
              </Text>
            </View>
          )}

          <FlatList
            data={filteredFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            style={dynamicStyles.list}
            contentContainerStyle={dynamicStyles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={dynamicStyles.footer}>
            <TouchableOpacity
              style={[
                dynamicStyles.confirmButton,
                selectedFriends.length === 0 && dynamicStyles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selectedFriends.length === 0}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  dynamicStyles.confirmButtonText,
                  selectedFriends.length === 0 && dynamicStyles.confirmButtonTextDisabled,
                ]}
              >
                确定（{selectedFriends.length}）
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* 用户详情模态框 */}
      {selectedUserId && (
        <UserProfileModal
          visible={showUserProfile}
          userId={selectedUserId}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </Modal>
  );
}
