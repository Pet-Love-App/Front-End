/**
 * useRegisterForm Hook 测试
 *
 * 测试注册表单逻辑
 */

import { renderHook, act } from '@testing-library/react-native';
import { useRegisterForm } from '../useRegisterForm';

import { useUserStore } from '@/src/store/userStore';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(() => ({
    register: jest.fn(),
    isLoading: false,
    getState: () => ({ isAuthenticated: false }),
  })),
}));

jest.mock('@/src/components/dialogs', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  showAlert: jest.fn(),
}));

jest.mock('@/src/schemas/auth.schema', () => ({
  registerSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('useRegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty values', () => {
      // Act
      const { result } = renderHook(() => useRegisterForm());

      // Assert
      expect(result.current.email).toBe('');
      expect(result.current.username).toBe('');
      expect(result.current.password).toBe('');
      expect(result.current.errors).toEqual({});
    });
  });

  describe('handleEmailChange', () => {
    it('should update email state', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());

      // Act
      act(() => {
        result.current.handleEmailChange('test@example.com');
      });

      // Assert
      expect(result.current.email).toBe('test@example.com');
    });

    it('should clear email error when changed', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());
      act(() => {
        result.current.errors.email = 'Error';
      });

      // Act
      act(() => {
        result.current.handleEmailChange('new@example.com');
      });

      // Assert
      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe('handleUsernameChange', () => {
    it('should update username state', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());

      // Act
      act(() => {
        result.current.handleUsernameChange('testuser');
      });

      // Assert
      expect(result.current.username).toBe('testuser');
    });

    it('should clear username error when changed', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());
      act(() => {
        result.current.errors.username = 'Error';
      });

      // Act
      act(() => {
        result.current.handleUsernameChange('newuser');
      });

      // Assert
      expect(result.current.errors.username).toBeUndefined();
    });
  });

  describe('handlePasswordChange', () => {
    it('should update password state', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());

      // Act
      act(() => {
        result.current.handlePasswordChange('password123');
      });

      // Assert
      expect(result.current.password).toBe('password123');
    });

    it('should clear password error when changed', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());
      act(() => {
        result.current.errors.password = 'Error';
      });

      // Act
      act(() => {
        result.current.handlePasswordChange('newpass');
      });

      // Assert
      expect(result.current.errors.password).toBeUndefined();
    });
  });

  describe('handleRegister', () => {
    it('should call register with correct data', async () => {
      // Arrange
      const mockRegister = jest.fn().mockResolvedValue(undefined);
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        register: mockRegister,
        isLoading: false,
        getState: () => ({ isAuthenticated: true }),
      });

      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.handleEmailChange('new@example.com');
        result.current.handleUsernameChange('newuser');
        result.current.handlePasswordChange('password123');
      });

      // Act
      await act(async () => {
        await result.current.handleRegister();
      });

      // Assert
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'newuser', 'password123');
    });

    it('should clear errors before registration', async () => {
      // Arrange
      const mockRegister = jest.fn().mockResolvedValue(undefined);
      (useUserStore as unknown as jest.Mock).mockReturnValue({
        register: mockRegister,
        isLoading: false,
        getState: () => ({ isAuthenticated: true }),
      });

      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.errors.email = 'Old error';
      });

      // Act
      await act(async () => {
        await result.current.handleRegister();
      });

      // Assert
      expect(result.current.errors).toEqual({});
    });
  });

  describe('navigateBack', () => {
    it('should navigate back', () => {
      // Arrange
      const { result } = renderHook(() => useRegisterForm());

      // Act & Assert
      expect(() => {
        result.current.navigateBack();
      }).not.toThrow();
    });
  });

  describe('returned values', () => {
    it('should return all expected properties', () => {
      // Act
      const { result } = renderHook(() => useRegisterForm());

      // Assert
      expect(result.current).toHaveProperty('email');
      expect(result.current).toHaveProperty('username');
      expect(result.current).toHaveProperty('password');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('handleEmailChange');
      expect(result.current).toHaveProperty('handleUsernameChange');
      expect(result.current).toHaveProperty('handlePasswordChange');
      expect(result.current).toHaveProperty('handleRegister');
      expect(result.current).toHaveProperty('navigateBack');
    });
  });
});
