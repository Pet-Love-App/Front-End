/**
 * User Store 集成测试
 *
 * 测试用户状态管理的核心功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { act } from '@testing-library/react-native';
import { useUserStore } from '../userStore';
import { supabaseAuthService, supabaseProfileService } from '@/src/lib/supabase';

// Mock Supabase services
jest.mock('@/src/lib/supabase', () => ({
  supabaseAuthService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshSession: jest.fn(),
    getSession: jest.fn(),
    updatePassword: jest.fn(),
    resetPassword: jest.fn(),
  },
  supabaseProfileService: {
    getCurrentProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  },
}));

// Mock schemas to bypass validation in tests
jest.mock('@/src/schemas/auth.schema', () => ({
  loginSchema: {
    parse: jest.fn((data) => data),
  },
  registerSchema: {
    parse: jest.fn((data) => data),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// 创建 mock 用户数据 (UserWithPets 类型)
const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  phone: null,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  pets: [],
  ...overrides,
});

const createMockSession = () => ({
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
  },
});

describe('UserStore', () => {
  // 每个测试前重置 store 状态
  beforeEach(() => {
    act(() => {
      useUserStore.setState({
        user: null,
        session: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        _hasHydrated: false,
      });
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have null session initially', () => {
      const state = useUserStore.getState();
      expect(state.session).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not be loading initially', () => {
      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should set authenticated state on successful login', async () => {
      // Arrange
      const mockSession = createMockSession();
      const mockUser = createMockUser();

      (supabaseAuthService.login as jest.Mock).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      // Act
      await act(async () => {
        await useUserStore.getState().login('test@example.com', 'password123');
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.session).toBeDefined();
      expect(state.accessToken).toBe('test-access-token');
    });

    it('should throw error on login failure', async () => {
      // Arrange
      (supabaseAuthService.login as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      // Act & Assert
      await expect(
        act(async () => {
          await useUserStore.getState().login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should set loading state during login', async () => {
      // Arrange
      let loadingDuringCall = false;
      (supabaseAuthService.login as jest.Mock).mockImplementation(async () => {
        loadingDuringCall = useUserStore.getState().isLoading;
        return {
          data: { session: createMockSession() },
          error: null,
        };
      });
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: createMockUser(),
        error: null,
      });

      // Act
      await act(async () => {
        await useUserStore.getState().login('test@example.com', 'password123');
      });

      // Assert
      expect(loadingDuringCall).toBe(true);
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user state on logout', async () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          user: createMockUser(),
          session: createMockSession() as any,
          accessToken: 'test-token',
          isAuthenticated: true,
        });
      });
      (supabaseAuthService.logout as jest.Mock).mockResolvedValue({});

      // Act
      await act(async () => {
        await useUserStore.getState().logout();
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear state even if logout API fails', async () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          user: createMockUser(),
          isAuthenticated: true,
        });
      });
      (supabaseAuthService.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      await act(async () => {
        await useUserStore.getState().logout();
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and authentication state', () => {
      // Arrange
      const mockUser = createMockUser();

      // Act
      act(() => {
        useUserStore.getState().setUser(mockUser as any);
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear authentication when user is null', () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          user: createMockUser() as any,
          isAuthenticated: true,
        });
      });

      // Act
      act(() => {
        useUserStore.getState().setUser(null);
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setSession', () => {
    it('should set session and access token', () => {
      // Arrange
      const mockSession = createMockSession();

      // Act
      act(() => {
        useUserStore.getState().setSession(mockSession as any);
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.session).toEqual(mockSession);
      expect(state.accessToken).toBe('test-access-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear session data when null', () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          session: createMockSession() as any,
          accessToken: 'test-token',
          isAuthenticated: true,
        });
      });

      // Act
      act(() => {
        useUserStore.getState().setSession(null);
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.session).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      // Act
      act(() => {
        useUserStore.getState().setLoading(true);
      });

      // Assert
      expect(useUserStore.getState().isLoading).toBe(true);
    });
  });

  describe('setHasHydrated', () => {
    it('should set hydration state', () => {
      // Act
      act(() => {
        useUserStore.getState().setHasHydrated(true);
      });

      // Assert
      expect(useUserStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should call profile service and refresh user', async () => {
      // Arrange
      const mockUser = createMockUser();
      const updatedUser = { ...mockUser, username: 'newusername' };

      act(() => {
        useUserStore.setState({
          user: mockUser as any,
          isAuthenticated: true,
        });
      });

      (supabaseProfileService.updateProfile as jest.Mock).mockResolvedValue({
        error: null,
      });
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: updatedUser,
        error: null,
      });

      // Act
      await act(async () => {
        await useUserStore.getState().updateProfile({ username: 'newusername' });
      });

      // Assert
      expect(supabaseProfileService.updateProfile).toHaveBeenCalledWith({
        username: 'newusername',
      });
    });

    it('should throw error on update failure', async () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          user: createMockUser() as any,
          isAuthenticated: true,
        });
      });

      (supabaseProfileService.updateProfile as jest.Mock).mockResolvedValue({
        error: { message: 'Update failed' },
      });

      // Act & Assert
      await expect(
        act(async () => {
          await useUserStore.getState().updateProfile({ username: 'newname' });
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('refreshAccessToken', () => {
    it('should update session on successful refresh', async () => {
      // Arrange
      const newSession = createMockSession();
      newSession.access_token = 'new-access-token';

      (supabaseAuthService.refreshSession as jest.Mock).mockResolvedValue({
        data: newSession,
        error: null,
      });

      // Act
      await act(async () => {
        await useUserStore.getState().refreshAccessToken();
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.accessToken).toBe('new-access-token');
    });

    it('should logout on refresh failure', async () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          user: createMockUser() as any,
          isAuthenticated: true,
        });
      });

      (supabaseAuthService.refreshSession as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Token expired' },
      });
      (supabaseAuthService.logout as jest.Mock).mockResolvedValue({});

      // Act & Assert
      await expect(
        act(async () => {
          await useUserStore.getState().refreshAccessToken();
        })
      ).rejects.toThrow('登录已过期，请重新登录');
    });
  });

  describe('register', () => {
    it('should call register service with valid credentials', async () => {
      // Arrange
      const mockSession = createMockSession();
      const mockUser = createMockUser();

      (supabaseAuthService.register as jest.Mock).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      // Act - use valid password: letters + numbers, 6+ chars
      await act(async () => {
        await useUserStore.getState().register('new@example.com', 'Abc12345', 'newuser');
      });

      // Assert
      expect(supabaseAuthService.register).toHaveBeenCalled();
      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(true);
    });

    it('should throw error on registration failure', async () => {
      // Arrange
      (supabaseAuthService.register as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });

      // Act & Assert - use valid password format
      await expect(
        act(async () => {
          await useUserStore.getState().register('exists@example.com', 'Pass1234', 'user');
        })
      ).rejects.toThrow();
    });
  });

  describe('fetchCurrentUser', () => {
    it('should fetch and set current user', async () => {
      // Arrange
      const mockUser = createMockUser();

      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      // Act
      await act(async () => {
        await useUserStore.getState().fetchCurrentUser();
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should handle fetch error', async () => {
      // Arrange
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' },
      });

      // Act & Assert
      await expect(
        act(async () => {
          await useUserStore.getState().fetchCurrentUser();
        })
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle updating profile when user exists', async () => {
      // Arrange
      act(() => {
        useUserStore.setState({
          user: createMockUser() as any,
          isAuthenticated: true,
        });
      });

      (supabaseProfileService.updateProfile as jest.Mock).mockResolvedValue({
        error: null,
      });
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: createMockUser({ username: 'updated' }),
        error: null,
      });

      // Act & Assert - should complete without errors
      await act(async () => {
        await useUserStore.getState().updateProfile({ username: 'updated' });
      });

      expect(supabaseProfileService.updateProfile).toHaveBeenCalled();
    });

    it('should maintain session consistency', () => {
      // Arrange
      const session = createMockSession();

      // Act
      act(() => {
        useUserStore.getState().setSession(session as any);
      });

      // Assert
      const state = useUserStore.getState();
      expect(state.accessToken).toBe(session.access_token);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle valid credentials during login', async () => {
      // Arrange
      const mockSession = createMockSession();
      const mockUser = createMockUser();

      (supabaseAuthService.login as jest.Mock).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });
      (supabaseProfileService.getCurrentProfile as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      // Act
      await act(async () => {
        await useUserStore.getState().login('test@example.com', 'Password123');
      });

      // Assert
      expect(useUserStore.getState().isAuthenticated).toBe(true);
    });
  });
});
