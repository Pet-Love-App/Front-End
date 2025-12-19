/**
 * useLoginForm Hook 测试
 *
 * 测试登录表单逻辑
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLoginForm } from '../useLoginForm';

import { useUserStore } from '@/src/store/userStore';
import { toast } from '@/src/components/dialogs';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(() => ({
    login: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock('@/src/components/dialogs', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/src/schemas/auth.schema', () => ({
  loginSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty values', () => {
      // Act
      const { result } = renderHook(() => useLoginForm());

      // Assert
      expect(result.current.email).toBe('');
      expect(result.current.password).toBe('');
      expect(result.current.errors).toEqual({});
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleEmailChange', () => {
    it('should update email state', () => {
      // Arrange
      const { result } = renderHook(() => useLoginForm());

      // Act
      act(() => {
        result.current.handleEmailChange('test@example.com');
      });

      // Assert
      expect(result.current.email).toBe('test@example.com');
    });

    it('should clear email error when changed', () => {
      // Arrange
      const { result } = renderHook(() => useLoginForm());
      act(() => {
        result.current.errors.email = 'Error message';
      });

      // Act
      act(() => {
        result.current.handleEmailChange('new@example.com');
      });

      // Assert
      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe('handlePasswordChange', () => {
    it('should update password state', () => {
      // Arrange
      const { result } = renderHook(() => useLoginForm());

      // Act
      act(() => {
        result.current.handlePasswordChange('password123');
      });

      // Assert
      expect(result.current.password).toBe('password123');
    });

    it('should clear password error when changed', () => {
      // Arrange
      const { result } = renderHook(() => useLoginForm());
      act(() => {
        result.current.errors.password = 'Error message';
      });

      // Act
      act(() => {
        result.current.handlePasswordChange('newpassword');
      });

      // Assert
      expect(result.current.errors.password).toBeUndefined();
    });
  });

  describe('handleLogin', () => {
    it('should call login with correct credentials', async () => {
      // Arrange
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleEmailChange('test@example.com');
        result.current.handlePasswordChange('password123');
      });

      // Act
      await act(async () => {
        await result.current.handleLogin();
      });

      // Assert
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should clear errors before login attempt', async () => {
      // Arrange
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
      });

      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.errors.email = 'Old error';
      });

      // Act
      await act(async () => {
        await result.current.handleLogin();
      });

      // Assert - errors should be cleared
      expect(result.current.errors).toEqual({});
    });
  });

  describe('navigateToRegister', () => {
    it('should navigate to register screen', () => {
      // Arrange
      const { result } = renderHook(() => useLoginForm());

      // Act & Assert - should not throw
      expect(() => {
        result.current.navigateToRegister();
      }).not.toThrow();
    });
  });

  describe('returned values', () => {
    it('should return all expected properties', () => {
      // Act
      const { result } = renderHook(() => useLoginForm());

      // Assert
      expect(result.current).toHaveProperty('email');
      expect(result.current).toHaveProperty('password');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('handleEmailChange');
      expect(result.current).toHaveProperty('handlePasswordChange');
      expect(result.current).toHaveProperty('handleLogin');
      expect(result.current).toHaveProperty('navigateToRegister');
    });

    it('should have function types for handlers', () => {
      // Act
      const { result } = renderHook(() => useLoginForm());

      // Assert
      expect(typeof result.current.handleEmailChange).toBe('function');
      expect(typeof result.current.handlePasswordChange).toBe('function');
      expect(typeof result.current.handleLogin).toBe('function');
      expect(typeof result.current.navigateToRegister).toBe('function');
    });
  });
});
