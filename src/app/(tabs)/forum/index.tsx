/**
 * 论坛主页面
 * 组件化重构后的版本，遵循企业最佳实践
 */

import type { Post } from '@/src/services/api/forum';
import React, { useRef, useState } from 'react';
import { YStack } from 'tamagui';
import {
  FavoritesTab,
  ForumHeader,
  MessagesTab,
  PostDetailModal,
  PostEditor,
  SquareTab,
  type ForumTab,
} from './components';
import { ForumColors } from './constants';

export default function ForumScreen() {
  // ===== 状态管理 =====
  const [activeTab, setActiveTab] = useState<ForumTab>('square');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);

  // ===== Refs =====
  const squareReloadRef = useRef<(() => void) | null>(null);

  // ===== 事件处理 =====
  const handleOpenCreatePanel = () => {
    setEditingPost(null);
    setIsPostEditorOpen(true);
  };

  const handleOpenEditPanel = (post: Post) => {
    setEditingPost(post);
    setIsPostEditorOpen(true);
  };

  const handlePostEditorSuccess = () => {
    setActiveTab('square');
    // 延迟触发刷新，确保编辑器关闭后再刷新列表
    setTimeout(() => {
      squareReloadRef.current?.();
    }, 100);
  };

  const handlePostDeleted = () => {
    setActivePost(null);
    setTimeout(() => {
      squareReloadRef.current?.();
    }, 100);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    // 延迟触发刷新，避免频繁调用
    setTimeout(() => {
      squareReloadRef.current?.();
    }, 0);
  };

  const handleEditPostFromDetail = (post: Post) => {
    setActivePost(null);
    handleOpenEditPanel(post);
  };

  // ===== 渲染 =====
  return (
    <YStack flex={1} backgroundColor={ForumColors.sand}>
      {/* 固定头部 */}
      <ForumHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={handleOpenCreatePanel}
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
        onHeightChange={setHeaderHeight}
      />

      {/* 内容区域 */}
      <YStack flex={1} padding="$3" gap="$3">
        {activeTab === 'square' && (
          <SquareTab
            externalReloadRef={squareReloadRef}
            onOpenPost={setActivePost}
            filterTags={selectedTags}
          />
        )}
        {activeTab === 'favorites' && <FavoritesTab onOpenPost={setActivePost} />}
        {activeTab === 'messages' && <MessagesTab onCreatePost={handleOpenCreatePanel} />}
      </YStack>

      {/* 帖子编辑器 */}
      <PostEditor
        visible={isPostEditorOpen}
        editingPost={editingPost}
        onClose={() => setIsPostEditorOpen(false)}
        onSuccess={handlePostEditorSuccess}
        headerOffset={headerHeight}
      />

      {/* 帖子详情弹窗 */}
      <PostDetailModal
        visible={!!activePost}
        post={activePost}
        onClose={() => setActivePost(null)}
        headerOffset={headerHeight}
        onEditPost={handleEditPostFromDetail}
        onPostDeleted={handlePostDeleted}
      />
    </YStack>
  );
}
