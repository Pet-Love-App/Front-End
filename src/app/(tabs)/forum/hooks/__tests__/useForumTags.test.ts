import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useForumTags } from '../useForumTags';
import { supabaseForumService } from '@/src/lib/supabase';

// Mock supabaseForumService
jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    getAllTags: jest.fn(),
    getPopularTags: jest.fn(),
  },
}));

const DEFAULT_TAGS = [
  { id: 1, name: '求助' },
  { id: 2, name: '分享' },
  { id: 3, name: '科普' },
  { id: 4, name: '避雷' },
  { id: 5, name: '日常' },
  { id: 6, name: '健康' },
];

describe('useForumTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该在初始加载时获取所有标签', async () => {
    const mockTags = ['标签1', '标签2'];
    (supabaseForumService.getAllTags as jest.Mock).mockResolvedValue({
      data: mockTags,
      error: null,
    });

    const { result } = renderHook(() => useForumTags());

    // 初始状态应该是 DEFAULT_TAGS
    expect(result.current.tags).toEqual(DEFAULT_TAGS);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tags).toEqual([
      { id: 1, name: '标签1' },
      { id: 2, name: '标签2' },
    ]);
    expect(supabaseForumService.getAllTags).toHaveBeenCalledTimes(1);
  });

  it('当 popular 为 true 时应该获取热门标签', async () => {
    const mockPopularTags = [
      { tag: '热门1', count: 10 },
      { tag: '热门2', count: 5 },
    ];
    (supabaseForumService.getPopularTags as jest.Mock).mockResolvedValue({
      data: mockPopularTags,
      error: null,
    });

    const { result } = renderHook(() => useForumTags({ popular: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tags).toEqual([
      { id: 1, name: '热门1', count: 10 },
      { id: 2, name: '热门2', count: 5 },
    ]);
    expect(supabaseForumService.getPopularTags).toHaveBeenCalledTimes(1);
  });

  it('当 API 调用失败时应该回退到默认标签', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (supabaseForumService.getAllTags as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('API Error'),
    });

    const { result } = renderHook(() => useForumTags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 应该回退到 DEFAULT_TAGS
    expect(result.current.tags).toEqual(DEFAULT_TAGS);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('refresh 函数应该重新触发加载', async () => {
    const mockTags1 = ['标签1'];
    const mockTags2 = ['标签2'];

    (supabaseForumService.getAllTags as jest.Mock)
      .mockResolvedValueOnce({ data: mockTags1, error: null })
      .mockResolvedValueOnce({ data: mockTags2, error: null });

    const { result } = renderHook(() => useForumTags());

    await waitFor(() => {
      expect(result.current.tags).toEqual([{ id: 1, name: '标签1' }]);
    });

    // 调用刷新
    act(() => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tags).toEqual([{ id: 1, name: '标签2' }]);
    expect(supabaseForumService.getAllTags).toHaveBeenCalledTimes(2);
  });
});
