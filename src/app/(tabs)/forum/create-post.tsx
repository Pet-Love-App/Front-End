/**
 * 创建帖子页面
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ImagePlus, X, ChevronLeft, Send } from '@tamagui/lucide-icons';
import { styled, YStack, XStack, Text, TextArea, Stack } from 'tamagui';

import type { Post, PostCategory } from '@/src/lib/supabase';

import { POST_CATEGORIES, MESSAGES, UI_CONFIG } from './constants';
import { usePostEditor } from './hooks/usePostEditor';
import { createErrorHandler } from './utils';

const Container = styled(YStack, {
  name: 'CreatePostContainer',
  flex: 1,
  backgroundColor: '$background',
});

const Header = styled(XStack, {
  name: 'CreatePostHeader',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColorMuted',
});

const HeaderButton = styled(XStack, {
  name: 'HeaderButton',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',

  pressStyle: {
    opacity: 0.7,
  },
});

const SubmitButton = styled(XStack, {
  name: 'SubmitButton',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  borderRadius: 9999,
  alignItems: 'center',
  gap: '$2',

  variants: {
    disabled: {
      true: {
        backgroundColor: '$backgroundSubtle',
      },
      false: {
        backgroundColor: '$primary',
      },
    },
  } as const,
});

const ContentArea = styled(YStack, {
  name: 'ContentArea',
  flex: 1,
  padding: '$4',
  gap: '$4',
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$2',
  fontWeight: '600',
  color: '$colorMuted',
  marginBottom: '$2',
});

const CategoryChip = styled(XStack, {
  name: 'CategoryChip',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: 9999,
  alignItems: 'center',
  gap: '$1',
  borderWidth: 1.5,

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

const TagInput = styled(TextArea, {
  name: 'TagInput',
  backgroundColor: '$backgroundSubtle',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  padding: '$3',
  fontSize: '$3',
  color: '$color',
  minHeight: 44,

  focusStyle: {
    borderColor: '$primary',
  },
});

const ContentInput = styled(TextArea, {
  name: 'ContentInput',
  backgroundColor: '$backgroundSubtle',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  padding: '$4',
  fontSize: '$4',
  color: '$color',
  minHeight: 180,

  focusStyle: {
    borderColor: '$primary',
  },
});

const MediaGrid = styled(XStack, {
  name: 'MediaGrid',
  flexWrap: 'wrap',
  gap: '$2',
});

const MediaItem = styled(Stack, {
  name: 'MediaItem',
  width: UI_CONFIG.THUMBNAIL_SIZE,
  height: UI_CONFIG.THUMBNAIL_SIZE,
  borderRadius: '$3',
  overflow: 'hidden',
  backgroundColor: '$backgroundSubtle',
});

const RemoveMediaButton = styled(XStack, {
  name: 'RemoveMediaButton',
  position: 'absolute',
  top: 4,
  right: 4,
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  alignItems: 'center',
  justifyContent: 'center',
});

const AddMediaButton = styled(XStack, {
  name: 'AddMediaButton',
  width: UI_CONFIG.THUMBNAIL_SIZE,
  height: UI_CONFIG.THUMBNAIL_SIZE,
  borderRadius: '$3',
  backgroundColor: '$backgroundSubtle',
  borderWidth: 2,
  borderColor: '$borderColor',
  borderStyle: 'dashed',
  alignItems: 'center',
  justifyContent: 'center',

  pressStyle: {
    borderColor: '$primary',
    backgroundColor: '$backgroundHover',
  },
});

const BottomBar = styled(XStack, {
  name: 'BottomBar',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderTopWidth: 1,
  borderTopColor: '$borderColorMuted',
  gap: '$3',
});

const ToolButton = styled(XStack, {
  name: 'ToolButton',
  width: 44,
  height: 44,
  borderRadius: '$3',
  backgroundColor: '$backgroundSubtle',
  alignItems: 'center',
  justifyContent: 'center',

  pressStyle: {
    backgroundColor: '$backgroundHover',
  },
});

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ editPostId?: string }>();
  const errorHandler = createErrorHandler('CreatePost');

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const editor = usePostEditor({
    onSuccess: () => {
      Alert.alert(
        '成功',
        editingPost ? MESSAGES.SUCCESS.POST_UPDATED : MESSAGES.SUCCESS.POST_CREATED,
        [{ text: '确定', onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      errorHandler.handle(error, { title: '提交失败' });
    },
  });

  useEffect(() => {
    if (params.editPostId) {
      // TODO: 加载要编辑的帖子
    }
  }, [params.editPostId]);

  const handlePickImages = useCallback(async () => {
    try {
      const files = await editor.pickMedia();
      if (files.length === 0) return;
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
      editor.setCategory(editor.category === category ? undefined : category);
    },
    [editor]
  );

  const canSubmit = useMemo(() => {
    return (
      !editor.submitting && (editor.content.trim().length > 0 || editor.pickedFiles.length > 0)
    );
  }, [editor.submitting, editor.content, editor.pickedFiles]);

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header paddingTop={insets.top}>
          <Pressable onPress={() => router.back()}>
            <HeaderButton>
              <ChevronLeft size={24} color="$color" />
              <Text fontSize="$3" color="$color">
                返回
              </Text>
            </HeaderButton>
          </Pressable>

          <Text fontSize="$5" fontWeight="600" color="$color">
            {editingPost ? '编辑帖子' : '发布新帖'}
          </Text>

          <Pressable onPress={handleSubmit} disabled={!canSubmit}>
            <SubmitButton disabled={!canSubmit}>
              <Text
                fontSize="$3"
                fontWeight="600"
                color={canSubmit ? '$primaryContrast' : '$colorDisabled'}
              >
                {editor.submitting ? '发布中...' : '发布'}
              </Text>
              <Send size={16} color={canSubmit ? '$primaryContrast' : '$colorDisabled'} />
            </SubmitButton>
          </Pressable>
        </Header>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContentArea>
            <YStack gap="$2">
              <SectionTitle>选择分类</SectionTitle>
              <XStack gap="$2" flexWrap="wrap">
                {POST_CATEGORIES.map((cat) => (
                  <Pressable key={cat.key} onPress={() => handleCategorySelect(cat.key)}>
                    <CategoryChip active={editor.category === cat.key}>
                      <CategoryText active={editor.category === cat.key}>{cat.label}</CategoryText>
                    </CategoryChip>
                  </Pressable>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <SectionTitle>添加标签（可选）</SectionTitle>
              <TagInput
                value={editor.tagsText}
                onChangeText={editor.setTagsText}
                placeholder="用空格或逗号分隔，如：猫咪 健康"
                numberOfLines={1}
              />
            </YStack>

            <YStack gap="$2" flex={1}>
              <SectionTitle>帖子内容</SectionTitle>
              <ContentInput
                value={editor.content}
                onChangeText={editor.setContent}
                placeholder="分享你和宠物的故事..."
                textAlignVertical="top"
                multiline
              />
            </YStack>

            <YStack gap="$2">
              <SectionTitle>添加图片/视频（{editor.pickedFiles.length}/9）</SectionTitle>
              <MediaGrid>
                {editor.pickedFiles.map((file, idx) => (
                  <AnimatedStack
                    key={idx}
                    entering={FadeInDown.springify()}
                    exiting={FadeOutUp.springify()}
                  >
                    <MediaItem>
                      <Image
                        source={{ uri: file.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <Pressable onPress={() => editor.removeFile(idx)}>
                        <RemoveMediaButton>
                          <X size={14} color="white" />
                        </RemoveMediaButton>
                      </Pressable>
                    </MediaItem>
                  </AnimatedStack>
                ))}

                {editor.pickedFiles.length < 9 && (
                  <Pressable onPress={handlePickImages}>
                    <AddMediaButton>
                      <ImagePlus size={28} color="$colorMuted" />
                    </AddMediaButton>
                  </Pressable>
                )}
              </MediaGrid>
            </YStack>
          </ContentArea>
        </ScrollView>

        <BottomBar paddingBottom={insets.bottom + 8}>
          <Pressable onPress={handlePickImages}>
            <ToolButton>
              <ImagePlus size={22} color="$colorMuted" />
            </ToolButton>
          </Pressable>
          <Pressable onPress={handlePickImages}>
            <ToolButton>
              <Camera size={22} color="$colorMuted" />
            </ToolButton>
          </Pressable>
          <XStack flex={1} />
          <Text fontSize="$2" color="$colorMuted" alignSelf="center">
            {editor.content.length} 字
          </Text>
        </BottomBar>
      </KeyboardAvoidingView>
    </Container>
  );
}
