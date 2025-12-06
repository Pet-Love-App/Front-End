/**
 * 帖子编辑器Hook
 * 管理帖子创建/编辑的所有状态和逻辑
 */

import { supabaseForumService, type Post, type PostCategory } from '@/src/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { MEDIA_LIMITS } from '../constants';

export interface MediaFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface PostEditorState {
  content: string;
  category?: PostCategory;
  tagsText: string;
  pickedFiles: MediaFile[];
  submitting: boolean;
}

export interface UsePostEditorOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 帖子编辑器 Hook
 * 封装了帖子创建/编辑的完整业务逻辑
 */
export function usePostEditor(options: UsePostEditorOptions = {}) {
  const [state, setState] = useState<PostEditorState>({
    content: '',
    category: undefined,
    tagsText: '',
    pickedFiles: [],
    submitting: false,
  });

  // ========== State Setters ==========

  const setContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, content }));
  }, []);

  const setCategory = useCallback((category: PostCategory | undefined) => {
    setState((prev) => ({ ...prev, category }));
  }, []);

  const setTagsText = useCallback((tagsText: string) => {
    setState((prev) => ({ ...prev, tagsText }));
  }, []);

  const setPickedFiles = useCallback((files: MediaFile[]) => {
    setState((prev) => ({ ...prev, pickedFiles: files }));
  }, []);

  const addFiles = useCallback((files: MediaFile[]) => {
    setState((prev) => ({
      ...prev,
      pickedFiles: [...prev.pickedFiles, ...files],
    }));
  }, []);

  const removeFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      pickedFiles: prev.pickedFiles.filter((_, i) => i !== index),
    }));
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setState((prev) => ({ ...prev, submitting }));
  }, []);

  // ========== Utility Functions ==========

  /**
   * 解析标签文本为数组
   */
  const parseTags = useCallback((text: string): string[] => {
    return text
      .split(/[，,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, []);

  /**
   * 获取解析后的标签
   */
  const getParsedTags = useCallback(() => {
    return parseTags(state.tagsText);
  }, [state.tagsText, parseTags]);

  /**
   * 验证表单数据
   */
  const validate = useCallback((): ValidationResult => {
    if (!state.content.trim() && state.pickedFiles.length === 0) {
      return { valid: false, error: '请输入内容或选择媒体' };
    }
    if (state.pickedFiles.length > MEDIA_LIMITS.MAX_FILES_COUNT) {
      return { valid: false, error: `最多可上传 ${MEDIA_LIMITS.MAX_FILES_COUNT} 个文件` };
    }
    return { valid: true };
  }, [state.content, state.pickedFiles]);

  /**
   * 重置表单
   */
  const reset = useCallback(() => {
    setState({
      content: '',
      category: undefined,
      tagsText: '',
      pickedFiles: [],
      submitting: false,
    });
  }, []);

  /**
   * 从帖子加载数据（用于编辑）
   */
  const loadFromPost = useCallback((post: Post) => {
    setState({
      content: post.content || '',
      category: post.category,
      tagsText: (post.tags || []).join(' '),
      pickedFiles: [],
      submitting: false,
    });
  }, []);

  // ========== Media Handling ==========

  /**
   * 选择图片/视频
   */
  const pickMedia = useCallback(async (): Promise<MediaFile[]> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return [];
      }

      const accepted: MediaFile[] = [];
      const currentCount = state.pickedFiles.length;

      for (let idx = 0; idx < result.assets.length; idx++) {
        const asset = result.assets[idx];
        const mime = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        const isValidType = mime.startsWith('image/') || mime.startsWith('video/');
        const size = (asset as any).fileSize || (asset as any).size || 0;

        // 验证文件类型
        if (!isValidType) continue;

        // 验证文件大小
        if (size && size > MEDIA_LIMITS.MAX_FILE_SIZE) continue;

        // 验证文件数量
        if (currentCount + accepted.length >= MEDIA_LIMITS.MAX_FILES_COUNT) break;

        accepted.push({
          uri: asset.uri,
          name:
            (asset.fileName || `media_${Date.now()}_${idx}`) +
            (asset.type === 'video' ? '.mp4' : '.jpg'),
          type: mime,
          size,
        });
      }

      return accepted;
    } catch (error) {
      console.error('选择媒体失败:', error);
      throw new Error('选择媒体失败，请重试');
    }
  }, [state.pickedFiles.length]);

  // ========== Submit Logic ==========

  /**
   * 提交帖子（创建或更新）
   * 这是核心业务逻辑，完全封装在 Hook 中
   */
  const submit = useCallback(
    async (editingPost?: Post | null) => {
      // 1. 验证
      const validation = validate();
      if (!validation.valid) {
        const error = new Error(validation.error);
        options.onError?.(error);
        throw error;
      }

      // 2. 准备数据
      const tags = getParsedTags();
      const postData = {
        content: state.content.trim(),
        tags,
        category: state.category,
      };

      try {
        setSubmitting(true);

        // 3. 调用 API
        if (editingPost) {
          // 更新现有帖子
          const { error } = await supabaseForumService.updatePost(editingPost.id, postData);
          if (error) throw error;
        } else {
          // 创建新帖子
          // TODO: 需要实现媒体上传功能，暂时不支持 pickedFiles
          const { error } = await supabaseForumService.createPost(postData);
          if (error) throw error;
        }

        // 4. 成功后清理
        reset();
        options.onSuccess?.();
      } catch (error) {
        console.error('提交帖子失败:', error);
        const err = error instanceof Error ? error : new Error('提交失败，请重试');
        options.onError?.(err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [state, validate, getParsedTags, reset, options]
  );

  // ========== Return API ==========

  return {
    // State
    content: state.content,
    category: state.category,
    tagsText: state.tagsText,
    pickedFiles: state.pickedFiles,
    submitting: state.submitting,

    // Computed
    parsedTags: getParsedTags(),

    // Setters
    setContent,
    setCategory,
    setTagsText,
    setPickedFiles,
    addFiles,
    removeFile,

    // Actions
    reset,
    loadFromPost,
    validate,
    pickMedia,
    submit, // ✅ 新增：完整的提交方法
  };
}
