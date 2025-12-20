import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useActionStatus } from '../useActionStatus';

import { supabaseCatfoodService } from '@/src/lib/supabase';
import { appEvents, APP_EVENTS } from '@/src/utils';

jest.mock('@/src/lib/supabase', () => ({
  supabaseCatfoodService: {
    checkFavorite: jest.fn(),
    checkLike: jest.fn(),
    getLikeCount: jest.fn(),
    toggleLike: jest.fn(),
    toggleFavorite: jest.fn(),
  },
}));

describe('useActionStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initializes status from apis and toggles like/favorite', async () => {
    (supabaseCatfoodService.checkFavorite as jest.Mock).mockResolvedValue({ data: true });
    (supabaseCatfoodService.checkLike as jest.Mock).mockResolvedValue({ data: false });
    (supabaseCatfoodService.getLikeCount as jest.Mock).mockResolvedValue({ data: 5 });

    const { result } = renderHook(() => useActionStatus('c1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.favorited).toBe(true);
      expect(result.current.likeCount).toBe(5);
    });

    // toggleLike optimistic then API returns new state
    (supabaseCatfoodService.toggleLike as jest.Mock).mockResolvedValue({
      data: { liked: true, likes: 6 },
    });

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(result.current.liked).toBe(true);

    // toggleFavorite optimistic then API returns is_favorited
    (supabaseCatfoodService.toggleFavorite as jest.Mock).mockResolvedValue({
      data: { is_favorited: false },
    });

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(result.current.favorited).toBe(false);
  });
});
