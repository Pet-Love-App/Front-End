import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import MessagesScreen from '../messages';
import { supabaseChatService, supabase } from '@/src/lib/supabase';
import { useRouter } from 'expo-router';
jest.setTimeout(30000);
// Mock navigator before imports
Object.defineProperty(global, 'navigator', {
  value: { product: 'ReactNative' },
  writable: true,
});

// Mock tamagui and icons
jest.mock('@tamagui/lucide-icons', () => ({
  MessageCircle: () => null,
  ChevronLeft: () => null,
  User: () => null,
}));

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseChatService: {
    getConversations: jest.fn(),
    getMyConversations: jest.fn(),
    subscribeToConversations: jest.fn(() => jest.fn()),
    getTotalUnreadCount: jest.fn(),
  },
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: jest.fn(() => null),
  },
  useFocusEffect: jest.fn((callback) => {
    const React = require('react');
    React.useEffect(callback, []);
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0 })),
}));

describe('MessagesScreen', () => {
  const mockRouter = { push: jest.fn() };
  const mockGetConversations = supabaseChatService.getConversations as jest.Mock;
  const mockGetUser = supabase.auth.getUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
    });

    (supabaseChatService.getMyConversations as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          participant1Id: 'user1',
          participant2Id: 'user2',
          participant1Username: 'User 1',
          participant2Username: 'User 2',
          participant1Avatar: 'avatar1.jpg',
          participant2Avatar: 'avatar2.jpg',
          lastMessage: 'Hello',
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
        },
      ],
    });
  });

  it('renders correctly and loads conversations', async () => {
    const { getByText } = render(<MessagesScreen />);

    await waitFor(() => {
      expect(getByText('消息')).toBeTruthy();
      expect(getByText('User 2')).toBeTruthy();
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  it('shows empty state when no conversations', async () => {
    (supabaseChatService.getMyConversations as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const { getByText } = render(<MessagesScreen />);

    await waitFor(() => {
      expect(getByText('暂无消息')).toBeTruthy();
    });
  });
});
