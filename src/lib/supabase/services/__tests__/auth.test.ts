/**
 * Auth Service 集成测试
 *
 * 测试认证服务的各项功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { supabaseAuthService } from '../auth';
import { mockSupabaseClient, resetAllMocks } from '../../__tests__/setup';

describe('SupabaseAuthService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('login', () => {
    it('should return success response on valid credentials', async () => {
      // Arrange
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        user: { id: 'user-123', email: 'test@example.com' },
      };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should return translated error message for invalid credentials', async () => {
      // Arrange
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', code: 'invalid_credentials', status: 400 },
      });

      // Act
      const result = await supabaseAuthService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('邮箱或密码错误');
    });

    it('should call signInWithPassword with correct parameters', async () => {
      // Arrange
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // Act
      await supabaseAuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await supabaseAuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Network error');
    });

    it('should return error when user or session is missing in response', async () => {
      // Arrange
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('登录失败，请重试');
    });
  });

  describe('register', () => {
    it('should return success response on valid registration', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'new@example.com' };
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
      };
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.register({
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
    });

    it('should handle email verification flow', async () => {
      // Arrange - 需要邮箱验证时 session 为 null
      const mockUser = { id: 'user-123', email: 'new@example.com' };
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.register({
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.session).toBeNull();
    });

    it('should return error when email already registered', async () => {
      // Arrange
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', code: 'user_already_exists', status: 400 },
      });

      // Act
      const result = await supabaseAuthService.register({
        email: 'existing@example.com',
        password: 'password123',
        username: 'existinguser',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('该邮箱已被注册');
    });

    it('should include username in signup options', async () => {
      // Arrange
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: '123' }, session: null },
        error: null,
      });

      // Act
      await supabaseAuthService.register({
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      });

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          password: 'password123',
          options: expect.objectContaining({
            data: { username: 'newuser' },
          }),
        })
      );
    });

    it('should return error when user is missing in response', async () => {
      // Arrange
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.register({
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('注册失败，请重试');
    });

    it('should handle unexpected errors during registration', async () => {
      // Arrange
      mockSupabaseClient.auth.signUp.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseAuthService.register({
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('logout', () => {
    it('should return success on logout', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      // Act
      const result = await supabaseAuthService.logout();

      // Assert
      expect(result.success).toBe(true);
    });

    it('should handle logout errors', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed', code: 'error', status: 500 },
      });

      // Act
      const result = await supabaseAuthService.logout();

      // Assert
      expect(result.success).toBe(false);
    });

    it('should handle unexpected errors during logout', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseAuthService.logout();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      // Arrange
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        user: { id: 'user-123' },
      };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.getSession();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
    });

    it('should return null when no session exists', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.getSession();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle error when getting session', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error', code: 'error', status: 500 },
      });

      // Act
      const result = await supabaseAuthService.getSession();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Session error');
    });

    it('should handle unexpected errors during getSession', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseAuthService.getSession();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.getCurrentUser();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('user-123');
    });

    it('should handle error when getting current user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User error', code: 'error', status: 500 },
      });

      // Act
      const result = await supabaseAuthService.getCurrentUser();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('User error');
    });

    it('should handle unexpected errors during getCurrentUser', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseAuthService.getCurrentUser();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('refreshSession', () => {
    it('should refresh and return new session', async () => {
      // Arrange
      const newSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
      };
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: newSession },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.refreshSession();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.access_token).toBe('new-token');
    });

    it('should return error when refresh fails', async () => {
      // Arrange
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid Refresh Token', code: 'invalid_token', status: 401 },
      });

      // Act
      const result = await supabaseAuthService.refreshSession();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('登录已过期，请重新登录');
    });

    it('should return error when session is missing in response', async () => {
      // Arrange
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.refreshSession();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('刷新失败，请重新登录');
    });

    it('should handle unexpected errors during refreshSession', async () => {
      // Arrange
      mockSupabaseClient.auth.refreshSession.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseAuthService.refreshSession();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      // Arrange
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      // Act
      const result = await supabaseAuthService.resetPassword({
        email: 'test@example.com',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });

    it('should handle rate limit error', async () => {
      // Arrange
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: {
          message: 'For security purposes, you can only request this once every 60 seconds',
          code: 'rate_limit',
          status: 429,
        },
      });

      // Act
      const result = await supabaseAuthService.resetPassword({
        email: 'test@example.com',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('出于安全考虑，每60秒只能请求一次');
    });

    it('should handle unexpected errors during resetPassword', async () => {
      // Arrange
      mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act
      const result = await supabaseAuthService.resetPassword({
        email: 'test@example.com',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Act
      const result = await supabaseAuthService.updatePassword({
        newPassword: 'newpassword123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should handle same password error', async () => {
      // Arrange
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: {
          message: 'New password should be different from the old password',
          code: 'same_password',
          status: 400,
        },
      });

      // Act
      const result = await supabaseAuthService.updatePassword({
        newPassword: 'samepassword',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('新密码不能与旧密码相同');
    });

    it('should handle unexpected errors during updatePassword', async () => {
      // Arrange
      mockSupabaseClient.auth.updateUser.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseAuthService.updatePassword({
        newPassword: 'newpassword123',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      // Arrange
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      // Act
      const unsubscribe = supabaseAuthService.onAuthStateChange(callback);

      // Assert
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe when cleanup function is called', () => {
      // Arrange
      const mockUnsubscribe = jest.fn();
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      // Act
      const unsubscribe = supabaseAuthService.onAuthStateChange(jest.fn());
      unsubscribe();

      // Assert
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
