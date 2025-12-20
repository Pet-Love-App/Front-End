import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserProfileModal } from '../UserProfileModal';
import { supabaseProfileService, supabaseFriendsService, supabaseFollowService } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseProfileService: {
    getProfileById: jest.fn(),
  },
  supabaseFriendsService: {
    getFriendRequestStatus: jest.fn(),
    sendFriendRequest: jest.fn(),
    acceptFriendRequestBySenderId: jest.fn(),
    removeFriend: jest.fn(),
  },
  supabaseFollowService: {
    isFollowing: jest.fn(),
    toggleFollow: jest.fn(),
    getFollowStats: jest.fn(),
  },
  supabaseChatService: {
    getOrCreateConversation: jest.fn(),
  },
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock icons
jest.mock('@tamagui/lucide-icons', () => ({
  User: () => <></>,
  UserPlus: () => <></>,
  UserMinus: () => <></>,
  UserCheck: () => <></>,
  MessageCircle: () => <></>,
  X: () => <></>,
  MapPin: () => <></>,
  Calendar: () => <></>,
  Heart: () => <></>,
}));

jest.mock('expo-blur', () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('UserProfileModal', () => {
  const mockUser = { id: 'current-user-id' };
  const mockProfile = {
    id: 'target-user-id',
    username: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
    bio: 'Test Bio',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue(mockUser);
    (supabaseProfileService.getProfileById as jest.Mock).mockResolvedValue({ success: true, data: mockProfile });
    (supabaseFriendsService.getFriendRequestStatus as jest.Mock).mockResolvedValue({ success: true, data: 'none' });
    (supabaseFollowService.isFollowing as jest.Mock).mockResolvedValue({ success: true, data: false });
    (supabaseFollowService.getFollowStats as jest.Mock).mockResolvedValue({ success: true, data: { followersCount: 10, followingCount: 5 } });
  });

  it('should render correctly when visible', async () => {
    // Arrange
    const props = {
      visible: true,
      userId: 'target-user-id',
      onClose: jest.fn(),
    };

    // Act
    const { getByTestId } = render(<UserProfileModal {...props} />);

    // Assert
    await waitFor(() => {
      expect(getByTestId('user-profile-username')).toBeTruthy();
      expect(getByTestId('user-profile-bio')).toBeTruthy();
    });
  });

  it('should handle follow action', async () => {
    // Arrange
    const props = {
      visible: true,
      userId: 'target-user-id',
      onClose: jest.fn(),
    };
    (supabaseFollowService.toggleFollow as jest.Mock).mockResolvedValue({ success: true, data: { isFollowing: true } });

    const { getByTestId } = render(<UserProfileModal {...props} />);
    await waitFor(() => expect(getByTestId('user-profile-follow-button')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('user-profile-follow-button'));

    // Assert
    await waitFor(() => {
      expect(supabaseFollowService.toggleFollow).toHaveBeenCalledWith('target-user-id');
    });
  });

  it('should handle friend request action', async () => {
    // Arrange
    const props = {
      visible: true,
      userId: 'target-user-id',
      onClose: jest.fn(),
    };
    (supabaseFriendsService.sendFriendRequest as jest.Mock).mockResolvedValue({ success: true });

    const { getByTestId } = render(<UserProfileModal {...props} />);
    await waitFor(() => expect(getByTestId('user-profile-friend-button')).toBeTruthy());

    // Act
    fireEvent.press(getByTestId('user-profile-friend-button'));

    // Assert
    await waitFor(() => {
      expect(supabaseFriendsService.sendFriendRequest).toHaveBeenCalledWith('target-user-id', expect.any(String));
    });
  });
});
