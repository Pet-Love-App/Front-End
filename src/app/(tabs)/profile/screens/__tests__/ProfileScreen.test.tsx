import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import { ProfileScreen } from '../ProfileScreen';
import { useProfileData, usePetManagement, useReputation } from '../../hooks';
import { supabaseChatService, supabase } from '@/src/lib/supabase';
import { useRouter } from 'expo-router';

// Mock navigator before imports
Object.defineProperty(global, 'navigator', {
  value: { product: 'ReactNative' },
  writable: true,
});

// Mock tamagui
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  return {
    YStack: View,
    XStack: View,
    Text: Text,
    ScrollView: ScrollView,
    Button: View,
    // Add other components as needed
  };
});

// Mock hooks
jest.mock('../../hooks', () => ({
  useProfileData: jest.fn(),
  usePetManagement: jest.fn(),
  useReputation: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn(),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0 })),
}));

// Mock supabase
jest.mock('@/src/lib/supabase', () => ({
  supabaseChatService: {
    subscribeToConversations: jest.fn(() => jest.fn()),
    getTotalUnreadCount: jest.fn(),
  },
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock components
jest.mock('../../components', () => ({
  AddPetModal: () => {
    const { Text } = require('react-native');
    return <Text>AddPetModal</Text>;
  },
  PetDetailModal: () => {
    const { Text } = require('react-native');
    return <Text>PetDetailModal</Text>;
  },
  ProfileHeader: () => {
    const { Text } = require('react-native');
    return <Text>ProfileHeader</Text>;
  },
  ProfileTabs: () => {
    const { Text } = require('react-native');
    return <Text>ProfileTabs</Text>;
  },
  ReputationCard: () => {
    const { Text } = require('react-native');
    return <Text>ReputationCard</Text>;
  },
  BadgeGrid: () => {
    const { Text } = require('react-native');
    return <Text>BadgeGrid</Text>;
  },
  BadgeDetailModal: () => {
    const { Text } = require('react-native');
    return <Text>BadgeDetailModal</Text>;
  },
}));

// Mock design-system components
jest.mock('@/src/design-system/components', () => ({
  Button: ({ children }: any) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

describe('ProfileScreen', () => {
  const mockRouter = { push: jest.fn() };
  const mockUseProfileData = useProfileData as jest.Mock;
  const mockUsePetManagement = usePetManagement as jest.Mock;
  const mockUseReputation = useReputation as jest.Mock;
  const mockGetTotalUnreadCount = supabaseChatService.getTotalUnreadCount as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Default mock implementations
    mockUseProfileData.mockReturnValue({
      user: { id: 'user123', name: 'Test User' },
      isLoading: false,
      isAuthenticated: true,
      _hasHydrated: true,
      fetchCurrentUser: jest.fn(),
      handleUnauthenticated: jest.fn(),
    });

    mockUsePetManagement.mockReturnValue({
      petModalVisible: false,
      selectedPet: null,
      handleAddPet: jest.fn(),
      handleDeletePet: jest.fn(),
      openAddPetModal: jest.fn(),
      closeAddPetModal: jest.fn(),
      selectPet: jest.fn(),
    });

    mockUseReputation.mockReturnValue({
      reputation: 100,
      badges: [],
      loading: false,
      equipBadge: jest.fn(),
      unequipBadge: jest.fn(),
      refresh: jest.fn(),
    });

    mockGetTotalUnreadCount.mockResolvedValue({ success: true, data: 5 });
  });

  it('renders correctly when authenticated', async () => {
    const { getByText } = render(<ProfileScreen />);

    // Check if main components are rendered
    expect(getByText('ProfileHeader')).toBeTruthy();
    expect(getByText('ReputationCard')).toBeTruthy();
    expect(getByText('ProfileTabs')).toBeTruthy();
  });

  it('shows unauthenticated view when not authenticated', () => {
    mockUseProfileData.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: true,
      fetchCurrentUser: jest.fn(),
      handleUnauthenticated: jest.fn(),
    });

    const { getByText } = render(<ProfileScreen />);

    expect(getByText('会话已过期')).toBeTruthy();
    expect(getByText('前往登录')).toBeTruthy();
  });

  it('loads unread count on mount', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(mockGetTotalUnreadCount).toHaveBeenCalled();
    });
  });
});
