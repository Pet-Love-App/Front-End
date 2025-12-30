import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PostDetailPage from '../post-detail';
import { useRouter, useLocalSearchParams, router } from 'expo-router';
import { supabaseForumService } from '@/src/lib/supabase';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Spinner: () => <View testID="spinner" />,
  };
});

jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ChevronLeft: () => <View testID="chevron-left" />,
  };
});

jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    getPostDetail: jest.fn(),
  },
}));

// Mock the missing module
jest.mock('../tabs/forum/components/post-detail', () => ({
  __esModule: true,
  PostDetailScreen: ({ onEdit, onDelete, onBack }: any) => {
    const React = require('react');
    const { View, Button } = require('react-native');
    return (
      <View testID="post-detail-screen-mock">
        <Button testID="close-button" title="Back" onPress={onBack} />
        <Button
          testID="edit-button"
          title="Edit"
          onPress={() => onEdit({ id: 123, title: 'Test Post' })}
        />
        <Button testID="delete-button" title="Delete" onPress={() => onDelete()} />
      </View>
    );
  },
}));

jest.mock('@/src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('PostDetailPage (src/app/post-detail.tsx)', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // We also need to mock the imported router object if it's used directly
    const router = require('expo-router').router;
    router.back.mockImplementation(mockRouter.back);
    router.push.mockImplementation(mockRouter.push);
  });

  it('renders loading state initially', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ postId: '123' });
    (supabaseForumService.getPostDetail as jest.Mock).mockReturnValue(new Promise(() => {})); // Pending promise

    render(<PostDetailPage />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders error state when postId is missing', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    render(<PostDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('无效的帖子ID')).toBeTruthy();
    });
  });

  it('renders error state when fetch fails', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ postId: '123' });
    (supabaseForumService.getPostDetail as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Network error'),
    });

    render(<PostDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('加载帖子失败')).toBeTruthy();
    });
  });

  const mockPost = { id: 123, title: 'Test Post' };

  it('renders post detail when fetch succeeds', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ postId: '123' });
    (supabaseForumService.getPostDetail as jest.Mock).mockResolvedValue({
      data: mockPost,
      error: null,
    });

    render(<PostDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-detail-screen-mock')).toBeTruthy();
    });
  });

  it('handles back navigation', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ postId: '123' });
    (supabaseForumService.getPostDetail as jest.Mock).mockResolvedValue({
      data: mockPost,
      error: null,
    });

    render(<PostDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-detail-screen-mock')).toBeTruthy();
    });

    // The close button is inside the mocked PostDetailScreen
    fireEvent.press(screen.getByTestId('close-button'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('handles edit post navigation', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ postId: '123' });
    (supabaseForumService.getPostDetail as jest.Mock).mockResolvedValue({
      data: mockPost,
      error: null,
    });

    render(<PostDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-detail-screen-mock')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-button'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/forum/create-post',
      params: { editPostId: '123' },
    });
  });

  it('handles post deleted', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ postId: '123' });
    (supabaseForumService.getPostDetail as jest.Mock).mockResolvedValue({
      data: mockPost,
      error: null,
    });

    render(<PostDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-detail-screen-mock')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('delete-button'));
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
