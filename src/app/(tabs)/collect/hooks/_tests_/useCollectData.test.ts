import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCollectData } from '../useCollectData';

import { supabaseCatfoodService } from '@/src/lib/supabase';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: any) => {
      React.useEffect(() => {
        callback();
      }, []);
    },
  };
});

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn((opts: any) => {
    const btn = opts?.buttons?.find((b: any) => b.style === 'destructive');
    if (btn && typeof btn.onPress === 'function') btn.onPress();
  }),
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/src/lib/supabase', () => ({
  supabaseCatfoodService: {
    getUserFavorites: jest.fn(),
    toggleFavorite: jest.fn(),
  },
}));

describe('useCollectData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches favorites then exposes handlers', async () => {
    (supabaseCatfoodService.getUserFavorites as jest.Mock).mockResolvedValue({
      data: [{ catfoodId: 'c1', id: 'fav1' }],
    });

    const { result } = renderHook(() => useCollectData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.favorites).toHaveLength(1);
    });

    // handlePress should call router.push
    act(() => {
      result.current.handlePress('c1');
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/detail', params: { id: 'c1' } });

    // handleDelete should call toggleFavorite and update list
    (supabaseCatfoodService.toggleFavorite as jest.Mock).mockResolvedValue({ data: true });
    act(() => {
      result.current.handleDelete('fav1', 'c1');
    });

    expect(supabaseCatfoodService.toggleFavorite).toHaveBeenCalledWith('c1');
  });

  it('handles fetch error', async () => {
    (supabaseCatfoodService.getUserFavorites as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'fail' },
    });
    const { result } = renderHook(() => useCollectData());
    await waitFor(() => {
      expect(result.current.error).toBe('fail');
    });
  });
});
