import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import MyFriendsScreen from '../friends';
import { supabaseFriendsService, supabaseChatService } from '@/src/lib/supabase';
import { useRouter } from 'expo-router';

jest.setTimeout(30000);

// Mock navigator before imports
Object.defineProperty(global, 'navigator', {
  value: { product: 'ReactNative' },
  writable: true,
});

// Mock tamagui and icons
jest.mock('@tamagui/lucide-icons', () => ({
  Users: () => null,
  UserPlus: () => null,
  ChevronLeft: () => null,
  Search: () => null,
  MessageCircle: () => null,
}));

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseFriendsService: {
    getFriends: jest.fn(),
    getFriendRequests: jest.fn(),
    acceptFriendRequest: jest.fn(),
    rejectFriendRequest: jest.fn(),
    removeFriend: jest.fn(),
    getMyFriends: jest.fn(),
    getReceivedRequests: jest.fn(),
  },
  supabaseChatService: {
    createConversation: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: jest.fn(() => null),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0 })),
}));

jest.mock('@/src/components/UserProfileModal', () => ({
  UserProfileModal: jest.fn(() => null),
}));

describe('MyFriendsScreen', () => {
  const mockRouter = { push: jest.fn(), back: jest.fn() };
  const mockGetMyFriends = supabaseFriendsService.getMyFriends as jest.Mock;
  const mockGetFriendRequestStatus = supabaseFriendsService.getFriendRequestStatus as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    mockGetMyFriends.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          friendId: 'friend1',
          friendUsername: 'Friend 1',
          friendAvatar: 'avatar1.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    mockGetFriendRequestStatus.mockResolvedValue({
      success: true,
      data: [],
    });

    (supabaseFriendsService.getReceivedRequests as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
  });

  it('renders correctly and loads friends', async () => {
    const { getByText, findByText } = render(<MyFriendsScreen />);

    expect(getByText('我的好友')).toBeTruthy();

    await waitFor(() => {
      expect(supabaseFriendsService.getMyFriends).toHaveBeenCalled();
    });

    const friendElement = await findByText('Friend 1');
    expect(friendElement).toBeTruthy();
  });

  it('switches tabs', async () => {
    const { getByText } = render(<MyFriendsScreen />);

    const requestsTab = getByText(/请求/);
    fireEvent.press(requestsTab);

    await waitFor(() => {
      expect(supabaseFriendsService.getReceivedRequests).toHaveBeenCalled();
    });
  });
});
