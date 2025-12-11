/**
 * 帖子编辑器Hook
 * 管理帖子创建/编辑的所有状态和逻辑
 */

import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { supabaseForumService, type Post, type PostCategory } from '@/src/lib/supabase';

import { MEDIA_LIMITS } from '../constants';

export interface MediaFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
  /** 标记为已存在的媒体（来自服务器的 URL） */
  isExisting?: boolean;
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
    // 将现有媒体转换为 MediaFile 格式
    const existingMedia: MediaFile[] = (post.media || []).map((m) => ({
      uri: m.fileUrl,
      name: m.fileUrl.split('/').pop() || `media_${m.id}`,
      type: m.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
      // 标记为已存在的媒体（URL 而非本地文件）
      isExisting: true,
    })) as MediaFile[];

    setState({
      content: post.content || '',
      category: post.category,
      tagsText: (post.tags || []).join(' '),
      pickedFiles: existingMedia,
      submitting: false,
    });
  }, []);

  // ========== Media Handling ==========

  /**
   * 选择图片/视频
   */
  const pickMedia = useCallback(async (): Promise<MediaFile[]> => {
    console.log('[usePostEditor] pickMedia called');
    try {
      // 1. 请求媒体库权限
      console.log('[usePostEditor] Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[usePostEditor] Permission status:', status);
      if (status !== 'granted') {
        throw new Error('需要媒体库访问权限才能选择图片');
      }

      // 2. 打开图片选择器
      console.log('[usePostEditor] Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      console.log(
        '[usePostEditor] Image picker result:',
        result.canceled ? 'canceled' : 'selected'
      );

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

  /**
   * 拍照
   */
  const takePhoto = useCallback(async (): Promise<MediaFile[]> => {
    console.log('[usePostEditor] takePhoto called');
    try {
      // 1. 请求相机权限
      console.log('[usePostEditor] Requesting camera permissions...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[usePostEditor] Camera permission status:', status);
      if (status !== 'granted') {
        throw new Error('需要相机访问权限才能拍照');
      }

      // 2. 打开相机
      console.log('[usePostEditor] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: true,
      });
      console.log('[usePostEditor] Camera result:', result.canceled ? 'canceled' : 'captured');

      if (result.canceled) {
        return [];
      }

      const accepted: MediaFile[] = [];
      const currentCount = state.pickedFiles.length;

      for (let idx = 0; idx < result.assets.length; idx++) {
        const asset = result.assets[idx];
        const mime = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        const size = (asset as any).fileSize || (asset as any).size || 0;

        // 验证文件数量
        if (currentCount + accepted.length >= MEDIA_LIMITS.MAX_FILES_COUNT) break;

        accepted.push({
          uri: asset.uri,
          name:
            (asset.fileName || `photo_${Date.now()}_${idx}`) +
            (asset.type === 'video' ? '.mp4' : '.jpg'),
          type: mime,
          size,
        });
      }

      return accepted;
    } catch (error) {
      console.error('拍照失败:', error);
      throw new Error('拍照失败，请重试');
    }
  }, [state.pickedFiles.length]);

  // ========== Submit Logic ==========

  /**
   * 提交帖子（创建或更新）
   * 这是核心业务逻辑，完全封装在 Hook 中
   */
  const submit = useCallback(
    async (editingPost?: Post | null) => {
      console.log('[usePostEditor] submit called');

      // 1. 验证
      const validation = validate();
      console.log('[usePostEditor] validation result:', validation);
      if (!validation.valid) {
        const error = new Error(validation.error);
        options.onError?.(error);
        throw error;
      }

      // 2. 准备数据
      const tags = getParsedTags();
      // 只上传新添加的媒体文件（排除已存在的）
      const newMediaFiles = state.pickedFiles
        .filter((file) => !file.isExisting)
        .map((file) => ({
          uri: file.uri,
          name: file.name,
          type: file.type,
        }));

      const postData = {
        content: state.content.trim(),
        tags,
        category: state.category,
        // 传递媒体文件用于上传（只包含新文件）
        mediaFiles: newMediaFiles,
      };
      console.log('[usePostEditor] postData:', {
        ...postData,
        mediaFiles: postData.mediaFiles.length,
      });

      try {
        setSubmitting(true);

        // 3. 调用 API
        if (editingPost) {
          // 更新现有帖子
          console.log('[usePostEditor] updating post:', editingPost.id);
          const { error } = await supabaseForumService.updatePost(editingPost.id, postData);
          if (error) {
            console.error('[usePostEditor] update error:', error);
            throw error;
          }
        } else {
          // 创建新帖子
          console.log(
            '[usePostEditor] creating new post with',
            postData.mediaFiles.length,
            'media files'
          );
          const { data, error } = await supabaseForumService.createPost(postData);
          console.log('[usePostEditor] createPost result:', { data, error });
          if (error) {
            console.error('[usePostEditor] create error:', error);
            throw error;
          }
        }

        // 4. 成功后清理
        console.log('[usePostEditor] submit successful');
        reset();
        options.onSuccess?.();
      } catch (error) {
        console.error('[usePostEditor] 提交帖子失败:', error);
        const err = error instanceof Error ? error : new Error('提交失败，请重试');
        options.onError?.(err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [state, validate, getParsedTags, reset, options, setSubmitting]
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
    takePhoto,
    submit, // ✅ 新增：完整的提交方法
  };
}
