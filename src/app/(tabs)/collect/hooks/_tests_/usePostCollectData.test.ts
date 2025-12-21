import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePostCollectData } from '../usePostCollectData';
import { supabaseForumService } from '@/src/lib/supabase';

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn((opts: any) => {
    const btn = opts?.buttons?.find((b: any) => b.style === 'destructive');
    if (btn && typeof btn.onPress === 'function') btn.onPress();
  }),
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    getMyFavorites: jest.fn(),
    toggleFavorite: jest.fn(),
  },
}));

describe('usePostCollectData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads favorite posts and supports delete and select', async () => {
    const mockPosts = [{ id: 1, title: 'Post A' }];
    (supabaseForumService.getMyFavorites as jest.Mock).mockResolvedValue({
      data: mockPosts,
      error: null,
    });

    const { result } = renderHook(() => usePostCollectData());

    await waitFor(() => {
      expect(result.current.isLoadingPosts).toBe(false);
      expect(result.current.favoritePosts).toHaveLength(1);
    });

    // handlePress selects
    act(() => {
      result.current.handlePress(1);
    });
    expect(result.current.selectedPost).toEqual(mockPosts[0]);

    // handlePostDeleted removes selected
    act(() => {
      result.current.handlePostDeleted();
    });
    expect(result.current.selectedPost).toBeNull();
  });

  it('handles fetch error', async () => {
    (supabaseForumService.getMyFavorites as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'fail' },
    });
    const { result } = renderHook(() => usePostCollectData());
    await waitFor(() => {
      expect(result.current.postError).toBe('获取帖子收藏列表失败');
    });
  });

  it('handles delete (unfavorite)', async () => {
    const mockPosts = [{ id: 1, title: 'Post A' }];
    (supabaseForumService.getMyFavorites as jest.Mock).mockResolvedValue({
      data: mockPosts,
      error: null,
    });
    (supabaseForumService.toggleFavorite as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => usePostCollectData());
    await waitFor(() => expect(result.current.isLoadingPosts).toBe(false));

    await act(async () => {
      result.current.handleDelete(1);
    });

    expect(supabaseForumService.toggleFavorite).toHaveBeenCalledWith(1);
    expect(result.current.favoritePosts).toHaveLength(0);
  });

  it('handles refresh', async () => {
    (supabaseForumService.getMyFavorites as jest.Mock).mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => usePostCollectData());
    await waitFor(() => expect(result.current.isLoadingPosts).toBe(false));

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(result.current.refreshing).toBe(false);
    expect(supabaseForumService.getMyFavorites).toHaveBeenCalledTimes(2);
  });
});
