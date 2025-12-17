/**
 * MentionFriendsModal - @好友选择模态框
 *
 * 允许用户选择要@的好友
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, Search, Check } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';

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

const BRAND_COLOR = '#1DA1F2';

export function MentionFriendsModal({
  visible,
  onClose,
  onConfirm,
  initialSelected = [],
}: MentionFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>(initialSelected);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟好友列表（实际项目中应该从 API 获取）
  const mockFriends: Friend[] = useMemo(
    () => [
      { id: '1', username: '小明', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', username: '小红', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: '3', username: '张三', avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: '4', username: '李四', avatar: 'https://i.pravatar.cc/150?img=4' },
      { id: '5', username: '王五', avatar: 'https://i.pravatar.cc/150?img=5' },
    ],
    []
  );

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return mockFriends;
    return mockFriends.filter((friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mockFriends, searchQuery]);

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

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => {
      const isSelected = selectedFriends.some((f) => f.id === item.id);

      return (
        <TouchableOpacity
          style={styles.friendItem}
          onPress={() => toggleFriend(item)}
          activeOpacity={0.7}
        >
          <View style={styles.friendLeft}>
            <View style={styles.avatarContainer}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.friendName}>{item.username}</Text>
          </View>

          {isSelected && (
            <View style={styles.checkmark}>
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedFriends, toggleFriend]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择好友</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <X size={24} color="#262626" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索好友"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {selectedFriends.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>已选择 {selectedFriends.length} 位好友</Text>
            </View>
          )}

          <FlatList
            data={filteredFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                selectedFriends.length === 0 && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selectedFriends.length === 0}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  selectedFriends.length === 0 && styles.confirmButtonTextDisabled,
                ]}
              >
                确定（{selectedFriends.length}）
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
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
    backgroundColor: '#F3F4F6',
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
    color: '#262626',
    marginLeft: 10,
  },
  selectedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#E8F5FE',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  selectedLabel: {
    fontSize: 13,
    color: BRAND_COLOR,
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
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#262626',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
