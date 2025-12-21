import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePostEditor } from '../usePostEditor';
import { supabaseForumService } from '@/src/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    createPost: jest.fn(),
    updatePost: jest.fn(),
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('../../constants', () => ({
  MEDIA_LIMITS: {
    MAX_FILES_COUNT: 9,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
}));

describe('usePostEditor', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该初始化默认状态', () => {
    const { result } = renderHook(() => usePostEditor());

    expect(result.current.content).toBe('');
    expect(result.current.category).toBeUndefined();
    expect(result.current.tagsText).toBe('');
    expect(result.current.pickedFiles).toEqual([]);
    expect(result.current.submitting).toBe(false);
  });

  it('应该能够更新内容、分类和标签', () => {
    const { result } = renderHook(() => usePostEditor());

    act(() => {
      result.current.setContent('新内容');
      result.current.setCategory('日常' as any);
      result.current.setTagsText('标签1, 标签2');
    });

    expect(result.current.content).toBe('新内容');
    expect(result.current.category).toBe('日常');
    expect(result.current.tagsText).toBe('标签1, 标签2');
    expect(result.current.parsedTags).toEqual(['标签1', '标签2']);
  });

  it('应该能够添加和删除文件', () => {
    const { result } = renderHook(() => usePostEditor());
    const mockFile = { uri: 'test.jpg', name: 'test.jpg', type: 'image/jpeg' };

    act(() => {
      result.current.addFiles([mockFile]);
    });

    expect(result.current.pickedFiles).toHaveLength(1);
    expect(result.current.pickedFiles[0]).toEqual(mockFile);

    act(() => {
      result.current.removeFile(0);
    });

    expect(result.current.pickedFiles).toHaveLength(0);
  });

  it('验证逻辑应该正确工作', () => {
    const { result } = renderHook(() => usePostEditor());

    // 初始状态（空内容且无文件）应无效
    expect(result.current.validate().valid).toBe(false);

    act(() => {
      result.current.setContent('有内容了');
    });
    expect(result.current.validate().valid).toBe(true);

    act(() => {
      result.current.setContent('');
      result.current.addFiles([{ uri: 'test.jpg', name: 'test.jpg', type: 'image/jpeg' }]);
    });
    expect(result.current.validate().valid).toBe(true);
  });

  it('应该能从现有帖子加载数据', () => {
    const { result } = renderHook(() => usePostEditor());
    const mockPost = {
      id: '1',
      content: '旧内容',
      category: '求助',
      tags: ['标签1', '标签2'],
      media: [{ id: 'm1', fileUrl: 'http://example.com/img.jpg', mediaType: 'image' }],
    } as any;

    act(() => {
      result.current.loadFromPost(mockPost);
    });

    expect(result.current.content).toBe('旧内容');
    expect(result.current.category).toBe('求助');
    expect(result.current.tagsText).toBe('标签1 标签2');
    expect(result.current.pickedFiles).toHaveLength(1);
    expect(result.current.pickedFiles[0].isExisting).toBe(true);
  });

  describe('submit', () => {
    it('提交成功时应该调用 createPost 并重置状态', async () => {
      (supabaseForumService.createPost as jest.Mock).mockResolvedValue({
        data: { id: 'new-id' },
        error: null,
      });

      const { result } = renderHook(() => usePostEditor({ onSuccess: mockOnSuccess }));

      act(() => {
        result.current.setContent('新帖子内容');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(supabaseForumService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '新帖子内容',
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.content).toBe(''); // 提交后重置
    });

    it('编辑模式下应该调用 updatePost', async () => {
      (supabaseForumService.updatePost as jest.Mock).mockResolvedValue({ error: null });

      const { result } = renderHook(() => usePostEditor({ onSuccess: mockOnSuccess }));
      const editingPost = { id: 'post-123' } as any;

      act(() => {
        result.current.setContent('更新的内容');
      });

      await act(async () => {
        await result.current.submit(editingPost);
      });

      expect(supabaseForumService.updatePost).toHaveBeenCalledWith(
        'post-123',
        expect.objectContaining({
          content: '更新的内容',
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('提交失败时应该调用 onError', async () => {
      const mockError = new Error('提交失败');
      (supabaseForumService.createPost as jest.Mock).mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => usePostEditor({ onError: mockOnError }));

      act(() => {
        result.current.setContent('内容');
      });

      await expect(
        act(async () => {
          await result.current.submit();
        })
      ).rejects.toThrow('提交失败');

      expect(mockOnError).toHaveBeenCalledWith(mockError);
      expect(result.current.submitting).toBe(false);
    });
  });

  describe('media picking', () => {
    it('pickMedia 应该在获得权限后返回选中的文件', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://test.jpg', mimeType: 'image/jpeg', fileName: 'test' }],
      });

      const { result } = renderHook(() => usePostEditor());

      let files: any[] = [];
      await act(async () => {
        files = await result.current.pickMedia();
      });

      expect(files).toHaveLength(1);
      expect(files[0].uri).toBe('file://test.jpg');
    });

    it('当权限被拒绝时 pickMedia 应该抛出错误', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => usePostEditor());

      await expect(
        act(async () => {
          await result.current.pickMedia();
        })
      ).rejects.toThrow('选择媒体失败，请重试');
    });
  });
});
