import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePostDetail } from '../usePostDetail';
import { supabaseCommentService } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseCommentService: {
    getComments: jest.fn(),
  },
  supabaseForumService: {
    deletePost: jest.fn(),
  },
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn(),
}));

describe('usePostDetail', () => {
  const mockPost = {
    id: 1,
    content: 'Test Post',
    author: { id: 'user1', username: 'User 1' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue({ id: 'user1' });
  });

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => usePostDetail({ post: mockPost as any, visible: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
    expect(result.current.newComment).toBe('');
  });

  it('should load comments when visible', async () => {
    const mockComments = [{ id: 1, content: 'Test Comment' }];
    (supabaseCommentService.getComments as jest.Mock).mockResolvedValue({
      data: mockComments,
      error: null,
    });

    const { result } = renderHook(() => usePostDetail({ post: mockPost as any, visible: true }));

    await waitFor(() => {
      expect(result.current.comments).toEqual(mockComments);
    });
  });

  it('should handle new comment input', () => {
    const { result } = renderHook(() => usePostDetail({ post: mockPost as any, visible: true }));

    act(() => {
      result.current.setNewComment('New Comment');
    });

    expect(result.current.newComment).toBe('New Comment');
  });
});
