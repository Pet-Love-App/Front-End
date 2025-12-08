/**
 * 帖子编辑器 - 创建或编辑帖子
 */
import React, { useEffect } from 'react';
import { Alert, Image } from 'react-native';
import { Button, Card, Text, TextArea, XStack, YStack } from 'tamagui';

import type { Post } from '@/src/services/api/forum/types';
import { neutralScale } from '@/src/design-system/tokens';

import { ForumColors, MESSAGES, POST_CATEGORIES, UI_CONFIG } from '../constants';
import { usePostEditor } from '../hooks/usePostEditor';
import { createErrorHandler } from '../utils';

interface PostEditorProps {
  visible: boolean;
  editingPost?: Post | null;
  onClose: () => void;
  onSuccess: () => void;
  headerOffset?: number;
}

export function PostEditor({
  visible,
  editingPost,
  onClose,
  onSuccess,
  headerOffset = 0,
}: PostEditorProps) {
  const errorHandler = createErrorHandler('PostEditor');

  const editor = usePostEditor({
    onSuccess: () => {
      Alert.alert(
        '成功',
        editingPost ? MESSAGES.SUCCESS.POST_UPDATED : MESSAGES.SUCCESS.POST_CREATED
      );
      onClose();
      onSuccess();
    },
    onError: (error) => {
      errorHandler.handle(error, { title: '提交失败' });
    },
  });

  // 加载编辑的帖子数据
  useEffect(() => {
    if (visible && editingPost) {
      editor.loadFromPost(editingPost);
    } else if (visible && !editingPost) {
      editor.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingPost]);

  const handlePickImages = async () => {
    try {
      const files = await editor.pickMedia();
      if (files.length === 0) {
        errorHandler.handleValidation(MESSAGES.ERROR.FILE_TYPE_INVALID);
        return;
      }
      editor.addFiles(files);
    } catch (err) {
      errorHandler.handle(err, { title: '选择媒体失败' });
    }
  };

  const handleSubmit = async () => {
    try {
      await editor.submit(editingPost);
    } catch {
      // 错误已在 Hook 中处理
    }
  };

  const handleReset = () => {
    editor.setContent('');
    editor.setPickedFiles([]);
    editor.setTagsText('');
    editor.setCategory(undefined);
  };

  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      top={headerOffset}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="white"
      padding="$4"
      gap="$3"
      zIndex={200}
      borderTopWidth={1}
      borderColor={neutralScale.neutral3}
    >
      {/* 头部 */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
        <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>
          {editingPost ? '编辑帖子' : '发布帖子'}
        </Text>
        <XStack gap="$2">
          <Button
            size="$3"
            onPress={handleSubmit}
            disabled={editor.submitting}
            backgroundColor={ForumColors.clay}
            color="white"
            pressStyle={{ opacity: 0.85 }}
          >
            {editor.submitting
              ? editingPost
                ? '更新中...'
                : '发布中...'
              : editingPost
                ? '更新'
                : '发布'}
          </Button>
          <Button
            size="$3"
            chromeless
            onPress={onClose}
            disabled={editor.submitting}
            color={ForumColors.clay}
          >
            关闭
          </Button>
        </XStack>
      </XStack>

      {/* 分类选择 */}
      <XStack gap="$2" flexWrap="wrap">
        {POST_CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            size="$2"
            onPress={() => editor.setCategory(cat.key)}
            backgroundColor={editor.category === cat.key ? ForumColors.clay : neutralScale.neutral2}
            color={editor.category === cat.key ? 'white' : ForumColors.darkText}
          >
            {cat.label}
          </Button>
        ))}
        {editor.category && (
          <Button
            size="$2"
            chromeless
            onPress={() => editor.setCategory(undefined)}
            color={ForumColors.clay}
          >
            清除分类
          </Button>
        )}
      </XStack>

      {/* 标签输入 */}
      <TextArea
        value={editor.tagsText}
        onChangeText={editor.setTagsText}
        placeholder="输入标签，以空格或逗号分隔"
        height={50}
        backgroundColor={neutralScale.neutral1}
        borderColor={ForumColors.clay + '55'}
        borderWidth={1}
        color="$foreground"
      />

      {/* 正文 */}
      <TextArea
        value={editor.content}
        onChangeText={editor.setContent}
        placeholder="说点什么..."
        height={160}
        backgroundColor={neutralScale.neutral1}
        borderColor={ForumColors.clay + '55'}
        borderWidth={1}
        color="$foreground"
      />

      {/* 媒体预览 */}
      {editor.pickedFiles.length > 0 && (
        <XStack gap="$2" flexWrap="wrap">
          {editor.pickedFiles.map((file, idx) => (
            <Card
              key={idx}
              width={UI_CONFIG.THUMBNAIL_SIZE}
              height={UI_CONFIG.THUMBNAIL_SIZE}
              backgroundColor={neutralScale.neutral2}
              borderColor={neutralScale.neutral3}
              borderWidth={1}
              overflow="hidden"
              position="relative"
              borderRadius="$3"
            >
              <Image
                source={{ uri: file.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <Button
                size="$2"
                position="absolute"
                top={2}
                right={2}
                backgroundColor="rgba(0,0,0,0.6)"
                color="white"
                paddingHorizontal="$2"
                paddingVertical="$1"
                onPress={() => editor.removeFile(idx)}
              >
                ×
              </Button>
            </Card>
          ))}
        </XStack>
      )}

      {/* 操作按钮 */}
      <XStack gap="$3">
        <Button
          size="$3"
          onPress={handlePickImages}
          backgroundColor={ForumColors.peach}
          color={ForumColors.text}
          pressStyle={{ opacity: 0.85 }}
        >
          选择图片/视频
        </Button>
        <Button
          size="$3"
          onPress={handleReset}
          backgroundColor={neutralScale.neutral2}
          borderWidth={1}
          borderColor={neutralScale.neutral3}
          color={ForumColors.darkText}
          pressStyle={{ opacity: 0.85 }}
        >
          重置
        </Button>
      </XStack>
    </YStack>
  );
}
