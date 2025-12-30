import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import Index from '../index';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    useRouter: jest.fn(),
    Redirect: jest.fn(({ href }) => <View testID="mock-redirect" accessibilityLabel={href} />),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('tamagui', () => {
  const { View } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Spinner: () => <View testID="spinner" />,
  };
});

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

describe('Index Screen (src/app/index.tsx)', () => {
  const mockRouter = {
    replace: jest.fn(),
  };
  const mockUseUserStore = useUserStore as unknown as jest.Mock;
  const mockFetchCurrentUser = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Default store mock: hydrated but not authenticated
    mockUseUserStore.mockImplementation((selector: any) => {
      const state = {
        isAuthenticated: false,
        _hasHydrated: true,
        fetchCurrentUser: mockFetchCurrentUser,
        logout: mockLogout,
      };
      return selector ? selector(state) : state;
    });

    // Mock getState for direct access
    (mockUseUserStore as any).getState = jest.fn().mockReturnValue({
      fetchCurrentUser: mockFetchCurrentUser,
      logout: mockLogout,
    });
  });

  it('renders loading spinner when not hydrated', () => {
    mockUseUserStore.mockImplementation((selector: any) => {
      const state = { isAuthenticated: false, _hasHydrated: false };
      return selector ? selector(state) : state;
    });

    render(<Index />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('redirects to login if not authenticated', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-redirect')).toBeTruthy();
      expect(screen.getByTestId('mock-redirect').props.accessibilityLabel).toBe('/login');
    });
  });

  it('redirects to home if authenticated and token is valid', async () => {
    mockUseUserStore.mockImplementation((selector: any) => {
      const state = {
        isAuthenticated: true,
        _hasHydrated: true,
        fetchCurrentUser: mockFetchCurrentUser,
        logout: mockLogout,
      };
      return selector ? selector(state) : state;
    });

    mockFetchCurrentUser.mockResolvedValue({});

    render(<Index />);

    await waitFor(() => {
      expect(mockFetchCurrentUser).toHaveBeenCalled();
      expect(screen.getByTestId('mock-redirect')).toBeTruthy();
      expect(screen.getByTestId('mock-redirect').props.accessibilityLabel).toBe('/(tabs)/collect');
    });
  });

  it('redirects to login if authenticated but token is invalid', async () => {
    mockUseUserStore.mockImplementation((selector: any) => {
      const state = {
        isAuthenticated: true,
        _hasHydrated: true,
        fetchCurrentUser: mockFetchCurrentUser,
        logout: mockLogout,
      };
      return selector ? selector(state) : state;
    });

    mockFetchCurrentUser.mockRejectedValue(new Error('Invalid token'));

    render(<Index />);

    await waitFor(() => {
      expect(mockFetchCurrentUser).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(screen.getByTestId('mock-redirect')).toBeTruthy();
      expect(screen.getByTestId('mock-redirect').props.accessibilityLabel).toBe('/login');
    });
  });
});
