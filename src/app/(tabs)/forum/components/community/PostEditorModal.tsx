/**
 * PostEditorModal - 帖子编辑器模态框
 *
 * 全屏模态框形式的帖子创建/编辑器
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, XStack, YStack, Text, TextArea, Stack } from 'tamagui';

import type { Post, PostCategory } from '@/src/lib/supabase';

import { POST_CATEGORIES, MESSAGES, UI_CONFIG } from '../../constants';
import { usePostEditor } from '../../hooks/usePostEditor';
import { createErrorHandler } from '../../utils';

export interface PostEditorModalProps {
  visible: boolean;
  editingPost?: Post | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(YStack);

const ModalOverlay = styled(YStack, {
  name: 'ModalOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

const EditorContainer = styled(YStack, {
  name: 'EditorContainer',
  flex: 1,
  backgroundColor: '$background',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: 'hidden',
});

const EditorHeader = styled(XStack, {
  name: 'EditorHeader',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColorMuted',
});

const HeaderButton = styled(Text, {
  name: 'HeaderButton',
  fontSize: '$3',
  fontWeight: '500',
  paddingHorizontal: '$2',
  paddingVertical: '$1',

  variants: {
    variant: {
      cancel: {
        color: '$colorMuted',
      },
      submit: {
        color: '$primary',
        fontWeight: '600',
      },
      disabled: {
        color: '$colorDisabled',
      },
    },
  } as const,
});

const CategoryButton = styled(XStack, {
  name: 'CategoryButton',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: 9999,
  alignItems: 'center',
  borderWidth: 1,

  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
      },
      false: {
        backgroundColor: 'transparent',
        borderColor: '$borderColor',
      },
    },
  } as const,
});

const CategoryText = styled(Text, {
  name: 'CategoryText',
  fontSize: '$2',
  fontWeight: '500',

  variants: {
    active: {
      true: {
        color: '$primaryContrast',
      },
      false: {
        color: '$colorMuted',
      },
    },
  } as const,
});

const MediaPreview = styled(Stack, {
  name: 'MediaPreview',
  width: UI_CONFIG.THUMBNAIL_SIZE,
  height: UI_CONFIG.THUMBNAIL_SIZE,
  borderRadius: '$3',
  overflow: 'hidden',
  backgroundColor: '$backgroundSubtle',
});

const RemoveButton = styled(XStack, {
  name: 'RemoveButton',
  position: 'absolute',
  top: 4,
  right: 4,
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  alignItems: 'center',
  justifyContent: 'center',
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$2',
  fontWeight: '600',
  color: '$colorMuted',
  marginBottom: '$2',
});

const StyledTextArea = styled(TextArea, {
  name: 'StyledTextArea',
  backgroundColor: '$backgroundSubtle',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  padding: '$3',
  fontSize: '$3',
  color: '$color',

  focusStyle: {
    borderColor: '$primary',
  },
});

const AddMediaButton = styled(XStack, {
  name: 'AddMediaButton',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$3',
  backgroundColor: '$backgroundSubtle',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderStyle: 'dashed',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',

  pressStyle: {
    backgroundColor: '$backgroundHover',
    borderColor: '$primary',
  },
});

export function PostEditorModal({
  visible,
  editingPost,
  onClose,
  onSuccess,
}: PostEditorModalProps) {
  const insets = useSafeAreaInsets();
  const errorHandler = createErrorHandler('PostEditorModal');

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

  useEffect(() => {
    if (visible && editingPost) {
      editor.loadFromPost(editingPost);
    } else if (visible && !editingPost) {
      editor.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingPost]);

  const handlePickImages = useCallback(async () => {
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
  }, [editor, errorHandler]);

  const handleSubmit = useCallback(async () => {
    try {
      await editor.submit(editingPost);
    } catch {
      // 错误已在 Hook 中处理
    }
  }, [editor, editingPost]);

  const handleCategorySelect = useCallback(
    (category: PostCategory) => {
      if (editor.category === category) {
        editor.setCategory(undefined);
      } else {
        editor.setCategory(category);
      }
    },
    [editor]
  );

  const canSubmit = useMemo(() => {
    return (
      !editor.submitting && (editor.content.trim().length > 0 || editor.pickedFiles.length > 0)
    );
  }, [editor.submitting, editor.content, editor.pickedFiles]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <YStack flex={1}>
        <AnimatedView entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} flex={1}>
          <ModalOverlay>
            <Pressable style={{ flex: 0.1 }} onPress={onClose} />
          </ModalOverlay>
        </AnimatedView>

        <AnimatedView
          entering={SlideInDown.springify().damping(20).stiffness(200)}
          exiting={SlideOutDown.springify().damping(20).stiffness(200)}
          flex={1}
          marginTop={insets.top + 40}
        >
          <EditorContainer>
            <EditorHeader>
              <Pressable onPress={onClose} disabled={editor.submitting}>
                <HeaderButton variant={editor.submitting ? 'disabled' : 'cancel'}>
                  取消
                </HeaderButton>
              </Pressable>

              <Text fontSize="$4" fontWeight="600" color="$color">
                {editingPost ? '编辑帖子' : '发布新帖'}
              </Text>

              <Pressable onPress={handleSubmit} disabled={!canSubmit}>
                <HeaderButton variant={canSubmit ? 'submit' : 'disabled'}>
                  {editor.submitting ? '发布中...' : '发布'}
                </HeaderButton>
              </Pressable>
            </EditorHeader>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <YStack gap="$2">
                <SectionTitle>选择分类</SectionTitle>
                <XStack gap="$2" flexWrap="wrap">
                  {POST_CATEGORIES.map((cat) => (
                    <Pressable key={cat.key} onPress={() => handleCategorySelect(cat.key)}>
                      <CategoryButton active={editor.category === cat.key}>
                        <CategoryText active={editor.category === cat.key}>
                          {cat.label}
                        </CategoryText>
                      </CategoryButton>
                    </Pressable>
                  ))}
                </XStack>
              </YStack>

              <YStack gap="$2">
                <SectionTitle>添加标签</SectionTitle>
                <StyledTextArea
                  value={editor.tagsText}
                  onChangeText={editor.setTagsText}
                  placeholder="输入标签，用空格或逗号分隔"
                  numberOfLines={1}
                  height={44}
                />
              </YStack>

              <YStack gap="$2">
                <SectionTitle>帖子内容</SectionTitle>
                <StyledTextArea
                  value={editor.content}
                  onChangeText={editor.setContent}
                  placeholder="分享你的想法..."
                  numberOfLines={6}
                  minHeight={150}
                  textAlignVertical="top"
                />
              </YStack>

              <YStack gap="$2">
                <SectionTitle>添加图片/视频 ({editor.pickedFiles.length}/9)</SectionTitle>

                <XStack gap="$2" flexWrap="wrap">
                  {editor.pickedFiles.map((file, idx) => (
                    <MediaPreview key={idx}>
                      <Image
                        source={{ uri: file.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <Pressable onPress={() => editor.removeFile(idx)}>
                        <RemoveButton>
                          <Text color="white" fontSize="$1">
                            ✕
                          </Text>
                        </RemoveButton>
                      </Pressable>
                    </MediaPreview>
                  ))}

                  {editor.pickedFiles.length < 9 && (
                    <Pressable onPress={handlePickImages}>
                      <AddMediaButton
                        width={UI_CONFIG.THUMBNAIL_SIZE}
                        height={UI_CONFIG.THUMBNAIL_SIZE}
                      >
                        <Text fontSize="$5" color="$colorMuted">
                          +
                        </Text>
                      </AddMediaButton>
                    </Pressable>
                  )}
                </XStack>
              </YStack>
            </ScrollView>

            <YStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              paddingBottom={insets.bottom + 16}
              borderTopWidth={1}
              borderTopColor="$borderColorMuted"
            >
              <Pressable onPress={handleSubmit} disabled={!canSubmit}>
                <XStack
                  backgroundColor={canSubmit ? '$primary' : '$backgroundSubtle'}
                  paddingVertical="$3"
                  borderRadius="$4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    color={canSubmit ? '$primaryContrast' : '$colorDisabled'}
                    fontSize="$4"
                    fontWeight="600"
                  >
                    {editor.submitting ? '发布中...' : editingPost ? '更新帖子' : '发布帖子'}
                  </Text>
                </XStack>
              </Pressable>
            </YStack>
          </EditorContainer>
        </AnimatedView>
      </YStack>
    </Modal>
  );
}
