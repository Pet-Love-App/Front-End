/**
 * PostDetailHeader - 帖子详情顶部栏
 *
 * 包含：返回按钮、标题、编辑/删除操作
 */

import React, { memo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
  Text as RNText,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft, MoreHorizontal, Edit3, Trash2, Flag, Share2, X } from '@tamagui/lucide-icons';
import { styled, XStack, YStack } from 'tamagui';

export interface PostDetailHeaderProps {
  /** 是否为帖子作者 */
  isAuthor: boolean;
  /** 关闭详情页 */
  onClose: () => void;
  /** 编辑帖子 */
  onEdit?: () => void;
  /** 删除帖子 */
  onDelete?: () => void;
  /** 分享帖子 */
  onShare?: () => void;
}

// 样式组件
const HeaderContainer = styled(XStack, {
  name: 'PostDetailHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 8,
  paddingVertical: 8,
  backgroundColor: '#fff',
  borderBottomWidth: 0.5,
  borderBottomColor: 'rgba(0, 0, 0, 0.06)',
});

const IconButton = styled(XStack, {
  name: 'IconButton',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    scale: 0.96,
  },
});

const CenterPlaceholder = styled(YStack, {
  name: 'CenterPlaceholder',
  flex: 1,
});

/**
 * 帖子详情顶部栏组件 - 极简设计
 */
function PostDetailHeaderComponent({
  isAuthor,
  onClose,
  onEdit,
  onDelete,
  onShare,
}: PostDetailHeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = () => {
    setModalVisible(false);
    Alert.alert('删除帖子', '确定要删除这篇帖子吗？此操作不可撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => onDelete?.(),
      },
    ]);
  };

  const handleEdit = () => {
    setModalVisible(false);
    onEdit?.();
  };

  const handleShare = () => {
    setModalVisible(false);
    onShare?.();
  };

  return (
    <>
      <HeaderContainer>
        {/* 返回按钮 */}
        <IconButton onPress={onClose}>
          <ChevronLeft size={26} color="#1a1a1a" strokeWidth={2} />
        </IconButton>

        {/* 中间留白 */}
        <CenterPlaceholder />

        {/* 更多选项按钮 */}
        <IconButton onPress={() => setModalVisible(true)}>
          <MoreHorizontal size={24} color="#1a1a1a" />
        </IconButton>
      </HeaderContainer>

      {/* 底部弹出菜单 - 使用 React Native Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
            {/* 拖拽指示条 */}
            <View style={styles.handle} />

            {/* 分享 */}
            <TouchableOpacity style={styles.menuItem} onPress={handleShare} activeOpacity={0.7}>
              <Share2 size={22} color="#1a1a1a" />
              <RNText style={styles.menuText}>分享帖子</RNText>
            </TouchableOpacity>

            {isAuthor ? (
              <>
                {/* 编辑 */}
                <TouchableOpacity style={styles.menuItem} onPress={handleEdit} activeOpacity={0.7}>
                  <Edit3 size={22} color="#1a1a1a" />
                  <RNText style={styles.menuText}>编辑帖子</RNText>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* 删除 */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Trash2 size={22} color="#ff3b30" />
                  <RNText style={styles.dangerText}>删除帖子</RNText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.divider} />
                {/* 举报 */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Flag size={22} color="#ff9500" />
                  <RNText style={styles.warningText}>举报内容</RNText>
                </TouchableOpacity>
              </>
            )}

            {/* 取消按钮 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <RNText style={styles.cancelText}>取消</RNText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  dangerText: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '500',
  },
  warningText: {
    fontSize: 16,
    color: '#ff9500',
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export const PostDetailHeader = memo(PostDetailHeaderComponent);
