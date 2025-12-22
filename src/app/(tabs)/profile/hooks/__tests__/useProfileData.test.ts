import { renderHook, act } from '@testing-library/react-native';
import { useProfileData } from '../useProfileData';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('@/src/store/userStore');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('useProfileData', () => {
  const mockFetchCurrentUser = jest.fn();
  const mockRouter = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        _hasHydrated: true,
        fetchCurrentUser: mockFetchCurrentUser.mockResolvedValue(undefined),
      };
      return selector(state);
    });
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isAuthenticated).toBeFalsy();
  });

  it('should fetch current user if authenticated and hydrated but no user', () => {
    (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: null,
        isLoading: false,
        isAuthenticated: true,
        _hasHydrated: true,
        fetchCurrentUser: mockFetchCurrentUser,
      };
      return selector(state);
    });

    renderHook(() => useProfileData());

    expect(mockFetchCurrentUser).toHaveBeenCalled();
  });

  it('should not fetch current user if not authenticated', () => {
    (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        _hasHydrated: true,
        fetchCurrentUser: mockFetchCurrentUser,
      };
      return selector(state);
    });

    renderHook(() => useProfileData());

    expect(mockFetchCurrentUser).not.toHaveBeenCalled();
  });

  it('should handle unauthenticated state by redirecting to login', () => {
    const { result } = renderHook(() => useProfileData());

    act(() => {
      result.current.handleUnauthenticated();
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
  });
});
